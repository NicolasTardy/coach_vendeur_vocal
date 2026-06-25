import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getTrainingSession } from "@/lib/db/sessions-store";
import { OpenAITextToSpeechService } from "@/lib/services/text-to-speech-service";

type Params = {
  params: Promise<{ id: string }>;
};

const schema = z.object({
  text: z.string().trim().min(1).max(600)
});

// Synthese audio a la demande pour une replique client deja affichee (ex: la
// phrase d'ouverture, generee avant le deverrouillage de la voix). L'audio
// n'est jamais persiste; on le renvoie juste pour la lecture.
export async function POST(request: Request, { params }: Params) {
  const auth = await getSession();
  if (!auth.userId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }
  if (auth.clientVoiceUnlocked !== true) {
    return NextResponse.json({ error: "Voix client non activee." }, { status: 403 });
  }

  const { id } = await params;
  const session = getTrainingSession(id);
  if (!session || session.userId !== auth.userId) {
    return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Texte invalide." }, { status: 400 });
  }

  const tts = new OpenAITextToSpeechService();
  try {
    const audioUrl = await tts.synthesize(parsed.data.text);
    if (!audioUrl) {
      return NextResponse.json({ error: "Synthese indisponible." }, { status: 502 });
    }
    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("speak synthesis failed", error);
    return NextResponse.json({ error: "Synthese echouee." }, { status: 502 });
  }
}
