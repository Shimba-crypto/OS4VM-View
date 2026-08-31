import { useWindowStore } from '../../store';
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

import { defaultApps } from '../../store';

export default function WindowManager() {
  const { windows } = useWindowStore();

  return (
    <>
      {windows.map((win) => {
        if (win.minimized) return null;

        const appDef = defaultApps.find((a) => a.id === win.appId);
        const AppComponent = appDef ? appComponents[appDef.component] : null;

        return (
          <Window key={win.id} window={win}>
            {AppComponent ? <AppComponent windowId={win.id} /> : (
              <div className="flex items-center justify-center h-full text-os-muted">
                App not found
              </div>
            )}
          </Window>
        );
      })}
    </>
  );
}
