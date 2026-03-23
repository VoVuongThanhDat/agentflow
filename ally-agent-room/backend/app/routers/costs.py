"""
Costs router — exposes cost tracking data for a session or individual agent.

Returns zeroed data for unknown sessions/agents rather than 404,
so the frontend can safely poll without error handling for new sessions.
"""

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/costs/{session_id}")
async def get_costs(request: Request, session_id: str):
    """Return per-agent cost breakdown, session total, and time series.

    Returns:
        {
            "agents": {agent_id: {"input_tokens": int, "output_tokens": int, "cost": float}},
            "total": float,
            "time_series": [{"timestamp": str, "cumulative_cost": float}, ...]
        }
    """
    return request.app.state.cost_tracker.get_session_costs(session_id)


@router.get("/costs/{session_id}/{agent_id}")
async def get_agent_cost(request: Request, session_id: str, agent_id: str):
    """Return cost stats for a single agent in a session.

    Returns:
        {"input_tokens": int, "output_tokens": int, "cost": float}
        Returns zeroed data if the agent has no recorded usage.
    """
    return request.app.state.cost_tracker.get_agent_cost(session_id, agent_id)
