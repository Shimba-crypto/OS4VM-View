import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { api } from '../../../store/api';
import { handleWpm } from '../../../lib/wpm';

export default function TerminalApp({ windowId: _ }: { windowId: string }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const [currentPath, setCurrentPath] = useState('home/user');
  const inputBuffer = useRef('');
  const pathRef = useRef(currentPath);
  pathRef.current = currentPath;

  useEffect(() => {
    if (!terminalRef.current) return;
    const term = new Terminal({
      theme: {
        background: '#0c0c0c',
        foreground: '#cccccc',
        cursor: '#ffffff',
        selectionBackground: 'rgba(0,120,212,0.4)',
        black: '#0c0c0c', red: '#e74856', green: '#16c60c', yellow: '#f9f1a5',
        blue: '#0037da', magenta: '#881798', cyan: '#3a96dd', white: '#cccccc',
      },
      fontFamily: "'Cascadia Code','Consolas','Courier New',monospace",
      fontSize: 13,
      lineHeight: 1.35,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 5000,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.open(terminalRef.current);
    fitAddon.fit();
    termRef.current = term;

    term.writeln('\x1b[1;34mMicrosoft Windows [Version 11.0.22631]\x1b[0m');
    term.writeln('\x1b[90m(c) Microsoft Corporation. All rights reserved.\x1b[0m');
    term.writeln('');
    writePrompt(term);

    term.onKey(({ key, domEvent }) => {
      const ev = domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
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
        term.clear(); writePrompt(term);
      } else if (printable) {
        inputBuffer.current += key;
        term.write(key);
      }
    });

    const ro = new ResizeObserver(() => fitAddon.fit());
    ro.observe(terminalRef.current);
    return () => { ro.disconnect(); term.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function writePrompt(term: Terminal) {
    const p = `C:\\Users\\user\\${pathRef.current.replace('home/user','').replace(/\//g,'\\')}`;
    term.write(`\x1b[90m${p}>\x1b[0m `);
  }

  async function handleCommand(cmd: string, term: Terminal) {
    const [command, ...args] = cmd.split(' ');
    const c = command.toLowerCase();
    switch (c) {
      case 'help':
        term.writeln('  dir            List files');
        term.writeln('  cd <dir>       Change directory');
        term.writeln('  type <file>    Read file');
        term.writeln('  mkdir <dir>    Create directory');
        term.writeln('  echo <text>    Print text');
        term.writeln('  cls            Clear screen');
        term.writeln('  ver            Show version');
        term.writeln('  date           Show date/time');
        break;
      case 'dir':
      case 'ls': {
        try {
          const files = await api.getFiles(pathRef.current);
          const list: any[] = Array.isArray(files) ? files : files.files || [];
          if (list.length === 0) term.writeln('  (empty)');
          else {
            term.writeln(` Directory of C:\\Users\\user\\${pathRef.current.replace('home/user','')}`);
            term.writeln('');
            list.forEach((f: any) => {
              const isDir = f.type === 'directory';
              term.writeln(`  ${isDir ? '<DIR>' : '     '}  ${f.name.padEnd(30)} ${isDir ? '' : (f.size||'')}`);
            });
            term.writeln(`\n              ${list.length} File(s)`);
          }
        } catch { term.writeln('  The system cannot find the path specified.'); }
        break;
      }
      case 'cd': {
        const target = args[0] || '';
        if (!target || target === '/') setCurrentPath('home/user');
        else if (target === '..') {
          const parts = pathRef.current.split('/'); parts.pop(); setCurrentPath(parts.join('/') || 'home/user');
        } else {
          const next = target.replace(/\\/g,'/').replace(/^\//,'');
          setCurrentPath(next.startsWith('home/') ? next : `${pathRef.current}/${next}`);
        }
        break;
      }
      case 'type':
      case 'cat': {
        if (!args[0]) term.writeln('  The syntax of the command is incorrect.');
        else {
          try { const r = await api.readFile(`${pathRef.current}/${args[0]}`); term.writeln(r.content ?? JSON.stringify(r)); }
          catch { term.writeln(`  The system cannot find the file specified.`); }
        }
        break;
      }
      case 'mkdir': {
        if (!args[0]) term.writeln('  The syntax of the command is incorrect.');
        else { try { await api.mkdir(`${pathRef.current}/${args[0]}`); term.writeln(`  Directory created.`); } catch { term.writeln('  Access is denied.'); } }
        break;
      }
      case 'echo': term.writeln(`  ${args.join(' ')}`); break;
      case 'cls': case 'clear': term.clear(); break;
      case 'ver': term.writeln('  Microsoft Windows [Version 11.0.22631.3007]'); break;
      case 'date': term.writeln(`  ${new Date().toString()}`); break;
      case 'whoami': term.writeln('  user\\user'); break;
      case 'wpm':
      case 'weblinux':
      case 'wxpm':
        await handleWpm(args, term);
        writePrompt(term);
        break;

      default: term.writeln(`  '${c}' is not recognized as an internal or external command,`); term.writeln('  operable program or batch file.');
    }
    writePrompt(term);
  }

  return (
    <div className="w-full h-full bg-[#0c0c0c] flex flex-col">
      {/* Windows Terminal tab bar */}
      <div className="h-8 bg-[#2d2d2d] flex items-center px-2 gap-1 shrink-0">
        <div className="bg-[#0c0c0c] text-white text-[12px] px-3 py-1 rounded-t flex items-center gap-2 border-t border-white/10">
          <span>🖥️</span> Windows PowerShell
        </div>
        <button className="ml-1 w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-white/60 text-sm">+</button>
      </div>
      <div ref={terminalRef} className="flex-1 w-full" />
    </div>
  );
}
