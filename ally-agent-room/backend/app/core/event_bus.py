"""
EventBus — asyncio.Queue-based pub/sub for decoupling CLI bridge output
from WebSocket transport.

Each session_id maps to a list of asyncio.Queue instances (one per subscriber).
"""

import asyncio
from typing import Dict, List


class EventBus:
    """Internal event bus that decouples CLI bridge output from WebSocket transport."""

    def __init__(self) -> None:
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}

    def subscribe(self, session_id: str) -> asyncio.Queue:
        """
        Create a new subscriber queue for the given session.

        A new asyncio.Queue is created with maxsize=100, appended to the
        session's subscriber list, and returned. Multiple queues per session
        are supported (e.g., multiple WebSocket connections).

        Args:
            session_id: The session identifier to subscribe to.

        Returns:
            A new asyncio.Queue that will receive events published to session_id.
        """
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        if session_id not in self._subscribers:
            self._subscribers[session_id] = []
        self._subscribers[session_id].append(queue)
        return queue

    def unsubscribe(self, session_id: str, queue: asyncio.Queue) -> None:
        """
        Remove a subscriber queue from the given session.

        If the session's subscriber list becomes empty after removal, the
        session entry is cleaned up from the internal mapping.

        Args:
            session_id: The session identifier to unsubscribe from.
            queue: The queue instance to remove (must be one previously returned
                   by subscribe()).
        """
        if session_id not in self._subscribers:
            return
        try:
            self._subscribers[session_id].remove(queue)
        except ValueError:
            pass
        if not self._subscribers[session_id]:
            del self._subscribers[session_id]

    async def publish(self, session_id: str, event: dict) -> None:
        """
        Publish an event to all subscribers of a session.

        If a subscriber's queue is full (maxsize reached), the oldest item is
        discarded to make room before putting the new event.

        Args:
            session_id: The session identifier whose subscribers will receive the event.
            event: A plain Python dict with at least a 'type' key matching WSEvent
                   type strings.
        """
        queues = self._subscribers.get(session_id, [])
        for queue in queues:
            if queue.full():
                try:
                    queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            await queue.put(event)

    async def publish_all(self, event: dict) -> None:
        """
        Publish an event to all subscribers across all sessions.

        Args:
            event: A plain Python dict with at least a 'type' key matching WSEvent
                   type strings.
        """
        for session_id in list(self._subscribers.keys()):
            await self.publish(session_id, event)
