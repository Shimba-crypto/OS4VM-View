const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('vmview_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function getInstanceId(): string {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

export const api = {
  getFiles: (path?: string) =>
    request(`/instances/${getInstanceId()}/files${path ? `?path=${encodeURIComponent(path)}` : ''}`),
  readFile: (path: string) =>
    request(`/instances/${getInstanceId()}/file?path=${encodeURIComponent(path)}`),
  writeFile: (path: string, content: string) =>
    request(`/instances/${getInstanceId()}/file`, { method: 'PUT', body: JSON.stringify({ path, content }) }),
  deleteFile: (path: string) =>
    request(`/instances/${getInstanceId()}/file?path=${encodeURIComponent(path)}`, { method: 'DELETE' }),
  mkdir: (path: string) =>
    request(`/instances/${getInstanceId()}/mkdir`, { method: 'POST', body: JSON.stringify({ path }) }),
  getInstance: () => request(`/instances/${getInstanceId()}`),

  createShare: (password: string, expiresIn?: number) =>
    request(`/instances/${getInstanceId()}/share`, { method: 'POST', body: JSON.stringify({ password, expiresIn }) }),
  getShareInfo: (shareId: string) => request(`/share/${shareId}/info`),
  verifyShare: (shareId: string, password: string) =>
    request(`/share/${shareId}/verify`, { method: 'POST', body: JSON.stringify({ password }) }),
};
