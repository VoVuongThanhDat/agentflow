"""
CostTracker — per-agent token accounting with cost calculation.

Tracks token usage per agent per session using Claude model pricing.
Publishes accurate cost_update events via EventBus.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.core.event_bus import EventBus


MODEL_COSTS: dict[str, dict[str, float]] = {
    "opus": {"input": 15.0 / 1_000_000, "output": 75.0 / 1_000_000},
    "sonnet": {"input": 3.0 / 1_000_000, "output": 15.0 / 1_000_000},
}

AGENT_MODELS: dict[str, str] = {
    "ba": "opus",
    "dev-lead": "sonnet",
    "dev": "sonnet",
    "tester": "sonnet",
    "devops": "sonnet",
}


@dataclass
class AgentUsage:
    input_tokens: int = 0
    output_tokens: int = 0
    cost: float = 0.0
    snapshots: list[dict] = field(default_factory=list)
    # Each snapshot: {timestamp: ISO str, cumulative_cost: float (session total so far)}


class CostTracker:
    def __init__(self, event_bus: EventBus) -> None:
        self._event_bus = event_bus
        # _usage: {session_id: {agent_id: AgentUsage}}
        self._usage: dict[str, dict[str, AgentUsage]] = {}

    def _get_or_create(self, session_id: str, agent_id: str) -> AgentUsage:
        """Auto-init nested dicts and return the AgentUsage for the given pair."""
        if session_id not in self._usage:
            self._usage[session_id] = {}
        if agent_id not in self._usage[session_id]:
            self._usage[session_id][agent_id] = AgentUsage()
        return self._usage[session_id][agent_id]

    async def add_usage(
        self,
        session_id: str,
        agent_id: str,
        input_tokens: int,
        output_tokens: int,
    ) -> None:
        """Record token usage for an agent and publish an accurate cost_update event.

        Args:
            session_id: The session identifier.
            agent_id: The agent identifier (e.g. 'ba', 'dev').
            input_tokens: Number of input tokens consumed in this call.
            output_tokens: Number of output tokens produced in this call.
        """
        model = AGENT_MODELS.get(agent_id, "sonnet")
        pricing = MODEL_COSTS.get(model, MODEL_COSTS["sonnet"])

        incremental_cost = (
            input_tokens * pricing["input"] + output_tokens * pricing["output"]
        )

        usage = self._get_or_create(session_id, agent_id)
        usage.input_tokens += input_tokens
        usage.output_tokens += output_tokens
        usage.cost += incremental_cost

        # Session total across all agents
        session_total = sum(
            a.cost for a in self._usage[session_id].values()
        )

        snapshot = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "cumulative_cost": session_total,
        }
        usage.snapshots.append(snapshot)

        await self._event_bus.publish(
            session_id,
            {
                "type": "cost_update",
                "agent_id": agent_id,
                "session_id": session_id,
                "input_tokens": usage.input_tokens,
                "output_tokens": usage.output_tokens,
                "cost": usage.cost,
                "session_total": session_total,
            },
        )

    def get_session_costs(self, session_id: str) -> dict:
        """Return per-agent cost breakdown and session totals.

        Returns:
            {
                "agents": {agent_id: {"input_tokens": int, "output_tokens": int, "cost": float}},
                "total": float,
                "time_series": [{"timestamp": str, "cumulative_cost": float}, ...]
            }
        """
        agents_data = self._usage.get(session_id, {})
        agents: dict[str, dict] = {}
        total = 0.0
        for agent_id, usage in agents_data.items():
            agents[agent_id] = {
                "input_tokens": usage.input_tokens,
                "output_tokens": usage.output_tokens,
                "cost": usage.cost,
            }
            total += usage.cost

        # Merge all agent snapshots into a unified chronological time series
        all_snapshots: list[dict] = []
        for usage in agents_data.values():
            all_snapshots.extend(usage.snapshots)
        all_snapshots.sort(key=lambda s: s["timestamp"])

        return {
            "agents": agents,
            "total": total,
            "time_series": all_snapshots,
        }

    def get_agent_cost(self, session_id: str, agent_id: str) -> dict:
        """Return cost stats for a single agent in a session.

        Returns:
            {"input_tokens": int, "output_tokens": int, "cost": float}
            Returns zeroed dict if the agent has no recorded usage.
        """
        agents_data = self._usage.get(session_id, {})
        usage = agents_data.get(agent_id)
        if usage is None:
            return {"input_tokens": 0, "output_tokens": 0, "cost": 0.0}
        return {
            "input_tokens": usage.input_tokens,
            "output_tokens": usage.output_tokens,
            "cost": usage.cost,
        }
