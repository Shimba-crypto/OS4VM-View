import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, Trash2, RotateCcw } from 'lucide-react';
import { getAppDB } from '../../../lib/db';

interface Session {
  id: number;
  start_ms: number;
  end_ms: number | null;
  seconds: number;
  task: string;
  app: string;
}

export default function TimeTrackerApp({ windowId }: { windowId: string }) {
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState('general');
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalToday, setTotalToday] = useState(0);
  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    loadSessions();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const loadSessions = async () => {
    try {
      const db = await getAppDB('time-tracker', 'app');
      await db.exec(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_ms INTEGER,
        end_ms INTEGER,
        seconds REAL,
        task TEXT,
        app TEXT
      )`);
      const rows = await db.query('SELECT * FROM sessions ORDER BY id DESC LIMIT 50');
      setSessions(rows);
      const today = new Date().setHours(0, 0, 0, 0);
      const todayTotal = rows
        .filter((s: Session) => s.start_ms >= today && s.end_ms !== null)
        .reduce((sum: number, s: Session) => sum + (s.seconds || 0), 0);
      setTotalToday(todayTotal);
    } catch {}
  };

  const start = () => {
    setRunning(true);
    startRef.current = Date.now();
    setElapsed(0);
    timerRef.current = window.setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 100);
  };

  const stop = async () => {
    setRunning(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const endMs = Date.now();
    const seconds = (endMs - startRef.current) / 1000;
    try {
      const db = await getAppDB('time-tracker', 'app');
      await db.exec(
        'INSERT INTO sessions (start_ms, end_ms, seconds, task, app) VALUES (?,?,?,?,?)',
        [startRef.current, endMs, seconds, task, task]
      );
      await loadSessions();
    } catch {}
    setElapsed(0);
  };

  const reset = () => {
    setRunning(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setElapsed(0);
  };

  const deleteSession = async (id: number) => {
    try {
      const db = await getAppDB('time-tracker', 'app');
      await db.exec('DELETE FROM sessions WHERE id = ?', [id]);
      await loadSessions();
    } catch {}
  };

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0f0f23', color: '#e0e0e0', fontFamily: "'Courier New', monospace", fontSize: 12 }}>
      <div style={{ padding: 12, background: '#16213e', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Clock size={18} color="#7c6bf5" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Time Tracker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Task name"
            style={{ flex: 1, background: '#0f0f23', border: '1px solid #333', borderRadius: 4, padding: '6px 10px', color: '#e0e0e0', fontFamily: 'inherit', fontSize: 12, outline: 'none' }} />
          {!running ? (
            <button onClick={start}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 4, background: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
              <Play size={14} /> Start
            </button>
          ) : (
            <button onClick={stop}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 4, background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
              <Square size={14} /> Stop
            </button>
          )}
          {elapsed > 0 && !running && (
            <button onClick={reset}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#888', fontSize: 12, border: 'none', cursor: 'pointer' }}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 22, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>{fmt(elapsed || totalToday)}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{running ? '⏱ Running' : `Today: ${fmt(totalToday)}`}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 10 }}>
        {sessions.length === 0 && (
          <div style={{ fontSize: 12, color: '#666', textAlign: 'center', paddingTop: 30 }}>No sessions yet. Start tracking!</div>
        )}
        {sessions.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 4, background: '#16213e', border: '1px solid #333', marginBottom: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.task}</div>
              <div style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{new Date(s.start_ms).toLocaleString()}</div>
            </div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#7c6bf5', fontWeight: 700 }}>{fmt(s.seconds)}</div>
            <button onClick={() => deleteSession(s.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
