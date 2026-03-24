"""AgentManager service for tracking agent states and publishing state-change events."""

from datetime import datetime

from app.core.event_bus import EventBus
from app.models.agent import AGENT_CONFIGS, AgentConfig


class AgentManager:
    """Tracks per-session agent states and publishes state-change events to EventBus."""

    def __init__(self, event_bus: EventBus) -> None:
        self._event_bus = event_bus
        # _states: {session_id: {agent_id: {'state': str, 'detail': str | None}}}
        self._states: dict[str, dict[str, dict]] = {}

    def _init_session(self, session_id: str) -> None:
        """Initialize all 5 agents to 'idle' state for the session."""
        self._states[session_id] = {
            agent_id: {'state': 'idle', 'detail': None}
            for agent_id in AGENT_CONFIGS
        }

    def get_states(self, session_id: str) -> dict:
        """Return current states dict for the session.

        Auto-initializes session to all agents idle if not seen yet.
        """
        if session_id not in self._states:
            self._init_session(session_id)
        return self._states[session_id]

    async def set_state(
        self,
        session_id: str,
        agent_id: str,
        state: str,
        detail: str | None = None,
    ) -> None:
        """Update agent state and publish state-change events to the EventBus.

        Publishes two events:
        - agent_state_change: notifies subscribers of the new state
        - timeline_event: records the transition with a UTC timestamp
        """
        if session_id not in self._states:
            self._init_session(session_id)

        self._states[session_id][agent_id] = {'state': state, 'detail': detail}

        await self._event_bus.publish(
            session_id,
            {
                'type': 'agent_state_change',
                'agent': agent_id,
                'state': state,
                'detail': detail,
            },
        )

        await self._event_bus.publish(
            session_id,
            {
                'type': 'timeline_event',
                'agent': agent_id,
                'action': f'State: {state}',
                'timestamp': datetime.utcnow().isoformat(),
                'detail': detail,
            },
        )

    def get_all_agents(self) -> list[AgentConfig]:
        """Return a list of all agent configurations."""
        return list(AGENT_CONFIGS.values())
