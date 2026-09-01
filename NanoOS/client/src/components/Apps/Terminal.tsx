import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { api } from '../../store/api';
import { handleWpm } from '../../lib/wpm';

export default function TerminalApp({ winId }: { winId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const [path, setPath] = useState('home/user');
  const buf = useRef('');

  useEffect(() => {
    if (!ref.current) return;
    const t = new Terminal({
      theme: {
        background: '#0a0a1a',
        foreground: '#e0e0e0',
        cursor: '#3498db',
        cursorAccent: '#0a0a1a',
        selectionBackground: 'rgba(52,152,219,0.3)',
        black: '#333', red: '#e74c3c', green: '#2ecc71', yellow: '#f1c40f',
        blue: '#3498db', magenta: '#9b59b6', cyan: '#1abc9c', white: '#ecf0f1',
      },
      fontFamily: "'Courier New', monospace",
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 2000,
    });
    const fit = new FitAddon();
    t.loadAddon(fit);
    t.open(ref.current);
    fit.fit();
    termRef.current = t;
    fitRef.current = fit;

    t.writeln('\x1b[1;34mNanoOS\x1b[0m \x1b[90mv0.1.0\x1b[0m');
    t.writeln('');
    prompt(t);

    t.onKey(({ key, domEvent: e }) => {
      if (e.key === 'Enter') {
        const cmd = buf.current.trim();
        t.writeln('');
        if (cmd) run(cmd, t);
        else prompt(t);
        buf.current = '';
      } else if (e.key === 'Backspace') {
        if (buf.current.length > 0) { buf.current = buf.current.slice(0, -1); t.write('\b \b'); }
      } else if (e.ctrlKey && e.key === 'c') {
        t.writeln('^C'); buf.current = ''; prompt(t);
      } else if (e.ctrlKey && e.key === 'l') {
        t.clear(); prompt(t);
      } else if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        buf.current += key; t.write(key);
      }
    });

    const ro = new ResizeObserver(() => fit.fit());
    ro.observe(ref.current);
    return () => { ro.disconnect(); t.dispose(); };
  }, []);

  function prompt(t: Terminal) {
    const p = path.replace('home/user', '~');
    t.write(`\x1b[1;34m$\x1b[0m \x1b[36m${p}\x1b[0m `);
  }

  async function run(cmd: string, t: Terminal) {
    const [c, ...args] = cmd.split(' ');
    switch (c) {
      case 'help':
        t.writeln('  help      Show commands');
        t.writeln('  ls        List files');
        t.writeln('  cd <dir>  Change dir');
        t.writeln('  pwd       Print dir');
        t.writeln('  cat <f>   Read file');
        t.writeln('  echo <t>  Print text');
        t.writeln('  date      Date/time');
        t.writeln('  whoami    User');
        t.writeln('  clear     Clear');
        t.writeln('  uname     System');
        break;
      case 'ls':
        try {
          const f = await api.getFiles(path);
          t.writeln(f.length ? '  ' + f.map((x: any) => x.type === 'directory' ? `\x1b[1;34m${x.name}/\x1b[0m` : x.name).join('  ') : '  (empty)');
        } catch { t.writeln('  error'); }
        prompt(t); break;
      case 'cd': {
        const a = args[0] || 'home/user';
        setPath(a === '..' ? path.split('/').slice(0, -1).join('/') || 'home/user' : a.startsWith('/') ? a.slice(1) : `${path}/${a}`);
        prompt(t); break;
      }
      case 'pwd': t.writeln(`  /${path}`); prompt(t); break;
      case 'cat':
        if (!args[0]) { t.writeln('  usage: cat <file>'); }
        else { try { t.writeln((await api.readFile(`${path}/${args[0]}`)).content); } catch { t.writeln('  no such file'); } }
        prompt(t); break;
      case 'echo': t.writeln(`  ${args.join(' ')}`); prompt(t); break;
      case 'date': t.writeln(`  ${new Date().toString()}`); prompt(t); break;
      case 'whoami': t.writeln('  user@nanoos'); prompt(t); break;
      case 'clear': t.clear(); prompt(t); break;
      case 'uname': t.writeln('  NanoOS 0.1.0 (Web)'); prompt(t); break;
      case 'wpm':
      case 'weblinux':
      case 'wxpm':
        await handleWpm(args, t);
        prompt(t);
        break;

      default: t.writeln(`  ${c}: not found`); prompt(t);
    }
  }

  return <div className="terminal-container" ref={ref} />;
}
