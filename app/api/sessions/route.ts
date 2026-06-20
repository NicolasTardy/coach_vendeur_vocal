import { NextResponse } from "next/server";
import { z } from "zod";
import { getScenario } from "@/lib/scenarios";
import { localStore } from "@/lib/storage/local-store";
import type { TrainingSession } from "@/lib/types";

const createSessionSchema = z.object({
  pseudo: z.string().trim().min(2).max(24),
  scenarioId: z.string().trim().min(1)
});

export async function POST(request: Request) {
  const parsed = createSessionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Pseudo ou scenario invalide." },
      { status: 400 }
    );
  }

  const scenario = getScenario(parsed.data.scenarioId);

  if (!scenario) {
    return NextResponse.json({ error: "Scenario introuvable." }, { status: 404 });
  }

  const user = await localStore.upsertAnonymousUser(parsed.data.pseudo);
  const session: TrainingSession = {
    id: crypto.randomUUID(),
    userId: user.id,
    pseudo: user.pseudo,
    scenarioId: scenario.id,
    startedAt: new Date().toISOString(),
    transcript: [
      {
        id: crypto.randomUUID(),
        speaker: "client",
        text: `Bonjour. Je regarde un peu. ${scenario.visibleNeed}, mais je veux etre sur de faire le bon choix.`,
        timestamp: new Date().toISOString(),
        contextIndex: 0
      }
    ]
  };

  await localStore.createSession(session);
  return NextResponse.json({ session, scenario });
}
