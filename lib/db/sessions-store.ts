import { getDb } from "@/lib/db/sqlite";
import type {
  ClientDifficulty,
  ServiceKey,
  SessionMode,
  TrainingSession,
  TranscriptTurn
} from "@/lib/types";

type Row = {
  id: string;
  user_id: string;
  scenario_id: string;
  difficulty: string | null;
  mode: string | null;
  focus_service: string | null;
  started_at: string;
  ended_at: string | null;
  transcript_json: string;
  replay_from_turn_index: number | null;
  pseudo: string;
};

function stripAudio(turns: TranscriptTurn[]): TranscriptTurn[] {
  return turns.map(({ audioUrl: _audioUrl, ...rest }) => rest);
}

function fromRow(row: Row): TrainingSession {
  return {
    id: row.id,
    userId: row.user_id,
    pseudo: row.pseudo,
    scenarioId: row.scenario_id,
    difficulty: (row.difficulty as ClientDifficulty | null) ?? undefined,
    mode: (row.mode as SessionMode | null) ?? undefined,
    focusService: (row.focus_service as ServiceKey | null) ?? undefined,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    transcript: JSON.parse(row.transcript_json) as TranscriptTurn[],
    replayFromTurnIndex: row.replay_from_turn_index ?? undefined
  };
}

const SELECT_WITH_PSEUDO = `
  SELECT s.*, u.pseudo
  FROM sessions s
  JOIN users u ON u.id = s.user_id
`;

export function createTrainingSession(session: TrainingSession): TrainingSession {
  const db = getDb();
  const transcript = stripAudio(session.transcript);
  db.prepare(
    `INSERT INTO sessions
     (id, user_id, scenario_id, difficulty, mode, focus_service, started_at, ended_at, transcript_json, replay_from_turn_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    session.id,
    session.userId,
    session.scenarioId,
    session.difficulty ?? null,
    session.mode ?? null,
    session.focusService ?? null,
    session.startedAt,
    session.endedAt ?? null,
    JSON.stringify(transcript),
    session.replayFromTurnIndex ?? null
  );
  return { ...session, transcript };
}

export function getTrainingSession(id: string): TrainingSession | null {
  const db = getDb();
  const row = db
    .prepare(`${SELECT_WITH_PSEUDO} WHERE s.id = ?`)
    .get(id) as Row | undefined;
  return row ? fromRow(row) : null;
}

export function updateTrainingSession(
  session: TrainingSession
): TrainingSession {
  const db = getDb();
  const transcript = stripAudio(session.transcript);
  db.prepare(
    `UPDATE sessions
     SET ended_at = ?, transcript_json = ?, replay_from_turn_index = ?
     WHERE id = ?`
  ).run(
    session.endedAt ?? null,
    JSON.stringify(transcript),
    session.replayFromTurnIndex ?? null,
    session.id
  );
  return { ...session, transcript };
}
