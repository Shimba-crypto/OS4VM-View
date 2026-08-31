import { useEffect, useState } from 'react';
import { useWindowStore, defaultApps } from '../../store';
import TopPanel from '../Panel/TopPanel';
import BottomPanel from '../Panel/BottomPanel';
import WindowManager from '../Window/WindowManager';

export default function Desktop() {
  const { openApp } = useWindowStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }

  function handleDesktopDoubleClick(appId: string) {
    openApp(appId);
  }

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden"
      style={{ background: '#214283' }}
      onContextMenu={handleContextMenu}
    >
      {/* Top Panel */}
      <TopPanel />

      {/* Desktop area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Desktop icons */}
        <div className="absolute inset-4 grid grid-cols-1 gap-2 content-start">
          {defaultApps.map((app) => (
            <button
              key={app.id}
              onDoubleClick={() => handleDesktopDoubleClick(app.id)}
              className="flex flex-col items-center justify-center w-20 h-20 rounded hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl mb-1">{app.desktopIcon}</span>
              <span className="text-[10px] text-white font-medium text-center leading-tight drop-shadow">
                {app.name}
              </span>
            </button>
          ))}
        </div>

        {/* Windows */}
        <WindowManager />

        {/* Context menu */}
        {contextMenu && (
          <div
            className="fixed z-[99999] min-w-[180px] bg-white border border-gray-400 shadow-lg"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: 'Open Terminal', action: () => { openApp('terminal'); setContextMenu(null); } },
              { label: 'Open File Manager', action: () => { openApp('file-manager'); setContextMenu(null); } },
              { type: 'separator' as const },
              { label: 'Refresh', action: () => setContextMenu(null) },
            ].map((item, i) => {
              if ('type' in item && item.type === 'separator') {
                return <div key={i} className="border-t border-gray-300 my-0.5" />;
              }
              return (
                <button
                  key={i}
                  onClick={() => 'action' in item && item.action()}
                  className="w-full text-left px-3 py-1 text-xs text-gray-800 hover:bg-blue-500 hover:text-white"
                >
                  {'label' in item ? item.label : ''}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Panel (taskbar) */}
      <BottomPanel />
    </div>
  );
}
