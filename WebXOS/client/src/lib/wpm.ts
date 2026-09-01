const CATALOG_URLS = [
  'http://localhost:8081/catalog.json',
  'http://localhost:8080/catalog.json',
  'https://cdn.jsdelivr.net/gh/Shimba-crypto/wpm@main/catalog.json',
  'https://raw.githubusercontent.com/Shimba-crypto/wpm/main/catalog.json',
];

export async function fetchCatalog(): Promise<any[]> {
  const custom = localStorage.getItem('wpm_catalog_url');
  const port = localStorage.getItem('wpm_port');
  const urls = custom ? [custom, ...CATALOG_URLS] : port ? [`http://localhost:${port}/catalog.json`, ...CATALOG_URLS] : CATALOG_URLS;
  for (const u of urls) {
    try {
      const r = await fetch(u, { cache: 'no-store' });
      if (!r.ok) continue;
      const d = await r.json();
      return Array.isArray(d) ? d : d.catalog || d.apps || [];
    } catch {}
  }
  return [];
}

export async function wpmInstall(app: any, installed: any[], addApp: any) {
  const entry = app.entry || app.path || `packages/${app.id}/${app.id}.js`;
  addApp({
    id: app.id, name: app.name, icon: app.icon || '📦',
    defaultWidth: app.defaultWidth || 700, defaultHeight: app.defaultHeight || 500,
    component: `wpm:${app.id}`, entry,
    _catalogBase: localStorage.getItem('wpm_catalog_base') || 'https://cdn.jsdelivr.net/gh/Shimba-crypto/wpm@main/catalog.json',
  });
}

export async function wpmRemove(id: string, removeApp: any) {
  removeApp(id);
}

export async function handleWpm(args: string[], term: any) {
  const [cmd, ...rest] = args;
  if (cmd === 'install') {
    const id = rest[0];
    if (!id) { term.writeln('\x1b[33mUsage: wpm install <app-id>\x1b[0m'); return; }
    term.writeln(`\x1b[36mInstalling ${id}...\x1b[0m`);
    const catalog = await fetchCatalog();
    const app = catalog.find((a: any) => a.id === id);
    if (!app) { term.writeln(`\x1b[31mApp ${id} not found in catalog\x1b[0m`); return; }
    term.writeln(`\x1b[32mInstalled ${app.name}!\x1b[0m`);
  } else if (cmd === 'list') {
    term.writeln('\x1b[36mInstalled wpm apps:\x1b[0m');
  } else if (cmd === 'search') {
    const q = rest.join(' ').toLowerCase();
    const catalog = await fetchCatalog();
    const results = catalog.filter((a: any) => `${a.name} ${a.description}`.toLowerCase().includes(q));
    results.forEach((a: any) => term.writeln(`  \x1b[32m${a.id}\x1b[0m — ${a.name}: ${a.description?.slice(0, 60)}`));
    if (!results.length) term.writeln('  No results');
  } else {
    term.writeln('\x1b[36mWebXOS Package Manager\x1b[0m');
    term.writeln('  wpm search <query>');
    term.writeln('  wpm install <app-id>');
    term.writeln('  wpm list');
  }
}
