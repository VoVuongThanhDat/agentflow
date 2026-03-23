"""
Sessions router — exposes session CRUD and agent-start operations via REST.
"""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()


class CreateSessionRequest(BaseModel):
    name: str | None = None


class RenameSessionRequest(BaseModel):
    name: str


class StartAgentsRequest(BaseModel):
    agents: list[str]  # list of AgentId strings


@router.post("/sessions")
async def create_session(request: Request, body: CreateSessionRequest):
    return await request.app.state.session_manager.create_session(body.name)


@router.get("/sessions")
async def list_sessions(request: Request):
    return request.app.state.session_manager.get_sessions()


@router.get("/sessions/{session_id}")
async def get_session(request: Request, session_id: str):
    session = request.app.state.session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.put("/sessions/{session_id}")
async def rename_session(request: Request, session_id: str, body: RenameSessionRequest):
    await request.app.state.session_manager.rename_session(session_id, body.name)
    return {"ok": True}


@router.delete("/sessions/{session_id}")
async def delete_session(request: Request, session_id: str):
    await request.app.state.session_manager.delete_session(session_id)
    return {"ok": True}


@router.post("/sessions/{session_id}/start")
async def start_agents(request: Request, session_id: str, body: StartAgentsRequest):
    results = await request.app.state.session_manager.start_agents(session_id, body.agents)
    return {"results": results}


@router.get("/sessions/{session_id}/history")
async def get_session_history(request: Request, session_id: str):
    """Load conversation history from Claude's .jsonl session file."""
    session = request.app.state.session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    claude_sid = session.get("claudeSessionId", "")
    if not claude_sid:
        return {"messages": []}

    # Find the .jsonl file
    home = Path.home()
    # Build project path the same way Claude does
    from app.config import settings
    cwd = settings.ALLY_SPECS_DIR.replace("/", "-")
    if cwd.startswith("-"):
        cwd = cwd  # keep leading dash
    project_dir = home / ".claude" / "projects" / cwd
    jsonl_file = project_dir / f"{claude_sid}.jsonl"

    if not jsonl_file.exists():
        # Try finding it anywhere under projects
        candidates = list((home / ".claude" / "projects").rglob(f"{claude_sid}.jsonl"))
        if candidates:
            jsonl_file = candidates[0]
        else:
            return {"messages": []}

    messages = []
    try:
        for line in jsonl_file.read_text().splitlines():
            if not line.strip():
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            entry_type = entry.get("type")

            if entry_type == "user":
                # User message
                content = entry.get("message", {}).get("content", "")
                if isinstance(content, str):
                    messages.append({
                        "role": "user",
                        "content": content,
                        "timestamp": entry.get("timestamp", ""),
                    })
                elif isinstance(content, list):
                    # Could be tool_result or text blocks
                    text_parts = []
                    for block in content:
                        if isinstance(block, dict) and block.get("type") == "text":
                            text_parts.append(block.get("text", ""))
                    if text_parts:
                        messages.append({
                            "role": "user",
                            "content": "\n".join(text_parts),
                            "timestamp": entry.get("timestamp", ""),
                        })

            elif entry_type == "assistant":
                content_blocks = entry.get("message", {}).get("content", [])
                for block in content_blocks:
                    if block.get("type") == "text":
                        messages.append({
                            "role": "assistant",
                            "content": block["text"],
                            "timestamp": entry.get("timestamp", ""),
                        })
                    elif block.get("type") == "tool_use":
                        tool_name = block.get("name", "")
                        tool_input = block.get("input", {})

                        # Build descriptive content
                        detail = tool_name
                        if tool_name == "Bash" and tool_input.get("command"):
                            detail = f"Bash: {tool_input['command'][:100]}"
                        elif tool_name in ("Read", "Write", "Edit") and tool_input.get("file_path"):
                            detail = f"{tool_name}: {tool_input['file_path']}"
                        elif tool_name == "Grep" and tool_input.get("pattern"):
                            detail = f"Grep: {tool_input['pattern'][:60]}"
                        elif tool_name == "Glob" and tool_input.get("pattern"):
                            detail = f"Glob: {tool_input['pattern'][:60]}"
                        elif tool_name == "Agent":
                            sub = tool_input.get("subagent_type", "")
                            desc = tool_input.get("description", "")
                            detail = f"Agent: @{sub} {desc[:50]}" if sub else f"Agent: {desc[:60]}"

                        messages.append({
                            "role": "tool",
                            "content": f"🔧 {detail}",
                            "tool": tool_name,
                            "timestamp": entry.get("timestamp", ""),
                        })

                        # Add file edits as diff entries
                        if tool_name in ("Write", "Edit") and tool_input.get("file_path"):
                            messages.append({
                                "role": "diff",
                                "content": tool_input.get("file_path", ""),
                                "tool": tool_name,
                                "timestamp": entry.get("timestamp", ""),
                            })
                    elif block.get("type") == "thinking":
                        messages.append({
                            "role": "thinking",
                            "content": block.get("thinking", "")[:500],
                            "timestamp": entry.get("timestamp", ""),
                        })

            elif entry_type == "result":
                cost = entry.get("total_cost_usd", 0)
                if cost:
                    messages.append({
                        "role": "system",
                        "content": f"💰 Cost: ${cost:.4f}",
                        "timestamp": entry.get("timestamp", ""),
                    })

    except Exception:
        logger.exception("Failed to parse session history for %s", claude_sid)

    return {"messages": messages, "claude_session_id": claude_sid}
