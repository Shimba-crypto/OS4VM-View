import { useEffect, useState } from 'react';
import { bus } from '../../store/bus';
import { useAutonomousStore } from '../../store';

export default function Timeline() {
  const { queue, history } = useAutonomousStore();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const off1 = bus.on('agent:enqueued', (t) => setLogs((l) => [`+ queued: ${t.prompt}`, ...l].slice(0, 12)));
    const off2 = bus.on('agent:started', (t) => setLogs((l) => [`▶ running: ${t.prompt}`, ...l].slice(0, 12)));
    const off3 = bus.on('agent:done', (t) => setLogs((l) => [`✓ done: ${t.prompt}`, ...l].slice(0, 12)));
    const off4 = bus.on('window:opened', (w) => setLogs((l) => [`◧ opened ${w.title}`, ...l].slice(0, 12)));
    const off5 = bus.on('agent:log', (m) => setLogs((l) => [`· ${m}`, ...l].slice(0, 12)));
    return () => { off1(); off2(); off3(); off4(); off5(); };
  }, []);

  if (queue.length === 0 && history.length === 0 && logs.length === 0) return null;

  return (
    <div className="absolute left-3 top-[48px] bottom-[68px] w-[260px] hidden xl:flex flex-col gap-3 z-10 pointer-events-none">
      <div className="bg-au-panel backdrop-blur border border-au-border rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-au-border flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-au-muted">TIMELINE</span>
          <span className="text-[10px] font-mono text-au-muted2">{queue.length} queued · {history.length} done</span>
        </div>
        <div className="p-2 space-y-1.5 max-h-[220px] overflow-auto pointer-events-auto">
          {queue.map((t) => (
            <div key={t.id} className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
              <div className="text-[11px] font-medium text-amber-200 truncate">{t.prompt}</div>
              <div className="text-[10px] text-amber-300/70">{t.status} · {t.actions.map((a) => a.label).join(', ')}</div>
            </div>
          ))}
          {history.slice(0, 3).map((t) => (
            <div key={t.id} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
              <div className="text-[11px] text-emerald-200 truncate">{t.prompt}</div>
              <div className="text-[10px] text-emerald-300/60">done · {new Date(t.finishedAt || 0).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-au-panel backdrop-blur border border-au-border rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="px-3 py-2 border-b border-au-border text-[11px] font-bold tracking-widest text-au-muted">LIVE LOG</div>
        <div className="flex-1 overflow-auto p-2 font-mono text-[10px] leading-relaxed text-au-muted space-y-1 pointer-events-auto">
          {logs.map((l, i) => <div key={i} className="truncate">{l}</div>)}
          {logs.length === 0 && <div className="text-au-muted2">No events yet — use Agent Bar</div>}
        </div>
      </div>
    </div>
  );
}
