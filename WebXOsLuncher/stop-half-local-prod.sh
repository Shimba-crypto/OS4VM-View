#!/usr/bin/env bash
echo "Stopping half-local-prod servers..."
for f in /tmp/pid-backend /tmp/pid-simple /tmp/pid-nano /tmp/pid-bindows /tmp/pid-autonomous /tmp/pid-luncher; do
  if [ -f "$f" ]; then
    pid=$(cat "$f")
    kill "$pid" 2>/dev/null && echo "killed $pid ($f)"
    rm -f "$f"
  fi
done
pkill -f "vite.*5174" 2>/dev/null; pkill -f "vite.*5175" 2>/dev/null; pkill -f "vite.*5176" 2>/dev/null; pkill -f "vite.*5177" 2>/dev/null; pkill -f "vite.*5178" 2>/dev/null; pkill -f "vite.*4179" 2>/dev/null
echo "Done."
