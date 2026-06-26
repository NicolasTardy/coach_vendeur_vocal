import { NextResponse } from "next/server";
import { getScenario } from "@/lib/scenarios";
import { getSession } from "@/lib/auth/session";
import { getTrainingSession, updateTrainingSession } from "@/lib/db/sessions-store";
import { ClientPersonaEngine } from "@/lib/services/conversation-engine";
import { buildLiveHint } from "@/lib/services/live-hint";
import { maxClientTurns, maxSellerTurns } from "@/lib/session-config";
import { OpenAISpeechToTextService } from "@/lib/services/speech-to-text-service";
import { OpenAITextToSpeechService } from "@/lib/services/text-to-speech-service";
import { cleanSpeechText } from "@/lib/speech-cleanup";
import type { TranscriptTurn } from "@/lib/types";

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

  const scenario = getScenario(session.scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Scenario introuvable." }, { status: 404 });
  }

  const MAX_SELLER_TURNS = maxSellerTurns(session.mode);
  const MAX_CLIENT_TURNS = maxClientTurns(session.mode);

  const sellerTurnsCount = session.transcript.filter(
    (turn) => turn.speaker === "seller"
  ).length;
  const clientTurnsCount = session.transcript.filter(
    (turn) => turn.speaker === "client"
  ).length;

  if (sellerTurnsCount >= MAX_SELLER_TURNS) {
    return NextResponse.json(
      {
        error: `Limite de ${MAX_SELLER_TURNS} prises de parole vendeur atteinte.`
      },
      { status: 409 }
    );
  }

  const formData = await request.formData();
  const textInput = cleanSpeechText(String(formData.get("text") ?? ""));
  const audio = formData.get("audio");
  const shouldGenerateAudio =
    String(formData.get("includeAudio") ?? "") === "true" &&
    auth.clientVoiceUnlocked === true;

  let sellerText = textInput;
  if (!sellerText && audio instanceof Blob) {
    const stt = new OpenAISpeechToTextService();
    try {
      sellerText = cleanSpeechText(await stt.transcribe(audio));
    } catch (error) {
      console.error("turn transcription failed", error);
      sellerText = "";
    }
  }

  if (!sellerText) {
    return NextResponse.json(
      { error: "Aucune parole vendeur detectee." },
      { status: 400 }
    );
  }

  if (isUnusableTranscription(sellerText)) {
    return NextResponse.json(
      {
        error:
          "Transcription instable. Reessaie en parlant plus court, ou utilise la saisie texte.",
        sellerText: sellerText.slice(0, 260)
      },
      { status: 422 }
    );
  }

  if (isTooShortTranscription(sellerText)) {
    return NextResponse.json(
      {
        error:
          "Transcription trop courte. Le micro a capte seulement un fragment, reessaie en parlant apres le bip mentalement puis attends une seconde avant d'arreter.",
        sellerText
      },
      { status: 422 }
    );
  }

  if (isLikelyIncompleteSellerText(sellerText)) {
    return NextResponse.json(
      {
        error:
          "Phrase vendeur incomplete. Reessaie avant de continuer la simulation.",
        sellerText
      },
      { status: 422 }
    );
  }

  const now = new Date().toISOString();
  const sellerTurn: TranscriptTurn = {
    id: crypto.randomUUID(),
    speaker: "seller",
    text: sellerText,
    timestamp: now,
    contextIndex: session.transcript.length
  };

  const engine = new ClientPersonaEngine();
  let responseClientTurn: TranscriptTurn | undefined;
  let audioUrl: string | null = null;

  if (clientTurnsCount < MAX_CLIENT_TURNS) {
    const clientText = await engine.reply({
      scenario,
      transcript: [...session.transcript, sellerTurn],
      sellerText,
      difficulty: session.difficulty,
      focusService: session.focusService,
      maxTurns: MAX_CLIENT_TURNS
    });

    if (shouldGenerateAudio) {
      const tts = new OpenAITextToSpeechService();
      try {
        audioUrl = await tts.synthesize(clientText);
      } catch (error) {
        console.error("TTS synthesis failed", error);
      }
    }

    const clientTurn: TranscriptTurn = {
      id: crypto.randomUUID(),
      speaker: "client",
      text: clientText,
      timestamp: new Date().toISOString(),
      contextIndex: session.transcript.length + 1
    };
    responseClientTurn = {
      ...clientTurn,
      audioUrl: audioUrl ?? undefined
    };
  }

  session.transcript = responseClientTurn
    ? [...session.transcript, sellerTurn, { ...responseClientTurn, audioUrl: undefined }]
    : [...session.transcript, sellerTurn];
  const persisted = updateTrainingSession(session);

  // Indice per-tour a estompage (selon la difficulte/maitrise).
  const liveHint = buildLiveHint(
    scenario,
    persisted.transcript,
    session.difficulty ?? "neutre"
  );

  return NextResponse.json({
    sellerText,
    clientTurn: responseClientTurn,
    session: persisted,
    liveHint,
    maxTurnsReached:
      sellerTurnsCount + 1 >= MAX_SELLER_TURNS ||
      clientTurnsCount >= MAX_CLIENT_TURNS
  });
}

function isLikelyIncompleteSellerText(text: string) {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[.!?…]+$/g, "")
    .replace(/\s+/g, " ");
  const words = normalized.split(" ").filter(Boolean);
  const incompleteEndings = [
    "alors justement",
    "puisque",
    "parce que",
    "et que",
    "que",
    "quand",
    "si",
    "avec",
    "sans",
    "pour",
    "sur",
    "dans",
    "de",
    "d'",
    "d",
    "j",
    "j'",
    "je",
    "l",
    "l'",
    "m",
    "m'",
    "n",
    "n'",
    "qu'",
    "pour ca j",
    "pour ça j"
  ];

  if (incompleteEndings.some((ending) => normalized.endsWith(ending))) {
    return true;
  }

  return false;
}

function isTooShortTranscription(text: string) {
  const normalized = text
    .trim()
    .replace(/^[-–—\s]+/, "")
    .replace(/\s+/g, " ");
  const words = normalized.split(" ").filter(Boolean);
  return words.length < 4;
}

function isUnusableTranscription(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 90) return true;

  const unique = new Set(words.map((word) => word.toLowerCase()));
  return words.length > 35 && unique.size / words.length < 0.45;
}
