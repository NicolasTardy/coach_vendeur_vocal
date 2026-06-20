import { NextResponse } from "next/server";
import { getScenario } from "@/lib/scenarios";
import { OpenAICoachAnalysisEngine } from "@/lib/services/coach-analysis-engine";
import { localStore } from "@/lib/storage/local-store";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await localStore.getSession(id);

  if (!session) {
    return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  }

  const scenario = getScenario(session.scenarioId);

  if (!scenario) {
    return NextResponse.json({ error: "Scenario introuvable." }, { status: 404 });
  }

  const coach = new OpenAICoachAnalysisEngine();
  const report = await coach.analyze({
    scenario,
    transcript: session.transcript
  });

  session.endedAt = new Date().toISOString();
  session.scores = report.score;
  session.finalReport = report;
  await localStore.updateSession(session);

  return NextResponse.json({ report, session });
}
