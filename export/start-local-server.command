#!/bin/zsh
cd "$(dirname "$0")" || exit 1
echo "Serving CANN-Bench export at http://127.0.0.1:4173/"
echo "Press Ctrl+C to stop."
python3 -m http.server 4173
