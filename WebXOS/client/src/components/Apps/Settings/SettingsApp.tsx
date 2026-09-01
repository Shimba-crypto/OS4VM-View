import { useState } from 'react';
import { useDesktopStore } from '../../../store';

const wallpapers = [
  { id: 'chrome-gradient', label: 'Chrome Gradient', preview: 'linear-gradient(135deg, #202124, #0f3460)' },
  { id: 'dark-blue', label: 'Dark Blue', preview: 'linear-gradient(135deg, #0d1117, #21262d)' },
  { id: 'midnight', label: 'Midnight', preview: 'linear-gradient(135deg, #1e1e2e, #45475a)' },
];

export default function SettingsApp({ windowId }: { windowId: string }) {
  const { settings, setWallpaper, setTheme } = useDesktopStore();
  const [tab, setTab] = useState<'appearance' | 'about'>('appearance');

  return (
    <div className="w-full h-full flex bg-wx-surface">
      <div className="w-40 shrink-0 bg-wx-surface2 border-r border-wx-border p-2 flex flex-col gap-0.5">
        <button onClick={() => setTab('appearance')} className={`text-left px-3 py-2 rounded-lg text-[12px] ${tab === 'appearance' ? 'bg-wx-accent/20 text-wx-accent' : 'text-wx-muted hover:bg-white/5'}`}>Appearance</button>
        <button onClick={() => setTab('about')} className={`text-left px-3 py-2 rounded-lg text-[12px] ${tab === 'about' ? 'bg-wx-accent/20 text-wx-accent' : 'text-wx-muted hover:bg-white/5'}`}>About</button>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {tab === 'appearance' && (
          <div>
            <h3 className="text-[14px] font-semibold text-wx-text mb-3">Wallpaper</h3>
            <div className="grid grid-cols-3 gap-3">
              {wallpapers.map((w) => (
                <button key={w.id} onClick={() => setWallpaper(w.id)}
                  className={`h-20 rounded-xl border-2 transition-all ${settings.wallpaper === w.id ? 'border-wx-accent' : 'border-wx-border hover:border-white/20'}`}
                  style={{ background: w.preview }}>
                  <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-full">{w.label}</span>
                </button>
              ))}
            </div>
            <h3 className="text-[14px] font-semibold text-wx-text mb-3 mt-6">Theme</h3>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-lg text-[12px] border ${settings.theme === t ? 'bg-wx-accent/20 text-wx-accent border-wx-accent/30' : 'bg-white/5 text-wx-muted border-wx-border hover:bg-white/10'}`}>
                  {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === 'about' && (
          <div className="space-y-3">
            <h3 className="text-[14px] font-semibold text-wx-text">WebXOS</h3>
            <div className="text-[12px] text-wx-muted space-y-1">
              <p>Version: 0.1.0</p>
              <p>Kernel: React 18 + Vite 5 + Zustand</p>
              <p>Platform: VM-View Hypervisor</p>
              <p>Renderer: ChromeOS-style</p>
              <p className="pt-2 text-wx-accent">Part of OS4VM-View family</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
