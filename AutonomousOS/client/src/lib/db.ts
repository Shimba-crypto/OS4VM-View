const API_BASE = '/api';

function getInstanceId(): string {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || 'default';
}

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('vmview_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((options.headers as Record<string, string>) || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed ${res.status}`);
  return data;
}

export interface AppDB {
  appId: string;
  dbName: string;
  instanceId: string;
  exec(sql: string, params?: any[]): Promise<{ rows?: any[]; lastInsertRowid?: number; changes?: number }>;
  query(sql: string, params?: any[]): Promise<any[]>;
  dump(): Promise<any>;
  drop(): Promise<void>;
}

export async function getAppDB(appId: string, dbName = 'app'): Promise<AppDB> {
  const instanceId = getInstanceId();
  if (!/^[a-zA-Z0-9_-]+$/.test(appId)) throw new Error('Invalid appId');
  if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) throw new Error('Invalid dbName');
  // Ensure DB exists
  await request(`/instances/${instanceId}/db/${appId}/${dbName}/open`, { method: 'POST', body: JSON.stringify({}) }).catch(() => {});
  return {
    appId,
    dbName,
    instanceId,
    exec: async (sql: string, params: any[] = []) => {
      const r = await request(`/instances/${instanceId}/db/${appId}/${dbName}/exec`, { method: 'POST', body: JSON.stringify({ sql, params }) });
      return r;
    },
    query: async (sql: string, params: any[] = []) => {
      const r = await request(`/instances/${instanceId}/db/${appId}/${dbName}/exec`, { method: 'POST', body: JSON.stringify({ sql, params }) });
      return r.rows || [];
    },
    dump: async () => request(`/instances/${instanceId}/db/${appId}/${dbName}/dump`),
    drop: async () => request(`/instances/${instanceId}/db/${appId}/${dbName}`, { method: 'DELETE' }),
  };
}

export async function listAppDBs(appId?: string): Promise<any[]> {
  const instanceId = getInstanceId();
  if (appId) return request(`/instances/${instanceId}/db/${appId}`);
  return request(`/instances/${instanceId}/db`);
}
