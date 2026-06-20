import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getTrainingSession, updateTrainingSession } from "@/lib/db/sessions-store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const auth = await getSession();
  if (!auth.userId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  const { id } = await params;
  const session = getTrainingSession(id);
  if (!session || session.userId !== auth.userId) {
    return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  }

  const { turnIndex } = (await request.json()) as { turnIndex?: number };
  const safeIndex = Math.max(
    0,
    Math.min(Number(turnIndex ?? 0), session.transcript.length)
  );

  session.replayFromTurnIndex = safeIndex;
  session.transcript = session.transcript.slice(0, safeIndex + 1);
  session.endedAt = undefined;
  session.finalReport = undefined;
  session.scores = undefined;

  const persisted = updateTrainingSession(session);
  return NextResponse.json({ session: persisted });
}
