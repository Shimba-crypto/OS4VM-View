import { useState, useEffect } from 'react';
import { Cpu, HardDrive, MemoryStick, Activity, Globe } from 'lucide-react';

export default function SystemInfoApp({ windowId }: { windowId: string }) {
  const [uptime, setUptime] = useState(0);
  const [mem, setMem] = useState({ used: 0, total: 0 });

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
      if ((performance as any).memory) {
        setMem({ used: (performance as any).memory.usedJSHeapSize, total: (performance as any).memory.jsHeapSizeLimit });
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;
  const fmtBytes = (b: number) => b ? `${(b / 1048576).toFixed(1)} MB` : 'N/A';

  const stats = [
    { icon: <Cpu className="w-4 h-4" />, label: 'CPU', value: `${navigator.hardwareConcurrency || 'N/A'} cores`, color: 'text-wx-accent' },
    { icon: <MemoryStick className="w-4 h-4" />, label: 'Memory', value: fmtBytes(mem.used) + (mem.total ? ` / ${fmtBytes(mem.total)}` : ''), color: 'text-wx-accent2' },
    { icon: <HardDrive className="w-4 h-4" />, label: 'Storage', value: 'SandBox-DB (per-app SQLite)', color: 'text-wx-green' },
    { icon: <Activity className="w-4 h-4" />, label: 'Uptime', value: fmt(uptime), color: 'text-wx-yellow' },
    { icon: <Globe className="w-4 h-4" />, label: 'Platform', value: 'WebXOS 0.1.0 · VM-View', color: 'text-wx-accent' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-wx-surface p-4">
      <h2 className="text-[14px] font-semibold text-wx-text mb-4">System Information</h2>
      <div className="space-y-2 flex-1">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg bg-wx-surface2 border border-wx-border">
            <div className={`${s.color}`}>{s.icon}</div>
            <div className="flex-1">
              <div className="text-[11px] text-wx-muted">{s.label}</div>
              <div className="text-[13px] text-wx-text font-mono">{s.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-3 rounded-lg bg-wx-surface2 border border-wx-border">
        <div className="text-[11px] text-wx-muted mb-1">Environment</div>
        <pre className="text-[11px] text-wx-text font-mono whitespace-pre-wrap">
{`renderer: WebXOS (ChromeOS-style)
window: ${window.innerWidth}×${window.innerHeight}
dpr: ${window.devicePixelRatio}
url: ${window.location.href}`}
        </pre>
      </div>
    </div>
  );
}
