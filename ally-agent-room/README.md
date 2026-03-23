# ally-agent-room

A web-based visual interface for the Ally multi-agent development system. Provides an isometric 3D "agent room" where users can observe agent activity, chat with agents, and manage the development pipeline visually.

## Structure

```
ally-agent-room/
├── backend/    # FastAPI backend — bridges Claude CLI processes via stream-json
└── frontend/   # React/Vite frontend — isometric 3D room UI
```

## Quick Start

**Backend:**
```bash
cd backend && uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend && npm run dev
```

## Notes

- This repo is nested inside `ally-specs/` but has its own git history
- Requires Claude CLI installed on the host machine
- Requires Beads CLI (`bd`) accessible from the backend
