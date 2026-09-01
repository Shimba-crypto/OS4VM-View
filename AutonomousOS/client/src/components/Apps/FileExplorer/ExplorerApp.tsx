import { useEffect, useState } from 'react';
import { ChevronRight, Home, ArrowUp, RotateCw, Search } from 'lucide-react';
import { api } from '../../../store/api';
interface Item { name: string; type: 'file' | 'directory' }
export default function ExplorerApp({ windowId: _ }: { windowId: string }) {
  const [path, setPath] = useState('home/user');
  const [files, setFiles] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { load(path); }, [path]);
  async function load(p: string) {
    try { const d = await api.getFiles(p); setFiles(Array.isArray(d) ? d : d.files || []); } catch { setFiles([]); }
  }
  async function open(it: Item) {
    if (it.type === 'directory') { setPath(`${path}/${it.name}`); setPreview(null); }
    else { try { const r = await api.readFile(`${path}/${it.name}`); setPreview(r.content || JSON.stringify(r)); setSel(it.name); } catch { setPreview('Unable to preview'); } }
  }
  const filtered = files.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
  const crumbs = path.split('/');
  return (
    <div className="flex flex-col h-full bg-[#0a131c] text-au-text">
      <div className="h-10 flex items-center gap-1 px-2 border-b border-au-border bg-au-surface shrink-0">
        <button onClick={() => { const p = path.split('/'); p.pop(); setPath(p.join('/') || 'home/user'); }} className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center"><ArrowUp className="w-4 h-4" /></button>
        <button onClick={() => load(path)} className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center"><RotateCw className="w-3.5 h-3.5" /></button>
        <div className="flex-1 flex items-center bg-au-bg border border-au-border rounded-full px-3 py-1.5 mx-2 text-[12px] overflow-hidden">
          <Home className="w-3.5 h-3.5 text-au-muted mr-2" />
          {crumbs.map((c, i) => <span key={i} className="flex items-center">{i > 0 && <ChevronRight className="w-3 h-3 text-au-muted mx-1" />}<button onClick={() => setPath(crumbs.slice(0, i + 1).join('/'))} className="hover:text-au-accent">{c}</button></span>)}
        </div>
        <div className="flex items-center bg-au-bg border border-au-border rounded-full px-3 py-1.5 w-48">
          <Search className="w-3.5 h-3.5 text-au-muted mr-2" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="flex-1 bg-transparent outline-none text-[12px]" />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[200px] bg-au-surface border-r border-au-border p-2 shrink-0 hidden sm:block">
          <div className="text-[11px] font-bold tracking-widest text-au-muted px-2 py-1">QUICK ACCESS</div>
          {[
            { label: 'Home', path: 'home/user' }, { label: 'Documents', path: 'home/user/Documents' }, { label: 'Downloads', path: 'home/user/Downloads' }, { label: 'Agent Logs', path: 'home/user/logs' },
          ].map((x) => <button key={x.label} onClick={() => setPath(x.path)} className={`w-full text-left px-2 py-1.5 rounded-lg text-[12px] ${path === x.path ? 'bg-au-accentMuted text-au-accent border border-au-accent/20' : 'hover:bg-white/5 text-au-muted'}`}>{x.label}</button>)}
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="sticky top-0 bg-au-bg border-b border-au-border flex text-[11px] text-au-muted px-3 py-1.5">
              <span className="flex-1">Name</span><span className="w-20 hidden sm:block">Type</span>
            </div>
            {filtered.length === 0 ? <div className="p-8 text-center text-au-muted text-[12px]">Empty — agent can create files via Terminal</div> : filtered.map((f) => (
              <button key={f.name} onClick={() => setSel(f.name)} onDoubleClick={() => open(f)} className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-white/5 ${sel === f.name ? 'bg-au-accentMuted text-au-accent' : ''}`}>
                <span className="text-[14px]">{f.type === 'directory' ? '⬢' : '≡'}</span>
                <span className="flex-1 text-left truncate">{f.name}</span>
                <span className="w-20 text-left text-[11px] text-au-muted hidden sm:block">{f.type}</span>
              </button>
            ))}
          </div>
          {preview !== null && (
            <div className="h-36 border-t border-au-border bg-au-surface p-3 overflow-auto shrink-0">
              <div className="text-[11px] font-bold tracking-widest text-au-muted mb-1">PREVIEW — {sel}</div>
              <pre className="text-[11px] font-mono whitespace-pre-wrap break-all">{preview.slice(0, 4000)}</pre>
              <button onClick={() => setPreview(null)} className="text-[11px] text-au-accent mt-2">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
