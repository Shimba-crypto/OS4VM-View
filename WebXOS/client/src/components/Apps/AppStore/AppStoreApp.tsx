import { useState, useEffect } from 'react';
import { Store, Download, Trash2, ExternalLink } from 'lucide-react';
import { fetchCatalog, wpmInstall, wpmRemove } from '../../../lib/wpm';
import { useAppRegistry } from '../../../store/appRegistry';

export default function AppStoreApp({ windowId }: { windowId: string }) {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { installed, addApp, removeApp } = useAppRegistry();

  useEffect(() => {
    fetchCatalog().then((c) => { setCatalog(c); setLoading(false); })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const isInstalled = (id: string) => installed.some((a) => a.id === id);

  return (
    <div className="w-full h-full flex flex-col bg-wx-surface">
      <div className="p-3 bg-wx-surface2 border-b border-wx-border flex items-center gap-2">
        <Store className="w-4 h-4 text-wx-accent" />
        <span className="text-[13px] font-semibold text-wx-text">App Store</span>
        <span className="text-[10px] text-wx-muted ml-1">wpm · {catalog.length} apps</span>
        <div className="flex-1" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
          className="w-40 bg-wx-surface border border-wx-border rounded-full px-3 py-1 text-[11px] text-wx-text outline-none focus:border-wx-accent" />
      </div>
      <div className="flex-1 p-3 overflow-auto">
        {loading && <div className="text-[12px] text-wx-muted text-center pt-8">Loading catalog...</div>}
        {error && <div className="text-[12px] text-wx-yellow bg-wx-yellow/10 p-3 rounded-lg">{error}</div>}
        {!loading && !error && catalog.filter((a) => `${a.name} ${a.description}`.toLowerCase().includes(search.toLowerCase())).map((app) => (
          <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg bg-wx-surface2 border border-wx-border mb-2 hover:border-white/10">
            <div className="w-10 h-10 rounded-xl bg-wx-surface border border-wx-border flex items-center justify-center text-lg">{app.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-wx-text">{app.name} <span className="text-[10px] font-mono text-wx-muted">{app.version}</span></div>
              <div className="text-[11px] text-wx-muted truncate">{app.description}</div>
            </div>
            {isInstalled(app.id) ? (
              <button onClick={() => wpmRemove(app.id, removeApp)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-wx-red/20 text-wx-red text-[11px] hover:bg-wx-red/30">
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            ) : (
              <button onClick={() => wpmInstall(app, installed, addApp)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-wx-accent text-white text-[11px] hover:bg-wx-accent/80">
                <Download className="w-3 h-3" /> Install
              </button>
            )}
          </div>
        ))}
        {!loading && !error && catalog.length === 0 && (
          <div className="text-[12px] text-wx-muted text-center pt-8">
            No apps found. Run: <code className="bg-wx-surface2 px-2 py-0.5 rounded">npx serve /home/shimba/VM-APPSTORE -l 8081</code>
          </div>
        )}
      </div>
    </div>
  );
}
