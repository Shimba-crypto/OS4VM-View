import { useState, useEffect } from 'react';
import { useWindowStore, defaultApps } from '../../store';
import { useAppRegistry } from '../../store/appRegistry';
import { Menu, Wifi, Volume2, Battery } from 'lucide-react';

export default function TopPanel() {
  const [time, setTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="h-8 bg-xfce-panel flex items-center justify-between px-2 text-xs text-xfce-textWhite shrink-0 border-b border-black/20 z-[9999]">
      {/* Left: Application menu */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-xfce-panelHover transition-colors font-semibold"
        >
          <Menu className="w-3.5 h-3.5" />
          Applications
        </button>

        {showMenu && (
          <div className="absolute top-8 left-0 bg-white border border-gray-400 shadow-lg min-w-[200px] z-[99999]">
            <div className="py-1">
              {[...defaultApps, ...useAppRegistry.getState().installed].map((item) => (
                // Map AppDefinition to menu item shape
                { name: item.name, icon: item.icon, app: item.id } as any
              )).slice(0, 8).map((item) => (
                <button
                  key={item.app}
                  onClick={() => {
                    useWindowStore.getState().openApp(item.app);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-800 hover:bg-blue-500 hover:text-white flex items-center gap-2"
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center: Clock */}
      <div className="font-medium">
        {dateStr} {timeStr}
      </div>

      {/* Right: Status icons */}
      <div className="flex items-center gap-2">
        <Wifi className="w-3.5 h-3.5" />
        <Volume2 className="w-3.5 h-3.5" />
        <Battery className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
