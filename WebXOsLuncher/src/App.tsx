import { useState, useEffect, useRef } from 'react';
import { Play, ExternalLink, Settings2, Monitor, Zap, Layers, Maximize2, X, Search, RefreshCw, Copy, Check, Activity, History, AlertCircle } from 'lucide-react';

type OSDef = {
  id: string;
  name: string;
  longName: string;
  icon: string;
  desc: string;
  color: string;
  port: number;
  basePath: string;
  localPath: string;
  features: string[];
};

const GH_PAGES_BASE = 'https://shimba-crypto.github.io/OS4VM-View';
const OSES: OSDef[] = [
  { id: 'backendos', name: 'BackendOS', longName: 'OS 1 — BackendOS', icon: '🖥️', desc: 'macOS-style developer OS · most complete', color: 'from-violet-600 to-indigo-600', port: 5174, basePath: 'backend-os/', localPath: 'http://localhost:5174/', features: ['Terminal + xterm', 'CodeMirror editor', 'Dock + Taskbar', '8 apps'] },
  { id: 'autonomous', name: 'AutonomousOS', longName: 'AutonomousOS', icon: '◉', desc: 'Agent-driven · auto-tile + queue', color: 'from-cyan-600 to-teal-600', port: 5178, basePath: 'autonomous/', localPath: 'http://localhost:5178/', features: ['Agent Bar', 'Auto-tile', 'Task Monitor', '6 apps'] },
  { id: 'bindows', name: 'Bindows 11', longName: 'Bindows 11', icon: '🪟', desc: 'Windows 11 Fluent · new', color: 'from-sky-600 to-blue-600', port: 5177, basePath: 'bindows/', localPath: 'http://localhost:5177/', features: ['Start Menu', 'File Explorer', 'Notepad + Calculator', 'Edge browser'] },
  { id: 'simpleos', name: 'SimpleOS', longName: 'SimpleOS', icon: '⚡', desc: 'XFCE-style lightweight', color: 'from-emerald-600 to-teal-600', port: 5175, basePath: 'simple-os/', localPath: 'http://localhost:5175/', features: ['Top + Bottom panels', '5 apps', 'Lightweight'] },
  { id: 'nanoos', name: 'NanoOS', longName: 'NanoOS', icon: '◆', desc: 'Ultra-light monochrome', color: 'from-zinc-700 to-zinc-900', port: 5176, basePath: 'nano-os/', localPath: 'http://localhost:5176/', features: ['Terminal only', '2 apps', '~12KB CSS'] },
];

type Health = Record<string, 'online' | 'offline' | 'checking'>;

export default function App() {
  const [running, setRunning] = useState<OSDef | null>(null);
  const [mode, setMode] = useState<'iframe' | 'newtab'>(() => (localStorage.getItem('wx_mode') as any) || 'iframe');
  const [search, setSearch] = useState('');
  const [instanceId, setInstanceId] = useState(localStorage.getItem('wx_instance') || '');
  const [token, setToken] = useState(localStorage.getItem('wx_token') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [envMode, setEnvMode] = useState<'auto' | 'local' | 'prod'>(() => (localStorage.getItem('wx_env') as any) || 'auto');
  const [health, setHealth] = useState<Health>({});
  const [instances, setInstances] = useState<any[]>([]);
  const [instancesError, setInstancesError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'os' | 'wpm'>('os');
  const [wpmCatalog, setWpmCatalog] = useState<any[]>([]);
  const [wpmLoading, setWpmLoading] = useState(false);
  const [wpmErr, setWpmErr] = useState<string | null>(null);
  const recent = JSON.parse(localStorage.getItem('wx_recent') || '[]') as string[];
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => { localStorage.setItem('wx_instance', instanceId); }, [instanceId]);
  useEffect(() => { localStorage.setItem('wx_token', token); if (token) localStorage.setItem('vmview_token', token); }, [token]);
  useEffect(() => { localStorage.setItem('wx_env', envMode); }, [envMode]);
  useEffect(() => { localStorage.setItem('wx_mode', mode); }, [mode]);

  // Health check — localhost dev + prod (GitHub Pages / Vercel)
  useEffect(() => {
    let cancelled = false;
    async function checkOne(url: string): Promise<boolean> {
      try {
        const c = new AbortController();
        setTimeout(() => c.abort(), 1500);
        const r = await fetch(url, { method: 'HEAD', signal: c.signal, cache: 'no-store' });
        if (r.ok || r.status === 200) return true;
      } catch {}
      try {
        await fetch(url, { mode: 'no-cors', cache: 'no-store' } as any);
        return true;
      } catch { return false; }
    }
    async function check() {
      const next: Health = {};
      const isVercel = window.location.hostname.includes('vercel.app');
      const isGhPages = window.location.hostname.includes('github.io');
      await Promise.all(OSES.map(async (os) => {
        next[os.id] = 'checking';
        if (!cancelled) setHealth({ ...next });
        const prodUrl = isVercel
          ? `${GH_PAGES_BASE}/${os.basePath}`
          : isGhPages
          ? `./${os.basePath}`
          : `${GH_PAGES_BASE}/${os.basePath}`;
        // Try local first when on localhost, else prod first
        const isLocal = window.location.hostname === 'localhost';
        const urls = isLocal ? [os.localPath, prodUrl] : [prodUrl, os.localPath];
        for (const u of urls) {
          if (await checkOne(u)) { next[os.id] = 'online'; if (!cancelled) setHealth({ ...next }); return; }
        }
        next[os.id] = 'offline';
        if (!cancelled) setHealth({ ...next });
      }));
      if (!cancelled) setHealth(next);
    }
    check();
    const id = setInterval(check, 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Fetch instances from backend if token/instance backend reachable
  useEffect(() => {
    async function load() {
      setInstancesError(null);
      const apiBases = ['http://localhost:3001/api', '/api'];
      for (const base of apiBases) {
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const r = await fetch(`${base}/instances`, { headers });
          if (!r.ok) throw new Error(`${r.status}`);
          const data = await r.json();
          const list = Array.isArray(data) ? data : data.instances || data.data || [];
          setInstances(list.slice(0, 8));
          return;
        } catch (e: any) {
          // try next base
        }
      }
      setInstances([]);
      if (token) setInstancesError('No backend at localhost:3001 or /api');
    }
    load();
  }, [token]);

  // wpm catalog for Repo tab
  useEffect(() => {
    if (activeTab !== 'wpm') return;
    setWpmLoading(true);
    setWpmErr(null);
    const custom = (() => { try { return localStorage.getItem('wpm_catalog_url'); } catch { return null; } })();
    const port = (() => { try { return localStorage.getItem('wpm_port'); } catch { return null; } })();
    const urls = custom ? [custom, 'https://cdn.jsdelivr.net/gh/Shimba-crypto/wpm@main/catalog.json'] : port ? [`http://localhost:${port}/catalog.json`, 'https://cdn.jsdelivr.net/gh/Shimba-crypto/wpm@main/catalog.json'] : ['http://localhost:8081/catalog.json', 'http://localhost:8080/catalog.json', 'https://cdn.jsdelivr.net/gh/Shimba-crypto/wpm@main/catalog.json', 'https://raw.githubusercontent.com/Shimba-crypto/wpm/main/catalog.json'];
    (async () => {
      for (const u of urls) {
        try {
          const r = await fetch(u, { cache: 'no-store' });
          if (!r.ok) continue;
          const d = await r.json();
          const arr = Array.isArray(d) ? d : d.catalog || d.apps || [];
          setWpmCatalog(arr);
          setWpmLoading(false);
          return;
        } catch {}
      }
      setWpmErr('No catalog at localhost:8081/8080 or raw github — run npx serve /home/shimba/VM-APPSTORE -l 8081 or push wpm');
      setWpmLoading(false);
    })();
  }, [activeTab]);

  const filtered = OSES.filter((o) => `${o.name} ${o.desc}`.toLowerCase().includes(search.toLowerCase()));

  function getOSUrl(os: OSDef) {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    const isVercel = host.includes('vercel.app');
    const useLocal = envMode === 'local' || (envMode === 'auto' && isLocalhost);
    let base: string;
    if (useLocal) base = os.localPath;
    else if (isVercel) base = `${GH_PAGES_BASE}/${os.basePath}`;
    else base = `./${os.basePath}`;
    if (instanceId) return `${base}${instanceId}`;
    return base;
  }

  function launch(os: OSDef) {
    const rec = [os.id, ...recent.filter((r) => r !== os.id)].slice(0, 4);
    localStorage.setItem('wx_recent', JSON.stringify(rec));
    if (mode === 'newtab') window.open(getOSUrl(os), '_blank');
    else { setRunning(os); setIframeError(false); setFrameKey((k) => k + 1); }
  }

  function copyUrl(os: OSDef) {
    navigator.clipboard.writeText(getOSUrl(os));
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#07070a] text-zinc-100">
      <header className="h-[56px] shrink-0 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm">⧉</div>
          <div>
            <div className="text-[14px] font-bold leading-none tracking-tight">WebXOs Luncher</div>
            <div className="text-[11px] text-zinc-500 leading-none mt-0.5">Run OS 1 — <span className="text-violet-400 font-medium">BackendOS</span> + 3 more</div>
          </div>
          <span className="ml-3 hidden md:inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full bg-violet-600/15 text-violet-300 border border-violet-600/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 5 OSes
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
            <Activity className="w-3 h-3" /> {Object.values(health).filter((v) => v === 'online').length}/{OSES.length} dev online
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full p-1">
            <button onClick={() => setActiveTab('os')} className={`px-3 py-1 rounded-full text-[11px] font-medium ${activeTab === 'os' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>OS</button>
            <button onClick={() => setActiveTab('wpm')} className={`px-3 py-1 rounded-full text-[11px] font-medium ${activeTab === 'wpm' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>wpm</button>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={activeTab === 'wpm' ? 'Search wpm…' : 'Search OS…'} className="bg-transparent outline-none text-[12px] placeholder:text-zinc-500 w-32" />
          </div>
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full p-1">
            <button onClick={() => setMode('iframe')} className={`px-3 py-1 rounded-full text-[11px] font-medium ${mode === 'iframe' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>Embed</button>
            <button onClick={() => setMode('newtab')} className={`px-3 py-1 rounded-full text-[11px] font-medium ${mode === 'newtab' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>New tab</button>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className={`w-8 h-8 rounded-full flex items-center justify-center border ${showSettings ? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}>
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="border-b border-zinc-800 bg-zinc-950 p-4 grid md:grid-cols-2 gap-4 animate-fade-in">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-zinc-400">Instance ID</span>
            <input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} placeholder="e.g. 64f1a2b3…" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-violet-600 font-mono" />
            {instances.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {instances.map((ins) => {
                  const id = ins.id || ins._id || ins.instanceId || String(ins).slice(0, 12);
                  return <button key={id} onClick={() => setInstanceId(id)} className={`text-[10px] px-2 py-1 rounded-full border ${instanceId === id ? 'bg-violet-600 text-white border-violet-600' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}>{String(id).slice(0, 12)}</button>;
                })}
              </div>
            )}
            {instancesError && <span className="text-[10px] text-amber-400">{instancesError}</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-zinc-400">vmview_token</span>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Bearer token" type="password" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-violet-600 font-mono" />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-zinc-400">Environment</span>
            <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full w-fit">
              {(['auto', 'local', 'prod'] as const).map((v) => (
                <button key={v} onClick={() => setEnvMode(v)} className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize ${envMode === v ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>{v === 'auto' ? 'Auto' : v === 'local' ? 'Local dev' : 'Prod'}</button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-500">{envMode === 'auto' ? 'Auto = localhost → 517x, else ./os/...' : envMode === 'local' ? 'Force localhost:517x' : 'Force ./os/... (preview/gh-pages)'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium text-zinc-400">Health</span>
            <div className="flex flex-wrap gap-1.5">
              {OSES.map((os) => (
                <span key={os.id} className={`text-[10px] font-mono px-2 py-1 rounded-full border flex items-center gap-1 ${health[os.id] === 'online' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : health[os.id] === 'offline' ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${health[os.id] === 'online' ? 'bg-emerald-500' : health[os.id] === 'offline' ? 'bg-red-500' : 'bg-zinc-500 animate-pulse'}`} />{os.name} {health[os.id] || '…'}
                </span>
              ))}
            </div>
            <button onClick={() => { setInstanceId(''); setToken(''); localStorage.removeItem('vmview_token'); }} className="text-[11px] px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 w-fit">Clear token/id</button>
          </div>
          <div className="md:col-span-2 flex items-center gap-2 text-[11px] text-zinc-500">
            <span>Half-local:</span> <code className="bg-zinc-900 px-1.5 py-0.5 rounded">./run-half-local-prod.sh</code> — prod launcher 4179 + dev OSes
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 overflow-auto p-4 md:p-6 ${running ? 'hidden lg:block' : ''}`}>
          <div className="max-w-[1100px] mx-auto">
            <div className="rounded-2xl overflow-hidden border border-violet-600/20 bg-gradient-to-br from-violet-600/20 via-indigo-600/20 to-zinc-900 p-[1px] mb-6">
              <div className="rounded-[15px] bg-zinc-950 p-5 md:p-6 flex flex-col md:flex-row gap-5">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-violet-300 bg-violet-600/15 border border-violet-600/20 px-2.5 py-1 rounded-full">
                    <Monitor className="w-3 h-3" /> OS 1 — FEATURED</div>
                  <h1 className="text-[24px] md:text-[28px] font-extrabold tracking-tight mt-3 leading-none">BackendOS <span className="font-normal text-zinc-500">· macOS-style</span></h1>
                  <p className="text-[13px] text-zinc-400 mt-2 max-w-[560px]">Most complete OS. CodeMirror, xterm, Dock, 8 apps. Zustand windowing.</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {OSES[0].features.map((f) => <span key={f} className="text-[11px] px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">{f}</span>)}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    <button onClick={() => launch(OSES[0])} className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-[13px] font-semibold hover:bg-zinc-100"><Play className="w-4 h-4 fill-black" /> Run OS 1</button>
                    <button onClick={() => window.open(getOSUrl(OSES[0]), '_blank')} className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-[13px] font-medium hover:bg-zinc-800">Open <ExternalLink className="w-3.5 h-3.5" /></button>
                    <button onClick={() => copyUrl(OSES[0])} className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-full text-[12px] hover:bg-zinc-800">{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied' : 'Copy URL'}</button>
                    <span className={`hidden sm:inline-flex items-center text-[10px] px-2 py-1 rounded-full border ${health.backendos === 'online' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>{health.backendos === 'online' ? '● online :5174' : '○ offline'}</span>
                  </div>
                  {recent.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 text-[11px] text-zinc-500"><History className="w-3 h-3" /> Recent: {recent.map((r) => OSES.find((o) => o.id === r)?.name).join(' · ')}</div>
                  )}
                </div>
                <div className="w-full md:w-[360px] shrink-0 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[16/10] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 to-indigo-600/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[82%] h-[74%] rounded-lg bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
                      <div className="h-6 bg-zinc-900 border-b border-zinc-800 flex items-center px-2 gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="ml-2 text-[10px] text-zinc-500">BackendOS — Terminal</span></div>
                      <div className="flex-1 p-3 font-mono text-[10px] leading-relaxed text-zinc-400"><div className="text-violet-400">$ neofetch</div><div>OS: BackendOS 0.1.0</div><div>Host: VM-View Hypervisor</div><div className="mt-2 text-emerald-400">➜ ~ ls</div><div className="text-zinc-300">Documents/ Projects/ README.md</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {activeTab === 'wpm' ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-semibold tracking-wide text-zinc-200 flex items-center gap-2"><Layers className="w-4 h-4 text-violet-400" /> wpm catalog · VM-APPSTORE</h2>
                  <span className="text-[11px] text-zinc-500">{wpmLoading ? 'loading' : `${wpmCatalog.length} apps`} · {wpmErr ? 'offline' : 'http://localhost:8080 or raw github'}</span>
                </div>
                {wpmLoading && <div className="text-[12px] text-zinc-500 p-8 text-center">Loading catalog...</div>}
                {wpmErr && <div className="text-[12px] text-amber-300 p-3 border border-amber-500/20 rounded-lg bg-amber-500/10">{wpmErr}<div className="mt-1 text-[11px] opacity-70">Run: npx serve /home/shimba/VM-APPSTORE -l 8080</div></div>}
                {!wpmLoading && !wpmErr && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {wpmCatalog.filter((a: any) => `${a.name} ${a.description}`.toLowerCase().includes(search.toLowerCase())).map((app: any) => (
                      <div key={app.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col hover:border-zinc-700">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl mb-3">{app.icon}</div>
                        <div className="text-[13px] font-semibold">{app.name} <span className="text-[11px] font-mono text-zinc-500">{app.version}</span></div>
                        <div className="text-[11px] text-zinc-500 line-clamp-2 flex-1 mt-1">{app.description}</div>
                        <div className="text-[10px] text-zinc-600 mt-1">{app.category} · {app.compatible?.join(', ')}</div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => navigator.clipboard.writeText(`wpm install ${app.id}`)} className="flex-1 py-1.5 rounded-full bg-white text-black text-[12px] font-medium hover:bg-zinc-100">Copy: wpm install {app.id}</button>
                          <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 self-center">{app.defaultWidth}×{app.defaultHeight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!wpmLoading && !wpmErr && wpmCatalog.filter((a: any) => `${a.name} ${a.description}`.toLowerCase().includes(search.toLowerCase())).length === 0 && <div className="text-[12px] text-zinc-500 p-4 text-center">No wpm results</div>}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-semibold tracking-wide text-zinc-200 flex items-center gap-2"><Layers className="w-4 h-4 text-zinc-500" /> All Operating Systems</h2>
                  <span className="text-[11px] text-zinc-500">{filtered.length} of {OSES.length} · AutonomousOS new</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {filtered.map((os) => (
                    <div key={os.id} className="group rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors flex flex-col">
                      <div className={`h-1.5 bg-gradient-to-r ${os.color}`} />
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg">{os.icon}</div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-mono px-1.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">:{os.port}</span>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${health[os.id] === 'online' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : health[os.id] === 'offline' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-zinc-900 text-zinc-600 border-zinc-800'}`}>{health[os.id] || '…'}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="text-[13px] font-semibold leading-none">{os.name}</div>
                          <div className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{os.desc}</div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">{os.features.slice(0, 2).map((f) => <span key={f} className="text-[10px] px-1.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">{f}</span>)}</div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => launch(os)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-black rounded-full py-1.5 text-[12px] font-semibold hover:bg-zinc-100"><Play className="w-3.5 h-3.5 fill-black" /> Run</button>
                          <button onClick={() => copyUrl(os)} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800" title={getOSUrl(os)}>{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}</button>
                          <a href={getOSUrl(os)} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800"><ExternalLink className="w-3.5 h-3.5 text-zinc-400" /></a>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-600 mt-2 truncate">{getOSUrl(os)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-amber-400" /></div><div><div className="text-[12px] font-semibold">Dev tip</div><div className="text-[11px] text-zinc-500">Run <code className="bg-zinc-900 px-1 py-0.5 rounded">npm run dev</code> in each OS client, then use launcher on :5179.</div></div></div>
              <div className="text-[11px] text-zinc-600 font-mono">OS4VM-View · 5 OSes · AutonomousOS new</div>
            </div>
          </div>
        </div>

        {running && (
          <div className="flex-1 lg:max-w-[65%] xl:max-w-[68%] border-l border-zinc-800 bg-zinc-950 flex flex-col animate-scale-in w-full">
            <div className="h-10 shrink-0 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2 px-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{running.icon}</span>
                <span className="text-[12px] font-semibold truncate">{running.longName}</span>
                <span className="hidden sm:inline text-[11px] font-mono text-zinc-500 truncate">{getOSUrl(running)}</span>
                <span className={`hidden md:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${health[running.id] === 'online' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>{health[running.id] === 'online' ? '● dev online' : '○ offline'}</span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setFrameKey((k) => k + 1)} className="w-7 h-7 rounded hover:bg-zinc-800 flex items-center justify-center" title="Reload"><RefreshCw className="w-3.5 h-3.5" /></button>
                <button onClick={() => { navigator.clipboard.writeText(getOSUrl(running)); setCopied(true); setTimeout(() => setCopied(false), 1200); }} className="w-7 h-7 rounded hover:bg-zinc-800 flex items-center justify-center" title="Copy URL">{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}</button>
                <a href={getOSUrl(running)} target="_blank" rel="noreferrer" className="w-7 h-7 rounded hover:bg-zinc-800 flex items-center justify-center" title="Open in new tab"><ExternalLink className="w-3.5 h-3.5" /></a>
                <button onClick={() => setRunning(null)} className="w-7 h-7 rounded hover:bg-zinc-800 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
                <button onClick={() => { const el = document.getElementById('os-frame'); if (el?.requestFullscreen) el.requestFullscreen(); }} className="hidden sm:flex w-7 h-7 rounded hover:bg-zinc-800 items-center justify-center"><Maximize2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex-1 bg-black relative">
              {iframeError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
                  <AlertCircle className="w-8 h-8 text-amber-400 mb-3" />
                  <div className="text-[13px] font-semibold">OS not reachable</div>
                  <div className="text-[12px] text-zinc-400 mt-1 max-w-md">No dev server at <code className="bg-zinc-900 px-1 py-0.5 rounded">{running.localPath}</code>. Start it with:<br /><code className="bg-zinc-900 px-2 py-1 rounded mt-2 inline-block">cd OS4VM-View/{running.name}/client && npm run dev</code></div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setIframeError(false)} className="px-3 py-1.5 rounded-full bg-white text-black text-[12px] font-medium">Retry</button>
                    <button onClick={() => setEnvMode('prod')} className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[12px]">Try prod relative</button>
                    <a href={getOSUrl(running)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[12px]">Open new tab</a>
                  </div>
                </div>
              ) : (
                <iframe
                  key={frameKey}
                  ref={iframeRef}
                  id="os-frame"
                  src={getOSUrl(running)}
                  title={running.name}
                  className="w-full h-full border-0"
                  allow="fullscreen"
                  onError={() => setIframeError(true)}
                  onLoad={(e) => {
                    try {
                      const doc = (e.target as HTMLIFrameElement).contentDocument;
                      if (doc && doc.title.includes('Cannot GET')) setIframeError(true);
                    } catch {}
                  }}
                />
              )}
              <div className="absolute bottom-2 right-2 text-[10px] font-mono bg-zinc-900/90 border border-zinc-800 px-2 py-1 rounded-full text-zinc-400 pointer-events-none">ESC to exit fullscreen</div>
            </div>
          </div>
        )}
      </div>

      <footer className="h-6 shrink-0 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between px-3 text-[10px] text-zinc-600 font-mono">
        <span>WebXOs Luncher · OS 1 = BackendOS (port 5174) · {envMode} · {mode}</span>
        <span className="hidden sm:inline">Embed uses iframe · {health.backendos === 'online' ? '●' : '○'} BackendOS</span>
      </footer>
    </div>
  );
}
