import { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, Settings, Power, User } from 'lucide-react';
import { useWindowStore } from '../../store';

export default function Taskbar() {
  const [time, setTime] = useState(new Date());
  const [showQuick, setShowQuick] = useState(false);
  const { openApp } = useWindowStore();

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <div className="h-8 shrink-0 bg-wx-shelf border-b border-wx-border flex items-center justify-between px-3 z-40 relative">
        <div className="flex items-center gap-4 text-[11px] text-wx-text">
          <span className="font-medium">WebXOS</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-[11px] text-wx-muted" onClick={() => setShowQuick(!showQuick)}>
            <Wifi className="w-3 h-3" />
            <Volume2 className="w-3 h-3" />
            <Battery className="w-3 h-3" />
            <span className="ml-1">{formatted}</span>
          </button>
        </div>
      </div>
      {showQuick && (
        <div className="absolute top-8 right-2 z-50 w-64 bg-wx-shelf border border-wx-border rounded-xl p-3 shadow-2xl animate-slide-up">
          <div className="text-[13px] font-medium text-wx-text mb-2">{dateStr} {formatted}</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-wx-accent/20 text-wx-accent text-[10px]"><Wifi className="w-4 h-4" />Wi-Fi</button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 text-wx-muted text-[10px]"><Volume2 className="w-4 h-4" />Sound</button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 text-wx-muted text-[10px]"><Battery className="w-4 h-4" />Battery</button>
          </div>
          <div className="border-t border-wx-border pt-2 flex gap-2">
            <button onClick={() => { openApp('settings'); setShowQuick(false); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-wx-muted"><Settings className="w-3 h-3" /> Settings</button>
            <button className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-wx-muted"><Power className="w-3 h-3" /></button>
          </div>
        </div>
      )}
    </>
  );
}
