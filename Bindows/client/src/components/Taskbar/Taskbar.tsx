import { Search, Wifi, Volume2, Battery } from 'lucide-react';
import { useWindowStore, useDesktopStore } from '../../store';

export default function Taskbar() {
  const { windows, focusWindow, restoreWindow, minimizeWindow } = useWindowStore();
  const { settings, startOpen, toggleStart } = useDesktopStore();

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });

  function handleTaskClick(win: typeof windows[number]) {
    if (win.minimized) restoreWindow(win.id);
    else if (win.focused) minimizeWindow(win.id);
    else focusWindow(win.id);
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#f3f3f3]/80 taskbar-blur border-t border-white/40 flex items-center px-2 z-[9998] select-none">
      {/* Left spacer or widgets */}
      <div className={`flex-1 flex items-center ${settings.taskbarAlignment === 'left' ? 'justify-start' : 'justify-center'}`}>
        <div className="flex items-center gap-1">
          {/* Start button */}
          <button
            onClick={toggleStart}
            className={`w-9 h-9 rounded flex items-center justify-center transition-colors ${startOpen ? 'bg-white shadow-sm' : 'hover:bg-white/80'}`}
            aria-label="Start"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" className="rounded-sm">
              <rect x="1" y="1" width="8" height="8" fill="#f25022" />
              <rect x="11" y="1" width="8" height="8" fill="#7fba00" />
              <rect x="1" y="11" width="8" height="8" fill="#00a4ef" />
              <rect x="11" y="11" width="8" height="8" fill="#ffb900" />
            </svg>
          </button>

          {/* Search */}
          <button className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-full bg-white shadow-sm border border-black/5 hover:bg-white transition-colors ml-1">
            <Search className="w-4 h-4 text-[#605e5c]" />
            <span className="text-[12px] text-[#605e5c] pr-2">Search</span>
          </button>

          {/* Task View */}
          <button className="w-9 h-9 rounded hover:bg-white/80 flex items-center justify-center transition-colors">
            <span className="text-[16px]">◫</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-black/10 mx-1" />

          {/* Running apps */}
          {windows.map((win) => (
            <button
              key={win.id}
              onClick={() => handleTaskClick(win)}
              className={`h-9 px-2.5 rounded flex items-center gap-2 transition-colors relative ${win.focused && !win.minimized ? 'bg-white shadow-sm' : win.minimized ? 'hover:bg-white/60' : 'bg-white/60 hover:bg-white/80'}`}
            >
              <span className="text-[16px] leading-none">{win.icon}</span>
              <span className="hidden lg:inline text-[12px] text-[#323130] max-w-[110px] truncate">{win.title}</span>
              {win.focused && !win.minimized && <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#0078d4] rounded-full" />}
              {!win.focused && !win.minimized && <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#0078d4]/40 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* System tray */}
      <div className="flex items-center gap-1 shrink-0">
        <button className="w-6 h-6 rounded hover:bg-white/80 flex items-center justify-center">
          <span className="text-[10px]">∧</span>
        </button>
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded hover:bg-white/80">
          <Wifi className="w-4 h-4 text-[#323130]" />
          <Volume2 className="w-4 h-4 text-[#323130]" />
          <Battery className="w-4 h-4 text-[#323130]" />
        </div>
        <div className="flex flex-col items-end px-2 py-0.5 rounded hover:bg-white/80 cursor-default leading-none gap-0.5">
          <span className="text-[12px] text-[#323130]">{timeStr}</span>
          <span className="text-[12px] text-[#323130]">{dateStr}</span>
        </div>
        <button className="w-8 h-12 flex items-center justify-center hover:bg-white/80 border-l border-black/10 ml-1">
          <span className="text-[10px] text-[#605e5c]">◰</span>
        </button>
      </div>
    </div>
  );
}
