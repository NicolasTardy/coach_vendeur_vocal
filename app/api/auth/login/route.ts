import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser } from "@/lib/db/users";
import { getSession } from "@/lib/auth/session";

const schema = z.object({
  pseudo: z.string().trim().min(2).max(24),
  password: z.string().min(1).max(72)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const user = await authenticateUser(parsed.data.pseudo, parsed.data.password);
  if (!user) {
    return NextResponse.json(
      { error: "Pseudo ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.pseudo = user.pseudo;
  await session.save();
  return NextResponse.json({ user: { id: user.id, pseudo: user.pseudo } });
}
