import { useRef, useState, useCallback, useEffect } from 'react';
import { useWindowStore } from '../../store';
import type { WindowState } from '../../types';
import { Minus, Square, Copy, X } from 'lucide-react';

export default function Window({ window: win, children }: { window: WindowState; children: React.ReactNode }) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow } = useWindowStore();
  const [drag, setDrag] = useState(false);
  const [resizing, setResizing] = useState<string | null>(null);
  const off = useRef({ x: 0, y: 0 });
  const rs = useRef({ x: 0, y: 0, w: 0, h: 0, ox: 0, oy: 0 });

  const onDown = useCallback((e: React.MouseEvent) => {
    focusWindow(win.id);
    if (win.maximized) return;
    setDrag(true);
    off.current = { x: e.clientX - win.x, y: e.clientY - win.y };
    e.preventDefault();
  }, [win.id, win.x, win.y, win.maximized, focusWindow]);

  const onResize = useCallback((e: React.MouseEvent, dir: string) => {
    e.preventDefault(); e.stopPropagation();
    focusWindow(win.id);
    setResizing(dir);
    rs.current = { x: e.clientX, y: e.clientY, w: win.width, h: win.height, ox: win.x, oy: win.y };
  }, [win.id, win.width, win.height, win.x, win.y, focusWindow]);

  useEffect(() => {
    if (!drag && !resizing) return;
    const mm = (e: MouseEvent) => {
      if (drag) moveWindow(win.id, e.clientX - off.current.x, e.clientY - off.current.y);
      if (resizing) {
        const dx = e.clientX - rs.current.x;
        const dy = e.clientY - rs.current.y;
        let nw = rs.current.w, nh = rs.current.h, nx = rs.current.ox, ny = rs.current.oy;
        const minW = win.minWidth || 240, minH = win.minHeight || 180;
        if (resizing.includes('e')) nw = Math.max(minW, rs.current.w + dx);
        if (resizing.includes('s')) nh = Math.max(minH, rs.current.h + dy);
        if (resizing.includes('w')) {
          const cand = rs.current.w - dx;
          if (cand >= minW) { nw = cand; nx = rs.current.ox + dx; }
        }
        if (resizing.includes('n')) {
          const cand = rs.current.h - dy;
          if (cand >= minH) { nh = cand; ny = rs.current.oy + dy; }
        }
        resizeWindow(win.id, nw, nh);
        if (nx !== rs.current.ox || ny !== rs.current.oy) moveWindow(win.id, nx, ny);
      }
    };
    const mu = () => { setDrag(false); setResizing(null); };
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
  }, [drag, resizing, win.id, win.minWidth, win.minHeight, moveWindow, resizeWindow]);

  const style: React.CSSProperties = win.maximized
    ? { top: 32, left: 0, width: '100vw', height: 'calc(100vh - 80px)', borderRadius: 0 }
    : { top: win.y, left: win.x, width: win.width, height: win.height, borderRadius: 10 };

  return (
    <div
      className={`absolute flex flex-col overflow-hidden animate-window-open border ${win.focused ? 'au-glow border-au-border' : 'border-au-border/60 shadow-lg'}`}
      style={{ ...style, zIndex: win.zIndex, background: '#0f1e2a' }}
      onMouseDown={() => focusWindow(win.id)}
    >
      <div className={`flex items-center h-8 shrink-0 select-none border-b ${win.focused ? 'bg-au-surface border-au-border' : 'bg-au-bg/80 border-au-border/40'}`} onMouseDown={onDown} onDoubleClick={() => maximizeWindow(win.id)}>
        <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${win.agentPinned ? 'bg-au-accent shadow-[0_0_6px_rgba(34,211,238,0.8)]' : 'bg-transparent'}`} />
          <span className="text-[13px]">{win.icon}</span>
          <span className="text-[12px] text-au-text truncate">{win.title}</span>
          {win.agentPinned && <span className="text-[9px] font-bold tracking-widest bg-au-accentMuted text-au-accent border border-au-accent/20 px-1.5 py-0.5 rounded-full">AUTO</span>}
        </div>
        <div className="flex h-full">
          <button onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} className="w-[42px] flex items-center justify-center hover:bg-white/5"><Minus className="w-3.5 h-3.5 text-au-muted" /></button>
          <button onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }} className="w-[42px] flex items-center justify-center hover:bg-white/5">{win.maximized ? <Copy className="w-3.5 h-3.5 text-au-muted" /> : <Square className="w-3.5 h-3.5 text-au-muted" />}</button>
          <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="w-[42px] flex items-center justify-center hover:bg-red-500 hover:text-white group"><X className="w-3.5 h-3.5 text-au-muted group-hover:text-white" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-[#0a131c]">{children}</div>
      {!win.maximized && (
        <>
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={(e) => onResize(e, 'se')} />
          <div className="absolute top-0 right-0 w-1 h-full cursor-e-resize" onMouseDown={(e) => onResize(e, 'e')} />
          <div className="absolute bottom-0 left-0 right-4 h-1 cursor-s-resize" onMouseDown={(e) => onResize(e, 's')} />
        </>
      )}
    </div>
  );
}
