import { useEffect, useState } from 'react';
import { useWindowStore, defaultApps, useDesktopStore } from '../../store';
import { useAppRegistry } from '../../store/appRegistry';
import WindowManager from '../Window/WindowManager';
import Taskbar from '../Taskbar/Taskbar';
import StartMenu from '../StartMenu/StartMenu';

const wallpapers: Record<string, string> = {
  bloom: 'linear-gradient(180deg, #0a4a8a 0%, #1a7fbf 28%, #4fb3e8 56%, #a8d8f0 100%)',
  windows11: 'linear-gradient(135deg, #0078d4 0%, #00bcf2 45%, #5ea0ef 100%)',
  dark: 'linear-gradient(180deg, #0f0f0f 0%, #1e1e1e 60%, #2d2d2d 100%)',
  sunrise: 'linear-gradient(180deg, #ff6b35 0%, #f7931e 35%, #ffd23f 70%, #a8d8ea 100%)',
  abstract: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

const desktopIcons = [
  { id: 'file-explorer', label: 'This PC', icon: '🖥️' },
  { id: 'file-explorer', label: 'File Explorer', icon: '📁' },
  { id: 'notepad', label: 'Notepad', icon: '📝' },
  { id: 'browser', label: 'Microsoft Edge', icon: '🌐' },
  { id: 'store', label: 'Microsoft Store', icon: '🛒' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'terminal', label: 'Terminal', icon: '🖥️' },
];

export default function Desktop() {
  const { openApp } = useWindowStore();
  const { settings, startOpen, setStartOpen, closeStart } = useDesktopStore();
  const installed = useAppRegistry((s) => s.installed);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  useEffect(() => {
    const onClick = () => {
      setContextMenu(null);
      if (startOpen) closeStart();
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [startOpen, closeStart]);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }

  const bg = wallpapers[settings.wallpaper] || wallpapers.bloom;

  return (
    <div
      className="w-screen h-screen relative overflow-hidden flex flex-col"
      style={{ background: bg }}
      onContextMenu={handleContextMenu}
      onClick={() => setSelectedIcon(null)}
    >
      {/* Bloom wallpaper decoration (Windows 11 style) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-white/10 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#5ea0ef]/30 rounded-full blur-3xl" />
      </div>

      {/* Desktop icons - left aligned Windows style */}
      <div className="flex-1 relative p-2 z-10">
        <div className="flex flex-col gap-1 w-[88px]">
          {[...desktopIcons, ...installed.map((a: any) => ({ id: a.id, label: a.name, icon: a.icon }))].map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              onClick={(e) => { e.stopPropagation(); setSelectedIcon(`${idx}`); }}
              onDoubleClick={() => openApp(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded hover:bg-white/15 transition-colors border border-transparent ${selectedIcon === `${idx}` ? 'bg-white/20 border-white/20' : ''}`}
            >
              <span className="text-[28px] drop-shadow-sm leading-none">{item.icon}</span>
              <span className="text-[11px] text-white text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] px-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Windows manager */}
        <WindowManager />

        {/* Start Menu */}
        {startOpen && <StartMenu />}

        {/* Context menu */}
        {contextMenu && (
          <div
            className="fixed z-[99999] min-w-[280px] bg-[#fcfcfc] rounded-lg win-shadow border border-black/5 py-1.5 animate-window-open"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: 'View', hasSub: true },
              { label: 'Sort by', hasSub: true },
              { label: 'Refresh', action: () => setContextMenu(null) },
              { type: 'sep' as const },
              { label: 'New', hasSub: true },
              { type: 'sep' as const },
              { label: 'Display settings', action: () => { openApp('settings'); setContextMenu(null); } },
              { label: 'Personalize', action: () => { openApp('settings'); setContextMenu(null); } },
              { type: 'sep' as const },
              { label: 'Open in Terminal', icon: '🖥️', action: () => { openApp('terminal'); setContextMenu(null); } },
              { label: 'Show more options', icon: '›', action: () => setContextMenu(null) },
            ].map((item, i) => {
              if ('type' in item && item.type === 'sep') return <div key={i} className="my-1 border-t border-black/5" />;
              return (
                <button
                  key={i}
                  onClick={() => 'action' in item && item.action?.()}
                  className="w-full text-left px-3 py-1.5 text-[12px] text-[#323130] hover:bg-[#f3f3f3] flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    {'icon' in item && item.icon && <span className="w-4 text-center text-[12px]">{item.icon}</span>}
                    {item.label}
                  </span>
                  {'hasSub' in item && item.hasSub && <span className="text-[#605e5c] text-[10px]">›</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Taskbar */}
      <Taskbar />

      {/* Trigger to close start when clicking desktop */}
      <div className="absolute inset-0 z-0" onClick={() => startOpen && setStartOpen(false)} style={{ display: startOpen ? 'block' : 'none' }} />
    </div>
  );
}
