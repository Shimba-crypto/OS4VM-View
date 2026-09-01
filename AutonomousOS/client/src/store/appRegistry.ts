import { create } from 'zustand';
import type { AppDefinition } from '../types';

export interface WpmApp extends AppDefinition {
  entry: string;
  version: string;
  hash?: string;
  compatible?: string[];
  category?: string;
  description?: string;
  _catalogBase?: string;
}

const STORAGE_KEY = 'wpm_installed';

function loadStored(): WpmApp[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveStored(apps: WpmApp[]) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(apps)); } catch {} }

interface RegistryState {
  installed: WpmApp[];
  catalog: any[] | null;
  catalogUrl: string | null;
  install: (app: WpmApp) => void;
  uninstall: (id: string) => void;
  setCatalog: (catalog: any[], url: string) => void;
}

export const useAppRegistry = create<RegistryState>((set, get) => ({
  installed: loadStored(),
  catalog: null,
  catalogUrl: null,
  install: (app) => {
    const exists = get().installed.find((a) => a.id === app.id);
    if (exists) return;
    const next = [...get().installed, app];
    set({ installed: next });
    saveStored(next);
  },
  uninstall: (id) => {
    const next = get().installed.filter((a) => a.id !== id);
    set({ installed: next });
    saveStored(next);
  },
  setCatalog: (catalog, url) => set({ catalog, catalogUrl: url }),
}));

export function getAllApps(defaultApps: AppDefinition[]): AppDefinition[] {
  const { installed } = useAppRegistry.getState();
  return [...defaultApps, ...installed];
}

// Dynamic component cache
const componentCache = new Map<string, React.ComponentType<any>>();

export async function loadWpmComponent(entry: string, baseUrl: string): Promise<React.ComponentType<any>> {
  const url = new URL(entry, baseUrl).toString();
  if (componentCache.has(url)) return componentCache.get(url)!;
  // Ensure React is available globally for ESM packages that use window.React
  // @ts-ignore
  if (typeof window !== 'undefined' && !window.React) {
    // will be set by main.tsx
  }
  const mod = await import(/* @vite-ignore */ url);
  const comp = mod.default as React.ComponentType<any>;
  componentCache.set(url, comp);
  return comp;
}
