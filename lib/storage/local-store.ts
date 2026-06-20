import { promises as fs } from "node:fs";
import path from "node:path";
import type { TrainingSession, User } from "@/lib/types";

type StoreShape = {
  users: User[];
  sessions: TrainingSession[];
};

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "simuvente.json");

async function ensureStore(): Promise<StoreShape> {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw) as StoreShape;
  } catch {
    const initial: StoreShape = { users: [], sessions: [] };
    await fs.writeFile(dataFile, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function writeStore(store: StoreShape) {
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2));
}

export const localStore = {
  async upsertAnonymousUser(pseudo: string): Promise<User> {
    const store = await ensureStore();
    const existing = store.users.find(
      (user) => user.pseudo.toLowerCase() === pseudo.toLowerCase()
    );

    if (existing) {
      return existing;
    }

    const user: User = {
      id: crypto.randomUUID(),
      pseudo,
      role: "seller",
      createdAt: new Date().toISOString()
    };

    store.users.push(user);
    await writeStore(store);
    return user;
  },

  async createSession(session: TrainingSession) {
    const store = await ensureStore();
    store.sessions.push(session);
    await writeStore(store);
    return session;
  },

  async getSession(sessionId: string) {
    const store = await ensureStore();
    return store.sessions.find((session) => session.id === sessionId) ?? null;
  },

  async updateSession(session: TrainingSession) {
    const store = await ensureStore();
    const index = store.sessions.findIndex((item) => item.id === session.id);

    if (index === -1) {
      store.sessions.push(session);
    } else {
      store.sessions[index] = session;
    }

    await writeStore(store);
    return session;
  },

  async latestSessionForPseudo(pseudo: string) {
    const store = await ensureStore();
    return [...store.sessions]
      .reverse()
      .find((session) => session.pseudo.toLowerCase() === pseudo.toLowerCase());
  }
};
