import { useEffect, useState } from 'react';
import { useWindowStore, useDesktopStore } from '../../store';
import Taskbar from '../Taskbar/Taskbar';
import Dock from '../Dock/Dock';
import WindowManager from '../Window/WindowManager';
import ContextMenu from './ContextMenu';

const wallpapers: Record<string, string> = {
  'gradient-purple': 'linear-gradient(135deg, #1a0533 0%, #0d1b2a 40%, #1b2838 100%)',
  'gradient-blue': 'linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #0d47a1 100%)',
  'gradient-sunset': 'linear-gradient(135deg, #1a0a2e 0%, #4a1942 40%, #6a3093 100%)',
  'gradient-ocean': 'linear-gradient(135deg, #0a1628 0%, #0d3b66 50%, #1a535c 100%)',
  'gradient-fire': 'linear-gradient(135deg, #1a0000 0%, #4a0e0e 50%, #7f1d1d 100%)',
  'gradient-forest': 'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #2d5016 100%)',
  'solid-black': '#000000',
  'solid-dark': '#111111',
};

export default function Desktop() {
  const { settings } = useDesktopStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }

  const bg = wallpapers[settings.wallpaper] || wallpapers['gradient-purple'];

  return (
    <div
      className="w-screen h-screen relative overflow-hidden"
      style={{ background: bg }}
      onContextMenu={handleContextMenu}
    >
      {/* Top Bar (macOS style) */}
      <Taskbar currentTime={currentTime} />

      {/* Windows */}
      <WindowManager />

      {/* Dock */}
      <Dock />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
