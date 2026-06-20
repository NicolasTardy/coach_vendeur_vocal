import { getDb } from "@/lib/db/sqlite";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type DbUser = {
  id: string;
  pseudo: string;
  passwordHash: string;
  createdAt: string;
};

type Row = {
  id: string;
  pseudo: string;
  password_hash: string;
  created_at: string;
};

function fromRow(row: Row): DbUser {
  return {
    id: row.id,
    pseudo: row.pseudo,
    passwordHash: row.password_hash,
    createdAt: row.created_at
  };
}

export async function createUser(pseudo: string, password: string): Promise<DbUser> {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM users WHERE pseudo = ?")
    .get(pseudo);
  if (existing) {
    throw new Error("PSEUDO_TAKEN");
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const createdAt = new Date().toISOString();

  db.prepare(
    "INSERT INTO users (id, pseudo, password_hash, created_at) VALUES (?, ?, ?, ?)"
  ).run(id, pseudo, passwordHash, createdAt);

  return { id, pseudo, passwordHash, createdAt };
}

export async function authenticateUser(
  pseudo: string,
  password: string
): Promise<DbUser | null> {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE pseudo = ?")
    .get(pseudo) as Row | undefined;
  if (!row) return null;
  const ok = await verifyPassword(password, row.password_hash);
  return ok ? fromRow(row) : null;
}

export function getUserById(id: string): DbUser | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | Row
    | undefined;
  return row ? fromRow(row) : null;
}

export function deleteUser(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
}
