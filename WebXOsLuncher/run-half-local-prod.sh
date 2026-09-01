#!/usr/bin/env bash
# Half Local / Half Prod runner
# - Launcher: PROD (vite preview on 4179, built dist)
# - OSes: DEV (vite dev on 5174/5175/5176/5177 with HMR + /api proxy)
# This lets you test prod launcher embedding dev OSes — closest to GitHub Pages behavior without deploying.

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
OS_ROOT="/home/shimba/OS4VM-View"

echo "=== WebXOs Luncher — Half Local / Half Prod ==="
echo "Launcher = PROD (4179) | OSes = DEV (517x)"
echo ""

# Build launcher prod
echo "[1/3] Building launcher (prod)..."
cd "$ROOT"
npm run build

# Check OS dev dependencies
for os in BackendOS SimpleOS NanoOS Bindows AutonomousOS; do
  if [ ! -d "$OS_ROOT/$os/client/node_modules" ]; then
    echo "Installing $os..."
    (cd "$OS_ROOT/$os/client" && npm install)
  fi
done

# Start OS dev servers in background
echo "[2/3] Starting OS dev servers..."
pids=()
(cd "$OS_ROOT/BackendOS/client" && nohup npm run dev > /tmp/os-backend-dev.log 2>&1 & echo $! > /tmp/pid-backend)
(cd "$OS_ROOT/SimpleOS/client" && nohup npm run dev > /tmp/os-simple-dev.log 2>&1 & echo $! > /tmp/pid-simple)
(cd "$OS_ROOT/NanoOS/client" && nohup npm run dev > /tmp/os-nano-dev.log 2>&1 & echo $! > /tmp/pid-nano)
(cd "$OS_ROOT/Bindows/client" && nohup npm run dev > /tmp/os-bindows-dev.log 2>&1 & echo $! > /tmp/pid-bindows)
(cd "$OS_ROOT/AutonomousOS/client" && nohup npm run dev > /tmp/os-autonomous-dev.log 2>&1 & echo $! > /tmp/pid-autonomous)
sleep 4
echo "  BackendOS     http://localhost:5174/os/backend/     (log /tmp/os-backend-dev.log)"
echo "  SimpleOS      http://localhost:5175/os/simple/      (log /tmp/os-simple-dev.log)"
echo "  NanoOS        http://localhost:5176/os/nano/        (log /tmp/os-nano-dev.log)"
echo "  Bindows       http://localhost:5177/os/bindows/     (log /tmp/os-bindows-dev.log)"
echo "  AutonomousOS  http://localhost:5178/os/autonomous/  (log /tmp/os-autonomous-dev.log)"

# Start launcher preview (prod)
echo "[3/3] Starting launcher PROD preview..."
cd "$ROOT"
nohup npm run preview -- --port 4179 --host 0.0.0.0 > /tmp/luncher-prod.log 2>&1 & echo $! > /tmp/pid-luncher
sleep 2
echo ""
echo "✓ Launcher PROD  http://localhost:4179/  (log /tmp/luncher-prod.log)"
echo ""
echo "— Half Local / Half Prod ready —"
echo "  Embed mode will iframe http://localhost:517x (dev) even though launcher is prod."
echo "  Set Instance ID / token via gear icon if you have a backend at localhost:3001"
echo ""
echo "To stop:  ./stop-half-local-prod.sh  or  pkill -f 'vite'"
echo "Tail logs: tail -f /tmp/os-*.log /tmp/luncher-prod.log"
