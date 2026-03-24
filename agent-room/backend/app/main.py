import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.event_bus import EventBus
from app.core.process_pool import ProcessPool
from app.routers import agents, chat, costs, diffs, sessions, tasks, timeline, ws
from app.services.agent_manager import AgentManager
from app.services.beads_client import BeadsClient
from app.services.chat_service import ChatService
from app.services.cli_bridge import CLIBridge
from app.services.cost_tracker import CostTracker
from app.services.diff_service import DiffService
from app.services.permission_service import PermissionService
from app.services.session_manager import SessionManager
from app.services.timeline_service import TimelineService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP ---
    event_bus = EventBus()
    process_pool = ProcessPool()
    cost_tracker = CostTracker(event_bus)
    diff_service = DiffService(event_bus)
    timeline_service = TimelineService(event_bus)
    agent_manager = AgentManager(event_bus)
    permission_service = PermissionService(event_bus)
    cli_bridge = CLIBridge(
        process_pool=process_pool,
        event_bus=event_bus,
        diff_service=diff_service,
        timeline_service=timeline_service,
        cost_tracker=cost_tracker,
        agent_manager=agent_manager,
    )
    chat_service = ChatService(cli_bridge, event_bus)
    chat_service._agent_manager = agent_manager  # for state updates
    cli_bridge._chat_service = chat_service  # wire back-reference for history recording
    session_manager = SessionManager(cli_bridge, event_bus)
    beads_client = BeadsClient(settings.ALLY_SPECS_DIR)

    app.state.event_bus = event_bus
    app.state.process_pool = process_pool
    app.state.cost_tracker = cost_tracker
    app.state.diff_service = diff_service
    app.state.timeline_service = timeline_service
    app.state.agent_manager = agent_manager
    app.state.permission_service = permission_service
    app.state.cli_bridge = cli_bridge
    app.state.chat_service = chat_service
    app.state.session_manager = session_manager
    app.state.beads_client = beads_client

    logger.info(
        "Starting ally-agent-room backend. ALLY_SPECS_DIR=%s", settings.ALLY_SPECS_DIR
    )

    yield

    # --- SHUTDOWN ---
    await process_pool.terminate_all()
    logger.info("Backend shutdown complete")


app = FastAPI(title="Ally Agent Room Backend", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws.router, prefix="")
app.include_router(tasks.router, prefix="/api")
app.include_router(costs.router, prefix="/api")
app.include_router(diffs.router, prefix="/api")
app.include_router(timeline.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
