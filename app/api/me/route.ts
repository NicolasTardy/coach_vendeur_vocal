import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteUser, getUserById } from "@/lib/db/users";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ user: null });
  }
  const user = getUserById(session.userId);
  if (!user) {
    session.destroy();
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { id: user.id, pseudo: user.pseudo, createdAt: user.createdAt }
  });
}

export async function DELETE() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }
  deleteUser(session.userId);
  session.destroy();
  return NextResponse.json({ ok: true });
}
