import { create } from 'zustand';
import { useAppRegistry } from './appRegistry';
import type { WindowState, AppDefinition, DesktopSettings } from '../types';

const defaultApps: AppDefinition[] = [
  { id: 'terminal', name: 'Terminal', icon: '>_', defaultWidth: 700, defaultHeight: 450, minWidth: 400, minHeight: 250, component: 'Terminal' },
  { id: 'browser', name: 'Browser', icon: '🌐', defaultWidth: 900, defaultHeight: 600, minWidth: 500, minHeight: 350, component: 'Browser' },
  { id: 'text-editor', name: 'Text Editor', icon: '📝', defaultWidth: 800, defaultHeight: 550, minWidth: 400, minHeight: 300, component: 'TextEditor' },
  { id: 'calculator', name: 'Calculator', icon: '🔢', defaultWidth: 300, defaultHeight: 420, minWidth: 280, minHeight: 400, resizable: false, component: 'Calculator' },
  { id: 'settings', name: 'Settings', icon: '⚙️', defaultWidth: 650, defaultHeight: 480, component: 'Settings' },
  { id: 'system-info', name: 'System Info', icon: '📊', defaultWidth: 500, defaultHeight: 400, component: 'SystemInfo' },
  { id: 'db-viewer', name: 'DB Viewer', icon: '🗄️', defaultWidth: 700, defaultHeight: 500, minWidth: 500, minHeight: 400, component: 'DBViewer' },
  { id: 'app-store', name: 'App Store', icon: '🏪', defaultWidth: 700, defaultHeight: 500, component: 'AppStore' },
  { id: 'time-tracker', name: 'Time Tracker', icon: '⏱️', defaultWidth: 500, defaultHeight: 400, component: 'TimeTracker' },
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
    const installed = useAppRegistry.getState().installed;
    const allApps = [...defaultApps, ...installed];
    const app = allApps.find((a) => a.id === appId);
    if (!app) return;
    const existing = get().windows.find((w) => w.appId === appId && !w.minimized);
    if (existing) { get().focusWindow(existing.id); return; }
    const minimized = get().windows.find((w) => w.appId === appId && w.minimized);
    if (minimized) { get().restoreWindow(minimized.id); return; }
    const state = get();
    const offsetX = (state.windows.length % 5) * 30;
    const offsetY = (state.windows.length % 5) * 30;
    const newWindow: WindowState = {
      id: `win-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      appId: app.id, title: app.name, icon: app.icon,
      x: 120 + offsetX, y: 60 + offsetY,
      width: app.defaultWidth, height: app.defaultHeight,
      minWidth: app.minWidth, minHeight: app.minHeight,
      minimized: false, maximized: false, focused: true, zIndex: state.nextZIndex,
    };
    set((s) => ({
      windows: s.windows.map((w) => ({ ...w, focused: false })).concat(newWindow),
      nextZIndex: s.nextZIndex + 1,
    }));
  },
  closeWindow: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),
  minimizeWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, minimized: true, focused: false } : w) })),
  maximizeWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, maximized: !w.maximized } : w) })),
  focusWindow: (id) => {
    const state = get();
    const newZ = state.nextZIndex;
    set({ windows: state.windows.map((w) => w.id === id ? { ...w, focused: true, zIndex: newZ, minimized: false } : { ...w, focused: false }), nextZIndex: newZ + 1 });
  },
  moveWindow: (id, x, y) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, x, y } : w) })),
  resizeWindow: (id, width, height) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, width, height } : w) })),
  restoreWindow: (id) => {
    const state = get();
    const newZ = state.nextZIndex;
    set({ windows: state.windows.map((w) => w.id === id ? { ...w, minimized: false, focused: true, zIndex: newZ } : { ...w, focused: false }), nextZIndex: newZ + 1 });
  },
}));

export { defaultApps };

interface DesktopStore {
  settings: DesktopSettings;
  setWallpaper: (w: string) => void;
  setTheme: (t: 'dark' | 'light') => void;
}

export const useDesktopStore = create<DesktopStore>((set) => ({
  settings: { wallpaper: 'chrome-gradient', theme: 'dark' },
  setWallpaper: (wallpaper) => set((s) => ({ settings: { ...s.settings, wallpaper } })),
  setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
}));
