import { Cpu, HardDrive, Wifi, Battery, Search } from 'lucide-react';
import { useWindowStore } from '../../store';

interface TaskbarProps {
  currentTime: Date;
}

export default function Taskbar({ currentTime }: TaskbarProps) {
  const { windows, focusWindow } = useWindowStore();

  const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const focusedApp = windows.find((w) => w.focused && !w.minimized);

  return (
    <div className="absolute top-0 left-0 right-0 h-7 bg-os-taskbar backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-[9999] text-xs text-white/80 select-none">
      {/* Left: Apple logo + App name */}
      <div className="flex items-center gap-4">
        <button className="text-sm font-bold hover:text-white transition-colors">
          
        </button>
        <span className="font-semibold text-white/90">
          {focusedApp ? focusedApp.title : 'BackendOS'}
        </span>
        <div className="flex items-center gap-3 text-white/60">
          <span className="hover:text-white/90 cursor-pointer transition-colors">File</span>
          <span className="hover:text-white/90 cursor-pointer transition-colors">Edit</span>
          <span className="hover:text-white/90 cursor-pointer transition-colors">View</span>
          <span className="hover:text-white/90 cursor-pointer transition-colors">Go</span>
          <span className="hover:text-white/90 cursor-pointer transition-colors">Window</span>
          <span className="hover:text-white/90 cursor-pointer transition-colors">Help</span>
        </div>
      </div>

      {/* Right: Status icons + Clock */}
      <div className="flex items-center gap-3">
        <Wifi className="w-3.5 h-3.5" />
        <Battery className="w-3.5 h-3.5" />
        <Cpu className="w-3.5 h-3.5" />
        <HardDrive className="w-3.5 h-3.5" />
        <Search className="w-3.5 h-3.5" />
        <div className="font-medium text-white/90">
          <span>{dateStr}</span>
          <span className="ml-2">{timeStr}</span>
        </div>
      </div>
    </div>
  );
}
