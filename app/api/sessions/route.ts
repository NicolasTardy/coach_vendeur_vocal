import { NextResponse } from "next/server";
import { z } from "zod";
import { getScenario } from "@/lib/scenarios";
import { getSession } from "@/lib/auth/session";
import { createTrainingSession } from "@/lib/db/sessions-store";
import { listReportsForUser } from "@/lib/db/reports";
import { getUserById } from "@/lib/db/users";
import { computeProgress } from "@/lib/services/mastery";
import { OpenAITextToSpeechService } from "@/lib/services/text-to-speech-service";
import type { TrainingSession } from "@/lib/types";

const createSessionSchema = z.object({
  scenarioId: z.string().trim().min(1),
  includeAudio: z.boolean().optional(),
  difficulty: z.enum(["ouvert", "neutre", "reticent", "presse"]).optional(),
  mode: z.enum(["full", "drill"]).optional(),
  focusService: z.enum(["cpay", "gld", "estaly"]).optional()
});

export async function POST(request: Request) {
  const auth = await getSession();
  if (!auth.userId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }
  const user = getUserById(auth.userId);
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 401 });
  }

  const parsed = createSessionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Scenario invalide." }, { status: 400 });
  }

  const scenario = getScenario(parsed.data.scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Scenario introuvable." }, { status: 404 });
  }
  const shouldGenerateAudio =
    parsed.data.includeAudio === true && auth.clientVoiceUnlocked === true;

  const progress = computeProgress(
    listReportsForUser(user.id)
      .filter((report) => report.report.discoveryReview)
      .map((report) => ({
        scenarioId: report.scenarioId,
        createdAt: report.createdAt,
        review: report.report.discoveryReview
      }))
  );

  // Difficulte: choix explicite du vendeur, sinon auto depuis sa maitrise.
  const difficulty = parsed.data.difficulty ?? progress.recommendedDifficulty;
  // Mode: vente complete par defaut. En drill, focus = reflexe le plus faible.
  const mode = parsed.data.mode ?? "full";
  const focusService =
    mode === "drill"
      ? parsed.data.focusService ?? progress.recommendation?.service ?? "cpay"
      : undefined;

  const greetingText = scenario.openingLine;

  let greetingAudioUrl: string | null = null;
  if (shouldGenerateAudio) {
    const tts = new OpenAITextToSpeechService();
    try {
      greetingAudioUrl = await tts.synthesize(greetingText);
    } catch (error) {
      console.error("Greeting TTS synthesis failed", error);
    }
  }

  const turnId = crypto.randomUUID();
  const persisted: TrainingSession = createTrainingSession({
    id: crypto.randomUUID(),
    userId: user.id,
    pseudo: user.pseudo,
    scenarioId: scenario.id,
    difficulty,
    mode,
    focusService,
    startedAt: new Date().toISOString(),
    transcript: [
      {
        id: turnId,
        speaker: "client",
        text: greetingText,
        timestamp: new Date().toISOString(),
        contextIndex: 0
      }
    ]
  });

  // Renvoyer l'audio au client sans le persister (non-stocke en base).
  const sessionForClient: TrainingSession = {
    ...persisted,
    transcript: persisted.transcript.map((turn, index) =>
      index === 0 && greetingAudioUrl
        ? { ...turn, audioUrl: greetingAudioUrl }
        : turn
    )
  };

  return NextResponse.json({ session: sessionForClient, scenario });
}
