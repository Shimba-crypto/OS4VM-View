import { useAppRegistry } from '../store/appRegistry';
import type { WpmApp } from '../store/appRegistry';

function getLocalCatalogs(): string[] {
  const custom = (() => { try { return localStorage.getItem('wpm_catalog_url'); } catch { return null; } })();
  if (custom) return [custom];
  const port = (() => { try { return localStorage.getItem('wpm_port'); } catch { return null; } })();
  if (port) return [`http://localhost:${port}/catalog.json`, `http://localhost:${port}/registry.json`];
  // 8080 is often taken (ADA Chat), try 8081 first then fallbacks
  return [
    'http://localhost:8081/catalog.json',
    'http://localhost:8080/catalog.json',
    'http://localhost:3002/catalog.json',
    'http://localhost:8787/catalog.json',
    'http://localhost:8081/registry.json',
    'http://localhost:8080/registry.json',
  ];
}
const LOCAL_CATALOGS = getLocalCatalogs();
const PROD_CATALOGS = [
  'https://raw.githubusercontent.com/Shimba-crypto/wpm/main/catalog.json',
  './repo/catalog.json',
  '/repo/catalog.json',
];

function isLocalhost(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

export async function fetchCatalog(): Promise<{ catalog: any[]; url: string }> {
  const { catalog, catalogUrl } = useAppRegistry.getState();
  // Try local first when on localhost, else prod first
  const LOCAL = getLocalCatalogs();
  const order = isLocalhost() ? [...LOCAL, ...PROD_CATALOGS] : [...PROD_CATALOGS, ...LOCAL];
  // If we already have catalog, return it but still try to refresh?
  for (const url of order) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) continue;
      const data = await r.json();
      const arr = Array.isArray(data) ? data : data.apps || data.catalog || [];
      useAppRegistry.getState().setCatalog(arr, url);
      return { catalog: arr, url };
    } catch {}
  }
  if (catalog) return { catalog, url: catalogUrl || '' };
  throw new Error('No catalog reachable (tried localhost:8080 and raw github)');
}

export async function wpmSearch(q: string, term: any): Promise<void> {
  try {
    const { catalog } = await fetchCatalog();
    const filtered = q ? catalog.filter((a: any) => `${a.id} ${a.name} ${a.description}`.toLowerCase().includes(q.toLowerCase())) : catalog;
    if (filtered.length === 0) term.writeln('  No results');
    else filtered.forEach((a: any) => term.writeln(`  ${a.icon || '•'} ${a.id.padEnd(16)} ${a.version.padEnd(8)} ${a.name} - ${a.description || ''}`));
  } catch (e: any) { term.writeln(`  error: ${e.message}`); }
}

export async function wpmList(term: any, opts?: { installed?: boolean }): Promise<void> {
  const { installed } = useAppRegistry.getState();
  if (opts?.installed) {
    if (installed.length === 0) term.writeln('  No installed wpm apps');
    else installed.forEach((a) => term.writeln(`  ${a.icon || '•'} ${a.id.padEnd(16)} ${a.version} ${a.name}`));
    return;
  }
  term.writeln('  Installed:');
  if (installed.length === 0) term.writeln('    (none)');
  else installed.forEach((a) => term.writeln(`    ${a.id} ${a.version}`));
  term.writeln('');
  try {
    const { catalog } = await fetchCatalog();
    term.writeln(`  Catalog: ${catalog.length} apps`);
    catalog.slice(0, 8).forEach((a: any) => term.writeln(`    ${a.id} ${a.version} ${a.name}`));
    if (catalog.length > 8) term.writeln(`    ... and ${catalog.length - 8} more (use wpm search)`);
  } catch (e: any) { term.writeln(`  catalog error: ${e.message}`); }
}

export async function wpmInfo(id: string, term: any): Promise<void> {
  try {
    const { catalog } = await fetchCatalog();
    const app = catalog.find((a: any) => a.id === id);
    if (!app) { term.writeln(`  not found: ${id}`); return; }
    term.writeln(`  ${app.icon || ''} ${app.name} (${app.id})`);
    term.writeln(`  version: ${app.version}`);
    term.writeln(`  entry: ${app.entry}`);
    term.writeln(`  desc: ${app.description || ''}`);
    term.writeln(`  compatible: ${(app.compatible || ['*']).join(', ')}`);
    term.writeln(`  size: ${app.defaultWidth}x${app.defaultHeight}`);
  } catch (e: any) { term.writeln(`  error: ${e.message}`); }
}

export async function wpmInstall(id: string, term: any): Promise<void> {
  try {
    const { catalog, url: baseUrl } = await fetchCatalog();
    const app = catalog.find((a: any) => a.id === id);
    if (!app) { term.writeln(`  package not found: ${id}`); return; }
    const { installed } = useAppRegistry.getState();
    if (installed.find((a) => a.id === id)) { term.writeln(`  already installed: ${id}`); return; }
    term.writeln(`  fetching ${id}@${app.version}...`);
    // Verify compatible - allow * or current os id (we don't have os id here, so allow all for now)
    // Preload component to verify entry reachable
    const entryUrl = new URL(app.entry, baseUrl).toString();
    try {
      const r = await fetch(entryUrl, { method: 'HEAD' });
      if (!r.ok) throw new Error(`${r.status}`);
    } catch {}
    // Try dynamic import to validate
    try {
      await import(/* @vite-ignore */ entryUrl);
    } catch (e: any) {
      // If import fails due to CORS, still register but warn
      term.writeln(`  warning: preload failed (${e.message?.slice(0, 60)}) — will try at launch`);
    }
    const wpmApp: WpmApp = {
      id: app.id,
      name: app.name,
      icon: app.icon || '📦',
      desktopIcon: app.icon || '📦',
      defaultWidth: app.defaultWidth || 500,
      defaultHeight: app.defaultHeight || 400,
      minWidth: app.minWidth,
      minHeight: app.minHeight,
      component: `wpm:${app.id}`,
      category: app.category || 'WPM',
      description: app.description,
      entry: app.entry,
      version: app.version,
      compatible: app.compatible,
    } as any;
    // Persist baseUrl for later resolution
    (wpmApp as any)._catalogBase = baseUrl;
    useAppRegistry.getState().install(wpmApp);
    // Also store baseUrl in separate storage for loader
    try { localStorage.setItem('wpm_catalog_base', baseUrl); } catch {}
    term.writeln(`  ✓ installed ${app.id} — open via dock or: open ${app.id}`);
    term.writeln(`  tip: refresh WindowManager will show it`);
  } catch (e: any) { term.writeln(`  install failed: ${e.message}`); }
}

export async function wpmRemove(id: string, term: any): Promise<void> {
  const { installed } = useAppRegistry.getState();
  if (!installed.find((a) => a.id === id)) { term.writeln(`  not installed: ${id}`); return; }
  useAppRegistry.getState().uninstall(id);
  term.writeln(`  removed ${id}`);
  term.writeln(`  close any open window and reopen to confirm`);
}

export async function handleWpm(args: string[], term: any): Promise<void> {
  const [sub, ...rest] = args;
  const cmd = (sub || 'help').toLowerCase();
  switch (cmd) {
    case 'search': await wpmSearch(rest.join(' '), term); break;
    case 'list': {
      const installedOnly = rest.includes('--installed') || rest.includes('-i');
      await wpmList(term, { installed: installedOnly });
      break;
    }
    case 'install':
    case 'add': {
      const id = rest[0];
      if (!id) term.writeln('  usage: wpm install <id>');
      else await wpmInstall(id, term);
      break;
    }
    case 'remove':
    case 'uninstall':
    case 'rm': {
      const id = rest[0];
      if (!id) term.writeln('  usage: wpm remove <id>');
      else await wpmRemove(id, term);
      break;
    }
    case 'info':
    case 'show': {
      const id = rest[0];
      if (!id) term.writeln('  usage: wpm info <id>');
      else await wpmInfo(id, term);
      break;
    }
    case 'help':
    default:
      term.writeln('  wpm — Web Package Manager (VM-APPSTORE)');
      term.writeln('    wpm search <q>        search catalog');
      term.writeln('    wpm list              list installed + catalog');
      term.writeln('    wpm install <id>      install app');
      term.writeln('    wpm remove <id>       uninstall app');
      term.writeln('    wpm info <id>         show details');
      term.writeln('  aliases: weblinux, wxpm');
      term.writeln('  catalog: /home/shimba/VM-APPSTORE → http://localhost:8081/catalog.json (8080 fallback) → raw github wpm');
      break;
  }
}
