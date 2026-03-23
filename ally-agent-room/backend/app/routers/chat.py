"""Chat router — single endpoint to send messages to Claude Code session."""

import asyncio
from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: str
    message: str


class PermissionResponse(BaseModel):
    approved: bool
    always_allow: bool = False


@router.post("/chat")
async def send_chat(request: Request, body: ChatRequest):
    chat_service = request.app.state.chat_service
    # Fire-and-forget: return immediately, process runs in background
    # Results stream to frontend via WebSocket
    asyncio.create_task(
        chat_service.send_message(body.session_id, body.message)
    )
    claude_session_id = chat_service.get_claude_session_id(body.session_id)
    return {
        "status": "queued",
        "claude_session_id": claude_session_id,
    }


@router.post("/chat/permission/{request_id}")
async def respond_permission(request: Request, request_id: str, body: PermissionResponse):
    request.app.state.permission_service.handle_response(request_id, body.approved, body.always_allow)
    return {"ok": True}
