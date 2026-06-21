import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";

const schema = z.object({
  password: z.string().trim().min(1)
});

const clientVoicePassword = process.env.CLIENT_VOICE_PASSWORD ?? "beleket";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success || parsed.data.password !== clientVoicePassword) {
    return NextResponse.json(
      { error: "Mot de passe voix incorrect." },
      { status: 403 }
    );
  }

  session.clientVoiceUnlocked = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
