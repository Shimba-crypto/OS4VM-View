import { useState, useEffect } from 'react';
import { getAppDB, listAppDBs } from '../../../lib/db';

export default function DBViewerApp({ windowId }: { windowId: string }) {
  const [appId, setAppId] = useState('hello-world');
  const [dbName, setDbName] = useState('app');
  const [sql, setSql] = useState('SELECT 1 as hello;');
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [dbs, setDbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
      const list = await listAppDBs();
      setDbs(list);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function run() {
    setLoading(true);
    setErr(null);
    try {
      const db = await getAppDB(appId, dbName);
      const r = await db.exec(sql);
      setResult(r);
    } catch (e: any) {
      setErr(String(e.message));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function createTable() {
    setSql('CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY, txt TEXT);');
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-zinc-100">
      <div className="flex items-center gap-2 p-2 border-b border-zinc-800 bg-zinc-900 shrink-0 flex-wrap">
        <input value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="appId (per-app sandbox)" className="px-2 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono w-32" />
        <input value={dbName} onChange={(e) => setDbName(e.target.value)} placeholder="dbName" className="px-2 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono w-24" />
        <button onClick={refresh} className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs hover:bg-zinc-700">List DBs</button>
        <span className="text-[11px] text-zinc-500 hidden sm:inline">{dbs.length} DBs</span>
        <div className="ml-auto flex gap-1">
          <button onClick={createTable} className="px-2 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs">Create Table</button>
          <button onClick={run} disabled={loading} className="px-4 py-1.5 rounded bg-violet-600 text-white text-xs font-medium hover:bg-violet-500 disabled:opacity-50">{loading ? '...' : 'Run ▶'}</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <textarea value={sql} onChange={(e) => setSql(e.target.value)} placeholder="SQL — e.g. SELECT * FROM notes; — per-app SQLite at /api/instances/:id/db/:appId/:dbName (requires backend on :3001)" className="flex-1 p-3 bg-zinc-950 border-b border-zinc-800 outline-none font-mono text-xs resize-none" spellCheck={false} />
        <div className="flex-1 overflow-auto p-3 bg-zinc-900">
          {err && <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded p-2">{err}<div className="mt-1 opacity-70">Backend required at localhost:3001 — start with: cd OS4VM-View/server && npm install && npm run dev</div></div>}
          {result && (
            <div className="space-y-2">
              {result.rows && (
                <div>
                  <div className="text-[11px] font-mono text-zinc-500 mb-1">{result.rows.length} rows</div>
                  <div className="overflow-auto border border-zinc-800 rounded">
                    <table className="w-full text-xs">
                      <thead className="bg-zinc-800">
                        <tr>{result.rows[0] ? Object.keys(result.rows[0]).map((k) => <th key={k} className="text-left px-2 py-1 font-medium text-zinc-300">{k}</th>) : <th className="px-2 py-1">Result</th>}</tr>
                      </thead>
                      <tbody>
                        {result.rows.map((r: any, i: number) => (
                          <tr key={i} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                            {Object.values(r).map((v: any, j) => <td key={j} className="px-2 py-1 font-mono text-zinc-300">{String(v ?? '')}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {(result.changes !== undefined || result.lastInsertRowid !== undefined) && (
                <div className="text-[11px] font-mono text-zinc-500">changes: {result.changes} · lastInsertRowid: {result.lastInsertRowid}</div>
              )}
              {!result.rows && result.changes === undefined && <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>}
            </div>
          )}
          {!result && !err && <div className="text-xs text-zinc-500">Run a query — per-app SQLite at /api/instances/:id/db/{appId}/{dbName} (backend file, isolated per app)</div>}
        </div>
      </div>

      <div className="px-3 py-1.5 border-t border-zinc-800 bg-zinc-900 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
        <span>App SDK: getAppDB('{appId}','{dbName}').query(sql)</span>
        <span className="hidden sm:inline">Sandbox-DB · per-app · SQLite · backend file</span>
      </div>
    </div>
  );
}
