export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  zIndex: number;
  agentPinned?: boolean;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  component: string;
  category?: string;
  description?: string;
}

export interface DesktopSettings {
  wallpaper: string;
  theme: 'dark';
  accent: string;
  autoTile: boolean;
  agentEnabled: boolean;
}

export type AgentActionType = 'openApp' | 'closeWindow' | 'minimizeWindow' | 'moveWindow' | 'resizeWindow' | 'writeLog';
export interface AgentAction { type: AgentActionType; payload: any; label: string; }
export interface AgentTask {
  id: string;
  prompt: string;
  actions: AgentAction[];
  status: 'queued' | 'running' | 'done' | 'failed';
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
}
