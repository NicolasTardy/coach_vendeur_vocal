import { getDb } from "@/lib/db/sqlite";
import type { FinalReport } from "@/lib/types";

export type StoredReport = {
  id: string;
  sessionId: string;
  userId: string;
  scenarioId: string;
  globalScore: number;
  summary: string;
  report: FinalReport;
  createdAt: string;
};

type Row = {
  id: string;
  session_id: string;
  user_id: string;
  scenario_id: string;
  global_score: number;
  summary: string;
  payload_json: string;
  created_at: string;
};

function fromRow(row: Row): StoredReport {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    scenarioId: row.scenario_id,
    globalScore: row.global_score,
    summary: row.summary,
    report: JSON.parse(row.payload_json) as FinalReport,
    createdAt: row.created_at
  };
}

export function saveReport(args: {
  sessionId: string;
  userId: string;
  scenarioId: string;
  report: FinalReport;
}): StoredReport {
  const db = getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const cleanReport: FinalReport = { ...args.report, rawText: "" };

  db.prepare(
    `INSERT OR REPLACE INTO reports
     (id, session_id, user_id, scenario_id, global_score, summary, payload_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    args.sessionId,
    args.userId,
    args.scenarioId,
    cleanReport.score.global,
    cleanReport.summary,
    JSON.stringify(cleanReport),
    createdAt
  );

  return {
    id,
    sessionId: args.sessionId,
    userId: args.userId,
    scenarioId: args.scenarioId,
    globalScore: cleanReport.score.global,
    summary: cleanReport.summary,
    report: cleanReport,
    createdAt
  };
}

export function listReportsForUser(userId: string): StoredReport[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Row[];
  return rows.map(fromRow);
}

export function getReportById(id: string): StoredReport | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(id) as
    | Row
    | undefined;
  return row ? fromRow(row) : null;
}
