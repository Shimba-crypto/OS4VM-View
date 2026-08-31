import { create } from 'zustand';
import type { WindowState, AppDefinition } from '../types';

const defaultApps: AppDefinition[] = [
  { id: 'terminal', name: 'Terminal', icon: '>', desktopIcon: '>_', defaultWidth: 650, defaultHeight: 400, minWidth: 350, minHeight: 200, component: 'Terminal' },
  { id: 'file-manager', name: 'File Manager', icon: '📁', desktopIcon: '📁', defaultWidth: 700, defaultHeight: 450, minWidth: 400, minHeight: 250, component: 'FileManager' },
  { id: 'text-editor', name: 'Text Editor', icon: '📝', desktopIcon: '📝', defaultWidth: 650, defaultHeight: 450, minWidth: 350, minHeight: 250, component: 'TextEditor' },
  { id: 'calculator', name: 'Calculator', icon: '🔢', desktopIcon: '🔢', defaultWidth: 260, defaultHeight: 370, minWidth: 240, minHeight: 350, component: 'Calculator' },
  { id: 'system-info', name: 'System Info', icon: '📊', desktopIcon: '📊', defaultWidth: 420, defaultHeight: 380, component: 'SystemInfo' },
];

interface WindowStore {
  windows: WindowState[];
  nextZIndex: number;
  openApp: (appId: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  restoreWindow: (id: string) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  nextZIndex: 100,

  openApp: (appId) => {
    const app = defaultApps.find((a) => a.id === appId);
    if (!app) return;

    const existing = get().windows.find((w) => w.appId === appId && !w.minimized);
    if (existing) { get().focusWindow(existing.id); return; }

    const minimized = get().windows.find((w) => w.appId === appId && w.minimized);
    if (minimized) { get().restoreWindow(minimized.id); return; }

    const state = get();
    const offsetX = (state.windows.length % 6) * 25;
    const offsetY = (state.windows.length % 6) * 25;

    const newWindow: WindowState = {
      id: `win-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      appId: app.id,
      title: app.name,
      icon: app.icon,
      x: 80 + offsetX,
      y: 30 + offsetY,
      width: app.defaultWidth,
      height: app.defaultHeight,
      minWidth: app.minWidth,
      minHeight: app.minHeight,
      minimized: false,
      maximized: false,
      focused: true,
      zIndex: state.nextZIndex,
    };

    set((s) => ({
      windows: s.windows.map((w) => ({ ...w, focused: false })).concat(newWindow),
      nextZIndex: s.nextZIndex + 1,
    }));
  },

  closeWindow: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  minimizeWindow: (id) => set((s) => ({
    windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true, focused: false } : w)),
  })),

  maximizeWindow: (id) => set((s) => ({
    windows: s.windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)),
  })),

  focusWindow: (id) => {
    const state = get();
    const newZ = state.nextZIndex;
    set({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, focused: true, zIndex: newZ, minimized: false } : { ...w, focused: false }
      ),
      nextZIndex: newZ + 1,
    });
  },

  moveWindow: (id, x, y) => set((s) => ({
    windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
  })),

  resizeWindow: (id, width, height) => set((s) => ({
    windows: s.windows.map((w) => (w.id === id ? { ...w, width, height } : w)),
  })),

  restoreWindow: (id) => {
    const state = get();
    const newZ = state.nextZIndex;
    set({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: false, focused: true, zIndex: newZ } : { ...w, focused: false }
      ),
      nextZIndex: newZ + 1,
    });
  },
}));

export { defaultApps };
