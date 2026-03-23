# ally-agent-room — Agent Instructions

## Monorepo Structure

This is a monorepo with two sub-projects:

```
ally-agent-room/
├── backend/    # FastAPI — Python 3.11+, async WebSocket, Claude CLI bridge
└── frontend/   # React 18 + Vite 5 + TypeScript 5 + Tailwind CSS 3
```

- `backend/` contains the FastAPI application that bridges Claude CLI processes via `--output-format stream-json --input-format stream-json`. It manages agent sessions, routes chat messages, and proxies Beads (`bd`) commands.
- `frontend/` contains the React/Vite SPA. It renders an isometric 3D room with animated agent characters, a chat panel, kanban board, cost tracker, and file diff viewer.

## How to Run

**Backend:**
```bash
cd backend && uvicorn app.main:app --reload
```

The backend starts on `http://localhost:8000` by default.

**Frontend:**
```bash
cd frontend && npm run dev
```

The frontend starts on `http://localhost:5173` by default.

## Key Architecture Notes

- Frontend connects to backend via a single WebSocket per session for all real-time events
- Backend spawns one Claude CLI process per agent, communicating via stdin/stdout stream-json
- All session state is in-memory — no database, no persistence across restarts
- The `bd` CLI must be accessible from the backend process (used to proxy Beads task data)

## Smoke Test Checklist

Use this to verify the system works end-to-end after changes.

### 1. Backend Startup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Expected: Server starts with no import errors.

Verify:
```bash
curl http://localhost:8000/api/health
# Expected: {"status": "ok", "version": "0.1.0"}
```

### 2. Frontend TypeScript Check and Build

```bash
cd frontend
npm install
npx tsc --noEmit   # Must exit 0 with no errors
npm run build      # Must exit 0
```

Expected: TypeScript check clean, build succeeds with no errors.

### 3. Frontend Dev Server

```bash
cd frontend && npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173`. Open browser, confirm no console errors.

### 4. UI Verification (browser devtools)

- Room panel: 5 agent characters visible, isometric floor grid visible
- No JavaScript console errors on load

### 5. Session Creation

- Click "New Session" in sidebar
- Verify session appears in the sidebar
- Network tab: POST `/api/sessions` returns 200
- If Claude CLI not installed: `start_agents` may fail — this is acceptable, show a graceful error (no crash)

### 6. Chat Panel

- Send a message in chat
- Verify message appears with user alignment
- If no Claude CLI: expect graceful error response, no unhandled exception

### 7. Dashboard

- Click "Dashboard" in sidebar
- Kanban board renders with column headers (can be empty)
- If Beads (`bd`) not available: empty columns, no crash

### 8. Cost Panel

- Click "Cost" in sidebar
- Shows $0.00 total and 5 agent rows

### No Crashes Rule

- All panels must render without uncaught exceptions
- Backend must not crash on startup
- Missing external dependencies (Claude CLI, `bd`) must result in graceful degradation

## Repo Context

This repo is nested inside `ally-specs/` but has its own independent git history (`.git/` lives here, not in the parent). The `ally-specs/.gitignore` excludes this directory so the parent repo does not track its contents.
