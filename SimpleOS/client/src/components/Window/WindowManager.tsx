import { useWindowStore } from '../../store';
import Window from './Window';
import TerminalApp from '../Apps/Terminal/TerminalApp';
import FileManagerApp from '../Apps/FileManager/FileManagerApp';
import TextEditorApp from '../Apps/TextEditor/TextEditorApp';
import CalculatorApp from '../Apps/Calculator/CalculatorApp';
import SystemInfoApp from '../Apps/SystemInfo/SystemInfoApp';
import { defaultApps } from '../../store';

const appComponents: Record<string, React.ComponentType<{ windowId: string }>> = {
  Terminal: TerminalApp,
  FileManager: FileManagerApp,
  TextEditor: TextEditorApp,
  Calculator: CalculatorApp,
  SystemInfo: SystemInfoApp,
};

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
            {AppComponent ? (
              <AppComponent windowId={win.id} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                App not found
              </div>
            )}
          </Window>
        );
      })}
    </>
  );
}
