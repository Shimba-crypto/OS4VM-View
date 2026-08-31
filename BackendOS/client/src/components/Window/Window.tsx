import { useRef, useState, useCallback, useEffect } from 'react';
import { useWindowStore } from '../../store';
import type { WindowState } from '../../types';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function Window({ window: win, children }: WindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow } = useWindowStore();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      focusWindow(win.id);
      if (win.maximized) return;
      setIsDragging(true);
      dragOffset.current = { x: e.clientX - win.x, y: e.clientY - win.y };
      e.preventDefault();
    },
    [win.id, win.x, win.y, win.maximized, focusWindow]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      focusWindow(win.id);
      setIsResizing(true);
      resizeStart.current = { x: e.clientX, y: e.clientY, w: win.width, h: win.height };
    },
    [win.id, win.width, win.height, focusWindow]
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        moveWindow(win.id, e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
      }
      if (isResizing) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        const newW = Math.max(win.minWidth || 200, resizeStart.current.w + dx);
        const newH = Math.max(win.minHeight || 150, resizeStart.current.h + dy);
        resizeWindow(win.id, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, win.id, moveWindow, resizeWindow, win.minWidth, win.minHeight]);

  const style: React.CSSProperties = win.maximized
    ? { top: 28, left: 0, width: '100vw', height: 'calc(100vh - 28px)' }
    : { top: win.y, left: win.x, width: win.width, height: win.height };

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col rounded-xl overflow-hidden shadow-2xl shadow-black/40 animate-window-open ${
        win.focused ? 'ring-1 ring-white/10' : 'ring-1 ring-white/5 opacity-95'
      }`}
      style={{
        ...style,
        zIndex: win.zIndex,
        background: 'rgba(24, 24, 37, 0.95)',
        backdropFilter: 'blur(20px)',
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        className="flex items-center h-9 px-3 bg-os-surface2/80 border-b border-white/5 shrink-0 select-none"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            className="w-3 h-3 rounded-full bg-os-danger hover:brightness-110 transition-all flex items-center justify-center"
          >
            <span className="text-[8px] text-black/60 opacity-0 group-hover:opacity-100">×</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="w-3 h-3 rounded-full bg-os-warning hover:brightness-110 transition-all flex items-center justify-center"
          >
            <span className="text-[8px] text-black/60 opacity-0 group-hover:opacity-100">−</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
            className="w-3 h-3 rounded-full bg-os-success hover:brightness-110 transition-all flex items-center justify-center"
          >
            <span className="text-[8px] text-black/60 opacity-0 group-hover:opacity-100">+</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex-1 text-center text-xs text-white/50 font-medium">
          {win.title}
        </div>

        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Resize handle */}
      {!win.maximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
}
