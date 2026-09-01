import { useState } from 'react';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';
import { useAutonomousStore } from '../../store';

const hints = ['open terminal and explorer', 'tile windows', 'open notepad', 'show agent console', 'open monitor'];

export default function AgentBar() {
  const { enqueue, queue, enabled } = useAutonomousStore();
  const [val, setVal] = useState('');
  const [hIdx, setHIdx] = useState(0);

  function submit(v = val) {
    const t = v.trim();
    if (!t) return;
    enqueue(t);
    setVal('');
  }

  return (
    <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 w-[640px] max-w-[92vw] z-30">
      <div className="bg-au-panel backdrop-blur border border-au-border rounded-2xl au-glow p-2 animate-agent-in">
        <div className="flex items-center gap-2 bg-au-bg border border-au-border rounded-xl px-3 py-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${enabled ? 'bg-au-accent text-black' : 'bg-au-surface text-au-muted border border-au-border'}`}>
            <Bot className="w-4 h-4" />
          </div>
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'ArrowUp') setVal(hints[hIdx]); }}
            placeholder={enabled ? 'Ask agent — e.g. “open terminal and tile windows”' : 'Agent paused — enable in Settings'}
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-au-muted2"
          />
          <button onClick={() => submit()} className="w-8 h-8 rounded-full bg-au-accent text-black flex items-center justify-center hover:bg-au-accentHover shrink-0">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-2 px-1 flex-wrap">
          <span className="text-[10px] font-bold tracking-widest text-au-muted flex items-center gap-1"><Sparkles className="w-3 h-3" /> TRY</span>
          {hints.map((h) => (
            <button key={h} onClick={() => submit(h)} className="text-[11px] px-2.5 py-1 rounded-full bg-au-surface border border-au-border text-au-muted hover:text-au-text hover:border-au-borderHover">
              {h}
            </button>
          ))}
          <span className="ml-auto text-[10px] font-mono text-au-muted2 hidden sm:inline">{queue.length} queued{!enabled ? ' · paused' : ''}</span>
        </div>
      </div>
    </div>
  );
}
