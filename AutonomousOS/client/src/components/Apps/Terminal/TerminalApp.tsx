import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { api } from '../../../store/api';
import { handleWpm } from '../../../lib/wpm';
import { bus } from '../../../store/bus';
import { useAutonomousStore } from '../../../store';

export default function TerminalApp({ windowId: _ }: { windowId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const buf = useRef('');
  const pathRef = useRef('home/user');

  useEffect(() => {
    if (!ref.current) return;
    const term = new Terminal({
      theme: { background: '#0a131c', foreground: '#cde6f5', cursor: '#22d3ee', selectionBackground: 'rgba(34,211,238,0.3)' },
      fontFamily: 'JetBrains Mono, monospace', fontSize: 13, cursorBlink: true, cursorStyle: 'bar',
    });
    const fit = new FitAddon();
    term.loadAddon(fit); term.loadAddon(new WebLinksAddon());
    term.open(ref.current); fit.fit();
    term.writeln('\x1b[38;5;44m AutonomousOS Terminal \x1b[0m  \x1b[90m— agent-aware\x1b[0m');
    term.writeln('\x1b[90m Type help, or use Agent Bar below.\x1b[0m');
    term.writeln('');
    prompt(term);

    term.onKey(({ key, domEvent }) => {
      const ev = domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
      if (ev.key === 'Enter') {
        const cmd = buf.current.trim();
        term.writeln('');
        if (cmd) handle(cmd, term);
        else prompt(term);
        buf.current = '';
      } else if (ev.key === 'Backspace') {
        if (buf.current.length) { buf.current = buf.current.slice(0, -1); term.write('\b \b'); }
      } else if (printable) {
        buf.current += key; term.write(key);
      }
    });

    const off = bus.on('agent:log', (m) => { term.writeln(`\x1b[38;5;44m[agent]\x1b[0m ${m}`); prompt(term); });
    const ro = new ResizeObserver(() => fit.fit());
    ro.observe(ref.current);
    return () => { off(); ro.disconnect(); term.dispose(); };
  }, []);

  function prompt(t: Terminal) { t.write(`\x1b[38;5;44m❯\x1b[0m \x1b[90m${pathRef.current}\x1b[0m `); }

  async function handle(cmd: string, term: Terminal) {
    const [c, ...a] = cmd.split(' ');
    switch (c.toLowerCase()) {
      case 'help':
        term.writeln('  help  agent <prompt>  ls  cat <file>  mkdir <dir>  clear  tile  auto on/off'); break;
      case 'agent': {
        const p = a.join(' ');
        if (!p) term.writeln('  usage: agent <prompt>');
        else { useAutonomousStore.getState().enqueue(p); term.writeln(`  queued: ${p}`); }
        break;
      }
      case 'ls': {
        try {
          const d = await api.getFiles(pathRef.current);
          const list: any[] = Array.isArray(d) ? d : d.files || [];
          term.writeln(list.map((f: any) => f.type === 'directory' ? `\x1b[38;5;44m${f.name}/\x1b[0m` : f.name).join('  ') || '(empty)');
        } catch { term.writeln('  error listing'); } break;
      }
      case 'cat': {
        if (!a[0]) term.writeln('  usage: cat <file>');
        else try { const r = await api.readFile(`${pathRef.current}/${a[0]}`); term.writeln(r.content || JSON.stringify(r)); } catch { term.writeln('  not found'); }
        break;
      }
      case 'mkdir': {
        if (!a[0]) term.writeln('  usage: mkdir <dir>');
        else try { await api.mkdir(`${pathRef.current}/${a[0]}`); term.writeln('  created'); } catch { term.writeln('  failed'); }
        break;
      }
      case 'clear': term.clear(); break;
      case 'tile': { const { useWindowStore } = await import('../../../store'); useWindowStore.getState().tileWindows(); term.writeln('  tiled'); break; }
      case 'auto': {
        const v = a[0]; const { useAutonomousStore } = await import('../../../store');
        if (v === 'on') { useAutonomousStore.getState().setEnabled(true); term.writeln('  agent on'); }
        else if (v === 'off') { useAutonomousStore.getState().setEnabled(false); term.writeln('  agent off'); }
        else term.writeln('  usage: auto on/off');
        break;
      }
      case 'wpm':
      case 'weblinux':
      case 'wxpm':
        await handleWpm(a, term);
        prompt(term);
        break;

      default: term.writeln(`  not found: ${c}`);
    }
    prompt(term);
  }

  return <div className="w-full h-full bg-[#0a131c]"><div ref={ref} className="w-full h-full" /></div>;
}
