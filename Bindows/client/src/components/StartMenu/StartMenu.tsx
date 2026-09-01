import { Search, Power, Settings, User } from 'lucide-react';
import { useWindowStore, defaultApps, useDesktopStore } from '../../store';
import { useAppRegistry } from '../../store/appRegistry';
import { useState, useMemo } from 'react';

export default function StartMenu() {
  const { openApp } = useWindowStore();
  const { setStartOpen } = useDesktopStore();
  const [query, setQuery] = useState('');

  const installed = useAppRegistry((s) => s.installed);
  const pinned = [...defaultApps, ...installed].slice(0, 20);
  const recommended = [
    { name: 'Getting Started', sub: 'Recently added', icon: '👋' },
    { name: 'Bindows Tips', sub: 'Recently added', icon: '💡' },
    { name: 'Project Proposal', sub: '2h ago', icon: '📄' },
    { name: 'Budget.xlsx', sub: 'Yesterday at 4:24 PM', icon: '📊' },
  ];

  const filtered = useMemo(() => {
    if (!query) return pinned;
    return defaultApps.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, pinned]);

  function launch(appId: string) {
    openApp(appId);
    setStartOpen(false);
  }

  return (
    <div
      className="absolute bottom-[56px] left-1/2 -translate-x-1/2 w-[640px] max-w-[92vw] h-[640px] max-h-[72vh] bg-[#f3f3f3]/95 taskbar-blur rounded-lg win-shadow border border-white/40 flex flex-col overflow-hidden animate-start-open z-[9999]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2.5 border border-black/5 shadow-sm">
          <Search className="w-4 h-4 text-[#605e5c]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for apps, settings, and documents"
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[#605e5c]"
            autoFocus
          />
        </div>
      </div>

      {/* Pinned */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-[#323130]">Pinned</h3>
          <button className="text-[12px] bg-white border border-black/5 px-3 py-1 rounded shadow-sm hover:bg-white">All apps ›</button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {filtered.map((app) => (
            <button
              key={app.id}
              onClick={() => launch(app.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded hover:bg-white transition-colors"
            >
              <div className="w-8 h-8 rounded flex items-center justify-center text-lg bg-white shadow-sm border border-black/5">
                {app.icon}
              </div>
              <span className="text-[11px] text-[#323130] text-center leading-tight line-clamp-2">{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div className="px-6 mt-6 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-[#323130]">Recommended</h3>
          <button className="text-[12px] bg-white border border-black/5 px-3 py-1 rounded shadow-sm">More ›</button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {recommended.map((item) => (
            <button key={item.name} className="flex items-center gap-3 p-2 rounded hover:bg-white text-left transition-colors">
              <div className="w-8 h-8 rounded bg-white shadow-sm border border-black/5 flex items-center justify-center text-sm">{item.icon}</div>
              <div className="min-w-0">
                <div className="text-[12px] text-[#323130] truncate">{item.name}</div>
                <div className="text-[11px] text-[#605e5c] truncate">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="h-14 bg-[#f3f3f3] border-t border-black/5 flex items-center justify-between px-6 shrink-0">
        <button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#e1e1e1] flex items-center justify-center">
            <User className="w-4 h-4 text-[#605e5c]" />
          </div>
          <span className="text-[12px] text-[#323130]">User</span>
        </button>
        <button className="w-8 h-8 rounded hover:bg-white flex items-center justify-center transition-colors">
          <Power className="w-4 h-4 text-[#323130]" />
        </button>
      </div>
    </div>
  );
}
