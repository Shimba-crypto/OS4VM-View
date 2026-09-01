import { useDesktopStore, useAutonomousStore, useWindowStore } from '../../../store';
export default function SettingsApp({ windowId: _ }: { windowId: string }) {
  const { settings, setWallpaper, setAutoTile, setAgentEnabled } = useDesktopStore();
  const { enabled, autoTile, clear } = useAutonomousStore();
  return (
    <div className="h-full overflow-auto bg-[#0a131c] p-6">
      <h1 className="text-[22px] font-bold">Settings — AutonomousOS</h1>
      <p className="text-[12px] text-au-muted mt-1">Control agent autonomy and appearance</p>

      <div className="mt-6 grid gap-4 max-w-[640px]">
        <div className="rounded-xl bg-au-surface border border-au-border p-4">
          <h3 className="text-[13px] font-semibold">Autonomy</h3>
          <label className="flex items-center justify-between mt-3">
            <span className="text-[12px]">Agent enabled</span>
            <button onClick={() => setAgentEnabled(!settings.agentEnabled)} className={`w-11 h-6 rounded-full p-1 transition-colors ${settings.agentEnabled ? 'bg-au-accent' : 'bg-zinc-700'}`}>
              <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${settings.agentEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </label>
          <label className="flex items-center justify-between mt-3">
            <span className="text-[12px]">Auto-tile windows</span>
            <button onClick={() => setAutoTile(!settings.autoTile)} className={`w-11 h-6 rounded-full p-1 transition-colors ${settings.autoTile ? 'bg-au-accent' : 'bg-zinc-700'}`}>
              <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${settings.autoTile ? 'translate-x-5' : ''}`} />
            </button>
          </label>
          <div className="flex gap-2 mt-4">
            <button onClick={() => useWindowStore.getState().tileWindows()} className="px-3 py-1.5 rounded-full bg-au-accent text-black text-[12px] font-semibold">Tile now</button>
            <button onClick={clear} className="px-3 py-1.5 rounded-full bg-au-surface border border-au-border text-[12px]">Clear queue/history</button>
          </div>
          <div className="text-[11px] text-au-muted mt-3">Agent queue: {enabled ? 'running' : 'paused'} · autoTile: {autoTile ? 'on' : 'off'}</div>
        </div>

        <div className="rounded-xl bg-au-surface border border-au-border p-4">
          <h3 className="text-[13px] font-semibold">Appearance</h3>
          <div className="text-[12px] font-medium mt-3 mb-2">Wallpaper</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'grid', name: 'Grid', bg: 'linear-gradient(180deg,#070f14,#0a1620)' },
              { id: 'aurora', name: 'Aurora', bg: 'linear-gradient(135deg,#0a1620,#1a2a40)' },
              { id: 'void', name: 'Void', bg: '#070f14' },
            ].map((w) => (
              <button key={w.id} onClick={() => setWallpaper(w.id)} className={`rounded-xl overflow-hidden border-2 ${settings.wallpaper === w.id ? 'border-au-accent' : 'border-au-border'}`}>
                <div className="h-16" style={{ background: w.bg }} />
                <div className="text-[11px] py-1.5 bg-au-bg text-center">{w.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-au-surface border border-au-border p-4">
          <h3 className="text-[13px] font-semibold">About</h3>
          <div className="text-[12px] text-au-muted mt-2 space-y-1">
            <div className="flex justify-between"><span>OS</span><span className="text-au-text font-medium">AutonomousOS 0.1.0</span></div>
            <div className="flex justify-between"><span>Engine</span><span className="text-au-text">Zustand + bus + scheduler</span></div>
            <div className="flex justify-between"><span>Mode</span><span className="text-au-text">Local-first agent (no LLM)</span></div>
          </div>
          <div className="mt-3 text-[11px] bg-au-bg border border-au-border rounded-lg p-3 text-au-muted">Ask Agent via bar or terminal <code className="bg-au-surface px-1 py-0.5 rounded">agent open terminal and tile</code>. Add LLM later via <code className="bg-au-surface px-1 py-0.5 rounded">/api/agent</code>.</div>
        </div>
      </div>
    </div>
  );
}
