import { useState } from 'react';
import { useDesktopStore } from '../../../store';
import { api } from '../../../store/api';
import {
  Monitor, Palette, Layout, Share2, Copy, Check, Lock,
  Wallpaper, Dock, Eye, EyeOff
} from 'lucide-react';

interface SettingsAppProps {
  windowId: string;
}

const wallpapers = [
  { id: 'gradient-purple', name: 'Purple Nebula', preview: 'linear-gradient(135deg, #1a0533, #0d1b2a)' },
  { id: 'gradient-blue', name: 'Deep Blue', preview: 'linear-gradient(135deg, #0c1445, #0d47a1)' },
  { id: 'gradient-sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #1a0a2e, #6a3093)' },
  { id: 'gradient-ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #0a1628, #1a535c)' },
  { id: 'gradient-fire', name: 'Fire', preview: 'linear-gradient(135deg, #1a0000, #7f1d1d)' },
  { id: 'gradient-forest', name: 'Forest', preview: 'linear-gradient(135deg, #0a1a0a, #2d5016)' },
  { id: 'solid-black', name: 'Pure Black', preview: '#000' },
  { id: 'solid-dark', name: 'Dark', preview: '#111' },
];

export default function SettingsApp({ windowId }: SettingsAppProps) {
  const { settings, setWallpaper, setDockAutoHide } = useDesktopStore();
  const [activeTab, setActiveTab] = useState('appearance');
  const [sharePassword, setSharePassword] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'dock', name: 'Dock', icon: Layout },
    { id: 'sharing', name: 'Share OS', icon: Share2 },
  ];

  async function handleCreateShare() {
    if (!sharePassword) return;
    setShareLoading(true);
    try {
      const result = await api.createShare(sharePassword);
      const link = `${window.location.origin}/share/${result.shareId}`;
      setShareLink(link);
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full h-full flex bg-os-surface/50">
      {/* Sidebar */}
      <div className="w-44 bg-os-surface2/50 border-r border-white/5 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
              activeTab === tab.id
                ? 'bg-os-primary/20 text-os-primary'
                : 'text-os-muted hover:text-os-text hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'appearance' && (
          <div>
            <h3 className="text-sm font-semibold text-os-text mb-4">Wallpaper</h3>
            <div className="grid grid-cols-4 gap-3">
              {wallpapers.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => setWallpaper(wp.id)}
                  className={`aspect-video rounded-lg border-2 transition-all overflow-hidden ${
                    settings.wallpaper === wp.id
                      ? 'border-os-primary ring-2 ring-os-primary/30'
                      : 'border-transparent hover:border-white/20'
                  }`}
                >
                  <div className="w-full h-full" style={{ background: wp.preview }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dock' && (
          <div>
            <h3 className="text-sm font-semibold text-os-text mb-4">Dock Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-os-text">Auto-hide Dock</div>
                  <div className="text-[10px] text-os-muted">Automatically hide the dock when not in use</div>
                </div>
                <button
                  onClick={() => setDockAutoHide(!settings.dockAutoHide)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    settings.dockAutoHide ? 'bg-os-primary' : 'bg-os-border'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.dockAutoHide ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sharing' && (
          <div>
            <h3 className="text-sm font-semibold text-os-text mb-2">Share This OS</h3>
            <p className="text-[11px] text-os-muted mb-4">
              Create a share link so others can access this OS instance. They'll need the password to connect.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-os-muted mb-1 block">Access Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-os-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                    placeholder="Enter a password for guests"
                    className="w-full bg-os-surface2 border border-os-border rounded-lg pl-8 pr-9 py-2 text-xs text-os-text focus:outline-none focus:border-os-primary"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-os-muted hover:text-os-text"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateShare}
                disabled={!sharePassword || shareLoading}
                className="bg-os-primary hover:bg-os-primary-hover disabled:opacity-50 text-white text-xs px-4 py-2 rounded-lg transition-colors"
              >
                {shareLoading ? 'Creating...' : 'Generate Share Link'}
              </button>

              {shareLink && (
                <div className="bg-os-surface2 border border-os-border rounded-lg p-3">
                  <label className="text-[10px] text-os-muted block mb-1">Share Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 bg-os-bg border border-os-border rounded px-2 py-1.5 text-xs text-os-text font-mono"
                    />
                    <button
                      onClick={copyLink}
                      className={`p-1.5 rounded transition-colors ${
                        copied ? 'bg-os-success/20 text-os-success' : 'bg-os-primary/20 text-os-primary hover:bg-os-primary/30'
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-os-muted mt-2">
                    Anyone with this link and password can access this OS instance.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
