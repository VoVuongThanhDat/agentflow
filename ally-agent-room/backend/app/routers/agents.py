"""Agents router — REST endpoints for agent config and state queries."""

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/agents")
async def get_agents(request: Request):
    return request.app.state.agent_manager.get_all_agents()


@router.get("/agents/{session_id}/states")
async def get_agent_states(request: Request, session_id: str):
    return request.app.state.agent_manager.get_states(session_id)
