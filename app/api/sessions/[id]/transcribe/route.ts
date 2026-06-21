import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getTrainingSession } from "@/lib/db/sessions-store";
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
  const textInput = String(formData.get("text") ?? "").trim();

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
  const sellerText = (await stt.transcribe(audio)).trim();

  if (!sellerText) {
    return NextResponse.json(
      { error: "Aucune parole vendeur detectee." },
      { status: 400 }
    );
  }

  return NextResponse.json({ sellerText });
}
