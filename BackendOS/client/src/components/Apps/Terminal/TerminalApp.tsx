import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { api } from '../../../store/api';
import { handleWpm } from '../../../lib/wpm';

interface TerminalAppProps {
  windowId: string;
}

export default function TerminalApp({ windowId }: TerminalAppProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentPath, setCurrentPath] = useState('~/user');
  const inputBuffer = useRef('');

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#11111b',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
        cursorAccent: '#11111b',
        selectionBackground: 'rgba(137, 180, 250, 0.3)',
        black: '#45475a',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#f5c2e7',
        cyan: '#94e2d5',
        white: '#bac2de',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;38;5;89m  BackendOS Terminal\x1b[0m');
    term.writeln('\x1b[38;5;240m  ─────────────────────────────\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[38;5;245m  Type "help" for available commands.\x1b[0m');
    term.writeln('');
    writePrompt(term);

    term.onKey(({ key, domEvent }) => {
      const ev = domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.key === 'Enter') {
        const cmd = inputBuffer.current.trim();
        term.writeln('');
        if (cmd) {
          handleCommand(cmd, term);
        } else {
          writePrompt(term);
        }
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
      } else if (printable) {
        inputBuffer.current += key;
        term.write(key);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  function writePrompt(term: Terminal) {
    const path = currentPath.replace('~/user', '~');
    term.write(`\x1b[1;38;5;89m➜\x1b[0m \x1b[1;38;5;75m${path}\x1b[0m `);
  }

  async function handleCommand(cmd: string, term: Terminal) {
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        term.writeln('\x1b[1;38;5;75mAvailable commands:\x1b[0m');
        term.writeln('  \x1b[38;5;89mls\x1b[0m          List files');
        term.writeln('  \x1b[38;5;89mcd <dir>\x1b[0m    Change directory');
        term.writeln('  \x1b[38;5;89mpwd\x1b[0m         Print working directory');
        term.writeln('  \x1b[38;5;89mcat <file>\x1b[0m   Read file contents');
        term.writeln('  \x1b[38;5;89mmkdir <dir>\x1b[0m  Create directory');
        term.writeln('  \x1b[38;5;89mtouch <file>\x1b[0m Create file');
        term.writeln('  \x1b[38;5;89mecho <text>\x1b[0m  Print text');
        term.writeln('  \x1b[38;5;89mdate\x1b[0m         Show date/time');
        term.writeln('  \x1b[38;5;89mwhoami\x1b[0m       Show current user');
        term.writeln('  \x1b[38;5;89mclear\x1b[0m        Clear terminal');
        term.writeln('  \x1b[38;5;89mneofetch\x1b[0m     System info');
        break;

      case 'ls': {
        try {
          const files = await api.getFiles(currentPath);
          if (files.length === 0) {
            term.writeln('\x1b[38;5;245m  (empty)\x1b[0m');
          } else {
            const line = files.map((f: any) =>
              f.type === 'directory'
                ? `\x1b[1;38;5;75m${f.name}/\x1b[0m`
                : `\x1b[38;5;252m${f.name}\x1b[0m`
            ).join('  ');
            term.writeln(`  ${line}`);
          }
        } catch {
          term.writeln('\x1b[38;5;89m  Error listing files\x1b[0m');
        }
        writePrompt(term);
        break;
      }

      case 'cd': {
        const target = args[0] || 'home/user';
        if (target === '~' || target === '') {
          setCurrentPath('home/user');
        } else if (target === '..') {
          const parts = currentPath.split('/');
          parts.pop();
          setCurrentPath(parts.join('/') || 'home/user');
        } else {
          setCurrentPath(target.startsWith('/') ? target.slice(1) : `${currentPath}/${target}`);
        }
        writePrompt(term);
        break;
      }

      case 'pwd':
        term.writeln(`  /${currentPath}`);
        writePrompt(term);
        break;

      case 'cat': {
        if (!args[0]) {
          term.writeln('\x1b[38;5;89m  Usage: cat <filename>\x1b[0m');
        } else {
          try {
            const fullPath = `${currentPath}/${args[0]}`;
            const result = await api.readFile(fullPath);
            term.writeln(result.content);
          } catch {
            term.writeln(`\x1b[38;5;89m  cat: ${args[0]}: No such file\x1b[0m`);
          }
        }
        writePrompt(term);
        break;
      }

      case 'mkdir': {
        if (!args[0]) {
          term.writeln('\x1b[38;5;89m  Usage: mkdir <dirname>\x1b[0m');
        } else {
          try {
            await api.mkdir(`${currentPath}/${args[0]}`);
            term.writeln(`\x1b[38;5;245m  Created directory: ${args[0]}\x1b[0m`);
          } catch {
            term.writeln(`\x1b[38;5;89m  mkdir: cannot create '${args[0]}'\x1b[0m`);
          }
        }
        writePrompt(term);
        break;
      }

      case 'touch': {
        if (!args[0]) {
          term.writeln('\x1b[38;5;89m  Usage: touch <filename>\x1b[0m');
        } else {
          try {
            await api.writeFile(`${currentPath}/${args[0]}`, '');
            term.writeln(`\x1b[38;5;245m  Created file: ${args[0]}\x1b[0m`);
          } catch {
            term.writeln(`\x1b[38;5;89m  touch: cannot create '${args[0]}'\x1b[0m`);
          }
        }
        writePrompt(term);
        break;
      }

      case 'echo':
        term.writeln(`  ${args.join(' ')}`);
        writePrompt(term);
        break;

      case 'date':
        term.writeln(`  ${new Date().toString()}`);
        writePrompt(term);
        break;

      case 'whoami':
        term.writeln('  user@backendos');
        writePrompt(term);
        break;

      case 'clear':
        term.clear();
        writePrompt(term);
        break;

      case 'neofetch':
        term.writeln('\x1b[1;38;5;89m        ╭──────────╮\x1b[0m    \x1b[1;38;5;75muser\x1b[0m@\x1b[1;38;5;75mbackendos\x1b[0m');
        term.writeln('\x1b[1;38;5;89m       ╱            ╲\x1b[0m   ──────────────');
        term.writeln('\x1b[1;38;5;89m      │   ╭──────╮  │\x1b[0m   \x1b[38;5;89mOS:\x1b[0m BackendOS 0.1.0');
        term.writeln('\x1b[1;38;5;89m      │   │  🖥️  │  │\x1b[0m   \x1b[38;5;89mHost:\x1b[0m VM-View Hypervisor');
        term.writeln('\x1b[1;38;5;89m      │   ╰──────╯  │\x1b[0m   \x1b[38;5;89mKernel:\x1b[0m Web Runtime');
        term.writeln('\x1b[1;38;5;89m       ╲            ╱\x1b[0m    \x1b[38;5;89mShell:\x1b[0m BackendOS Terminal');
        term.writeln('\x1b[1;38;5;89m        ╰──────────╯\x1b[0m     \x1b[38;5;89mTheme:\x1b[0m Catppuccin Mocha');
        writePrompt(term);
        break;

      case 'wpm':
      case 'weblinux':
      case 'wxpm':
        await handleWpm(args, term);
        writePrompt(term);
        break;

      default:
        term.writeln(`\x1b[38;5;89m  command not found: ${command}\x1b[0m`);
        writePrompt(term);
    }
  }

  return (
    <div className="w-full h-full bg-[#11111b]">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
}
