import { useWindowStore, defaultApps } from '../../store';
import { useAppRegistry, loadWpmComponent } from '../../store/appRegistry';
import { useState, useEffect } from 'react';
import Window from './Window';
import TerminalApp from '../Apps/Terminal/TerminalApp';
import ExplorerApp from '../Apps/FileExplorer/ExplorerApp';
import NotepadApp from '../Apps/Notepad/NotepadApp';
import MonitorApp from '../Apps/Monitor/MonitorApp';
import AgentConsole from '../Apps/Monitor/AgentConsole';
import SettingsApp from '../Apps/Settings/SettingsApp';
import DBViewerApp from '../Apps/DBViewer/DBViewerApp';

const comps: Record<string, React.ComponentType<{ windowId: string }>> = {
  Terminal: TerminalApp,
  Explorer: ExplorerApp,
  Notepad: NotepadApp,
  Monitor: MonitorApp,
  AgentConsole: AgentConsole,
  Settings: SettingsApp,
  DBViewer: DBViewerApp,
};

function WpmWrapper({ entry, baseUrl, windowId }: { entry: string; baseUrl: string; windowId: string }) {
  const [Comp, setComp] = useState<React.ComponentType<{ windowId: string }> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const url = new URL(entry, baseUrl).toString();
    loadWpmComponent(entry, baseUrl).then(setComp).catch((e) => setErr(String(e)));
  }, [entry, baseUrl]);
  if (err) return <div className="p-4 text-red-400 text-sm">Failed: {err}</div>;
  if (!Comp) return <div className="p-4 text-zinc-500 text-sm">Loading...</div>;
  return <Comp windowId={windowId} />;
}

export default function WindowManager() {
  const { windows } = useWindowStore();
  const installed = useAppRegistry((s) => s.installed);
  return (
    <>
      {windows.map((w) => {
        if (w.minimized) return null;
        const allApps = [...defaultApps, ...installed];
        const app = allApps.find((a) => a.id === w.appId);
        const isWpm = app?.component?.startsWith('wpm:');
        if (isWpm) {
          const entry = (app as any).entry;
          const base = (app as any)._catalogBase || localStorage.getItem('wpm_catalog_base') || 'http://localhost:8081/catalog.json';
          return <Window key={w.id} window={w}><WpmWrapper entry={entry} baseUrl={base} windowId={w.id} /></Window>;
        }
        const C = app ? comps[app.component] : null;
        return <Window key={w.id} window={w}>{C ? <C windowId={w.id} /> : <div className="p-4 text-au-muted text-sm">App not found</div>}</Window>;
      })}
    </>
  );
}
