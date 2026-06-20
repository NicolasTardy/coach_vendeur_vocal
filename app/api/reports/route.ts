import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listReportsForUser } from "@/lib/db/reports";
import { getScenario } from "@/lib/scenarios";

export async function GET() {
  const auth = await getSession();
  if (!auth.userId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  const reports = listReportsForUser(auth.userId).map((report) => ({
    id: report.id,
    scenarioId: report.scenarioId,
    scenarioTitle: getScenario(report.scenarioId)?.title ?? report.scenarioId,
    globalScore: report.globalScore,
    summary: report.summary,
    createdAt: report.createdAt
  }));

  return NextResponse.json({ reports });
}
