#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

npm ci
npm run build

uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 2 &
BACKEND_PID=$!

npm run preview -- --host 0.0.0.0 --port 4173 &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
