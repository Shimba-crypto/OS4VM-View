import { useWindowStore, defaultApps } from '../../store';
import { useAppRegistry } from '../../store/appRegistry';

export default function Dock() {
  const { windows, openApp, focusWindow, restoreWindow } = useWindowStore();
  const installed = useAppRegistry((s) => s.installed);
  const allApps = [...defaultApps, ...installed];
  const dockApps = allApps.slice(0, 9);
  const runningIds = new Set(windows.map((w) => w.appId));

  return (
    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-end gap-1 px-3 py-1.5 rounded-2xl bg-wx-shelf border border-wx-border backdrop-blur-xl shadow-2xl">
        {dockApps.map((app) => {
          const isRunning = runningIds.has(app.id);
          return (
            <button
              key={app.id}
              onClick={() => {
                const win = windows.find((w) => w.appId === app.id);
                if (win?.minimized) restoreWindow(win.id);
                else if (win) focusWindow(win.id);
                else openApp(app.id);
              }}
              className="group relative flex flex-col items-center"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all duration-150
                hover:bg-white/10 active:scale-95 ${isRunning ? 'bg-white/5' : ''}`}>
                {app.icon}
              </div>
              {isRunning && <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-wx-accent" />}
              <div className="absolute -top-8 px-2 py-1 rounded bg-black/90 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {app.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
