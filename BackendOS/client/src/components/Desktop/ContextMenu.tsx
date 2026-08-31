import { useWindowStore, useDesktopStore } from '../../store';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const wallpapers = [
  { id: 'gradient-purple', name: 'Purple Nebula', preview: 'linear-gradient(135deg, #1a0533, #0d1b2a)' },
  { id: 'gradient-blue', name: 'Deep Blue', preview: 'linear-gradient(135deg, #0c1445, #0d47a1)' },
  { id: 'gradient-sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #1a0a2e, #6a3093)' },
  { id: 'gradient-ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #0a1628, #1a535c)' },
  { id: 'gradient-fire', name: 'Fire', preview: 'linear-gradient(135deg, #1a0000, #7f1d1d)' },
  { id: 'gradient-forest', name: 'Forest', preview: 'linear-gradient(135deg, #0a1a0a, #2d5016)' },
  { id: 'solid-black', name: 'Black', preview: '#000' },
  { id: 'solid-dark', name: 'Dark', preview: '#111' },
];

export default function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const { openApp } = useWindowStore();
  const { setWallpaper } = useDesktopStore();

  const items = [
    { label: 'New Folder', action: () => { openApp('file-manager'); onClose(); } },
    { label: 'Open Terminal', action: () => { openApp('terminal'); onClose(); } },
    { label: 'Open Settings', action: () => { openApp('settings'); onClose(); } },
    { type: 'separator' as const },
    { label: 'Change Wallpaper', submenu: wallpapers.map((w) => ({
      label: w.name,
      action: () => { setWallpaper(w.id); onClose(); },
      preview: w.preview,
    }))},
    { type: 'separator' as const },
    { label: 'About BackendOS', action: () => onClose() },
  ];

  return (
    <div
      className="fixed z-[99999] min-w-[200px] py-1 rounded-xl shadow-2xl shadow-black/50 border border-white/10"
      style={{
        left: x,
        top: y,
        background: 'rgba(30, 30, 46, 0.9)',
        backdropFilter: 'blur(20px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => {
        if (item.type === 'separator') {
          return <div key={i} className="my-1 border-t border-white/10" />;
        }

        if ('submenu' in item && item.submenu) {
          return (
            <div key={i} className="relative group">
              <button className="w-full text-left px-4 py-1.5 text-xs text-white/80 hover:bg-os-primary/30 hover:text-white transition-colors flex items-center justify-between">
                {item.label}
                <span className="text-white/40">›</span>
              </button>
              <div className="absolute left-full top-0 ml-1 hidden group-hover:block min-w-[160px] py-1 rounded-xl shadow-2xl shadow-black/50 border border-white/10"
                style={{ background: 'rgba(30, 30, 46, 0.95)', backdropFilter: 'blur(20px)' }}
              >
                {item.submenu.map((sub, j) => (
                  <button
                    key={j}
                    onClick={sub.action}
                    className="w-full text-left px-3 py-1.5 text-xs text-white/80 hover:bg-os-primary/30 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <div className="w-4 h-4 rounded-sm" style={{ background: sub.preview }} />
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          );
        }

        return (
          <button
            key={i}
            onClick={item.action}
            className="w-full text-left px-4 py-1.5 text-xs text-white/80 hover:bg-os-primary/30 hover:text-white transition-colors"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
