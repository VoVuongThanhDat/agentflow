"""
Tasks router — proxies Beads CLI data to the frontend.

Endpoints use a session_id path segment so the frontend can scope requests
to a specific session context; the BeadsClient itself is global (reads from
ALLY_SPECS_DIR) so all sessions share the same Beads state.
"""

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/tasks/{session_id}")
async def get_tasks(request: Request, session_id: str):
    """Return all tasks grouped by status."""
    beads = request.app.state.beads_client
    tasks = await beads.list_tasks()
    grouped = {
        "backlog": [],
        "ready": [],
        "in-progress": [],
        "done": [],
        "blocked": [],
    }
    for task in tasks:
        status = task.get("status", "backlog")
        if status in grouped:
            grouped[status].append(task)
        else:
            grouped["backlog"].append(task)
    return {"tasks": tasks, "by_status": grouped}


@router.get("/tasks/{session_id}/ready")
async def get_ready_tasks(request: Request, session_id: str):
    """Return tasks with no unresolved blockers."""
    return await request.app.state.beads_client.get_ready_tasks()


@router.get("/tasks/{session_id}/{task_id}")
async def get_task(request: Request, session_id: str, task_id: str):
    """Return a single task by ID."""
    return await request.app.state.beads_client.get_task(task_id)


@router.post("/tasks/{session_id}/refresh")
async def refresh_tasks(request: Request, session_id: str):
    """Re-fetch all tasks and publish a task_update event to the session."""
    beads = request.app.state.beads_client
    tasks = await beads.list_tasks()
    await request.app.state.event_bus.publish(
        session_id, {"type": "task_update", "tasks": tasks}
    )
    return {"ok": True, "count": len(tasks)}
