import { useState } from 'react';
import { useDesktopStore } from '../../../store';
import { Search } from 'lucide-react';

const nav = [
  { id: 'system', label: 'System', icon: '🖥️', desc: 'Display, sound, notifications' },
  { id: 'bluetooth', label: 'Bluetooth & devices', icon: '📡', desc: 'Mouse, printer, camera' },
  { id: 'network', label: 'Network & internet', icon: '🌐', desc: 'Wi-Fi, airplane mode, VPN' },
  { id: 'personalization', label: 'Personalization', icon: '🎨', desc: 'Background, lock screen, colors' },
  { id: 'apps', label: 'Apps', icon: '⊞', desc: 'Installed apps, defaults' },
  { id: 'accounts', label: 'Accounts', icon: '👤', desc: 'Your info, email, sync' },
  { id: 'updates', label: 'Windows Update', icon: '🔄', desc: 'Security & updates' },
];

const wallpapers = [
  { id: 'bloom', name: 'Bloom (Default)', preview: 'linear-gradient(135deg,#0a4a8a,#4fb3e8)' },
  { id: 'windows11', name: 'Windows 11', preview: 'linear-gradient(135deg,#0078d4,#00bcf2)' },
  { id: 'dark', name: 'Dark', preview: '#1e1e1e' },
  { id: 'sunrise', name: 'Sunrise', preview: 'linear-gradient(135deg,#ff6b35,#ffd23f)' },
  { id: 'abstract', name: 'Abstract', preview: 'linear-gradient(135deg,#667eea,#764ba2)' },
];

export default function SettingsApp({ windowId: _ }: { windowId: string }) {
  const { settings, setWallpaper, setTheme, setTaskbarAlignment } = useDesktopStore();
  const [section, setSection] = useState('system');

  return (
    <div className="flex h-full bg-white text-[#323130]">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#f3f3f3] border-r border-[#e5e5e5] flex flex-col shrink-0">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#0078d4] flex items-center justify-center text-white text-sm">👤</div>
            <div>
              <div className="text-[13px] font-semibold">User</div>
              <div className="text-[11px] text-[#605e5c]">user@bindows.local</div>
            </div>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#605e5c]" />
            <input placeholder="Find a setting" className="w-full pl-8 pr-2 py-1.5 rounded border border-[#e5e5e5] bg-white text-[12px] outline-none focus:border-[#0078d4]" />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-2 pb-2 space-y-0.5">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 ${section===n.id ? 'bg-white shadow-sm border border-black/5' : 'hover:bg-white/60'}`}
            >
              <span className="text-[16px]">{n.icon}</span>
              <div className="min-w-0">
                <div className="text-[12px] font-medium leading-none">{n.label}</div>
                <div className="text-[11px] text-[#605e5c] truncate hidden xl:block">{n.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#f9f9f9]">
        <div className="max-w-[720px] mx-auto p-6">
          <h1 className="text-[28px] font-semibold mb-1">System</h1>
          <p className="text-[12px] text-[#605e5c] mb-6">Customize your Bindows experience</p>

          {/* Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-[#e5e5e5] p-4">
              <h3 className="text-[13px] font-semibold mb-3">Appearance</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-[12px] font-medium mb-2">Theme</div>
                  <div className="flex gap-2">
                    {(['light','dark'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-3 rounded border text-[12px] capitalize ${settings.theme===t ? 'bg-[#0078d4] text-white border-[#0078d4]' : 'bg-[#f3f3f3] border-[#e5e5e5] hover:bg-[#e5e5e5]'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-medium mb-2">Wallpaper</div>
                  <div className="grid grid-cols-3 gap-2">
                    {wallpapers.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setWallpaper(w.id)}
                        className={`rounded-lg overflow-hidden border-2 ${settings.wallpaper===w.id ? 'border-[#0078d4]' : 'border-[#e5e5e5] hover:border-[#c7c7c7]'}`}
                      >
                        <div className="h-16" style={{ background: w.preview }} />
                        <div className="text-[11px] py-1.5 bg-white">{w.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-medium mb-2">Taskbar alignment</div>
                  <div className="flex gap-2">
                    {(['center','left'] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setTaskbarAlignment(a)}
                        className={`flex-1 py-2 rounded border text-[12px] capitalize ${settings.taskbarAlignment===a ? 'bg-[#0078d4] text-white border-[#0078d4]' : 'bg-[#f3f3f3] border-[#e5e5e5]'}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#e5e5e5] p-4">
              <h3 className="text-[13px] font-semibold mb-1">About</h3>
              <div className="text-[12px] text-[#605e5c] space-y-1">
                <div className="flex justify-between"><span>Edition</span><span className="text-[#323130] font-medium">Bindows 11 Pro</span></div>
                <div className="flex justify-between"><span>Version</span><span className="text-[#323130] font-medium">23H2</span></div>
                <div className="flex justify-between"><span>Build</span><span className="text-[#323130] font-medium">22631.3007</span></div>
                <div className="flex justify-between"><span>Experience</span><span className="text-[#323130] font-medium">Bindows Feature Experience Pack</span></div>
              </div>
              <div className="mt-3 p-3 bg-[#f3f3f3] rounded text-[11px] text-[#605e5c]">
                This is a browser-based simulation. No actual Windows kernel is running — just good vibes and Fluent Design.
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#e5e5e5] p-4">
              <h3 className="text-[13px] font-semibold mb-2">System Info</h3>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-[#f3f3f3] rounded p-3"><div className="text-[#605e5c]">Processor</div><div className="font-medium">VM-View Virtual CPU @ 3.2 GHz</div></div>
                <div className="bg-[#f3f3f3] rounded p-3"><div className="text-[#605e5c]">RAM</div><div className="font-medium">8.00 GB</div></div>
                <div className="bg-[#f3f3f3] rounded p-3"><div className="text-[#605e5c]">Storage</div><div className="font-medium">120 GB SSD</div></div>
                <div className="bg-[#f3f3f3] rounded p-3"><div className="text-[#605e5c]">Graphics</div><div className="font-medium">VM-View Adapter</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
