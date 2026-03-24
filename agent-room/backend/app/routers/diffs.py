"""
Diffs router — exposes file diff entries captured by DiffService.

Returns diff entries for a given session in newest-first order.
Returns an empty list (not 404) for unknown sessions.
"""

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/diffs/{session_id}")
async def get_diffs(request: Request, session_id: str):
    """Return all diff entries for a session, newest first."""
    return {"diffs": request.app.state.diff_service.get_diffs(session_id)}
