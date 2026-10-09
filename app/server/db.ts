import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Attempt, SessionInfo, SessionKind } from "../shared/engine/engine";

export interface StudentRow {
  id: number; token: string; name: string; email: string; whatsapp: string; created_at: number;
  destination: string | null; company: string | null; test_date: string | null; hours: string | null; language: string | null;
  goal_at: number | null; finish_confirmed_at: number | null;
  paid: "none" | "claimed" | "confirmed"; paid_at: number | null;
  next_session_at: string | null;
  outcome: string | null; outcome_topics: string | null; outcome_next: string | null; outcome_at: number | null;
}
export interface SessionRow {
  id: number; student_id: number; kind: SessionKind; created_at: number; finished_at: number | null;
  minutes: number | null; topic: string | null; plan: string | null; practice_ref: string | null; practice_done: string | null;
}
export interface AttemptRow {
  id: number; session_id: number; student_id: number; item_id: string; confidence: number | null; response: string;
  score: number | null; note: string; seconds: number | null; created_at: number; reviewed_at: number | null;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY, token TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, whatsapp TEXT NOT NULL,
  created_at INTEGER NOT NULL, destination TEXT, company TEXT, test_date TEXT, hours TEXT, language TEXT,
  goal_at INTEGER, finish_confirmed_at INTEGER, paid TEXT NOT NULL DEFAULT 'none', paid_at INTEGER,
  next_session_at TEXT, outcome TEXT, outcome_topics TEXT, outcome_next TEXT, outcome_at INTEGER
);
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES students(id), kind TEXT NOT NULL,
  created_at INTEGER NOT NULL, finished_at INTEGER, minutes INTEGER, topic TEXT, plan TEXT,
  practice_ref TEXT, practice_done TEXT
);
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY, session_id INTEGER NOT NULL REFERENCES sessions(id), student_id INTEGER NOT NULL REFERENCES students(id),
  item_id TEXT NOT NULL, confidence INTEGER, response TEXT NOT NULL, score INTEGER, note TEXT NOT NULL,
  seconds INTEGER, created_at INTEGER NOT NULL, reviewed_at INTEGER
);
CREATE INDEX IF NOT EXISTS attempts_student ON attempts(student_id);
CREATE INDEX IF NOT EXISTS sessions_student ON sessions(student_id);
`;

export function openDb(path: string) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return db;
}
export type Db = ReturnType<typeof openDb>;

/** Everything the engine needs about one student, in its own shapes. */
export function history(db: Db, studentId: number): { attempts: Attempt[]; sessions: SessionInfo[]; rows: SessionRow[] } {
  const rows = db.prepare("SELECT * FROM sessions WHERE student_id = ? ORDER BY id").all(studentId) as unknown as SessionRow[];
  const kinds = new Map(rows.map((r) => [r.id, r.kind]));
  const attempts = (db.prepare("SELECT * FROM attempts WHERE student_id = ? ORDER BY id").all(studentId) as unknown as AttemptRow[]).map((a) => ({
    itemId: a.item_id, score: a.score, note: a.note, at: a.created_at, sessionId: a.session_id, sessionKind: kinds.get(a.session_id) ?? "daily",
  }));
  // A fix or weekly check-in only counts once it's finished.
  const sessions: SessionInfo[] = rows
    .filter((r) => (r.kind === "fix" || r.kind === "weekly" ? r.finished_at !== null : true))
    .map((r) => ({ id: r.id, kind: r.kind, at: r.finished_at ?? r.created_at, topic: r.topic, practiceRef: r.practice_ref, practiceDone: r.practice_done }));
  return { attempts, sessions, rows };
}
