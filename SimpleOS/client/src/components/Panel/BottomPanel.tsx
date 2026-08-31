import { useWindowStore } from '../../store';

export default function BottomPanel() {
  const { windows, focusWindow, restoreWindow, minimizeWindow } = useWindowStore();

  return (
    <div className="h-9 bg-xfce-panel flex items-center px-1 gap-0.5 border-t border-black/20 z-[9999] shrink-0">
      {/* Running window buttons */}
      {windows.map((win) => (
        <button
          key={win.id}
          onClick={() => {
            if (win.minimized) {
              restoreWindow(win.id);
            } else if (win.focused) {
              minimizeWindow(win.id);
            } else {
              focusWindow(win.id);
            }
          }}
          className={`h-7 px-3 text-[11px] rounded border flex items-center gap-1 transition-colors ${
            win.focused && !win.minimized
              ? 'bg-xfce-active text-white border-xfce-active'
              : 'bg-xfce-button text-xfce-text border-xfce-border hover:bg-xfce-buttonHover'
          }`}
        >
          <span>{win.icon}</span>
          <span className="truncate max-w-[100px]">{win.title}</span>
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Show Desktop button */}
      <button
        onClick={() => {
          const allMinimized = windows.every((w) => w.minimized);
          windows.forEach((w) => {
            if (allMinimized) {
              restoreWindow(w.id);
            } else {
              minimizeWindow(w.id);
            }
          });
        }}
        className="h-7 px-2 text-[10px] text-xfce-textLight border border-xfce-border rounded bg-xfce-button hover:bg-xfce-buttonHover"
      >
        Show Desktop
      </button>
    </div>
  );
}
