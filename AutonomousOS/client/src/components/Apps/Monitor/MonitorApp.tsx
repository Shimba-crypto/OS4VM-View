import { useEffect, useState } from 'react';
import { useWindowStore, useAutonomousStore } from '../../../store';
import { bus } from '../../../store/bus';

export default function MonitorApp({ windowId: _ }: { windowId: string }) {
  const { windows } = useWindowStore();
  const { queue, history, enabled } = useAutonomousStore();
  const [logs, setLogs] = useState<string[]>([]);
  const [health, setHealth] = useState<Record<string, string>>({});
  useEffect(() => {
    const offs = [
      bus.on('agent:enqueued', (t) => setLogs((l) => [`queued ${t.prompt}`, ...l].slice(0, 20))),
      bus.on('agent:done', (t) => setLogs((l) => [`done ${t.prompt}`, ...l].slice(0, 20))),
      bus.on('window:opened', (w) => setLogs((l) => [`opened ${w.title}`, ...l].slice(0, 20))),
    ];
    return () => offs.forEach((f) => f());
  }, []);
  useEffect(() => {
    async function chk() {
      const map: Record<string, string> = {};
      for (const port of [5174, 5175, 5176, 5177, 5178]) {
        try { const r = await fetch(`http://localhost:${port}`, { method: 'HEAD' } as any); map[port] = r.ok ? 'online' : 'offline'; } catch { map[port] = 'offline'; }
      }
      setHealth(map);
    }
    chk(); const id = setInterval(chk, 7000); return () => clearInterval(id);
  }, []);
  return (
    <div className="h-full overflow-auto bg-[#0a131c] p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-au-surface border border-au-border p-3"><div className="text-[11px] tracking-widest font-bold text-au-muted">WINDOWS</div><div className="text-[22px] font-bold">{windows.filter((w) => !w.minimized).length}</div><div className="text-[11px] text-au-muted">{windows.length} total</div></div>
        <div className="rounded-xl bg-au-surface border border-au-border p-3"><div className="text-[11px] tracking-widest font-bold text-au-muted">QUEUE</div><div className="text-[22px] font-bold">{queue.length}</div><div className="text-[11px] text-au-muted">{enabled ? 'agent on' : 'paused'}</div></div>
        <div className="rounded-xl bg-au-surface border border-au-border p-3"><div className="text-[11px] tracking-widest font-bold text-au-muted">HISTORY</div><div className="text-[22px] font-bold">{history.length}</div><div className="text-[11px] text-au-muted">done</div></div>
      </div>
      <div className="rounded-xl bg-au-surface border border-au-border p-3">
        <div className="text-[11px] font-bold tracking-widest text-au-muted mb-2">PEER HEALTH (dev ports)</div>
        <div className="flex flex-wrap gap-2">
          {[5174, 5175, 5176, 5177, 5178].map((p) => (
            <span key={p} className={`text-[11px] font-mono px-2 py-1 rounded-full border ${health[p] === 'online' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>:{p} {health[p] || '…'}</span>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-au-surface border border-au-border p-3">
        <div className="text-[11px] font-bold tracking-widest text-au-muted mb-2">LIVE LOG</div>
        <div className="font-mono text-[11px] text-au-muted space-y-1">{logs.map((l, i) => <div key={i}>· {l}</div>)}{logs.length === 0 && <div className="text-au-muted2">No events</div>}</div>
      </div>
      <div className="rounded-xl bg-au-surface border border-au-border p-3">
        <div className="text-[11px] font-bold tracking-widest text-au-muted mb-2">WINDOWS</div>
        {windows.map((w) => <div key={w.id} className="text-[11px] font-mono flex justify-between border-b border-au-border/30 py-1"><span>{w.icon} {w.title} {w.focused ? '●' : ''} {w.agentPinned ? '(auto)' : ''}</span><span className="text-au-muted">{w.width}×{w.height} @ {w.x},{w.y}</span></div>)}
        {windows.length === 0 && <div className="text-[11px] text-au-muted2">No windows</div>}
      </div>
    </div>
  );
}
