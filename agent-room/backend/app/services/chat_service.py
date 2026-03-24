"""
ChatService — forwards user messages to the single Claude Code session.

Claude Code handles agent routing internally via @mentions and its own
agent definitions in .claude/agents/.
"""

import logging
import uuid

from app.core.event_bus import EventBus
from app.services.cli_bridge import CLIBridge

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self, cli_bridge: CLIBridge, event_bus: EventBus) -> None:
        self._bridge = cli_bridge
        self._event_bus = event_bus
        self._history: dict[str, list] = {}

    async def send_message(self, session_id: str, message: str) -> str:
        """Send a user message to the Claude Code session.

        Claude Code handles agent detection and routing internally.

        Returns:
            A UUID4 message_id string.
        """
        message_id = str(uuid.uuid4())

        # Publish user message to WebSocket
        await self._event_bus.publish(
            session_id,
            {
                "type": "chat_message",
                "message_id": message_id,
                "from": "user",
                "to": "assistant",
                "content": message,
                "streaming": False,
            },
        )

        # Record in history
        if session_id not in self._history:
            self._history[session_id] = []
        self._history[session_id].append({
            "from": "user",
            "content": message,
        })

        # Forward to the single Claude Code session
        await self._bridge.send_message(session_id, message)

        return message_id

    def record_agent_response(self, session_id: str, agent_id: str, content: str) -> None:
        """Record an agent response in history."""
        if session_id not in self._history:
            self._history[session_id] = []
        self._history[session_id].append({
            "from": agent_id,
            "content": content[:500],
        })

    def get_claude_session_id(self, session_id: str) -> str:
        """Get the Claude Code session ID for terminal resume."""
        return self._bridge.get_claude_session_id(session_id)
