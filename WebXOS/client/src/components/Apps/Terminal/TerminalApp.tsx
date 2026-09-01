import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { handleWpm } from '../../../lib/wpm';
import { useAppRegistry } from '../../../store/appRegistry';
import { getDb } from '../../../lib/db';

export default function TerminalApp({ windowId }: { windowId: string }) {
  const termRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState<Terminal | null>(null);
  const installed = useAppRegistry((s) => s.installed);

  useEffect(() => {
    if (!termRef.current) return;
    const t = new Terminal({ theme: { background: '#202124', foreground: '#e8eaed', cursor: '#8ab4f8', selectionBackground: '#8ab4f833' }, fontFamily: '"Roboto Mono", monospace', fontSize: 13, cursorBlink: true });
    const fit = new FitAddon();
    t.loadAddon(fit);
    t.open(termRef.current);
    fit.fit();
    setTerm(t);

    const writePrompt = () => t.write('\r\n\x1b[36mwebxos\x1b[0m:\x1b[33m~\x1b[0m$ ');
    t.write('\x1b[1;36mWebXOS Terminal\x1b[0m v0.1.0\r\nType \x1b[33mhelp\x1b[0m for commands.\r\n');
    writePrompt();

    let line = '';
      t.onKey(({ key, domEvent }) => {
        if (domEvent.key === 'Enter') {
          const parts = line.trim().split(/\s+/);
          const cmd = parts[0]?.toLowerCase();
          const args = parts.slice(1);
          const handleCommand = async () => {
            if (cmd === 'help') {
              t.writeln('\r\n\x1b[1mCommands:\x1b[0m');
              t.writeln('  help        Show this help');
              t.writeln('  clear       Clear terminal');
              t.writeln('  echo        Print text');
              t.writeln('  date        Current date/time');
              t.writeln('  ls          List apps');
              t.writeln('  wpm         WebXOS Package Manager');
              t.writeln('  db          Database operations');
              t.writeln('  neofetch    System info');
            } else if (cmd === 'clear') t.clear();
            else if (cmd === 'echo') t.writeln('\r\n' + args.join(' '));
            else if (cmd === 'date') t.writeln('\r\n' + new Date().toString());
            else if (cmd === 'ls') {
              t.writeln('\r\n\x1b[1mInstalled apps:\x1b[0m');
              installed.forEach((a: any) => t.writeln(`  ${a.icon} ${a.name} (${a.id})`));
            } else if (cmd === 'wpm') await handleWpm(args, t);
            else if (cmd === 'db') {
              const sub = args[0];
              if (sub === 'exec') {
                const sql = args.slice(1).join(' ');
                try { const r = await (await getDb('terminal')).exec(sql); t.writeln('\r\n' + JSON.stringify(r, null, 2)); }
                catch (e: any) { t.writeln(`\r\n\x1b[31m${e.message}\x1b[0m`); }
              } else { t.writeln('\r\nUsage: db exec <sql>'); }
            } else if (cmd === 'neofetch') {
              t.writeln('\r\n\x1b[1;36m    ___  __  ______  _____\x1b[0m');
              t.writeln('\x1b[1;36m   /   | / / /_  __/ /   |\x1b[0m');
              t.writeln('\x1b[1;36m  / /| |/ /  / / / / /| |\x1b[0m');
              t.writeln('\x1b[1;36m / ___ / /  / / / / ___ |\x1b[0m');
              t.writeln('\x1b[1;36m/_/  |_/_/ /_/ /_/_/  |_|\x1b[0m');
              t.writeln(`  OS: WebXOS 0.1.0`);
              t.writeln(`  Host: VM-View Hypervisor`);
              t.writeln(`  Kernel: React 18 + Vite`);
              t.writeln(`  Shell: WebXOS Terminal`);
            } else if (cmd) t.writeln(`\r\n\x1b[31mUnknown command: ${cmd}\x1b[0m`);
            line = '';
            writePrompt();
          };
          handleCommand();
        } else if (domEvent.key === 'Backspace') {
        if (line.length > 0) { line = line.slice(0, -1); t.write('\b \b'); }
      } else { line += key; t.write(key); }
    });

    return () => t.dispose();
  }, [installed]);

  return <div ref={termRef} className="w-full h-full p-1 bg-[#202124]" />;
}
