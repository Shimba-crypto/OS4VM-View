import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useWindowStore } from '../../store';
import type { WindowState } from '../../types';

interface Props { window: WindowState; children: React.ReactNode; }

export default function Window({ window: win, children }: Props) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow } = useWindowStore();
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, origW: 0, origH: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    e.preventDefault();
    focusWindow(win.id);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: win.x, origY: win.y };
    setDragging(true);
  }, [win.id, win.x, win.y, focusWindow]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      moveWindow(win.id, dragRef.current.origX + dx, dragRef.current.origY + dy);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, win.id, moveWindow]);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, origW: win.width, origH: win.height };
    setResizing(true);
  }, [win.width, win.height]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      const w = Math.max(win.minWidth || 200, resizeRef.current.origW + dx);
      const h = Math.max(win.minHeight || 150, resizeRef.current.origH + dy);
      resizeWindow(win.id, w, h);
    };
    const onUp = () => setResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [resizing, win.id, resizeWindow, win.minWidth, win.minHeight]);

  if (win.minimized) return null;

  const style: React.CSSProperties = win.maximized
    ? { position: 'fixed', top: 32, left: 0, right: 0, bottom: 48, zIndex: win.zIndex, width: '100%', height: 'calc(100% - 80px)' }
    : { position: 'absolute', left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div
      style={style}
      className={`flex flex-col rounded-xl overflow-hidden shadow-2xl border transition-shadow duration-150
        ${win.focused ? 'border-wx-accent/30 shadow-black/40' : 'border-wx-border shadow-black/20'}
        ${win.maximized ? '' : 'animate-scale-in'}`}
      onMouseDown={() => focusWindow(win.id)}
    >
      <div
        onMouseDown={onMouseDown}
        className={`h-8 shrink-0 flex items-center justify-between px-2 cursor-default select-none
          ${win.focused ? 'bg-wx-surface2' : 'bg-wx-surface/80'}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 ml-1">
          <span className="text-xs">{win.icon}</span>
          <span className={`text-[11px] truncate ${win.focused ? 'text-wx-text' : 'text-wx-muted'}`}>{win.title}</span>
        </div>
        <div className="no-drag flex items-center gap-0.5">
          <button onClick={() => minimizeWindow(win.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-wx-muted"><Minus className="w-3 h-3" /></button>
          <button onClick={() => maximizeWindow(win.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-wx-muted">
            {win.maximized ? <Square className="w-2.5 h-2.5" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button onClick={() => closeWindow(win.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/80 text-wx-muted hover:text-white"><X className="w-3 h-3" /></button>
        </div>
      </div>
      <div className="flex-1 bg-wx-surface overflow-hidden">{children}</div>
      {!win.maximized && (
        <div onMouseDown={onResizeStart} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize no-drag" />
      )}
    </div>
  );
}
