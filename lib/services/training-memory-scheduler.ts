import type { FinalReport } from "@/lib/types";

export function scheduleReviews(report: FinalReport) {
  return report.spacedPlan.map((item) => ({
    id: crypto.randomUUID(),
    when: item.when,
    task: item.task,
    createdAt: new Date().toISOString()
  }));
}
