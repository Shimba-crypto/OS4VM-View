import { useRef, useState, useCallback, useEffect } from 'react';
import { useWindowStore } from '../../store';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import type { WindowState } from '../../types';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function Window({ window: win, children }: WindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow } = useWindowStore();
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
        resizeWindow(
          win.id,
          Math.max(win.minWidth || 200, resizeStart.current.w + dx),
          Math.max(win.minHeight || 150, resizeStart.current.h + dy)
        );
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
    ? { top: 32, left: 0, width: '100vw', height: 'calc(100vh - 68px)' }
    : { top: win.y, left: win.x, width: win.width, height: win.height };

  return (
    <div
      className={`absolute flex flex-col shadow-lg ${
        win.focused ? 'border border-xfce-windowBorder' : 'border border-gray-400 opacity-95'
      }`}
      style={{ ...style, zIndex: win.zIndex, background: '#f0f0f0' }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div
        className={`flex items-center h-7 px-1 shrink-0 select-none ${
          win.focused ? 'bg-xfce-windowTitle' : 'bg-gray-400'
        }`}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
      >
        {/* Window controls (left side, XFCE style) */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            className="w-5 h-5 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="w-5 h-5 flex items-center justify-center rounded bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
            className="w-5 h-5 flex items-center justify-center rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
          >
            {win.maximized ? <Square className="w-2.5 h-2.5" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>

        {/* Title */}
        <div className="flex-1 text-center text-[11px] text-white font-medium truncate">
          {win.title}
        </div>

        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white">
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
