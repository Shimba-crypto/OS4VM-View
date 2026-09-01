import { useDesktopStore, useWindowStore, defaultApps } from '../../store';
import { useAppRegistry } from '../../store/appRegistry';
import WindowManager from '../Window/WindowManager';
import Dock from '../Dock/Dock';
import Taskbar from '../Taskbar/Taskbar';

const wallpapers: Record<string, string> = {
  'chrome-gradient': 'linear-gradient(135deg, #202124 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)',
  'dark-blue': 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
  'midnight': 'linear-gradient(135deg, #1e1e2e 0%, #313244 50%, #45475a 100%)',
};

export default function Desktop() {
  const { settings } = useDesktopStore();
  const { openApp } = useWindowStore();
  const installed = useAppRegistry((s) => s.installed);
  const bg = wallpapers[settings.wallpaper] || wallpapers['chrome-gradient'];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Taskbar />
      <div className="flex-1 relative overflow-hidden" style={{ background: bg }}>
        <div className="absolute inset-0 p-4 overflow-auto z-10">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-w-4xl">
            {[...defaultApps, ...installed].map((app) => (
              <button
                key={app.id}
                onDoubleClick={() => openApp(app.id)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl group-hover:bg-white/10 group-hover:border-white/10 transition-all">
                  {app.icon}
                </div>
                <span className="text-[10px] text-wx-text/70 group-hover:text-wx-text text-center leading-tight truncate w-full">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
        <WindowManager />
        <Dock />
      </div>
    </div>
  );
}
