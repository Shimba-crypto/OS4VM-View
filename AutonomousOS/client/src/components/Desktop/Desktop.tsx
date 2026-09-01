import { useEffect, useState } from 'react';
import { useWindowStore, useDesktopStore, defaultApps } from '../../store';
import { useAppRegistry } from '../../store/appRegistry';
import { useAutonomousStore } from '../../store';
import WindowManager from '../Window/WindowManager';
import Taskbar from '../Taskbar/Taskbar';
import AgentBar from '../Agent/AgentBar';
import Timeline from '../Agent/Timeline';

const wallpapers: Record<string, string> = {
  grid: 'radial-gradient(1200px 600px at 70% -10%, rgba(34,211,238,0.12), transparent 60%), linear-gradient(180deg, #070f14 0%, #0a1620 100%)',
  aurora: 'radial-gradient(900px 500px at 20% 0%, rgba(34,211,238,0.18), transparent 60%), radial-gradient(800px 400px at 90% 30%, rgba(99,102,241,0.15), transparent 60%), #070f14',
  void: '#070f14',
};

export default function Desktop() {
  const { openApp } = useWindowStore();
  const { settings } = useDesktopStore();
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const installed = useAppRegistry((s) => s.installed);

  useEffect(() => {
    const h = () => setCtx(null);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, []);

  const bg = wallpapers[settings.wallpaper] || wallpapers.grid;

  return (
    <div
      className="w-screen h-screen relative overflow-hidden flex flex-col au-grid"
      style={{ background: bg }}
      onContextMenu={(e) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY }); }}
      onClick={() => setSel(null)}
    >
      {/* Top bar */}
      <div className="h-8 bg-au-panel backdrop-blur border-b border-au-border flex items-center px-3 gap-2 z-20">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-bold tracking-widest text-au-accent">AUTONOMOUS OS</span>
        <span className="text-[11px] text-au-muted hidden sm:inline">— self-managing desktop · agent queue + auto-tile</span>
        <div className="ml-auto text-[11px] font-mono text-au-muted2 hidden md:block">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      <div className="flex-1 relative">
        {/* Icons */}
        <div className="absolute left-3 top-3 flex flex-col gap-1 z-10">
          {[...defaultApps, ...installed].map((a) => (
            <button
              key={a.id}
              onClick={(e) => { e.stopPropagation(); setSel(a.id); }}
              onDoubleClick={() => openApp(a.id)}
              className={`w-[86px] p-2.5 rounded-xl border flex flex-col items-center gap-1.5 ${sel === a.id ? 'bg-au-accentMuted border-au-accent/30' : 'bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/5'}`}
            >
              <span className="text-[22px]">{a.icon}</span>
              <span className="text-[10px] text-au-text text-center leading-tight">{a.name}</span>
            </button>
          ))}
        </div>

        <Timeline />
        <WindowManager />
        <AgentBar />

        {ctx && (
          <div className="fixed z-50 min-w-[220px] bg-au-surface border border-au-border rounded-xl overflow-hidden shadow-2xl" style={{ left: ctx.x, top: ctx.y }} onClick={(e) => e.stopPropagation()}>
            {[
              { label: 'Ask Agent…', action: () => { const v = prompt('Agent prompt:'); if (v) useAutonomousStore.getState().enqueue(v); setCtx(null); } },
              { label: 'Tile windows', action: () => { useWindowStore.getState().tileWindows(); setCtx(null); } },
              { label: 'Open Terminal', action: () => { openApp('terminal'); setCtx(null); } },
              { type: 'sep' as const },
              { label: 'Settings', action: () => { openApp('settings'); setCtx(null); } },
            ].map((it, i) => {
              if ('type' in it && it.type === 'sep') return <div key={i} className="border-t border-au-border my-1" />;
              return <button key={i} onClick={() => (it as any).action()} className="w-full text-left px-3 py-2 text-[12px] text-au-text hover:bg-au-accentMuted hover:text-au-accent">{(it as any).label}</button>;
            })}
          </div>
        )}
      </div>

      <Taskbar />
    </div>
  );
}
