import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getTrainingSession } from "@/lib/db/sessions-store";
import { cleanSpeechText } from "@/lib/speech-cleanup";
import { OpenAISpeechToTextService } from "@/lib/services/speech-to-text-service";

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

  const formData = await request.formData();
  const audio = formData.get("audio");
  const textInput = cleanSpeechText(String(formData.get("text") ?? ""));

  if (textInput) {
    return NextResponse.json({ sellerText: textInput });
  }

  if (!(audio instanceof Blob)) {
    return NextResponse.json(
      { error: "Aucune parole vendeur detectee." },
      { status: 400 }
    );
  }

  const stt = new OpenAISpeechToTextService();
  const sellerText = cleanSpeechText(await stt.transcribe(audio));

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

  return NextResponse.json({ sellerText });
}

function isUnusableTranscription(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 90) return true;

  const unique = new Set(words.map((word) => word.toLowerCase()));
  return words.length > 35 && unique.size / words.length < 0.45;
}
