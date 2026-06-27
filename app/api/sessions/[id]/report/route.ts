import { NextResponse } from "next/server";
import { getScenario } from "@/lib/scenarios";
import { getSession } from "@/lib/auth/session";
import { getTrainingSession, updateTrainingSession } from "@/lib/db/sessions-store";
import { saveReport } from "@/lib/db/reports";
import { OpenAICoachAnalysisEngine } from "@/lib/services/coach-analysis-engine";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
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

  const coach = new OpenAICoachAnalysisEngine();
  const report = await coach.analyze({
    scenario,
    transcript: session.transcript,
    mode: session.mode,
    focusService: session.focusService
  });

  session.endedAt = new Date().toISOString();
  session.scores = report.score;
  session.finalReport = report;
  updateTrainingSession(session);

  const stored = saveReport({
    sessionId: session.id,
    userId: session.userId,
    scenarioId: session.scenarioId,
    report
  });

  return NextResponse.json({ report: stored.report, session, reportId: stored.id });
}
