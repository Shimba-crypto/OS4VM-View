import { useState, useEffect } from 'react';
import { Database, RefreshCw, Play, Trash2 } from 'lucide-react';
import { getDb } from '../../../lib/db';

export default function DBViewerApp({ windowId }: { windowId: string }) {
  const [appId, setAppId] = useState('hello-world');
  const [dbName, setDbName] = useState('default');
  const [sql, setSql] = useState('SELECT 1 as test');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbs, setDbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDbs = async () => {
    try {
      const db = await getDb(appId, dbName);
      const list = await db.listDbs();
      setDbs(Array.isArray(list) ? list : []);
    } catch (e: any) { setError(e.message); }
  };

  useEffect(() => { loadDbs(); }, []);

  const runQuery = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const db = await getDb(appId, dbName);
      const r = await db.exec(sql);
      setResult(r);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-wx-surface">
      <div className="p-3 bg-wx-surface2 border-b border-wx-border flex items-center gap-2">
        <Database className="w-4 h-4 text-wx-accent" />
        <span className="text-[13px] font-semibold text-wx-text">DB Viewer</span>
        <div className="flex-1" />
        <input value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="App ID"
          className="w-28 bg-wx-surface border border-wx-border rounded px-2 py-1 text-[11px] text-wx-text font-mono outline-none" />
        <input value={dbName} onChange={(e) => setDbName(e.target.value)} placeholder="DB name"
          className="w-24 bg-wx-surface border border-wx-border rounded px-2 py-1 text-[11px] text-wx-text font-mono outline-none" />
        <button onClick={loadDbs} className="p-1 hover:bg-white/10 rounded text-wx-muted"><RefreshCw className="w-3.5 h-3.5" /></button>
      </div>
      {dbs.length > 0 && (
        <div className="px-3 py-2 border-b border-wx-border flex gap-1 flex-wrap">
          {dbs.map((d: any, i: number) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-wx-accent/15 text-wx-accent border border-wx-accent/20">
              {d.appId}/{d.dbName}
            </span>
          ))}
        </div>
      )}
      <div className="p-3 border-b border-wx-border flex gap-2">
        <textarea value={sql} onChange={(e) => setSql(e.target.value)} rows={2}
          className="flex-1 bg-wx-surface border border-wx-border rounded-lg p-2 text-[12px] text-wx-text font-mono outline-none resize-none focus:border-wx-accent" />
        <button onClick={runQuery} disabled={loading}
          className="flex items-center gap-1 px-3 rounded-lg bg-wx-accent text-white text-[12px] font-medium hover:bg-wx-accent/80 disabled:opacity-50 self-start">
          <Play className="w-3 h-3" /> Run
        </button>
      </div>
      <div className="flex-1 p-3 overflow-auto">
        {error && <div className="text-[12px] text-wx-red bg-wx-red/10 p-2 rounded-lg">{error}</div>}
        {result && (
          <pre className="text-[11px] text-wx-text font-mono whitespace-pre-wrap bg-wx-surface2 p-3 rounded-lg border border-wx-border">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
        {!result && !error && (
          <div className="text-[12px] text-wx-muted text-center pt-8">
            Enter SQL and click Run. Backend required at localhost:3001.<br />
            <code className="text-[11px] bg-wx-surface2 px-2 py-1 rounded mt-2 inline-block">cd server && npm install && node server.js</code>
          </div>
        )}
      </div>
    </div>
  );
}
