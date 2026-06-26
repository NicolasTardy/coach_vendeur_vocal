import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listReportsForUser } from "@/lib/db/reports";
import { computeProgress } from "@/lib/services/mastery";

export async function GET() {
  const auth = await getSession();
  if (!auth.userId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  const sessions = listReportsForUser(auth.userId)
    .filter((report) => report.report.discoveryReview)
    .map((report) => ({
      scenarioId: report.scenarioId,
      createdAt: report.createdAt,
      review: report.report.discoveryReview
    }));

  return NextResponse.json(computeProgress(sessions));
}
