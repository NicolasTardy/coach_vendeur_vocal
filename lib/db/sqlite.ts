import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dbDir = path.join(process.cwd(), "data");
mkdirSync(dbDir, { recursive: true });

const dbPath = process.env.SQLITE_PATH ?? path.join(dbDir, "coach_vente.db");

declare global {
  // eslint-disable-next-line no-var
  var __coachVenteDb: Database.Database | undefined;
}

function createDb() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      pseudo TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      scenario_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      transcript_json TEXT NOT NULL DEFAULT '[]',
      replay_from_turn_index INTEGER
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      scenario_id TEXT NOT NULL,
      global_score INTEGER NOT NULL,
      summary TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id, created_at DESC);
  `);

  ensureColumn(db, "sessions", "difficulty", "TEXT");
  ensureColumn(db, "sessions", "mode", "TEXT");
  ensureColumn(db, "sessions", "focus_service", "TEXT");
}

// Ajoute une colonne si elle manque (SQLite n'a pas d'ADD COLUMN IF NOT EXISTS).
function ensureColumn(
  db: Database.Database,
  table: string,
  column: string,
  type: string
) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
  }>;
  if (!columns.some((col) => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

export function getDb(): Database.Database {
  if (!globalThis.__coachVenteDb) {
    globalThis.__coachVenteDb = createDb();
  }
  return globalThis.__coachVenteDb;
}
