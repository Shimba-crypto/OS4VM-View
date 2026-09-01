import { useWindowStore, defaultApps } from '../../store';
import { useAppRegistry, loadWpmComponent } from '../../store/appRegistry';
import { useState, useEffect } from 'react';
import Window from './Window';
import TerminalApp from '../Apps/Terminal/TerminalApp';
import FileManagerApp from '../Apps/FileManager/FileManagerApp';
import TextEditorApp from '../Apps/TextEditor/TextEditorApp';
import SettingsApp from '../Apps/Settings/SettingsApp';
import SystemMonitorApp from '../Apps/SystemMonitor/SystemMonitorApp';
import CalculatorApp from '../Apps/Calculator/CalculatorApp';
import AppStoreApp from '../Apps/AppStore/AppStoreApp';
import BrowserApp from '../Apps/Browser/BrowserApp';

const appComponents: Record<string, React.ComponentType<{ windowId: string }>> = {
  Terminal: TerminalApp,
  FileManager: FileManagerApp,
  TextEditor: TextEditorApp,
  Settings: SettingsApp,
  SystemMonitor: SystemMonitorApp,
  Calculator: CalculatorApp,
  AppStore: AppStoreApp,
  Browser: BrowserApp,
};

function WpmWrapper({ entry, baseUrl, windowId }: { entry: string; baseUrl: string; windowId: string }) {
  const [Comp, setComp] = useState<React.ComponentType<{ windowId: string }> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const url = new URL(entry, baseUrl).toString();
    loadWpmComponent(entry, baseUrl).then(setComp).catch((e) => setErr(String(e)));
  }, [entry, baseUrl]);
  if (err) return <div className="p-4 text-red-400 text-sm">Failed to load wpm app: {err}</div>;
  if (!Comp) return <div className="p-4 text-zinc-500 text-sm">Loading wpm app...</div>;
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
        const wpmBase = isWpm ? ((appDef as any)._catalogBase || localStorage.getItem('wpm_catalog_base') || 'http://localhost:8080/catalog.json') : null;
        const AppComponent = appDef ? (isWpm ? null : appComponents[appDef.component]) : null;

        return (
          <Window key={win.id} window={win}>
            {isWpm ? (
              <WpmWrapper entry={wpmEntry} baseUrl={wpmBase} windowId={win.id} />
            ) : AppComponent ? (
              <AppComponent windowId={win.id} />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">App not found</div>
            )}
          </Window>
        );
      })}
    </>
  );
}
