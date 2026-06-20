import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/db/users";
import { getSession } from "@/lib/auth/session";

const schema = z.object({
  pseudo: z
    .string()
    .trim()
    .min(2, "Pseudo trop court")
    .max(24, "Pseudo trop long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Lettres, chiffres, tiret et underscore uniquement"),
  password: z.string().min(6, "Mot de passe trop court (6 min)").max(72)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides." },
      { status: 400 }
    );
  }

  try {
    const user = await createUser(parsed.data.pseudo, parsed.data.password);
    const session = await getSession();
    session.userId = user.id;
    session.pseudo = user.pseudo;
    await session.save();
    return NextResponse.json({ user: { id: user.id, pseudo: user.pseudo } });
  } catch (error) {
    if (error instanceof Error && error.message === "PSEUDO_TAKEN") {
      return NextResponse.json({ error: "Pseudo deja pris." }, { status: 409 });
    }
    console.error("signup failed", error);
    return NextResponse.json(
      { error: "Inscription impossible." },
      { status: 500 }
    );
  }
}
