import { useWindowStore, defaultApps } from '../../store';
import { useAppRegistry, loadWpmComponent } from '../../store/appRegistry';
import { useState, useEffect } from 'react';
import Window from './Window';
import TerminalApp from '../Apps/Terminal/TerminalApp';
import BrowserApp from '../Apps/Browser/BrowserApp';
import TextEditorApp from '../Apps/TextEditor/TextEditorApp';
import CalculatorApp from '../Apps/Calculator/CalculatorApp';
import SettingsApp from '../Apps/Settings/SettingsApp';
import SystemInfoApp from '../Apps/SystemInfo/SystemInfoApp';
import DBViewerApp from '../Apps/DBViewer/DBViewerApp';
import AppStoreApp from '../Apps/AppStore/AppStoreApp';
import TimeTrackerApp from '../Apps/TimeTracker/TimeTrackerApp';

const appComponents: Record<string, React.ComponentType<{ windowId: string }>> = {
  Terminal: TerminalApp,
  Browser: BrowserApp,
  TextEditor: TextEditorApp,
  Calculator: CalculatorApp,
  Settings: SettingsApp,
  SystemInfo: SystemInfoApp,
  DBViewer: DBViewerApp,
  AppStore: AppStoreApp,
  TimeTracker: TimeTrackerApp,
};

function WpmWrapper({ entry, baseUrl, windowId }: { entry: string; baseUrl: string; windowId: string }) {
  const [Comp, setComp] = useState<React.ComponentType<{ windowId: string }> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { loadWpmComponent(entry, baseUrl).then(setComp).catch((e) => setErr(String(e))); }, [entry, baseUrl]);
  if (err) return <div className="p-4 text-red-400 text-sm">Failed to load: {err}</div>;
  if (!Comp) return <div className="p-4 text-wx-muted text-sm">Loading...</div>;
  return <Comp windowId={windowId} />;
}

export default function WindowManager() {
  const { windows } = useWindowStore();
  const installed = useAppRegistry((s) => s.installed);
  return (
    <>
      {windows.map((win) => {
        if (win.minimized) return null;
        const allApps = [...defaultApps, ...installed];
        const appDef = allApps.find((a) => a.id === win.appId);
        const isWpm = appDef?.component?.startsWith('wpm:');
        const wpmEntry = isWpm ? (appDef as any).entry : null;
        const wpmBase = isWpm ? ((appDef as any)._catalogBase || localStorage.getItem('wpm_catalog_base') || 'http://localhost:8081/catalog.json') : null;
        const AppComponent = appDef ? (isWpm ? null : appComponents[appDef.component]) : null;
        return (
          <Window key={win.id} window={win}>
            {isWpm ? <WpmWrapper entry={wpmEntry} baseUrl={wpmBase} windowId={win.id} />
              : AppComponent ? <AppComponent windowId={win.id} />
              : <div className="flex items-center justify-center h-full text-wx-muted">App not found</div>}
          </Window>
        );
      })}
    </>
  );
}
