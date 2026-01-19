#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v uv >/dev/null 2>&1; then
  uv venv .venv
  source .venv/bin/activate
  uv pip install -r requirements.txt
else
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
fi

npm ci
npm run build

uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 2 &
BACKEND_PID=$!

npm run preview -- --host 0.0.0.0 --port 4173 &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
