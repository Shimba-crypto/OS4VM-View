import { useEffect, useState } from 'react';
import { ChevronRight, Home, ArrowLeft, ArrowRight, ArrowUp, RotateCw, Search, LayoutGrid, List } from 'lucide-react';
import { api } from '../../../store/api';

interface FileItem { name: string; type: 'file' | 'directory'; size?: number; modified?: string; }

const quickAccess = [
  { label: 'Home', icon: '🏠', path: 'home/user' },
  { label: 'Desktop', icon: '🖥️', path: 'home/user/Desktop' },
  { label: 'Documents', icon: '📄', path: 'home/user/Documents' },
  { label: 'Downloads', icon: '⬇️', path: 'home/user/Downloads' },
  { label: 'Pictures', icon: '🖼️', path: 'home/user/Pictures' },
  { label: 'Music', icon: '🎵', path: 'home/user/Music' },
];

const drives = [
  { label: 'Local Disk (C:)', icon: '💾', free: '42.3 GB free of 120 GB' },
  { label: 'Data (D:)', icon: '💿', free: '210 GB free of 500 GB' },
];

export default function FileExplorerApp({ windowId: _ }: { windowId: string }) {
  const [path, setPath] = useState('home/user');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => { load(path); }, [path]);

  async function load(p: string) {
    setLoading(true); setError(null);
    try {
      const data = await api.getFiles(p);
      const list: FileItem[] = Array.isArray(data) ? data : data.files || [];
      setFiles(list);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
      setFiles([]);
    } finally { setLoading(false); }
  }

  async function openItem(item: FileItem) {
    if (item.type === 'directory') {
      setPath(`${path}/${item.name}`);
      setPreview(null);
    } else {
      try {
        const res = await api.readFile(`${path}/${item.name}`);
        setPreview(res.content ?? JSON.stringify(res, null, 2));
        setSelectedFile(item.name);
      } catch {
        setPreview('Unable to preview file');
      }
    }
  }

  function goUp() {
    const parts = path.split('/');
    if (parts.length > 1) { parts.pop(); setPath(parts.join('/') || 'home/user'); }
  }

  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const crumbs = path.split('/');

  return (
    <div className="flex flex-col h-full bg-white text-[#323130]">
      {/* Command bar */}
      <div className="h-11 flex items-center gap-1 px-2 border-b border-[#e5e5e5] bg-[#f3f3f3] shrink-0">
        <button onClick={() => {}} className="w-7 h-7 rounded hover:bg-black/5 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <button className="w-7 h-7 rounded hover:bg-black/5 flex items-center justify-center opacity-40"><ArrowRight className="w-4 h-4" /></button>
        <button onClick={goUp} className="w-7 h-7 rounded hover:bg-black/5 flex items-center justify-center"><ArrowUp className="w-4 h-4" /></button>
        <button onClick={() => load(path)} className="w-7 h-7 rounded hover:bg-black/5 flex items-center justify-center"><RotateCw className="w-3.5 h-3.5" /></button>

        <div className="flex-1 flex items-center bg-white border border-[#e5e5e5] rounded h-7 px-2 mx-2 text-[12px] overflow-hidden">
          <Home className="w-3.5 h-3.5 text-[#605e5c] mr-2 shrink-0" />
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <ChevronRight className="w-3 h-3 text-[#605e5c] mx-1" />}
              <button onClick={() => setPath(crumbs.slice(0, i + 1).join('/'))} className="hover:bg-[#f3f3f3] px-1 rounded">{c}</button>
            </span>
          ))}
        </div>

        <div className="flex items-center bg-white border border-[#e5e5e5] rounded h-7 px-2 w-56">
          <Search className="w-3.5 h-3.5 text-[#605e5c] mr-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="flex-1 outline-none text-[12px] placeholder:text-[#605e5c]" />
        </div>
      </div>

      {/* Ribbon tabs */}
      <div className="flex items-center gap-4 px-3 h-8 border-b border-[#e5e5e5] bg-white text-[12px] shrink-0">
        <button className="px-2 py-1 bg-[#0078d4] text-white rounded">Home</button>
        <button className="px-2 py-1 hover:bg-[#f3f3f3] rounded">Share</button>
        <button className="px-2 py-1 hover:bg-[#f3f3f3] rounded">View</button>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setView('list')} className={`w-7 h-7 rounded flex items-center justify-center ${view==='list' ? 'bg-[#e5e5e5]' : 'hover:bg-[#f3f3f3]'}`}><List className="w-4 h-4" /></button>
          <button onClick={() => setView('grid')} className={`w-7 h-7 rounded flex items-center justify-center ${view==='grid' ? 'bg-[#e5e5e5]' : 'hover:bg-[#f3f3f3]'}`}><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[240px] bg-[#fcfcfc] border-r border-[#e5e5e5] flex flex-col overflow-auto shrink-0">
          <div className="p-2">
            <div className="text-[12px] font-semibold text-[#323130] px-2 py-1">Quick access</div>
            {quickAccess.map((q) => (
              <button key={q.label} onClick={() => setPath(q.path)} className={`w-full text-left px-2 py-1.5 rounded text-[12px] flex items-center gap-2 hover:bg-[#f3f3f3] ${path===q.path ? 'bg-[#e5f1fb]' : ''}`}>
                <span className="text-[14px]">{q.icon}</span>{q.label}
              </button>
            ))}
            <div className="border-t border-[#e5e5e5] my-2" />
            <div className="text-[12px] font-semibold text-[#323130] px-2 py-1">This PC</div>
            {drives.map((d) => (
              <button key={d.label} className="w-full text-left px-2 py-1.5 rounded hover:bg-[#f3f3f3] flex items-center gap-2">
                <span>{d.icon}</span>
                <div className="min-w-0">
                  <div className="text-[12px] truncate">{d.label}</div>
                  <div className="text-[10px] text-[#605e5c]">{d.free}</div>
                  <div className="h-1 bg-[#e5e5e5] rounded mt-1"><div className="h-1 bg-[#0078d4] rounded" style={{ width: '65%' }} /></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-[12px] text-[#605e5c]">Loading…</div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-[12px] text-[#a4262c]">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#605e5c] p-8">
              <span className="text-4xl mb-2">📂</span>
              <span className="text-[13px] font-semibold">This folder is empty.</span>
            </div>
          ) : view === 'list' ? (
            <div className="flex-1 overflow-auto">
              <div className="sticky top-0 bg-white border-b border-[#e5e5e5] flex text-[11px] text-[#605e5c] px-2 py-1">
                <span className="flex-1">Name</span><span className="w-24">Size</span><span className="w-36">Date modified</span>
              </div>
              {filtered.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFile(f.name)}
                  onDoubleClick={() => openItem(f)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-[12px] hover:bg-[#f3f3f3] border border-transparent ${selectedFile===f.name ? 'bg-[#e5f1fb] border-[#c7e0f4]' : ''}`}
                >
                  <span className="text-[16px]">{f.type==='directory' ? '📁' : '📄'}</span>
                  <span className="flex-1 text-left truncate">{f.name}</span>
                  <span className="w-24 text-left text-[#605e5c] text-[11px]">{f.type==='directory' ? '' : f.size ? `${f.size} KB` : '—'}</span>
                  <span className="w-36 text-left text-[#605e5c] text-[11px]">{f.modified || '—'}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-3 grid grid-cols-[repeat(auto-fill,80px)] gap-2 content-start">
              {filtered.map((f) => (
                <button key={f.name} onDoubleClick={() => openItem(f)} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-[#f3f3f3] border border-transparent hover:border-[#e5e5e5]">
                  <span className="text-3xl">{f.type==='directory' ? '📁' : '📄'}</span>
                  <span className="text-[11px] text-center leading-tight line-clamp-2">{f.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Preview pane */}
          {preview !== null && (
            <div className="h-40 border-t border-[#e5e5e5] bg-[#fcfcfc] p-2 overflow-auto shrink-0">
              <div className="text-[11px] font-semibold text-[#323130] mb-1">Preview — {selectedFile}</div>
              <pre className="text-[11px] text-[#323130] whitespace-pre-wrap break-all font-mono">{preview.slice(0, 4000)}</pre>
              <button onClick={() => setPreview(null)} className="mt-2 text-[11px] text-[#0078d4] hover:underline">Close preview</button>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="h-6 bg-[#f3f3f3] border-t border-[#e5e5e5] flex items-center px-3 text-[11px] text-[#605e5c] justify-between shrink-0">
        <span>{filtered.length} items</span>
        <span className="flex items-center gap-2">
          <span className="hidden sm:inline">🖼️</span>
          <input type="range" className="w-20 accent-[#0078d4]" min={0} max={100} defaultValue={50} />
        </span>
      </div>
    </div>
  );
}
