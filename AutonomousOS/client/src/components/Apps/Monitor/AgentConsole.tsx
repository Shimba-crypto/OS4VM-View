import { useAutonomousStore } from '../../../store';
import { Trash2, Pause, Play } from 'lucide-react';
export default function AgentConsole({ windowId: _ }: { windowId: string }) {
  const { queue, history, enabled, setEnabled, clear } = useAutonomousStore();
  return (
    <div className="h-full flex flex-col bg-[#0a131c]">
      <div className="flex items-center gap-2 p-3 border-b border-au-border bg-au-surface shrink-0">
        <button onClick={() => setEnabled(!enabled)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 ${enabled ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
          {enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />} {enabled ? 'Agent ON' : 'Paused'}
        </button>
        <button onClick={clear} className="ml-auto px-3 py-1.5 rounded-full bg-au-surface border border-au-border text-[12px] hover:bg-white/5 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Clear</button>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-au-muted mb-2">QUEUED ({queue.length})</div>
          {queue.length === 0 ? <div className="text-[12px] text-au-muted2 border border-dashed border-au-border rounded-xl p-4 text-center">No queued tasks — use Agent Bar</div> : queue.map((t) => (
            <div key={t.id} className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 mb-2">
              <div className="text-[12px] font-medium text-amber-100">{t.prompt}</div>
              <div className="text-[11px] text-amber-200/70 mt-1">{t.actions.map((a) => a.label).join(' → ')}</div>
              <div className="text-[10px] font-mono text-amber-300/50 mt-1">{t.status}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-widest text-au-muted mb-2">HISTORY ({history.length})</div>
          {history.length === 0 ? <div className="text-[12px] text-au-muted2">No history yet</div> : history.map((t) => (
            <div key={t.id} className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 mb-2">
              <div className="text-[12px] text-emerald-100">{t.prompt}</div>
              <div className="text-[11px] text-emerald-200/60 mt-1">{t.actions.map((a) => a.label).join(' → ')}</div>
              <div className="text-[10px] font-mono text-emerald-300/40">{new Date(t.finishedAt || 0).toLocaleTimeString()} · done</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
