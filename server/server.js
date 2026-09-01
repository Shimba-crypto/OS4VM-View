import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const DATA_ROOT = path.join(__dirname, '../.sandbox-data');
fs.mkdirSync(DATA_ROOT, { recursive: true });

// Helper to get instance id from URL and validate
function getInstancePath(id) {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid instance id');
  return path.join(DATA_ROOT, id);
}
function getAppDbPath(instanceId, appId, dbName) {
  if (!/^[a-zA-Z0-9_-]+$/.test(appId)) throw new Error('Invalid appId');
  if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) throw new Error('Invalid dbName');
  const p = path.join(getInstancePath(instanceId), 'db', appId);
  fs.mkdirSync(p, { recursive: true });
  return path.join(p, `${dbName}.sqlite`);
}

// Simple file API mock (for FS without hypervisor) — uses same DATA_ROOT
// GET /api/instances/:id/files?path=
app.get('/api/instances/:id/files', (req, res) => {
  const instanceId = req.params.id;
  const qPath = req.query.path || '';
  const base = path.join(getInstancePath(instanceId), 'files', qPath);
  fs.mkdirSync(base, { recursive: true });
  try {
    const entries = fs.readdirSync(base, { withFileTypes: true });
    const files = entries.map((e) => ({
      name: e.name,
      type: e.isDirectory() ? 'directory' : 'file',
      size: e.isFile() ? fs.statSync(path.join(base, e.name)).size : undefined,
    }));
    res.json(files);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/instances/:id/file', (req, res) => {
  const instanceId = req.params.id;
  const qPath = req.query.path || '';
  const filePath = path.join(getInstancePath(instanceId), 'files', qPath);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ content });
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.put('/api/instances/:id/file', (req, res) => {
  const instanceId = req.params.id;
  const { path: p, content } = req.body;
  const filePath = path.join(getInstancePath(instanceId), 'files', p);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content || '', 'utf-8');
  res.json({ ok: true });
});

app.delete('/api/instances/:id/file', (req, res) => {
  const instanceId = req.params.id;
  const qPath = req.query.path || '';
  const filePath = path.join(getInstancePath(instanceId), 'files', qPath);
  try {
    fs.unlinkSync(filePath);
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: String(e) });
  }
});

app.post('/api/instances/:id/mkdir', (req, res) => {
  const instanceId = req.params.id;
  const { path: p } = req.body;
  const dirPath = path.join(getInstancePath(instanceId), 'files', p);
  fs.mkdirSync(dirPath, { recursive: true });
  res.json({ ok: true });
});

app.get('/api/instances/:id', (req, res) => {
  res.json({ id: req.params.id, status: 'running' });
});

app.get('/api/instances', (req, res) => {
  try {
    const ids = fs.readdirSync(DATA_ROOT).filter((f) => fs.statSync(path.join(DATA_ROOT, f)).isDirectory());
    res.json(ids.map((id) => ({ id })));
  } catch {
    res.json([]);
  }
});

// --- SandBox-DB: per-app SQLite backend file ---
let Database;
try {
  const mod = await import('better-sqlite3');
  Database = mod.default;
  console.log('Using better-sqlite3');
} catch (e) {
  console.log('better-sqlite3 not available, using mock JSON DB (install with npm install better-sqlite3)');
  Database = null;
}

const dbCache = new Map();

function getDB(instanceId, appId, dbName) {
  const key = `${instanceId}:${appId}:${dbName}`;
  if (dbCache.has(key)) return dbCache.get(key);
  const dbPath = getAppDbPath(instanceId, appId, dbName);
  if (Database) {
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    dbCache.set(key, db);
    return db;
  }
  // Fallback JSON mock
  return {
    _isMock: true,
    _path: dbPath + '.json',
    exec(sql, params = []) {
      // Very naive mock — only supports CREATE TABLE, INSERT, SELECT for demo
      const jsonPath = this._path;
      let data = {};
      try { data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')); } catch {}
      const sqlUp = sql.trim().toUpperCase();
      if (sqlUp.startsWith('CREATE TABLE')) {
        const m = sql.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/i) || sql.match(/CREATE TABLE\s+(\w+)/i);
        if (m) {
          const tbl = m[1];
          if (!data[tbl]) data[tbl] = [];
          fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
          return { changes: 0 };
        }
      } else if (sqlUp.startsWith('INSERT INTO')) {
        const m = sql.match(/INSERT INTO\s+(\w+)/i);
        if (m) {
          const tbl = m[1];
          if (!data[tbl]) data[tbl] = [];
          // naive params handling
          const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
          const vals = params;
          const obj = {};
          if (colsMatch) {
            const cols = colsMatch[1].split(',').map((s) => s.trim());
            cols.forEach((c, i) => (obj[c] = vals[i]));
          } else {
            obj.values = vals;
          }
          obj._id = (data[tbl].length + 1);
          data[tbl].push(obj);
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
          return { lastInsertRowid: obj._id, changes: 1 };
        }
      } else if (sqlUp.startsWith('SELECT')) {
        const m = sql.match(/FROM\s+(\w+)/i);
        if (m) {
          const tbl = m[1];
          const rows = data[tbl] || [];
          // naive WHERE id = ?
          if (sqlUp.includes('WHERE') && params.length) {
            return rows.filter((r) => Object.values(r).includes(params[0]));
          }
          return rows;
        }
      } else if (sqlUp.startsWith('DROP TABLE')) {
        const m = sql.match(/DROP TABLE.*\s+(\w+)/i);
        if (m) {
          delete data[m[1]];
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
          return { changes: 0 };
        }
      }
      return { rows: [] };
    },
    prepare(sql) {
      return { all: (...params) => this.exec(sql, params), run: (...params) => this.exec(sql, params) };
    },
  };
}

// POST /api/instances/:id/db/:appId/:dbName/open
app.post('/api/instances/:id/db/:appId/:dbName/open', (req, res) => {
  try {
    const { id, appId, dbName } = req.params;
    const db = getDB(id, appId, dbName);
    // ensure file exists
    if (!db._isMock) db.prepare('SELECT 1').get();
    res.json({ ok: true, path: getAppDbPath(id, appId, dbName) });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

// POST /api/instances/:id/db/:appId/:dbName/exec {sql, params}
app.post('/api/instances/:id/db/:appId/:dbName/exec', (req, res) => {
  try {
    const { id, appId, dbName } = req.params;
    const { sql, params = [] } = req.body;
    if (!sql) return res.status(400).json({ error: 'Missing sql' });
    const db = getDB(id, appId, dbName);
    if (db._isMock) {
      const result = db.exec(sql, params);
      if (Array.isArray(result)) return res.json({ rows: result });
      return res.json(result);
    }
    const stmt = db.prepare(sql);
    const isSelect = /^\s*SELECT/i.test(sql);
    if (isSelect) {
      const rows = stmt.all(...params);
      res.json({ rows });
    } else {
      const info = stmt.run(...params);
      res.json({ lastInsertRowid: info.lastInsertRowid, changes: info.changes });
    }
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/instances/:id/db/:appId/:dbName/dump
app.get('/api/instances/:id/db/:appId/:dbName/dump', (req, res) => {
  try {
    const { id, appId, dbName } = req.params;
    const db = getDB(id, appId, dbName);
    if (db._isMock) {
      const jsonPath = getAppDbPath(id, appId, dbName) + '.json';
      const data = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf-8') : '{}';
      return res.json({ dump: data });
    }
    const dump = db.prepare("SELECT sql FROM sqlite_master WHERE type='table'").all();
    res.json({ dump });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// DELETE /api/instances/:id/db/:appId/:dbName
app.delete('/api/instances/:id/db/:appId/:dbName', (req, res) => {
  try {
    const { id, appId, dbName } = req.params;
    const key = `${id}:${appId}:${dbName}`;
    const db = dbCache.get(key);
    if (db && !db._isMock) db.close();
    dbCache.delete(key);
    const p = getAppDbPath(id, appId, dbName);
    try { fs.unlinkSync(p); } catch {}
    try { fs.unlinkSync(p + '.json'); } catch {}
    try { fs.unlinkSync(p + '-wal'); } catch {}
    try { fs.unlinkSync(p + '-shm'); } catch {}
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// List DBs for instance/app
app.get('/api/instances/:id/db', (req, res) => {
  const id = req.params.id;
  const base = path.join(getInstancePath(id), 'db');
  if (!fs.existsSync(base)) return res.json([]);
  const result = [];
  const apps = fs.readdirSync(base);
  for (const appId of apps) {
    const appPath = path.join(base, appId);
    if (!fs.statSync(appPath).isDirectory()) continue;
    const files = fs.readdirSync(appPath).filter((f) => f.endsWith('.sqlite') || f.endsWith('.json'));
    for (const f of files) result.push({ appId, dbName: f.replace(/\.sqlite$|\.json$/,''), file: f });
  }
  res.json(result);
});

app.get('/api/instances/:id/db/:appId', (req, res) => {
  const { id, appId } = req.params;
  const base = path.join(getInstancePath(id), 'db', appId);
  if (!fs.existsSync(base)) return res.json([]);
  const files = fs.readdirSync(base).filter((f) => f.endsWith('.sqlite') || f.endsWith('.json'));
  res.json(files.map((f) => ({ dbName: f.replace(/\.sqlite$|\.json$/,''), file: f })));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Sandbox-DB + FS mock listening on http://localhost:${PORT}`);
  console.log(`Data root: ${DATA_ROOT}`);
  console.log(`Per-app DB at /api/instances/:id/db/:appId/:dbName`);
});
