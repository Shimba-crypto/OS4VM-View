import { useState, useEffect } from 'react';
import { Download, Star, Search, Check, Trash2 } from 'lucide-react';
import { useAppRegistry } from '../../../store/appRegistry';
import { fetchCatalog, wpmInstall, wpmRemove } from '../../../lib/wpm';

export default function AppStoreApp({ windowId: _ }: { windowId: string }) {
  const [search, setSearch] = useState('');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const installed = useAppRegistry((s) => s.installed);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog().then(({ catalog }) => { setCatalog(catalog); setLoading(false); }).catch((e) => { setErr(String(e.message)); setLoading(false); });
  }, []);

  const filtered = catalog.filter((a) => `${a.name} ${a.description}`.toLowerCase().includes(search.toLowerCase()));
  const isInstalled = (id: string) => installed.some((x) => x.id === id);

  async function handleToggle(app: any) {
    setBusy(app.id);
    const fakeTerm = { writeln: (s: string) => console.log(s) };
    if (isInstalled(app.id)) await wpmRemove(app.id, fakeTerm as any);
    else await wpmInstall(app.id, fakeTerm as any);
    setBusy(null);
  }

  return (
    <div className="w-full h-full flex flex-col bg-os-surface/50">
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-os-text">App Store — wpm</h3>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-os-muted">{loading ? 'loading' : `${catalog.length} apps`} · {installed.length} installed</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-os-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search wpm catalog..." className="w-full bg-os-surface2 border border-os-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-os-text focus:outline-none focus:border-os-primary" />
        </div>
        <div className="text-[10px] text-os-muted mt-1">VM-APPSTORE · http://localhost:8080/catalog.json → raw github wpm</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && <div className="text-xs text-os-muted p-4 text-center">Loading catalog...</div>}
        {err && <div className="text-xs text-red-400 p-3 border border-red-500/20 rounded-lg bg-red-500/10">{err}<div className="mt-1 text-[11px] opacity-70">Run: npx serve /home/shimba/VM-APPSTORE -l 8080</div></div>}
        {!loading && !err && filtered.length === 0 && <div className="text-xs text-os-muted p-4 text-center">No results</div>}
        {!loading && filtered.map((app) => (
          <div key={app.id} className="flex items-center gap-3 bg-os-surface2/50 rounded-xl p-3 hover:bg-os-surface2 transition-colors border border-transparent hover:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">{app.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-os-text flex items-center gap-2">{app.name} <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{app.version}</span></div>
              <div className="text-[10px] text-os-muted truncate">{app.description}</div>
              <div className="flex items-center gap-2 mt-0.5"><Star className="w-2.5 h-2.5 text-os-warning fill-os-warning" /><span className="text-[9px] text-os-muted">{app.category} · {app.compatible?.join(', ')}</span></div>
            </div>
            <button
              disabled={busy === app.id}
              onClick={() => handleToggle(app)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-[72px] ${isInstalled(app.id) ? 'bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-os-primary/20 text-os-primary hover:bg-os-primary/30'} disabled:opacity-50`}
            >
              {busy === app.id ? '...' : isInstalled(app.id) ? <span className="flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</span> : <span className="flex items-center gap-1"><Download className="w-3 h-3" /> Install</span>}
            </button>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-white/5 text-[10px] text-os-muted flex items-center justify-between">
        <span>wpm install &lt;id&gt; in Terminal</span>
        <span className="hidden sm:inline">catalog: VM-APPSTORE → wpm</span>
      </div>
    </div>
  );
}
