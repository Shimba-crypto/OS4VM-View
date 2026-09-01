const API = '/api';
const IID = () => window.location.pathname.split('/').pop() || '';

async function req(path: string, opts: RequestInit = {}) {
  const t = localStorage.getItem('vmview_token');
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...((opts.headers as Record<string, string>) || {}) };
  if (t) h['Authorization'] = `Bearer ${t}`;
  const r = await fetch(`${API}${path}`, { ...opts, headers: h });
  const text = await r.text();
  let d: any;
  try { d = text ? JSON.parse(text) : {}; } catch { throw new Error('No backend at localhost:3001 — files unavailable (demo)'); }
  if (!r.ok) throw new Error(d.error || 'Failed');
  return d;
}

export const api = {
  getFiles: (p?: string) => req(`/instances/${IID()}/files${p ? `?path=${encodeURIComponent(p)}` : ''}`),
  readFile: (p: string) => req(`/instances/${IID()}/file?path=${encodeURIComponent(p)}`),
};
