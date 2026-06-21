import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userId?: string;
  pseudo?: string;
  clientVoiceUnlocked?: boolean;
};

const password =
  process.env.SESSION_SECRET ??
  "dev_only_secret_change_me_please_change_in_production_32chars_min";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET requis en production (au moins 32 caracteres).");
}

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "coach_vente_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session.userId) {
    throw new Response("Non authentifie.", { status: 401 });
  }
  return { userId: session.userId, pseudo: session.pseudo ?? "" };
}
