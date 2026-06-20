import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getReportById } from "@/lib/db/reports";
import { getScenario } from "@/lib/scenarios";
import { renderReportPdf } from "@/lib/pdf/report-pdf";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const auth = await getSession();
  if (!auth.userId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  const { id } = await params;
  const stored = getReportById(id);
  if (!stored || stored.userId !== auth.userId) {
    return NextResponse.json({ error: "Rapport introuvable." }, { status: 404 });
  }

  const scenario = getScenario(stored.scenarioId);
  const pdfBuffer = await renderReportPdf({
    report: stored.report,
    scenarioTitle: scenario?.title ?? stored.scenarioId,
    pseudo: auth.pseudo ?? "anonyme",
    createdAt: stored.createdAt
  });

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-${stored.id}.pdf"`
    }
  });
}
