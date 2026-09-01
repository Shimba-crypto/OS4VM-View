export const API_BASE = '/api';

export async function apiFetch(path: string, opts?: RequestInit) {
  const token = localStorage.getItem('vmview_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts?.headers as any || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  try { return JSON.parse(text); } catch { throw new Error(`No backend at localhost:3001 — demo mode`); }
}

export function getInstanceId(): string {
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (last && last !== 'web-xos' && last !== 'webxos') return last;
  return localStorage.getItem('wxos_instance') || 'default';
}
