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
  theme: 'light' | 'dark';
  accentColor: string;
  taskbarAlignment: 'center' | 'left';
}
