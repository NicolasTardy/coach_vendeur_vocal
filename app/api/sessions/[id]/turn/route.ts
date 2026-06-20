import { NextResponse } from "next/server";
import { getScenario } from "@/lib/scenarios";
import { ClientPersonaEngine } from "@/lib/services/conversation-engine";
import { OpenAISpeechToTextService } from "@/lib/services/speech-to-text-service";
import { OpenAITextToSpeechService } from "@/lib/services/text-to-speech-service";
import { localStore } from "@/lib/storage/local-store";
import type { TranscriptTurn } from "@/lib/types";

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

  const scenario = getScenario(session.scenarioId);

  if (!scenario) {
    return NextResponse.json({ error: "Scenario introuvable." }, { status: 404 });
  }

  const formData = await request.formData();
  const textInput = String(formData.get("text") ?? "").trim();
  const audio = formData.get("audio");

  let sellerText = textInput;

  if (!sellerText && audio instanceof Blob) {
    const stt = new OpenAISpeechToTextService();
    sellerText = (await stt.transcribe(audio)).trim();
  }

  if (!sellerText) {
    return NextResponse.json(
      { error: "Aucune parole vendeur detectee." },
      { status: 400 }
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
  const clientText = await engine.reply({
    scenario,
    transcript: session.transcript,
    sellerText
  });

  const tts = new OpenAITextToSpeechService();
  const audioUrl = await tts.synthesize(clientText);
  const clientTurn: TranscriptTurn = {
    id: crypto.randomUUID(),
    speaker: "client",
    text: clientText,
    timestamp: new Date().toISOString(),
    audioUrl: audioUrl ?? undefined,
    contextIndex: session.transcript.length + 1
  };

  session.transcript = [...session.transcript, sellerTurn, clientTurn];
  await localStore.updateSession(session);

  return NextResponse.json({
    sellerText,
    clientTurn,
    session
  });
}
