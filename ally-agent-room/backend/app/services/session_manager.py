"""
SessionManager — manages session lifecycle with file-based persistence.

Sessions are saved to .sessions.json so they survive backend restarts.
Each web session maps to a Claude Code session (via CLIBridge).
"""

import json
import logging
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path

from app.core.event_bus import EventBus
from app.services.cli_bridge import CLIBridge

logger = logging.getLogger(__name__)

# Persist sessions next to the backend app
SESSIONS_FILE = Path(__file__).parent.parent.parent / ".sessions.json"


@dataclass
class SessionState:
    id: str
    name: str
    status: str  # 'active' | 'idle' | 'stopped'
    created_at: str
    claude_session_id: str = ""
    agent_ids: list[str] = field(default_factory=list)


class SessionManager:
    """Manages session lifecycle with file persistence."""

    def __init__(self, cli_bridge: CLIBridge, event_bus: EventBus) -> None:
        self._bridge = cli_bridge
        self._event_bus = event_bus
        self._sessions: dict[str, SessionState] = {}
        self._load()

    def _load(self) -> None:
        """Load sessions from disk."""
        if SESSIONS_FILE.exists():
            try:
                data = json.loads(SESSIONS_FILE.read_text())
                for s in data:
                    state = SessionState(**s)
                    state.status = "idle"  # reset status on restart
                    self._sessions[state.id] = state
                    # Restore the claude session mapping in CLIBridge
                    if state.claude_session_id:
                        self._bridge._claude_sessions[state.id] = state.claude_session_id
                        self._bridge._session_initialized[state.id] = True
                logger.info("Loaded %d sessions from %s", len(self._sessions), SESSIONS_FILE)
            except Exception:
                logger.exception("Failed to load sessions from %s", SESSIONS_FILE)

    def _save(self) -> None:
        """Persist sessions to disk."""
        try:
            data = [asdict(s) for s in self._sessions.values()]
            SESSIONS_FILE.write_text(json.dumps(data, indent=2))
        except Exception:
            logger.exception("Failed to save sessions to %s", SESSIONS_FILE)

    async def create_session(self, name: str | None = None) -> dict:
        session_id = str(uuid.uuid4())
        name = name or f"Session {len(self._sessions) + 1}"
        claude_sid = self._bridge.get_claude_session_id(session_id)
        state = SessionState(
            id=session_id,
            name=name,
            status="idle",
            created_at=datetime.utcnow().isoformat(),
            claude_session_id=claude_sid,
        )
        self._sessions[session_id] = state
        self._save()
        await self._event_bus.publish_all(
            {"type": "session_update", "sessions": self._get_session_infos()}
        )
        return self._to_info(state)

    def get_sessions(self) -> list[dict]:
        return [self._to_info(s) for s in self._sessions.values()]

    def get_session(self, session_id: str) -> dict | None:
        state = self._sessions.get(session_id)
        return self._to_info(state) if state else None

    async def rename_session(self, session_id: str, name: str) -> None:
        if session_id in self._sessions:
            self._sessions[session_id].name = name
            self._save()
            await self._event_bus.publish_all(
                {"type": "session_update", "sessions": self._get_session_infos()}
            )

    async def delete_session(self, session_id: str) -> None:
        if session_id in self._sessions:
            claude_sid = self._sessions[session_id].claude_session_id
            await self._bridge.stop_session(
                session_id,
                delete_claude_session=True,
                claude_session_id=claude_sid,
            )
            del self._sessions[session_id]
            self._save()
            await self._event_bus.publish_all(
                {"type": "session_update", "sessions": self._get_session_infos()}
            )

    async def start_agents(self, session_id: str, agent_ids: list[str]) -> dict:
        from app.models.agent import AGENT_CONFIGS

        results: dict[str, str] = {}
        for agent_id in agent_ids:
            config = AGENT_CONFIGS.get(agent_id)
            if config:
                ok = await self._bridge.start_agent(
                    session_id, agent_id, config.model, config.system_prompt
                )
                results[agent_id] = "started" if ok else "failed"
        if session_id in self._sessions:
            self._sessions[session_id].agent_ids = agent_ids
            self._sessions[session_id].status = "active"
            self._save()
        return results

    def _to_info(self, state: SessionState) -> dict:
        return {
            "id": state.id,
            "name": state.name,
            "status": state.status,
            "createdAt": state.created_at,
            "agentCount": len(state.agent_ids),
            "claudeSessionId": state.claude_session_id,
        }

    def _get_session_infos(self) -> list[dict]:
        return [self._to_info(s) for s in self._sessions.values()]
