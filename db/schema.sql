CREATE TABLE users (
  id TEXT PRIMARY KEY,
  pseudo TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'seller',
  store TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scenarios (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  client_persona TEXT NOT NULL,
  visible_need TEXT NOT NULL,
  hidden_need TEXT NOT NULL,
  budget TEXT NOT NULL,
  objections JSONB NOT NULL,
  expected_skills JSONB NOT NULL,
  success_criteria JSONB NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  replay_from_turn_index INTEGER
);

CREATE TABLE transcript_turns (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT,
  context_index INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  global_score INTEGER NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scheduled_reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  due_at TIMESTAMPTZ NOT NULL,
  task TEXT NOT NULL,
  completed_at TIMESTAMPTZ
);
