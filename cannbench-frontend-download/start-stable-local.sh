#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ -f logs/stable-local.pid ]]; then
  old_pid="$(cat logs/stable-local.pid 2>/dev/null || true)"
  if [[ -n "${old_pid}" ]]; then
    kill "${old_pid}" 2>/dev/null || true
  fi
fi

if lsof -tiTCP:4174 -sTCP:LISTEN >/dev/null 2>&1; then
  lsof -tiTCP:4174 -sTCP:LISTEN | xargs kill 2>/dev/null || true
fi

PORT=4174 LOGGED_IN_REPLAY=1 nohup node serve-local.mjs \
  > logs/stable-local.out.log \
  2> logs/stable-local.err.log &

echo $! > logs/stable-local.pid
echo "http://127.0.0.1:4174/"
