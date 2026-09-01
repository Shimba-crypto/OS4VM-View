import { create } from 'zustand';
import { useAppRegistry } from './appRegistry';
import type { WindowState, AppDefinition, DesktopSettings } from '../types';

export const defaultApps: AppDefinition[] = [
  { id: 'file-explorer', name: 'File Explorer', icon: '📁', defaultWidth: 900, defaultHeight: 520, minWidth: 600, minHeight: 350, component: 'FileExplorer', category: 'System', description: 'Browse files and folders' },
  { id: 'terminal', name: 'Terminal', icon: '🖥️', defaultWidth: 700, defaultHeight: 450, minWidth: 400, minHeight: 280, component: 'Terminal', category: 'System', description: 'Command line' },
  { id: 'notepad', name: 'Notepad', icon: '📝', defaultWidth: 700, defaultHeight: 500, minWidth: 400, minHeight: 300, component: 'Notepad', category: 'Accessories', description: 'Text editor' },
  { id: 'browser', name: 'Edge', icon: '🌐', defaultWidth: 1000, defaultHeight: 620, minWidth: 500, minHeight: 350, component: 'Browser', category: 'Internet', description: 'Web browser' },
  { id: 'calculator', name: 'Calculator', icon: '🔢', defaultWidth: 340, defaultHeight: 520, minWidth: 320, minHeight: 450, resizable: false, component: 'Calculator', category: 'Accessories', description: 'Calculator' },
  { id: 'settings', name: 'Settings', icon: '⚙️', defaultWidth: 850, defaultHeight: 550, minWidth: 600, minHeight: 400, component: 'Settings', category: 'System', description: 'System settings' },
  { id: 'vscode', name: 'VS Code', icon: '💻', defaultWidth: 950, defaultHeight: 600, minWidth: 500, minHeight: 350, component: 'Browser', category: 'Development', description: 'Code editor' },
  { id: 'store', name: 'Microsoft Store', icon: '🛒', defaultWidth: 900, defaultHeight: 600, minWidth: 600, minHeight: 400, component: 'Store', category: 'System', description: 'App store' },
  { id: 'photos', name: 'Photos', icon: '🖼️', defaultWidth: 800, defaultHeight: 550, minWidth: 500, minHeight: 350, component: 'Photos', category: 'Accessories', description: 'Image viewer' },
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
    if (existing) {
      get().focusWindow(existing.id);
      return;
    }

    const minimized = get().windows.find((w) => w.appId === appId && w.minimized);
    if (minimized) {
      get().restoreWindow(minimized.id);
      return;
    }

    const state = get();
    const offset = (state.windows.length % 6) * 28;

    const newWindow: WindowState = {
      id: `win-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      appId: app.id,
      title: app.name,
      icon: app.icon,
      x: 80 + offset,
      y: 40 + offset,
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

export { defaultApps as apps };

interface DesktopStore {
  settings: DesktopSettings;
  startOpen: boolean;
  setWallpaper: (wallpaper: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setTaskbarAlignment: (align: 'center' | 'left') => void;
  toggleStart: () => void;
  setStartOpen: (open: boolean) => void;
  closeStart: () => void;
}

export const useDesktopStore = create<DesktopStore>((set) => ({
  settings: {
    wallpaper: 'bloom',
    theme: 'light',
    accentColor: '#0078d4',
    taskbarAlignment: 'center',
  },
  startOpen: false,
  setWallpaper: (wallpaper) => set((s) => ({ settings: { ...s.settings, wallpaper } })),
  setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
  setTaskbarAlignment: (taskbarAlignment) => set((s) => ({ settings: { ...s.settings, taskbarAlignment } })),
  toggleStart: () => set((s) => ({ startOpen: !s.startOpen })),
  setStartOpen: (startOpen) => set({ startOpen }),
  closeStart: () => set({ startOpen: false }),
}));
