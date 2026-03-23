"""
CLIBridge — single Claude Code session per web session.

One persistent session using --session-id for first message and --resume for
subsequent messages. Claude Code handles agent routing internally via @mentions.
All stream-json output is parsed and forwarded to EventBus.
"""

import asyncio
import glob
import json
import logging
import os
import shutil
import uuid
from pathlib import Path
from typing import Dict, Optional

from app.config import settings
from app.core.event_bus import EventBus
from app.core.process_pool import ProcessHandle, ProcessPool
from app.services.agent_manager import AgentManager
from app.services.cost_tracker import CostTracker
from app.services.diff_service import DiffService
from app.services.timeline_service import TimelineService

logger = logging.getLogger(__name__)


class CLIBridge:
    """Manages one Claude Code session per web session.

    First message spawns with --session-id, subsequent messages use --resume.
    Each message is a one-shot --print call that resumes the same session,
    preserving full conversation context.
    """

    def __init__(
        self,
        process_pool: ProcessPool,
        event_bus: EventBus,
        diff_service: DiffService,
        timeline_service: TimelineService,
        cost_tracker: CostTracker,
        agent_manager: AgentManager,
    ) -> None:
        self._pool = process_pool
        self._event_bus = event_bus
        self._diff_service = diff_service
        self._timeline_service = timeline_service
        self._cost_tracker = cost_tracker
        self._agent_manager = agent_manager
        self._chat_service = None  # set after construction

        # session_id (web) -> Claude Code session UUID
        self._claude_sessions: Dict[str, str] = {}
        # session_id (web) -> True if at least one message has been sent
        self._session_initialized: Dict[str, bool] = {}
        # Currently running process per web session
        self._processes: Dict[str, ProcessHandle] = {}
        self._read_tasks: Dict[str, asyncio.Task] = {}
        # Lock per session to serialize messages (one process at a time)
        self._locks: Dict[str, asyncio.Lock] = {}

    def get_claude_session_id(self, session_id: str) -> str:
        """Get or create a Claude Code session UUID for this web session."""
        if session_id not in self._claude_sessions:
            self._claude_sessions[session_id] = str(uuid.uuid4())
        return self._claude_sessions[session_id]

    async def send_message(self, session_id: str, message: str) -> None:
        """Send a message to the single Claude Code session.

        First call uses --session-id to create the session.
        Subsequent calls use --resume to continue the same session.
        If a previous message is still running, it waits for it to finish
        since Claude Code sessions are sequential.
        """
        if session_id not in self._locks:
            self._locks[session_id] = asyncio.Lock()

        # If lock is already held, notify user their message is queued
        if self._locks[session_id].locked():
            await self._event_bus.publish(
                session_id,
                {
                    "type": "chat_message",
                    "from": "ba",
                    "to": "user",
                    "content": "⏳ *Previous request still processing. Your message is queued...*",
                    "streaming": False,
                },
            )

        async with self._locks[session_id]:
            await self._send_message_impl(session_id, message)

    async def _send_message_impl(self, session_id: str, message: str) -> None:
        # Kill any lingering process from previous message
        old_handle = self._processes.pop(session_id, None)
        if old_handle is not None and old_handle.is_alive():
            await self._pool.terminate(old_handle)
        old_task = self._read_tasks.pop(session_id, None)
        if old_task is not None and not old_task.done():
            old_task.cancel()

        claude_session_id = self.get_claude_session_id(session_id)
        is_first = not self._session_initialized.get(session_id, False)

        cmd = [
            settings.CLAUDE_CLI_PATH,
            "--print",
            "--output-format", "stream-json",
            "--verbose",
            "--permission-mode", "bypassPermissions",
        ]

        if is_first:
            cmd.extend(["--session-id", claude_session_id])
        else:
            cmd.extend(["--resume", claude_session_id])

        cmd.append(message)

        msg_preview = message[:100].replace("\n", " ")
        logger.info(
            "CLI [session=%s, claude=%s, %s]: %s",
            session_id[:8],
            claude_session_id[:8],
            "new" if is_first else "resume",
            msg_preview,
        )

        # Reset all agents to idle before starting — correct agent will be
        # detected from stream output when Agent tool is invoked
        await self._set_all_agents_idle(session_id)

        try:
            handle = await self._pool.spawn(cmd, cwd=settings.ALLY_SPECS_DIR)
        except Exception:
            logger.exception("Failed to spawn Claude CLI for session %s", session_id)
            return

        self._processes[session_id] = handle
        self._session_initialized[session_id] = True

        # Read stdout synchronously within the lock so messages are ordered
        await self._read_stdout(session_id, handle)

        # Wait a moment for Claude to persist the session before next resume
        await asyncio.sleep(0.5)
        logger.info("CLI process finished for session %s", session_id[:8])

    async def _set_all_agents_idle(self, session_id: str) -> None:
        """Set all agents to idle for this session."""
        for agent_id in self._VALID_AGENTS:
            await self._agent_manager.set_state(session_id, agent_id, "idle")

    async def _read_stdout(self, session_id: str, handle: ProcessHandle) -> None:
        """Read all stdout from the process and dispatch events."""
        current_agent: Optional[str] = None

        try:
            async for line in handle.read_stdout():
                if not line.strip():
                    continue
                try:
                    event = json.loads(line)
                except json.JSONDecodeError:
                    logger.debug("Non-JSON line: %r", line[:200])
                    continue

                # Detect which agent is active from the event
                detected_agent = self._detect_agent(event)
                if detected_agent and detected_agent != current_agent:
                    # Agent switch: set ALL agents idle first, then activate new one
                    await self._set_all_agents_idle(session_id)
                    current_agent = detected_agent
                    await self._agent_manager.set_state(
                        session_id, current_agent, "working"
                    )
                    logger.info("Agent switch → %s [session=%s]", current_agent, session_id[:8])

                await self._handle_event(session_id, event, current_agent)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Error reading stdout for session %s", session_id)
        finally:
            # Capture stderr for debugging
            if handle.process.stderr:
                try:
                    stderr_data = await handle.process.stderr.read()
                    stderr_text = stderr_data.decode(errors="replace").strip()
                    if stderr_text:
                        logger.warning("CLI stderr [session=%s]: %s", session_id[:8], stderr_text[:500])
                except Exception:
                    pass
            # Wait for process to fully exit
            try:
                await handle.process.wait()
            except Exception:
                pass
            # ALL agents back to idle when process finishes
            await self._set_all_agents_idle(session_id)
            self._processes.pop(session_id, None)

    _VALID_AGENTS = {"ba", "dev-lead", "dev-be", "dev-fe", "tester", "devops"}

    def _detect_agent(self, event: dict) -> Optional[str]:
        """Detect which agent is active from event content.

        Primary signal: Agent tool_use with subagent_type in input.
        Secondary: @mention in user message text.
        """
        event_type = event.get("type")

        if event_type == "system":
            return None

        # Primary: check for Agent tool invocation with subagent_type
        if event_type == "assistant":
            content_blocks = event.get("message", {}).get("content", [])
            for block in content_blocks:
                if block.get("type") == "tool_use" and block.get("name") == "Agent":
                    inp = block.get("input", {})
                    agent_type = inp.get("subagent_type", "")
                    if agent_type in self._VALID_AGENTS:
                        return agent_type

        # Secondary: check @mentions in user input
        if event_type == "user":
            msg = event.get("message", {})
            content = msg.get("content", "")
            if isinstance(content, str):
                text = content.lower()
                # Check longest first to avoid "dev" matching "dev-lead"
                for agent_id in sorted(self._VALID_AGENTS, key=len, reverse=True):
                    if f"@{agent_id}" in text:
                        return agent_id

        return None

    async def _handle_event(
        self, session_id: str, event: dict, current_agent: Optional[str]
    ) -> None:
        """Parse a stream-json event and publish to EventBus."""
        event_type = event.get("type")
        agent_id = current_agent or "ba"

        if event_type == "system":
            # Init event — only log once per session
            if event.get("subtype") == "init":
                claude_session = event.get("session_id", "")
                logger.info("Claude session initialized: %s", claude_session)
            return

        if event_type == "assistant":
            content_blocks = event.get("message", {}).get("content", [])
            for block in content_blocks:
                block_type = block.get("type")

                if block_type == "thinking":
                    thinking_text = block.get("thinking", "")
                    if thinking_text:
                        summary = thinking_text[:150].replace("\n", " ")
                        await self._agent_manager.set_state(
                            session_id, agent_id, "working",
                            f"Thinking: {summary}...",
                        )
                        await self._event_bus.publish(
                            session_id,
                            {
                                "type": "chat_message",
                                "from": agent_id,
                                "to": "user",
                                "content": f"💭 *Thinking:* {thinking_text}",
                                "streaming": True,
                            },
                        )

                elif block_type == "text":
                    text_content = block["text"]
                    await self._event_bus.publish(
                        session_id,
                        {
                            "type": "chat_message",
                            "from": agent_id,
                            "to": "user",
                            "content": text_content,
                            "streaming": True,
                        },
                    )
                    if self._chat_service is not None:
                        self._chat_service.record_agent_response(
                            session_id, agent_id, text_content
                        )
                    await self._timeline_service.add_event(
                        session_id=session_id,
                        agent_id=agent_id,
                        action="Sent message",
                        event_type="chat",
                    )

                elif block_type == "tool_use":
                    tool_name = block.get("name", "")
                    tool_input = block.get("input", {})
                    tool_id = block.get("id", "")

                    # Build a descriptive detail from tool input
                    detail = tool_name
                    if tool_name == "Bash" and tool_input.get("command"):
                        detail = f"Bash: {tool_input['command'][:80]}"
                    elif tool_name == "Read" and tool_input.get("file_path"):
                        detail = f"Read: {tool_input['file_path'].split('/')[-1]}"
                    elif tool_name == "Write" and tool_input.get("file_path"):
                        detail = f"Write: {tool_input['file_path'].split('/')[-1]}"
                    elif tool_name == "Edit" and tool_input.get("file_path"):
                        detail = f"Edit: {tool_input['file_path'].split('/')[-1]}"
                    elif tool_name == "Grep" and tool_input.get("pattern"):
                        detail = f"Grep: {tool_input['pattern'][:50]}"
                    elif tool_name == "Glob" and tool_input.get("pattern"):
                        detail = f"Glob: {tool_input['pattern'][:50]}"
                    elif tool_name == "Agent":
                        sub = tool_input.get("subagent_type", "")
                        desc = tool_input.get("description", "")
                        detail = f"Agent: @{sub} {desc[:40]}" if sub else f"Agent: {desc[:50]}"
                    elif tool_name == "WebSearch" and tool_input.get("query"):
                        detail = f"Search: {tool_input['query'][:50]}"
                    elif tool_name == "WebFetch" and tool_input.get("url"):
                        detail = f"Fetch: {tool_input['url'][:50]}"
                    elif tool_input:
                        # Fallback: show first key=value
                        first_key = next(iter(tool_input), "")
                        if first_key:
                            val = str(tool_input[first_key])[:50]
                            detail = f"{tool_name}: {val}"

                    await self._agent_manager.set_state(
                        session_id, agent_id, "working", detail,
                    )
                    await self._event_bus.publish(
                        session_id,
                        {
                            "type": "tool_use",
                            "agent": agent_id,
                            "tool": tool_name,
                            "tool_id": tool_id,
                            "input": tool_input,
                            "status": "pending",
                        },
                    )
                    await self._diff_service.handle_tool_use(
                        session_id=session_id,
                        agent_id=agent_id,
                        tool_name=tool_name,
                        tool_input=tool_input,
                    )
                    await self._timeline_service.add_event(
                        session_id=session_id,
                        agent_id=agent_id,
                        action=f"Using tool: {tool_name}",
                        event_type="tool_use",
                        detail=json.dumps(tool_input)[:200] if tool_input else None,
                    )

        elif event_type == "result":
            usage = event.get("usage", {})
            if usage:
                input_tokens = usage.get("input_tokens", 0)
                output_tokens = usage.get("output_tokens", 0)
                await self._cost_tracker.add_usage(
                    session_id=session_id,
                    agent_id=agent_id,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                )
            # Result text as final message
            result_text = event.get("result", "")
            if result_text and not event.get("is_error"):
                # Don't re-publish if already sent as assistant text
                pass

            cost = event.get("total_cost_usd", 0)
            if cost:
                await self._event_bus.publish(
                    session_id,
                    {
                        "type": "cost_update",
                        "agent": agent_id,
                        "cost": cost,
                        "tokens": usage,
                    },
                )

        elif event_type == "error":
            error_msg = event.get("error", str(event))
            await self._event_bus.publish(
                session_id,
                {
                    "type": "error",
                    "agent": agent_id,
                    "message": error_msg[:300],
                },
            )
            await self._agent_manager.set_state(
                session_id, agent_id, "error", error_msg[:100]
            )

    async def stop_session(self, session_id: str, delete_claude_session: bool = True, claude_session_id: str | None = None) -> None:
        """Stop the Claude process and optionally delete the Claude session data."""
        handle = self._processes.pop(session_id, None)
        if handle is not None and handle.is_alive():
            await self._pool.terminate(handle)
        task = self._read_tasks.pop(session_id, None)
        if task is not None and not task.done():
            task.cancel()

        # Delete Claude Code session files from disk
        claude_sid = self._claude_sessions.pop(session_id, None) or claude_session_id
        if delete_claude_session and claude_sid:
            self._delete_claude_session_files(claude_sid)
            logger.info("Deleted Claude session %s for web session %s", claude_sid, session_id[:8])

        self._session_initialized.pop(session_id, None)
        self._locks.pop(session_id, None)

    def _delete_claude_session_files(self, claude_session_id: str) -> None:
        """Remove Claude Code session files from ~/.claude/."""
        home = Path.home()
        claude_dir = home / ".claude"

        # 1. Remove session .jsonl in project dirs
        for jsonl in glob.glob(str(claude_dir / "projects" / "**" / f"{claude_session_id}.jsonl"), recursive=True):
            try:
                os.remove(jsonl)
                logger.info("Deleted session file: %s", jsonl)
            except OSError:
                pass

        # 2. Remove subagent dirs
        for subdir in glob.glob(str(claude_dir / "projects" / "**" / claude_session_id), recursive=True):
            if os.path.isdir(subdir):
                try:
                    shutil.rmtree(subdir)
                    logger.info("Deleted session dir: %s", subdir)
                except OSError:
                    pass

        # 3. Remove from sessions/ index (PID-keyed files that reference this session)
        sessions_dir = claude_dir / "sessions"
        if sessions_dir.is_dir():
            for f in sessions_dir.iterdir():
                try:
                    data = json.loads(f.read_text())
                    if data.get("sessionId") == claude_session_id:
                        f.unlink()
                        logger.info("Deleted session index: %s", f)
                except (json.JSONDecodeError, OSError):
                    pass

        # 4. Remove session-env if exists
        env_dir = claude_dir / "session-env" / claude_session_id
        if env_dir.is_dir():
            try:
                shutil.rmtree(env_dir)
                logger.info("Deleted session env: %s", env_dir)
            except OSError:
                pass

    # Legacy compat — start_agent just registers, no process spawned
    async def start_agent(
        self, session_id: str, agent_id: str, model: str, system_prompt: str
    ) -> bool:
        """No-op — agents are handled by the single Claude Code session."""
        logger.info("Registered agent %s in session %s (single-session mode)", agent_id, session_id)
        await self._agent_manager.set_state(session_id, agent_id, "idle")
        return True
