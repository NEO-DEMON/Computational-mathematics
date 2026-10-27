#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Запуск Backend (FastAPI) на http://127.0.0.1:8001 ..."
"$ROOT_DIR/backend/venv/bin/python3" -m uvicorn main:app --app-dir "$ROOT_DIR/backend" --host 127.0.0.1 --port 8001 --reload &
BACKEND_PID=$!

echo "Запуск Frontend (Vite) на http://127.0.0.1:5173 ..."
"$ROOT_DIR/frontend/node_modules/.bin/vite" "$ROOT_DIR/frontend" --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0' INT TERM

echo ""
echo "Приложение запущено: http://127.0.0.1:5173/"
echo "Нажмите Ctrl+C для остановки обоих серверов."
wait
