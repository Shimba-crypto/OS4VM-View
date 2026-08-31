import { Monitor, Cpu, HardDrive, Clock, User, Globe } from 'lucide-react';

interface SystemInfoAppProps {
  windowId: string;
}

export default function SystemInfoApp({ windowId }: SystemInfoAppProps) {
  const info = [
    { label: 'OS Name', value: 'SimpleOS 0.1.0', icon: Monitor },
    { label: 'Kernel', value: 'Web Runtime', icon: Cpu },
    { label: 'Desktop', value: 'XFCE-style', icon: Monitor },
    { label: 'Host', value: 'VM-View Hypervisor', icon: Globe },
    { label: 'User', value: 'user@simpleos', icon: User },
    { label: 'Uptime', value: formatUptime(), icon: Clock },
    { label: 'Memory', value: 'Browser-managed', icon: HardDrive },
    { label: 'Storage', value: 'Server-side FS', icon: HardDrive },
  ];

  function formatUptime(): string {
    const h = Math.floor(Math.random() * 12);
    const m = Math.floor(Math.random() * 60);
    return `${h}h ${m}m`;
  }

  return (
    <div className="w-full h-full bg-white p-4 overflow-y-auto text-xs">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
          S
        </div>
        <div>
          <div className="text-sm font-bold text-gray-800">SimpleOS</div>
          <div className="text-gray-500">Version 0.1.0 — Lightweight Linux-style WebOS</div>
        </div>
      </div>

      <div className="space-y-2">
        {info.map((item) => (
          <div key={item.label} className="flex items-center gap-3 py-1.5 px-2 hover:bg-gray-50 rounded">
            <item.icon className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 w-24 shrink-0">{item.label}</span>
            <span className="text-gray-800 font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
