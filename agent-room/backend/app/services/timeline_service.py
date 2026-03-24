"""
TimelineService — Collects and stores agent activity events in chronological order.

Events are stored per session_id and published to the EventBus so WebSocket
subscribers receive live timeline updates.
"""

import uuid
from datetime import datetime

from app.core.event_bus import EventBus

EVENT_TYPES = {'chat', 'tool_use', 'task_claim', 'task_complete', 'error', 'state_change'}


class TimelineService:
    """Records timestamped agent activities and publishes timeline events."""

    def __init__(self, event_bus: EventBus) -> None:
        self._event_bus = event_bus
        # _events: {session_id: list[TimelineEntry]}
        self._events: dict[str, list] = {}

    async def add_event(
        self,
        session_id: str,
        agent_id: str,
        action: str,
        event_type: str,
        detail: str | None = None,
    ) -> None:
        """
        Record an agent activity and publish a timeline_event to the EventBus.

        If event_type is not in EVENT_TYPES, it falls back to 'chat'.

        Args:
            session_id: The session this event belongs to.
            agent_id: The agent that performed the action.
            action: Short description of the action performed.
            event_type: One of EVENT_TYPES; unknown values fall back to 'chat'.
            detail: Optional additional context for the event.
        """
        if event_type not in EVENT_TYPES:
            event_type = 'chat'

        entry = {
            'id': str(uuid.uuid4()),
            'agent': agent_id,
            'action': action,
            'type': event_type,
            'detail': detail,
            'timestamp': datetime.utcnow().isoformat(),
        }
        self._events.setdefault(session_id, []).append(entry)

        await self._event_bus.publish(session_id, {
            'type': 'timeline_event',
            'agent': agent_id,
            'action': action,
            'timestamp': entry['timestamp'],
            'detail': detail,
        })

    def get_events(
        self,
        session_id: str,
        agent_filter: list[str] | None = None,
    ) -> list:
        """
        Return timeline entries for a session in chronological order (oldest first).

        Args:
            session_id: The session to retrieve events for.
            agent_filter: If provided, only return events whose 'agent' is in this list.

        Returns:
            List of timeline entry dicts sorted by timestamp ascending.
        """
        events = self._events.get(session_id, [])
        if agent_filter:
            events = [e for e in events if e['agent'] in agent_filter]
        return sorted(events, key=lambda e: e['timestamp'])
