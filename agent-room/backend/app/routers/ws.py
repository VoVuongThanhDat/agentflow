"""
WebSocket hub router — bridges frontend clients to the EventBus.

Each connection subscribes to a session's event queue and streams
events to the client. Incoming messages are routed to chat_service
and permission_service from app.state.
"""

import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    state = websocket.app.state
    event_bus = state.event_bus
    chat_service = state.chat_service
    permission_service = state.permission_service
    queue: asyncio.Queue = event_bus.subscribe(session_id)

    # Cache pending permission_request events so we can look up tool_name for always_allow
    _pending_requests: dict[str, dict] = {}

    async def forward_events() -> None:
        """Forward events from EventBus queue to the WebSocket client."""
        while True:
            event = await queue.get()
            if event.get("type") == "permission_request":
                _pending_requests[event["id"]] = event
            await websocket.send_json(event)

    async def receive_messages() -> None:
        """
        Receive messages from the WebSocket client and route to services.

        Supported incoming message types:
            {type: 'chat', message: str}
            {type: 'permission_response', request_id: str, agent_id: str,
             approved: bool, always_allow: bool}
        """
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                logger.warning("Non-JSON WebSocket message from client: %r", raw)
                continue

            msg_type = data.get("type")

            if msg_type == "chat":
                message = data.get("message", "")
                if not message:
                    continue
                # Detect target agent automatically via ChatService
                agent_id = chat_service.detect_target(message, session_id)
                if agent_id is None:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": (
                                "Could not determine target agent. "
                                "Use @ba, @dev, @dev-lead, @tester, or @devops."
                            ),
                        }
                    )
                    continue
                try:
                    await chat_service.send_to_agent(session_id, agent_id, message)
                except Exception:
                    logger.exception(
                        "Failed to send message to agent %s in session %s",
                        agent_id,
                        session_id,
                    )
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": f"Failed to deliver message to agent {agent_id!r}.",
                        }
                    )

            elif msg_type == "permission_response":
                request_id = data.get("request_id", "")
                agent_id = data.get("agent_id", "")
                approved = bool(data.get("approved", False))
                always_allow = bool(data.get("always_allow", False))

                permission_service.handle_response_full(
                    request_id=request_id,
                    session_id=session_id,
                    agent_id=agent_id,
                    approved=approved,
                    always_allow=always_allow,
                )

                if always_allow and request_id in _pending_requests:
                    tool_name = _pending_requests[request_id].get("tool", "")
                    if tool_name:
                        permission_service.add_session_override(
                            session_id, agent_id, tool_name
                        )

                _pending_requests.pop(request_id, None)

            else:
                logger.debug(
                    "Unhandled WebSocket message type %r in session %s",
                    msg_type,
                    session_id,
                )

    forward_task = asyncio.create_task(forward_events())
    receive_task = asyncio.create_task(receive_messages())

    try:
        await asyncio.gather(forward_task, receive_task)
    except WebSocketDisconnect:
        pass
    finally:
        forward_task.cancel()
        receive_task.cancel()
        event_bus.unsubscribe(session_id, queue)
