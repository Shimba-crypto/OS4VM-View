import { useState } from 'react';
import { Download, Star, Search } from 'lucide-react';

interface AppStoreAppProps {
  windowId: string;
}

const storeApps = [
  { id: 'vscode', name: 'VS Code Web', icon: '💻', desc: 'Code editor in the browser', installed: true },
  { id: 'docker', name: 'Docker UI', icon: '🐳', desc: 'Container management', installed: false },
  { id: 'git-client', name: 'Git Client', icon: '🔀', desc: 'Visual git client', installed: false },
  { id: 'database', name: 'Database Viewer', icon: '🗄️', desc: 'Browse databases', installed: false },
  { id: 'api-client', name: 'API Client', icon: '🔗', desc: 'REST & GraphQL client', installed: false },
  { id: 'markdown', name: 'Markdown Editor', icon: '📄', desc: 'Rich markdown editor', installed: false },
  { id: 'image-editor', name: 'Image Editor', icon: '🖼️', desc: 'Edit images', installed: false },
  { id: 'ssh', name: 'SSH Client', icon: '🔐', desc: 'Connect to remote servers', installed: false },
  { id: 'redis', name: 'Redis GUI', icon: '🔴', desc: 'Redis database browser', installed: false },
  { id: 'postman', name: 'HTTP Client', icon: '🚀', desc: 'Test HTTP requests', installed: false },
];

export default function AppStoreApp({ windowId }: AppStoreAppProps) {
  const [search, setSearch] = useState('');
  const [installed, setInstalled] = useState<Set<string>>(
    new Set(storeApps.filter((a) => a.installed).map((a) => a.id))
  );

  const filtered = storeApps.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) ||
           a.desc.toLowerCase().includes(search.toLowerCase())
  );

  function toggleInstall(id: string) {
    setInstalled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="w-full h-full flex flex-col bg-os-surface/50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-os-text mb-2">App Store</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-os-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps..."
            className="w-full bg-os-surface2 border border-os-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-os-text focus:outline-none focus:border-os-primary"
          />
        </div>
      </div>

      {/* App list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="flex items-center gap-3 bg-os-surface2/50 rounded-xl p-3 hover:bg-os-surface2 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
              {app.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-os-text">{app.name}</div>
              <div className="text-[10px] text-os-muted truncate">{app.desc}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-2.5 h-2.5 text-os-warning fill-os-warning" />
                <span className="text-[9px] text-os-muted">4.{Math.floor(Math.random() * 9)}</span>
              </div>
            </div>
            <button
              onClick={() => toggleInstall(app.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                installed.has(app.id)
                  ? 'bg-os-danger/20 text-os-danger hover:bg-os-danger/30'
                  : 'bg-os-primary/20 text-os-primary hover:bg-os-primary/30'
              }`}
            >
              {installed.has(app.id) ? 'Remove' : (
                <>
                  <Download className="w-3 h-3 inline mr-1" />
                  Install
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
