#!/bin/bash
set -e
SCRIPT_DIR="$(dirname "$0")"
echo 'Starting ally-agent-room...'
echo 'Backend: http://localhost:8000'
echo 'Frontend: http://localhost:5173'

bash "$SCRIPT_DIR/backend/run.sh" &
BACKEND_PID=$!

bash "$SCRIPT_DIR/frontend/run.sh" &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' EXIT INT TERM
wait
