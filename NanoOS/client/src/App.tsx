import { useState, useEffect } from 'react';
import { useStore, APPS } from './store';
import TerminalApp from './components/Apps/Terminal';
import FileViewer from './components/Apps/FileViewer';

const APP_COMP: Record<string, React.FC<{ winId: string }>> = {
  terminal: TerminalApp,
  files: FileViewer,
};

export default function App() {
  const { windows, open, focus, minimize, restore } = useStore();
  const [time, setTime] = useState(new Date());
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = () => setMenu(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, []);

  return (
    <>
      {/* Panel */}
      <div className="panel">
        <button className="panel-btn" onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}>
          [ apps ]
        </button>
        <div className="panel-center">
          {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="panel-right">
          {windows.map((w) => (
            <button
              key={w.id}
              className="panel-btn"
              style={{ color: w.focused && !w.minimized ? '#fff' : '#666' }}
              onClick={() => w.minimized ? restore(w.id) : w.focused ? minimize(w.id) : focus(w.id)}
            >
              {w.title}
            </button>
          ))}
        </div>

        {/* Menu dropdown */}
        {menu && (
          <div className="menu-dropdown" onClick={(e) => e.stopPropagation()}>
            {APPS.map((app) => (
              <button key={app.id} className="menu-item" onClick={() => { open(app.id); setMenu(false); }}>
                {app.icon} {app.name}
              </button>
            ))}
            <div className="menu-sep" />
            <button className="menu-item" onClick={() => setMenu(false)}>NanoOS v0.1.0</button>
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="desktop">
        {/* Desktop icons */}
        <div className="icon-grid">
          {APPS.map((app) => (
            <div key={app.id} className="desktop-icon" onDoubleClick={() => open(app.id)}>
              <span style={{ fontSize: 20 }}>{app.icon}</span>
              <span className="desktop-icon-label">{app.name}</span>
            </div>
          ))}
        </div>

        {/* Windows */}
        {windows.map((w) => {
          const Comp = APP_COMP[w.appId];
          return w.minimized ? null : (
            <Window key={w.id} win={w}>
              {Comp ? <Comp winId={w.id} /> : <div style={{ padding: 8, color: '#666' }}>?</div>}
            </Window>
          );
        })}
      </div>
    </>
  );
}

function Window({ win, children }: { win: any; children: React.ReactNode }) {
  const { close, minimize, maximize, focus, move, resize } = useStore();
  const [drag, setDrag] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [rs, setRs] = useState({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    if (!drag && !resizing) return;
    const onMove = (e: MouseEvent) => {
      if (drag) move(win.id, e.clientX - off.x, e.clientY - off.y);
      if (resizing) {
        resize(
          win.id,
          Math.max(win.minW || 200, rs.w + e.clientX - rs.x),
          Math.max(win.minH || 120, rs.h + e.clientY - rs.y)
        );
      }
    };
    const onUp = () => { setDrag(false); setResizing(false); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [drag, resizing, off, rs, win.id, win.minW, win.minH, move, resize]);

  const style: React.CSSProperties = win.maximized
    ? { top: 26, left: 0, width: '100vw', height: 'calc(100vh - 26px)' }
    : { top: win.y, left: win.x, width: win.w, height: win.h };

  return (
    <div
      className={`window ${win.focused ? 'focused' : ''}`}
      style={{ ...style, zIndex: win.z }}
      onMouseDown={() => focus(win.id)}
    >
      <div
        className={`window-titlebar ${win.focused ? 'focused' : ''}`}
        onMouseDown={(e) => {
          if (win.maximized) return;
          focus(win.id);
          setDrag(true);
          setOff({ x: e.clientX - win.x, y: e.clientY - win.y });
        }}
        onDoubleClick={() => maximize(win.id)}
      >
        <div className="window-btns">
          <button className="window-btn close" onClick={() => close(win.id)}>x</button>
          <button className="window-btn minimize" onClick={() => minimize(win.id)}>-</button>
          <button className="window-btn maximize" onClick={() => maximize(win.id)}>+</button>
        </div>
        <span className={`window-title ${win.focused ? 'focused' : ''}`}>{win.title}</span>
      </div>
      <div className="window-content">{children}</div>
      {!win.maximized && (
        <div
          className="resize-handle"
          onMouseDown={(e) => {
            e.stopPropagation();
            focus(win.id);
            setResizing(true);
            setRs({ x: e.clientX, y: e.clientY, w: win.w, h: win.h });
          }}
        />
      )}
    </div>
  );
}
