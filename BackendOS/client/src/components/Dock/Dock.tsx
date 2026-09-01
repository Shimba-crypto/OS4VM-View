import { useState } from 'react';
import { useWindowStore, defaultApps } from '../../store';
import { useAppRegistry } from '../../store/appRegistry';

export default function Dock() {
  const { windows, openApp, focusWindow, restoreWindow } = useWindowStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const installed = useAppRegistry((s) => s.installed);
  const dockApps = [...defaultApps, ...installed].slice(0, 9);

  function handleAppClick(appId: string) {
    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      if (existing.minimized) {
        restoreWindow(existing.id);
      } else {
        focusWindow(existing.id);
      }
    } else {
      openApp(appId);
    }
  }

  function getMagnification(index: number): number {
    if (hoveredIndex === null) return 0;
    const dist = Math.abs(index - hoveredIndex);
    if (dist === 0) return 12;
    if (dist === 1) return 6;
    if (dist === 2) return 2;
    return 0;
  }

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[9998]">
      <div
        className="flex items-end gap-1 px-3 py-1.5 rounded-2xl"
        style={{
          background: 'rgba(30, 30, 46, 0.65)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {dockApps.map((app, index) => {
          const isRunning = windows.some((w) => w.appId === app.id);
          const mag = getMagnification(index);
          const scale = 1 + mag * 0.04;

          return (
            <div key={app.id} className="flex flex-col items-center">
              <div
                className="relative group cursor-pointer transition-transform duration-150"
                style={{
                  transform: `scale(${scale}) translateY(-${mag}px)`,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleAppClick(app.id)}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl hover:bg-white/20 transition-colors">
                  {app.icon}
                </div>

                {/* Running indicator */}
                {isRunning && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80" />
                )}

                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                    {app.name}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
