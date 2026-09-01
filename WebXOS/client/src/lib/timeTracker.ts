import { getDb } from '../lib/db';

interface TimeEntry {
  id?: number;
  start_ms: number;
  end_ms: number | null;
  seconds: number;
  task: string;
  app: string;
}

let sessionStart = Date.now();
let currentTask = 'session';

export function startSession(task: string) {
  sessionStart = Date.now();
  currentTask = task;
}

export async function endSession() {
  const db = await getDb('time-tracker');
  const now = Date.now();
  await db.exec(
    'INSERT INTO sessions (start_ms, end_ms, seconds, task, app) VALUES (?,?,?,?,?)',
    [sessionStart, now, (now - sessionStart) / 1000, currentTask, currentTask]
  );
}

export function getSessionSeconds(): number {
  return (Date.now() - sessionStart) / 1000;
}

export function getSessionTask(): string {
  return currentTask;
}
