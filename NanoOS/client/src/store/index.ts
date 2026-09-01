import { create } from 'zustand';
import { useAppRegistry } from './appRegistry';

export interface WinState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  z: number;
}

export interface AppDef {
  id: string;
  name: string;
  icon: string;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export const APPS: AppDef[] = [
  { id: 'terminal', name: 'Terminal', icon: '>', w: 600, h: 380, minW: 300, minH: 180 },
  { id: 'files', name: 'Files', icon: '~', w: 550, h: 360, minW: 300, minH: 200 },
  { id: 'db-viewer', name: 'DB Viewer', icon: '🗄️', w: 600, h: 400, minW: 400, minH: 300 },
  { id: 'time-tracker', name: 'Time Tracker', icon: '⏱️', w: 500, h: 400 },
];

interface Store {
  windows: WinState[];
  nextZ: number;
  open: (appId: string) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  maximize: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
  restore: (id: string) => void;
}

export const useStore = create<Store>((set, get) => ({
  windows: [],
  nextZ: 100,

  open: (appId) => {
    const installed = useAppRegistry.getState().installed as any;
    const allApps = [...APPS, ...installed];
    const app = allApps.find((a: any) => a.id === appId);
    if (!app) return;
    const existing = get().windows.find((w) => w.appId === appId && !w.minimized);
    if (existing) { get().focus(existing.id); return; }
    const minimized = get().windows.find((w) => w.appId === appId && w.minimized);
    if (minimized) { get().restore(minimized.id); return; }

    const s = get();
    const off = (s.windows.length % 5) * 20;
    set({
      windows: s.windows.map((w) => ({ ...w, focused: false })).concat({
        id: `w${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
        appId: app.id,
        title: app.name,
        x: 60 + off, y: 20 + off,
        w: (app as any).w || (app as any).defaultWidth || 500,
        h: (app as any).h || (app as any).defaultHeight || 380,
        minW: (app as any).minW || (app as any).minWidth || 300,
        minH: (app as any).minH || (app as any).minHeight || 200,
        minimized: false, maximized: false, focused: true, z: s.nextZ,
      }),
      nextZ: s.nextZ + 1,
    });
  },

  close: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  minimize: (id) => set((s) => ({
    windows: s.windows.map((w) => w.id === id ? { ...w, minimized: true, focused: false } : w),
  })),

  maximize: (id) => set((s) => ({
    windows: s.windows.map((w) => w.id === id ? { ...w, maximized: !w.maximized } : w),
  })),

  focus: (id) => {
    const s = get();
    set({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, focused: true, z: s.nextZ, minimized: false } : { ...w, focused: false }
      ),
      nextZ: s.nextZ + 1,
    });
  },

  move: (id, x, y) => set((s) => ({
    windows: s.windows.map((w) => w.id === id ? { ...w, x, y } : w),
  })),

  resize: (id, w, h) => set((s) => ({
    windows: s.windows.map((win) => win.id === id ? { ...win, w, h } : win),
  })),

  restore: (id) => {
    const s = get();
    set({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, minimized: false, focused: true, z: s.nextZ } : { ...w, focused: false }
      ),
      nextZ: s.nextZ + 1,
    });
  },
}));
