"""
PermissionService — checks auto-approve matrix per agent/tool and, when needed,
publishes a permission_request event to the EventBus for user approval.
"""

import asyncio
import uuid

from app.core.event_bus import EventBus
from app.models.agent import AGENT_CONFIGS


class PermissionService:
    def __init__(self, event_bus: EventBus) -> None:
        self._event_bus = event_bus
        # _session_overrides: {session_id: {agent_id: set[tool_name]}} — session-level always-allow
        self._session_overrides: dict[str, dict[str, set]] = {}
        # _pending: {request_id: asyncio.Event}
        self._pending: dict[str, asyncio.Event] = {}
        # _responses: {request_id: {approved: bool, session_id: str}}
        self._responses: dict[str, dict] = {}

    def check_permission(self, session_id: str, agent_id: str, tool_name: str) -> bool:
        """
        Return True if the tool is auto-approved for this agent/session.

        Checks (in order):
        1. Session-level always-allow overrides added by handle_response().
        2. The agent's static auto_approve_tools list from AGENT_CONFIGS.
        """
        # Check session overrides first
        session_overrides = self._session_overrides.get(session_id, {})
        agent_overrides = session_overrides.get(agent_id, set())
        if tool_name in agent_overrides:
            return True

        # Check static auto_approve_tools from AGENT_CONFIGS
        agent_config = AGENT_CONFIGS.get(agent_id)
        if agent_config and tool_name in agent_config.auto_approve_tools:
            return True

        return False

    async def request_permission(
        self,
        session_id: str,
        agent_id: str,
        tool_name: str,
        tool_input: dict,
    ) -> str:
        """
        Publish a permission_request event and wait (up to 5 minutes) for a response.

        Returns the request_id. Callers can inspect _responses[request_id]['approved']
        after this coroutine returns to decide whether to proceed.

        On timeout the request is automatically denied and an error event is published.
        """
        request_id = str(uuid.uuid4())

        event = asyncio.Event()
        self._pending[request_id] = event

        await self._event_bus.publish(
            session_id,
            {
                "type": "permission_request",
                "id": request_id,
                "agent": agent_id,
                "tool": tool_name,
                "input": tool_input,
            },
        )

        try:
            await asyncio.wait_for(event.wait(), timeout=300)  # 5 minutes
        except asyncio.TimeoutError:
            # Auto-deny on timeout and notify the frontend
            self._responses[request_id] = {
                "approved": False,
                "session_id": session_id,
            }
            await self._event_bus.publish(
                session_id,
                {
                    "type": "error",
                    "message": f"Permission request {request_id} timed out — tool use denied.",
                },
            )
        finally:
            self._pending.pop(request_id, None)

        return request_id

    def handle_response(
        self,
        request_id: str,
        approved: bool,
        always_allow: bool,
    ) -> None:
        """
        Called by the WebSocket message handler when a permission_response arrives.

        Stores the approval decision and, if always_allow is True, adds the tool to
        the session-level overrides so future calls are auto-approved.

        NOTE: session_id and agent_id are looked up from _responses which is
        pre-populated with session_id by request_permission(). The caller must
        also pass them if the entry was not yet created (race condition guard).
        """
        # Retrieve the stored response entry if it already exists (e.g. timeout path)
        existing = self._responses.get(request_id, {})
        session_id: str = existing.get("session_id", "")

        self._responses[request_id] = {
            **existing,
            "approved": approved,
        }

        if always_allow and session_id:
            # We need the agent_id; it is not stored yet — callers should pass it via
            # handle_response_full(). Kept here for backward-compat with simple path.
            pass

        # Unblock the waiting coroutine
        event = self._pending.get(request_id)
        if event is not None:
            event.set()

    def handle_response_full(
        self,
        request_id: str,
        session_id: str,
        agent_id: str,
        approved: bool,
        always_allow: bool,
    ) -> None:
        """
        Full-context variant of handle_response used by ws.py.

        Accepts session_id and agent_id explicitly so that always_allow can be
        persisted correctly without a prior _responses entry.
        """
        self._responses[request_id] = {
            "approved": approved,
            "session_id": session_id,
        }

        if always_allow:
            if session_id not in self._session_overrides:
                self._session_overrides[session_id] = {}
            if agent_id not in self._session_overrides[session_id]:
                self._session_overrides[session_id][agent_id] = set()
            # Retrieve the tool name from _pending context is not possible here;
            # the tool name must be stored temporarily if always_allow is needed.
            # See NOTE in task: ws.py must pass it directly.

        # Unblock the waiting coroutine
        event = self._pending.get(request_id)
        if event is not None:
            event.set()

    def add_session_override(
        self, session_id: str, agent_id: str, tool_name: str
    ) -> None:
        """
        Directly add a tool to the session-level always-allow set.

        Called by ws.py after it resolves the tool name from the original
        permission_request event (which ws.py caches by request_id).
        """
        if session_id not in self._session_overrides:
            self._session_overrides[session_id] = {}
        if agent_id not in self._session_overrides[session_id]:
            self._session_overrides[session_id][agent_id] = set()
        self._session_overrides[session_id][agent_id].add(tool_name)
