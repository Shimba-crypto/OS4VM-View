import { useRef, useState, useCallback, useEffect } from 'react';
import { useWindowStore } from '../../store';
import type { WindowState } from '../../types';
import { Minus, Square, Copy, X } from 'lucide-react';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function Window({ window: win, children }: WindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow } = useWindowStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, winX: 0, winY: 0 });
  const winRef = useRef<HTMLDivElement>(null);

  const handleTitleMouseDown = useCallback(
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
    (e: React.MouseEvent, dir: string) => {
      e.preventDefault();
      e.stopPropagation();
      focusWindow(win.id);
      setIsResizing(dir);
      resizeStart.current = { x: e.clientX, y: e.clientY, w: win.width, h: win.height, winX: win.x, winY: win.y };
    },
    [win.id, win.width, win.height, win.x, win.y, focusWindow]
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const onMove = (e: MouseEvent) => {
      if (isDragging) {
        moveWindow(win.id, e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
      }
      if (isResizing) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        let newW = resizeStart.current.w;
        let newH = resizeStart.current.h;
        let newX = resizeStart.current.winX;
        let newY = resizeStart.current.winY;
        const minW = win.minWidth || 200;
        const minH = win.minHeight || 150;

        if (isResizing.includes('e')) newW = Math.max(minW, resizeStart.current.w + dx);
        if (isResizing.includes('s')) newH = Math.max(minH, resizeStart.current.h + dy);
        if (isResizing.includes('w')) {
          const proposed = resizeStart.current.w - dx;
          if (proposed >= minW) {
            newW = proposed;
            newX = resizeStart.current.winX + dx;
          }
        }
        if (isResizing.includes('n')) {
          const proposed = resizeStart.current.h - dy;
          if (proposed >= minH) {
            newH = proposed;
            newY = resizeStart.current.winY + dy;
          }
        }

        if (isResizing === 'e' || isResizing === 's' || isResizing === 'se') {
          resizeWindow(win.id, newW, newH);
        } else {
          // For simplicity, apply size; x/y for w/n dirs
          resizeWindow(win.id, newW, newH);
          if (newX !== resizeStart.current.winX || newY !== resizeStart.current.winY) {
            moveWindow(win.id, newX, newY);
          }
        }
      }
    };
    const onUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, isResizing, win.id, win.minWidth, win.minHeight, moveWindow, resizeWindow]);

  const style: React.CSSProperties = win.maximized
    ? { top: 0, left: 0, width: '100vw', height: 'calc(100vh - 48px)', borderRadius: 0 }
    : { top: win.y, left: win.x, width: win.width, height: win.height, borderRadius: 8 };

  return (
    <div
      ref={winRef}
      className={`absolute flex flex-col overflow-hidden animate-window-open border ${win.focused ? 'win-shadow border-[#e5e5e5]' : 'win-shadow-inactive border-[#e5e5e5]/80'}`}
      style={{
        ...style,
        zIndex: win.zIndex,
        background: '#ffffff',
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar - Windows 11 style */}
      <div
        className={`flex items-center h-8 shrink-0 select-none ${win.focused ? 'bg-white' : 'bg-[#f3f3f3]'}`}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
      >
        <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
          <span className="text-[14px] leading-none">{win.icon}</span>
          <span className="text-[12px] text-[#000000] truncate">{win.title}</span>
        </div>

        <div className="flex items-stretch h-full">
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="w-[46px] flex items-center justify-center hover:bg-black/5 transition-colors"
            aria-label="Minimize"
          >
            <Minus className="w-4 h-4 text-[#000]" strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
            className="w-[46px] flex items-center justify-center hover:bg-black/5 transition-colors"
            aria-label="Maximize"
          >
            {win.maximized ? <Copy className="w-3.5 h-3.5 text-[#000]" strokeWidth={1.5} /> : <Square className="w-3.5 h-3.5 text-[#000]" strokeWidth={1.5} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            className="w-[46px] flex items-center justify-center hover:bg-[#e81123] hover:text-white group transition-colors"
            style={{ borderTopRightRadius: win.maximized ? 0 : 8 }}
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#000] group-hover:text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white">
        {children}
      </div>

      {/* Resize handles */}
      {!win.maximized && (
        <>
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={(e) => handleResizeStart(e, 'se')} />
          <div className="absolute top-0 right-0 w-1 h-full cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, 'e')} />
          <div className="absolute bottom-0 left-0 right-4 h-1 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, 's')} />
          <div className="absolute top-8 left-0 w-1 h-full cursor-w-resize" onMouseDown={(e) => handleResizeStart(e, 'w')} />
        </>
      )}
    </div>
  );
}
