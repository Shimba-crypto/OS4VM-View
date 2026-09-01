import { create } from 'zustand';
import { useAppRegistry } from './appRegistry';
import type { WindowState, AppDefinition, DesktopSettings, AgentTask, AgentAction } from '../types';
import { bus } from './bus';

export const defaultApps: AppDefinition[] = [
  { id: 'terminal', name: 'Terminal', icon: '◧', defaultWidth: 720, defaultHeight: 460, minWidth: 400, minHeight: 280, component: 'Terminal', category: 'System', description: 'xterm + agent commands' },
  { id: 'explorer', name: 'Explorer', icon: '⬢', defaultWidth: 900, defaultHeight: 520, minWidth: 600, minHeight: 350, component: 'Explorer', category: 'System', description: 'File browser' },
  { id: 'notepad', name: 'Notepad', icon: '≡', defaultWidth: 680, defaultHeight: 480, minWidth: 400, minHeight: 300, component: 'Notepad', category: 'Accessories', description: 'Text editor' },
  { id: 'monitor', name: 'Task Monitor', icon: '◎', defaultWidth: 640, defaultHeight: 460, minWidth: 420, minHeight: 320, component: 'Monitor', category: 'System', description: 'Queue + health' },
  { id: 'agent', name: 'Agent Console', icon: '⬡', defaultWidth: 560, defaultHeight: 520, minWidth: 400, minHeight: 380, component: 'AgentConsole', category: 'Autonomy', description: 'Agent queue & history' },
  { id: 'settings', name: 'Settings', icon: '⬔', defaultWidth: 760, defaultHeight: 500, minWidth: 500, minHeight: 380, component: 'Settings', category: 'System', description: 'Autonomy controls' },
  { id: 'db-viewer', name: 'DB Viewer', icon: '🗄️', defaultWidth: 720, defaultHeight: 500, minWidth: 500, minHeight: 400, component: 'DBViewer', category: 'System', description: 'Sandboxed SQLite per-app' },
];

interface WindowStore {
  windows: WindowState[];
  nextZIndex: number;
  openApp: (appId: string, opts?: { agent?: boolean }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  restoreWindow: (id: string) => void;
  tileWindows: () => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  nextZIndex: 100,
  openApp: (appId, opts) => {
    const installed = useAppRegistry.getState().installed;
    const allApps = [...defaultApps, ...installed];
    const app = allApps.find((a) => a.id === appId);
    if (!app) return;
    const existing = get().windows.find((w) => w.appId === appId && !w.minimized);
    if (existing) { get().focusWindow(existing.id); return; }
    const minimized = get().windows.find((w) => w.appId === appId && w.minimized);
    if (minimized) { get().restoreWindow(minimized.id); return; }
    const s = get();
    const off = (s.windows.length % 6) * 26;
    const w: WindowState = {
      id: `win-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      appId: app.id, title: app.name, icon: app.icon,
      x: 72 + off, y: 40 + off, width: app.defaultWidth, height: app.defaultHeight,
      minWidth: app.minWidth, minHeight: app.minHeight,
      minimized: false, maximized: false, focused: true, zIndex: s.nextZIndex,
      agentPinned: !!opts?.agent,
    };
    set({ windows: s.windows.map((x) => ({ ...x, focused: false })).concat(w), nextZIndex: s.nextZIndex + 1 });
    bus.emit('window:opened', w);
    if (useDesktopStore.getState().settings.autoTile) setTimeout(() => get().tileWindows(), 80);
  },
  closeWindow: (id) => { set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })); bus.emit('window:closed', id); },
  minimizeWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, minimized: true, focused: false } : w) })),
  maximizeWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, maximized: !w.maximized } : w) })),
  focusWindow: (id) => {
    const s = get(); const nz = s.nextZIndex;
    set({ windows: s.windows.map((w) => w.id === id ? { ...w, focused: true, zIndex: nz, minimized: false } : { ...w, focused: false }), nextZIndex: nz + 1 });
    bus.emit('window:focused', id);
  },
  moveWindow: (id, x, y) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, x, y } : w) })),
  resizeWindow: (id, width, height) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, width, height } : w) })),
  restoreWindow: (id) => {
    const s = get(); const nz = s.nextZIndex;
    set({ windows: s.windows.map((w) => w.id === id ? { ...w, minimized: false, focused: true, zIndex: nz } : { ...w, focused: false }), nextZIndex: nz + 1 });
  },
  tileWindows: () => {
    const wins = get().windows.filter((w) => !w.minimized && !w.maximized);
    if (wins.length <= 1) return;
    const cols = wins.length === 2 ? 2 : wins.length <= 4 ? 2 : 3;
    const pad = 16; const top = 36; const gap = 12;
    const availW = window.innerWidth - pad * 2 - gap * (cols - 1);
    const availH = window.innerHeight - top - 48 - pad; // taskbar 48
    const cw = Math.floor(availW / cols);
    const rows = Math.ceil(wins.length / cols);
    const rh = Math.floor((availH - gap * (rows - 1)) / rows);
    set((s) => ({
      windows: s.windows.map((w) => {
        const idx = wins.findIndex((x) => x.id === w.id);
        if (idx === -1) return w;
        const col = idx % cols; const row = Math.floor(idx / cols);
        return { ...w, x: pad + col * (cw + gap), y: top + row * (rh + gap), width: cw, height: rh };
      }),
    }));
    bus.emit('window:tiled', wins.length);
  },
}));

function parsePrompt(prompt: string): AgentAction[] {
  const p = prompt.toLowerCase();
  const acts: AgentAction[] = [];
  const wants = (kw: string[]) => kw.some((k) => p.includes(k));
  if (wants(['terminal', 'term', 'shell', 'xterm'])) acts.push({ type: 'openApp', payload: 'terminal', label: 'Open Terminal' });
  if (wants(['explorer', 'files', 'file', 'folder'])) acts.push({ type: 'openApp', payload: 'explorer', label: 'Open Explorer' });
  if (wants(['notepad', 'editor', 'note', 'text'])) acts.push({ type: 'openApp', payload: 'notepad', label: 'Open Notepad' });
  if (wants(['monitor', 'task', 'health'])) acts.push({ type: 'openApp', payload: 'monitor', label: 'Open Task Monitor' });
  if (wants(['agent', 'console', 'queue'])) acts.push({ type: 'openApp', payload: 'agent', label: 'Open Agent Console' });
  if (wants(['settings', 'config', 'preferences'])) acts.push({ type: 'openApp', payload: 'settings', label: 'Open Settings' });
  if (wants(['tile', 'arrange', 'grid'])) acts.push({ type: 'moveWindow', payload: 'tile', label: 'Tile windows' });
  if (wants(['close all', 'clear'])) {
    acts.length = 0;
    acts.push({ type: 'writeLog', payload: 'Closing all (simulated)', label: 'Clear workspace' });
  }
  if (acts.length === 0) {
    // fallback: open terminal + log
    acts.push({ type: 'openApp', payload: 'terminal', label: 'Open Terminal (fallback)' });
    acts.push({ type: 'writeLog', payload: `No rule for "${prompt}" — opened Terminal`, label: 'Log' });
  }
  return acts;
}

interface AutoStore {
  enabled: boolean;
  autoTile: boolean;
  queue: AgentTask[];
  history: AgentTask[];
  isRunning: boolean;
  enqueue: (prompt: string) => void;
  runNext: () => Promise<void>;
  clear: () => void;
  setEnabled: (v: boolean) => void;
  setAutoTile: (v: boolean) => void;
}

export const useAutonomousStore = create<AutoStore>((set, get) => ({
  enabled: true,
  autoTile: false,
  queue: [],
  history: [],
  isRunning: false,
  enqueue: (prompt) => {
    const task: AgentTask = { id: `t-${Date.now()}`, prompt, actions: parsePrompt(prompt), status: 'queued', createdAt: Date.now() };
    set((s) => ({ queue: [...s.queue, task] }));
    bus.emit('agent:enqueued', task);
    if (get().enabled && !get().isRunning) get().runNext();
  },
  runNext: async () => {
    const { queue, isRunning } = get();
    if (isRunning || queue.length === 0) return;
    const task = queue[0];
    set({ isRunning: true, queue: queue.map((t) => t.id === task.id ? { ...t, status: 'running', startedAt: Date.now() } : t) });
    bus.emit('agent:started', task);
    // Execute actions sequentially with small delay
    for (const act of task.actions) {
      await new Promise((r) => setTimeout(r, 280));
      try {
        const ws = useWindowStore.getState();
        switch (act.type) {
          case 'openApp': ws.openApp(act.payload, { agent: true }); break;
          case 'closeWindow': ws.closeWindow(act.payload); break;
          case 'minimizeWindow': ws.minimizeWindow(act.payload); break;
          case 'moveWindow':
            if (act.payload === 'tile') ws.tileWindows();
            else ws.moveWindow(act.payload.id, act.payload.x, act.payload.y);
            break;
          case 'writeLog': bus.emit('agent:log', act.payload); break;
        }
      } catch {}
    }
    const done: AgentTask = { ...task, status: 'done', finishedAt: Date.now() };
    set((s) => ({ queue: s.queue.slice(1), history: [done, ...s.history].slice(0, 20), isRunning: false }));
    bus.emit('agent:done', done);
    if (get().queue.length > 0 && get().enabled) setTimeout(() => get().runNext(), 300);
  },
  clear: () => set({ queue: [], history: [] }),
  setEnabled: (enabled) => set({ enabled }),
  setAutoTile: (autoTile) => set({ autoTile }),
}));

export const useDesktopStore = create<{
  settings: DesktopSettings;
  setWallpaper: (w: string) => void;
  setAutoTile: (v: boolean) => void;
  setAgentEnabled: (v: boolean) => void;
}>((set) => ({
  settings: { wallpaper: 'grid', theme: 'dark', accent: '#22d3ee', autoTile: false, agentEnabled: true },
  setWallpaper: (wallpaper) => set((s) => ({ settings: { ...s.settings, wallpaper } })),
  setAutoTile: (autoTile) => {
    set((s) => ({ settings: { ...s.settings, autoTile } }));
    useAutonomousStore.getState().setAutoTile(autoTile);
  },
  setAgentEnabled: (agentEnabled) => {
    set((s) => ({ settings: { ...s.settings, agentEnabled } }));
    useAutonomousStore.getState().setEnabled(agentEnabled);
  },
}));
