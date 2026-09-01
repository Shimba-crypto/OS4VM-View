import { apiFetch, getInstanceId } from '../store/api';

async function request(path: string, opts?: RequestInit) {
  const id = getInstanceId();
  return apiFetch(`/instances/${id}${path}`, opts);
}

function parseRows(result: any): any[] {
  if (Array.isArray(result)) return result;
  if (result?.rows) return result.rows;
  return [];
}

export async function getDb(appId: string, dbName = 'default') {
  await request(`/db/${appId}/${dbName}/open`, { method: 'POST' });
  return {
    async exec(sql: string, params: any[] = []) {
      return request(`/db/${appId}/${dbName}/exec`, {
        method: 'POST',
        body: JSON.stringify({ sql, params }),
      });
    },
    async query(sql: string, params: any[] = []) {
      const res = await request(`/db/${appId}/${dbName}/exec`, {
        method: 'POST',
        body: JSON.stringify({ sql, params }),
      });
      return parseRows(res);
    },
    async dump() {
      return request(`/db/${appId}/${dbName}/dump`);
    },
    async listDbs() {
      return request(`/db`);
    },
    async drop() {
      return request(`/db/${appId}/${dbName}`, { method: 'DELETE' });
    },
  };
}
