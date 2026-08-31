import { useEffect, useState } from 'react';
import { Cpu, HardDrive, Activity, MemoryStick } from 'lucide-react';

interface SystemMonitorAppProps {
  windowId: string;
}

export default function SystemMonitorApp({ windowId }: SystemMonitorAppProps) {
  const [stats, setStats] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: 0,
    processes: 0,
  });

  useEffect(() => {
    function updateStats() {
      setStats({
        cpu: Math.random() * 30 + 5,
        memory: Math.random() * 40 + 20,
        disk: Math.random() * 20 + 10,
        uptime: Date.now() / 1000,
        processes: Math.floor(Math.random() * 20) + 15,
      });
    }
    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  function formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600) % 24;
    const m = Math.floor(seconds / 60) % 60;
    return `${h}h ${m}m`;
  }

  const metrics = [
    { label: 'CPU Usage', value: stats.cpu, icon: Cpu, color: '#89b4fa' },
    { label: 'Memory', value: stats.memory, icon: MemoryStick, color: '#a6e3a1' },
    { label: 'Disk I/O', value: stats.disk, icon: HardDrive, color: '#f9e2af' },
  ];

  return (
    <div className="w-full h-full bg-os-surface/50 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-os-text mb-4">System Monitor</h3>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-os-surface2/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
                <span className="text-xs text-os-text">{metric.label}</span>
              </div>
              <span className="text-xs font-mono text-os-muted">{metric.value.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-os-bg rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
              />
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-os-surface2/50 rounded-lg p-3">
            <Activity className="w-4 h-4 text-os-accent mb-1" />
            <div className="text-lg font-bold text-os-text">{stats.processes}</div>
            <div className="text-[10px] text-os-muted">Processes</div>
          </div>
          <div className="bg-os-surface2/50 rounded-lg p-3">
            <div className="text-lg font-bold text-os-text">{formatUptime(stats.uptime)}</div>
            <div className="text-[10px] text-os-muted">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
