import { NextResponse } from "next/server";
import { localStore } from "@/lib/storage/local-store";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await localStore.getSession(id);

  if (!session) {
    return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  }

  const { turnIndex } = (await request.json()) as { turnIndex?: number };
  const safeIndex = Math.max(0, Math.min(Number(turnIndex ?? 0), session.transcript.length));

  session.replayFromTurnIndex = safeIndex;
  session.transcript = session.transcript.slice(0, safeIndex + 1);
  session.endedAt = undefined;
  session.finalReport = undefined;
  session.scores = undefined;

  await localStore.updateSession(session);
  return NextResponse.json({ session });
}
