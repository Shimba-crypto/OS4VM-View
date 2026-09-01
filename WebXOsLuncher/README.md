# WebXOs Luncher

Launcher to run **OS 1 = BackendOS** (+ 3 other browser OSes) from `OS4VM-View`.

- **BackendOS** — OS 1, macOS-style, 5174, `/os/backend/`, 8 apps
- **Bindows 11** — Windows 11 Fluent, 5177, `/os/bindows/`, new
- **SimpleOS** — XFCE-style, 5175, `/os/simple/`
- **NanoOS** — monochrome, 5176, `/os/nano/`

## Quick start

```bash
npm install
npm run dev      # launcher on http://localhost:5179
```

Run OSes in parallel (separate terminals):

```bash
cd ../OS4VM-View/BackendOS/client && npm run dev  # 5174
cd ../OS4VM-View/Bindows/client   && npm run dev  # 5177
cd ../OS4VM-View/SimpleOS/client  && npm run dev  # 5175
cd ../OS4VM-View/NanoOS/client    && npm run dev  # 5176
```

Set Instance ID + token via gear icon if you have a backend at `localhost:3001` (stored as `localStorage.vmview_token`).

## Half Local / Half Prod

Launcher **prod** (preview) embedding OS **dev** servers — closest to GitHub Pages without deploying:

```bash
./run-half-local-prod.sh
# Launcher PROD http://localhost:4179
# OSes DEV 5174/5175/5176/5177
# logs: tail -f /tmp/os-*.log /tmp/luncher-prod.log

./stop-half-local-prod.sh
```

Manual:

```bash
npm run build && npm run preview -- --port 4179 --host 0.0.0.0
# then run each OS with npm run dev
```

Environment toggle in settings: **Auto** (localhost→local dev, else prod relative) | **Local dev** (force `localhost:517x`) | **Prod** (force `./os/...`).
Health dots check `HEAD http://localhost:517x` every 8s. Instance browser lists `/api/instances` if backend at `localhost:3001` reachable.

## Full prod local (like GitHub Pages)

```bash
./assemble-site.sh          # builds all 4 OSes + Luncher → _site/
npx serve _site -l 4179     # or vite preview
./assemble-site.sh _site --serve  # build + serve
```

## Full prod (preview all)

```bash
# build all OSes + launcher, then preview each on its port
(cd ../OS4VM-View/BackendOS/client && npm run build && npm run preview -- --port 4174 --host 0.0.0.0) &
(cd ../OS4VM-View/Bindows/client   && npm run build && npm run preview -- --port 4177 --host 0.0.0.0) &
npm run build && npm run preview -- --port 4179 --host 0.0.0.0
```

Set env toggle to **Prod** to use relative `./os/...` paths (requires OSes served alongside launcher at `_site/` like GitHub Pages does).

## Build

```bash
npm run build   # dist/
```

All builds verified 2026-09-01 — launcher 170kB gzip 52kB, BackendOS 1.7MB, Bindows 501kB, SimpleOS 469kB, NanoOS 447kB.
Deploy: `WebXOsLuncher/dist` becomes site root (`_site/`), OSes at `_site/backend-os/` etc. + `/luncher/` copy — see `OS4VM-View/.github/workflows/deploy.yml`.
