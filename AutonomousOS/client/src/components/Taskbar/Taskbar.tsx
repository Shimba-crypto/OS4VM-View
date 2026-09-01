import { Cpu, Radio, Activity, Timer } from 'lucide-react';
import { useWindowStore, useAutonomousStore } from '../../store';

export default function Taskbar() {
  const { windows, focusWindow, restoreWindow, minimizeWindow } = useWindowStore();
  const { queue, history, enabled } = useAutonomousStore();
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-au-panel backdrop-blur border-t border-au-border flex items-center px-2 gap-2 z-20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-[11px] font-bold text-black">◉</div>
        <div className="hidden sm:block leading-none">
          <div className="text-[11px] font-bold tracking-widest text-au-accent">AUTONOMOUS</div>
          <div className="text-[10px] text-au-muted font-mono">OS — agent {enabled ? '● ON' : '○ OFF'}</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-1 overflow-hidden">
        {windows.map((w) => (
          <button
            key={w.id}
            onClick={() => w.minimized ? restoreWindow(w.id) : w.focused ? minimizeWindow(w.id) : focusWindow(w.id)}
            className={`h-8 px-2.5 rounded-full border flex items-center gap-2 text-[12px] whitespace-nowrap ${w.focused && !w.minimized ? 'bg-au-accent text-black border-au-accent' : 'bg-au-surface border-au-border text-au-muted hover:text-au-text'}`}
          >
            <span>{w.icon}</span><span className="hidden md:inline">{w.title}</span>
            {w.agentPinned && <span className="w-1.5 h-1.5 rounded-full bg-au-accent animate-pulse" />}
          </button>
        ))}
        {windows.length === 0 && <span className="text-[11px] text-au-muted2">No windows — use Agent Bar or icons</span>}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono bg-au-surface border border-au-border rounded-full px-2.5 py-1">
          <span className="flex items-center gap-1"><Timer className="w-3 h-3 text-au-accent" />{queue.length} queued</span>
          <span className="w-px h-3 bg-au-border" />
          <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-400" />{history.length} done</span>
        </div>
        <div className="hidden lg:flex items-center gap-1 text-au-muted">
          <Radio className="w-3.5 h-3.5" /><Cpu className="w-3.5 h-3.5" />
        </div>
        <div className="text-right leading-none">
          <div className="text-[11px] font-medium">{time}</div>
          <div className="text-[10px] text-au-muted">{date}</div>
        </div>
      </div>
    </div>
  );
}
