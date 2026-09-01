import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { api } from '../../../store/api';

interface TerminalAppProps {
  windowId: string;
}

export default function TerminalApp({ windowId }: TerminalAppProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentPath, setCurrentPath] = useState('home/user');
  const inputBuffer = useRef('');

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#1a1a2e',
        foreground: '#e0e0e0',
        cursor: '#3b82f6',
        cursorAccent: '#1a1a2e',
        selectionBackground: 'rgba(59, 130, 246, 0.3)',
        black: '#333',
        red: '#e74c3c',
        green: '#2ecc71',
        yellow: '#f1c40f',
        blue: '#3b82f6',
        magenta: '#9b59b6',
        cyan: '#1abc9c',
        white: '#ecf0f1',
      },
      fontFamily: "'Noto Sans Mono', 'Courier New', monospace",
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 3000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;34m  SimpleOS Terminal\x1b[0m');
    term.writeln('\x1b[90m  ────────────────────────\x1b[0m');
    term.writeln('');
    writePrompt(term);

    term.onKey(({ key, domEvent }) => {
      const ev = domEvent;
      if (ev.key === 'Enter') {
        const cmd = inputBuffer.current.trim();
        term.writeln('');
        if (cmd) handleCommand(cmd, term);
        else writePrompt(term);
        inputBuffer.current = '';
      } else if (ev.key === 'Backspace') {
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (ev.ctrlKey && ev.key === 'c') {
        term.writeln('^C');
        inputBuffer.current = '';
        writePrompt(term);
      } else if (ev.ctrlKey && ev.key === 'l') {
        term.clear();
        writePrompt(term);
      } else if (!ev.altKey && !ev.ctrlKey && !ev.metaKey) {
        inputBuffer.current += key;
        term.write(key);
      }
    });

    const ro = new ResizeObserver(() => fitAddon.fit());
    ro.observe(terminalRef.current);

    return () => { ro.disconnect(); term.dispose(); };
  }, []);

  function writePrompt(term: Terminal) {
    const p = currentPath.replace('home/user', '~');
    term.write(`\x1b[1;34msimple\x1b[0m:\x1b[1;36m${p}\x1b[0m$ `);
  }

  async function handleCommand(cmd: string, term: Terminal) {
    const parts = cmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        term.writeln('\x1b[1;34mAvailable commands:\x1b[0m');
        term.writeln('  \x1b[33mls\x1b[0m         List files');
        term.writeln('  \x1b[33mcd <dir>\x1b[0m   Change directory');
        term.writeln('  \x1b[33mpwd\x1b[0m        Print directory');
        term.writeln('  \x1b[33mcat <file>\x1b[0m  Read file');
        term.writeln('  \x1b[33mmkdir <dir>\x1b[0m Create directory');
        term.writeln('  \x1b[33mtouch <f>\x1b[0m  Create file');
        term.writeln('  \x1b[33mecho <text>\x1b[0m Print text');
        term.writeln('  \x1b[33mdate\x1b[0m       Show date');
        term.writeln('  \x1b[33mwhoami\x1b[0m     Show user');
        term.writeln('  \x1b[33mclear\x1b[0m      Clear screen');
        term.writeln('  \x1b[33muname\x1b[0m      System info');
        break;
      case 'ls':
        try {
          const files = await api.getFiles(currentPath);
          if (files.length === 0) term.writeln('  (empty)');
          else term.writeln('  ' + files.map((f: any) => f.type === 'directory' ? `\x1b[1;34m${f.name}/\x1b[0m` : f.name).join('  '));
        } catch { term.writeln('  Error listing files'); }
        writePrompt(term);
        break;
      case 'cd': {
        const t = args[0] || 'home/user';
        setCurrentPath(t === '..' ? currentPath.split('/').slice(0, -1).join('/') || 'home/user' : t === '~' || t === '' ? 'home/user' : t.startsWith('/') ? t.slice(1) : `${currentPath}/${t}`);
        writePrompt(term);
        break;
      }
      case 'pwd': term.writeln(`  /${currentPath}`); writePrompt(term); break;
      case 'cat':
        if (!args[0]) { term.writeln('  Usage: cat <file>'); }
        else { try { const r = await api.readFile(`${currentPath}/${args[0]}`); term.writeln(r.content); } catch { term.writeln(`  cat: ${args[0]}: No such file`); } }
        writePrompt(term);
        break;
      case 'mkdir':
        if (!args[0]) { term.writeln('  Usage: mkdir <dir>'); }
        else { try { await api.mkdir(`${currentPath}/${args[0]}`); term.writeln(`  Created: ${args[0]}`); } catch { term.writeln('  Error'); } }
        writePrompt(term);
        break;
      case 'touch':
        if (!args[0]) { term.writeln('  Usage: touch <file>'); }
        else { try { await api.writeFile(`${currentPath}/${args[0]}`, ''); term.writeln(`  Created: ${args[0]}`); } catch { term.writeln('  Error'); } }
        writePrompt(term);
        break;
      case 'echo': term.writeln(`  ${args.join(' ')}`); writePrompt(term); break;
      case 'date': term.writeln(`  ${new Date().toString()}`); writePrompt(term); break;
      case 'whoami': term.writeln('  user@simpleos'); writePrompt(term); break;
      case 'clear': term.clear(); writePrompt(term); break;
      case 'uname': term.writeln('  SimpleOS 0.1.0 (Web)'); writePrompt(term); break;
      default: term.writeln(`  ${command}: command not found`); writePrompt(term);
    }
  }

  return (
    <div className="w-full h-full" style={{ background: '#1a1a2e' }}>
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
}
