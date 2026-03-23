"""
Timeline router — exposes agent activity events captured by TimelineService.

Returns timeline events for a given session in chronological order.
Supports optional filtering by agent via the `agents` query parameter
(comma-separated list, e.g. `?agents=ba,dev`).
Returns an empty list (not 404) for unknown sessions.
"""

from fastapi import APIRouter, Request, Query

router = APIRouter()


@router.get("/timeline/{session_id}")
async def get_timeline(
    request: Request,
    session_id: str,
    agents: str | None = Query(None),
):
    """
    Return timeline events for a session in chronological order.

    Query params:
        agents: Optional comma-separated agent IDs to filter by (e.g. 'ba,dev').
    """
    agent_filter = [a.strip() for a in agents.split(",")] if agents else None
    return {
        "events": request.app.state.timeline_service.get_events(
            session_id, agent_filter
        )
    }
