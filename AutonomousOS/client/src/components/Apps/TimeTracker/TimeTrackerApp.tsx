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
    <div className="w-full h-full flex flex-col bg-au-bg">
      <div className="p-4 bg-au-surface border-b border-au-border">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="w-5 h-5 text-au-accent" />
          <span className="text-[14px] font-semibold text-au-text">Time Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Task name"
            className="flex-1 bg-au-bg border border-au-border rounded-lg px-3 py-2 text-[13px] text-au-text font-mono outline-none focus:border-au-accent" />
          {!running ? (
            <button onClick={start}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-au-success/20 text-au-success text-[12px] font-medium hover:bg-au-success/30">
              <Play className="w-3.5 h-3.5" /> Start
            </button>
          ) : (
            <button onClick={stop}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-au-danger/20 text-au-danger text-[12px] font-medium hover:bg-au-danger/30">
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          )}
          {elapsed > 0 && !running && (
            <button onClick={reset}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 text-au-muted text-[12px] hover:bg-white/10">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="text-2xl font-mono text-au-text font-bold tracking-wider">{fmt(elapsed || totalToday)}</div>
          <div className="text-[11px] text-au-muted">{running ? '⏱ Running' : `Today: ${fmt(totalToday)}`}</div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {sessions.length === 0 && (
          <div className="text-[12px] text-au-muted text-center pt-8">No sessions yet. Start tracking!</div>
        )}
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-au-surface border border-au-border mb-1.5 hover:border-au-borderHover">
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-au-text font-medium truncate">{s.task}</div>
              <div className="text-[10px] text-au-muted font-mono">{new Date(s.start_ms).toLocaleString()}</div>
            </div>
            <div className="text-[13px] font-mono text-au-accent font-bold">{fmt(s.seconds)}</div>
            <button onClick={() => deleteSession(s.id)} className="p-1 hover:bg-white/10 rounded text-au-muted hover:text-au-danger">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
