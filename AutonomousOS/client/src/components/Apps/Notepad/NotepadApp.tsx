import { useState } from 'react';
import { api } from '../../../store/api';
export default function NotepadApp({ windowId: _ }: { windowId: string }) {
  const [path, setPath] = useState('home/user/notes.txt');
  const [content, setContent] = useState('// AutonomousOS — agent can also write here via api.writeFile\n');
  const [status, setStatus] = useState('Ready');
  async function save() {
    try { await api.writeFile(path, content); setStatus(`Saved ${path}`); } catch (e: any) { setStatus(e.message || 'Failed'); }
  }
  async function open() {
    const p = prompt('Path:', path);
    if (!p) return;
    try { const r = await api.readFile(p); setContent(r.content || ''); setPath(p); setStatus(`Opened ${p}`); } catch (e: any) { setStatus(e.message); }
  }
  return (
    <div className="flex flex-col h-full bg-[#0a131c] text-au-text">
      <div className="flex items-center gap-2 px-2 h-9 border-b border-au-border bg-au-surface shrink-0">
        <input value={path} onChange={(e) => setPath(e.target.value)} className="flex-1 bg-au-bg border border-au-border rounded-full px-3 py-1.5 text-[12px] outline-none focus:border-au-accent font-mono" />
        <button onClick={open} className="px-3 py-1.5 rounded-full bg-au-surface border border-au-border text-[12px] hover:bg-white/5">Open</button>
        <button onClick={save} className="px-4 py-1.5 rounded-full bg-au-accent text-black text-[12px] font-semibold hover:bg-au-accentHover">Save</button>
      </div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 w-full p-3 bg-transparent outline-none text-[13px] font-mono resize-none" spellCheck={false} />
      <div className="h-6 border-t border-au-border bg-au-surface flex items-center justify-between px-3 text-[11px] font-mono text-au-muted"><span>{status}</span><span>{content.length} chars</span></div>
    </div>
  );
}
