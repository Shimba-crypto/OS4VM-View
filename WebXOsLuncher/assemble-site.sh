#!/usr/bin/env bash
# Assemble full prod _site locally (mirrors deploy.yml Assemble Pages)
# Usage: ./assemble-site.sh [outDir]
set -e
OUT="${1:-_site}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
OS_ROOT="/home/shimba/OS4VM-View"

echo "Building all prod dists..."
(cd "$OS_ROOT/BackendOS/client" && npm run build)
(cd "$OS_ROOT/SimpleOS/client" && npm run build)
(cd "$OS_ROOT/NanoOS/client" && npm run build)
(cd "$OS_ROOT/Bindows/client" && npm run build)
(cd "$OS_ROOT/AutonomousOS/client" && npm run build)
(cd "$ROOT" && npm run build)

echo "Assembling $OUT/..."
rm -rf "$ROOT/$OUT"
mkdir -p "$ROOT/$OUT/backend-os" "$ROOT/$OUT/simple-os" "$ROOT/$OUT/nano-os" "$ROOT/$OUT/bindows" "$ROOT/$OUT/autonomous" "$ROOT/$OUT/luncher"
cp -r "$OS_ROOT/BackendOS/client/dist"/* "$ROOT/$OUT/backend-os/"
cp -r "$OS_ROOT/SimpleOS/client/dist"/* "$ROOT/$OUT/simple-os/"
cp -r "$OS_ROOT/NanoOS/client/dist"/* "$ROOT/$OUT/nano-os/"
cp -r "$OS_ROOT/Bindows/client/dist"/* "$ROOT/$OUT/bindows/"
cp -r "$OS_ROOT/AutonomousOS/client/dist"/* "$ROOT/$OUT/autonomous/"
cp -r "$ROOT/dist"/* "$ROOT/$OUT/"
cp -r "$ROOT/dist"/* "$ROOT/$OUT/luncher/"

echo "✓ $OUT assembled:"
ls -lh "$ROOT/$OUT" | head -20
echo "Preview full prod: npx serve $OUT -l 4179  (or)  npx vite preview --host 0.0.0.0 --port 4179 --outDir $OUT"
# Optional: start preview if --serve flag
if [ "$2" = "--serve" ]; then
  npx serve "$ROOT/$OUT" -l 4179
fi
