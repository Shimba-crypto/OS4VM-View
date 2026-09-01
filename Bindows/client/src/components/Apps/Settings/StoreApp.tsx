import { useState, useEffect } from 'react';
import { useAppRegistry } from '../../../store/appRegistry';
import { fetchCatalog, wpmInstall, wpmRemove } from '../../../lib/wpm';

export default function StoreApp({ windowId: _ }: { windowId: string }) {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const installed = useAppRegistry((s) => s.installed);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog().then(({ catalog }) => { setCatalog(catalog); setLoading(false); }).catch((e) => { setErr(String(e.message)); setLoading(false); });
  }, []);

  const filtered = catalog.filter((a) => `${a.name} ${a.description}`.toLowerCase().includes(q.toLowerCase()));
  const isInstalled = (id: string) => installed.some((x) => x.id === id);

  async function toggle(app: any) {
    setBusy(app.id);
    const t = { writeln: (s: string) => console.log(s) };
    if (isInstalled(app.id)) await wpmRemove(app.id, t as any);
    else await wpmInstall(app.id, t as any);
    setBusy(null);
  }

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9] text-[#323130]">
      <div className="h-12 bg-white border-b border-[#e5e5e5] flex items-center px-4 gap-3 shrink-0">
        <span className="text-lg">🛒</span><span className="font-semibold text-[14px]">Microsoft Store — wpm</span>
        <div className="ml-auto flex items-center gap-2 bg-[#f3f3f3] rounded px-3 py-1.5 w-64">
          <span className="text-[#605e5c] text-sm">🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search wpm catalog..." className="flex-1 bg-transparent outline-none text-[12px]" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-gradient-to-r from-[#0078d4] to-[#00bcf2] rounded-lg p-6 text-white mb-6">
          <h2 className="text-[22px] font-semibold">wpm catalog</h2>
          <p className="text-[12px] opacity-90 mt-1">{loading ? 'Loading...' : `${catalog.length} apps · ${installed.length} installed`} · VM-APPSTORE</p>
          {err && <div className="mt-2 text-[11px] bg-white/20 rounded px-2 py-1">{err}</div>}
        </div>
        {loading ? (
          <div className="text-[12px] text-[#605e5c] p-8 text-center">Loading catalog...</div>
        ) : (
          <>
            <h3 className="text-[14px] font-semibold mb-3">All apps {filtered.length !== catalog.length && `(${filtered.length}/${catalog.length})`}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((a) => (
                <div key={a.id} className="bg-white border border-[#e5e5e5] rounded-lg p-4 hover:shadow-sm transition-shadow flex flex-col">
                  <div className="w-12 h-12 bg-[#f3f3f3] rounded flex items-center justify-center text-2xl mb-3">{a.icon}</div>
                  <div className="text-[13px] font-medium truncate">{a.name} <span className="text-[11px] font-mono text-[#605e5c]">{a.version}</span></div>
                  <div className="text-[11px] text-[#605e5c] line-clamp-2 flex-1">{a.description}</div>
                  <div className="text-[10px] text-[#a0a0a0] mt-1">{a.category} · {a.compatible?.join(', ')}</div>
                  <button disabled={busy === a.id} onClick={() => toggle(a)} className={`mt-3 w-full py-1.5 rounded text-[12px] font-medium ${isInstalled(a.id) ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-[#0078d4] text-white hover:bg-[#106ebe]'} disabled:opacity-50`}>
                    {busy === a.id ? '...' : isInstalled(a.id) ? 'Remove' : 'Get'}
                  </button>
                </div>
              ))}
            </div>
            {filtered.length === 0 && <div className="text-[12px] text-[#605e5c] p-4 text-center">No results</div>}
          </>
        )}
        <div className="mt-6 bg-white border border-[#e5e5e5] rounded-lg p-4 text-[12px] text-[#605e5c]">
          Install via Terminal: <code className="bg-[#f3f3f3] px-1 py-0.5 rounded">wpm install &lt;id&gt;</code> · Catalog: <code className="bg-[#f3f3f3] px-1 py-0.5 rounded">http://localhost:8080/catalog.json</code>
        </div>
      </div>
    </div>
  );
}
