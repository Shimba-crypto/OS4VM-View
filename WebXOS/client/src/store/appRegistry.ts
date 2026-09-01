import React from 'react';
import { create } from 'zustand';
import type { AppDefinition } from '../types';

export interface WpmApp extends AppDefinition {
  entry: string;
  _catalogBase?: string;
}

interface AppRegistryState {
  installed: WpmApp[];
  addApp: (app: WpmApp) => void;
  removeApp: (id: string) => void;
}

const STORAGE_KEY = 'wxos_wpm_installed';

function loadInstalled(): WpmApp[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveInstalled(apps: WpmApp[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export const useAppRegistry = create<AppRegistryState>((set, get) => ({
  installed: loadInstalled(),
  addApp: (app) => {
    const next = [...get().installed.filter((a) => a.id !== app.id), app];
    saveInstalled(next);
    set({ installed: next });
  },
  removeApp: (id) => {
    const next = get().installed.filter((a) => a.id !== id);
    saveInstalled(next);
    set({ installed: next });
  },
}));

export async function loadWpmComponent(entry: string, baseUrl: string): Promise<React.ComponentType<{ windowId: string }>> {
  const url = new URL(entry, baseUrl).toString();
  const mod = await import(/* @vite-ignore */ url);
  const Fn = mod.default || mod;
  return function WpmComponent({ windowId }: { windowId: string }) {
    return React.createElement('div', { className: 'w-full h-full p-4' }, React.createElement(Fn, { windowId }));
  };
}
