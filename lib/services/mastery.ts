import { scenarios } from "@/lib/scenarios";
import { recommendDifficulty } from "@/lib/services/difficulty";
import { SERVICE_LABELS } from "@/lib/services/signal-analysis";
import type { ClientDifficulty, DiscoveryReview, ServiceKey } from "@/lib/types";

// Boucle d'entrainement: on derive un niveau de maitrise par reflexe (Cpay, GLD,
// Estaly) depuis l'historique des sessions. C'est le mecanisme du sentiment
// d'efficacite (§12.2): progression VISIBLE + reussites attribuees a une
// strategie controlable. Tout est deterministe, calcule depuis discoveryReview.

const SERVICE_ORDER: ServiceKey[] = ["cpay", "gld", "estaly"];

// Fenetre des sessions recentes qui pese sur le niveau (automatisation = succes
// recent et constant, pas une bonne session ancienne).
const RECENT_WINDOW = 5;

export type OutcomeKind = "success" | "miss" | "error" | "abstain" | "none";

export type ReflexMastery = {
  service: ServiceKey;
  label: string;
  level: number; // 0..5
  trials: number;
  successes: number;
  recentStreak: number;
  trend: "up" | "flat" | "down";
  lastOutcome: OutcomeKind;
};

export type Recommendation = {
  service: ServiceKey;
  label: string;
  reason: string;
  scenarioId: string | null;
  scenarioTitle: string | null;
};

export type ProgressSummary = {
  totalSessions: number;
  mastery: ReflexMastery[];
  recommendation: Recommendation | null;
  recommendedDifficulty: ClientDifficulty;
};

export type MasterySession = {
  scenarioId: string;
  createdAt: string;
  review: DiscoveryReview;
};

// Verdict d'un service sur une session -> resultat. Captee et bonne abstention
// sont DEUX reussites: proposer au bon moment ET savoir s'abstenir comptent.
function outcomeFor(review: DiscoveryReview, service: ServiceKey): OutcomeKind {
  const entry = review.services.find((item) => item.service === service);
  if (!entry) {
    return "none";
  }
  switch (entry.verdict) {
    case "captee":
      return "success";
    case "bonne_abstention":
      return "abstain";
    case "manquee":
      return "miss";
    case "erreur_eligibilite":
      return "error";
  }
}

function isSuccess(outcome: OutcomeKind) {
  return outcome === "success" || outcome === "abstain";
}

// Plafond par experience: impossible d'etre "maitrise" sur une seule session.
function levelCap(trials: number) {
  if (trials >= 5) return 5;
  if (trials >= 3) return 4;
  if (trials >= 2) return 3;
  if (trials >= 1) return 2;
  return 0;
}

function computeReflex(
  service: ServiceKey,
  chronological: MasterySession[]
): ReflexMastery {
  const outcomes = chronological.map((session) => outcomeFor(session.review, service));
  const trials = outcomes.length;
  const successes = outcomes.filter(isSuccess).length;

  const recent = outcomes.slice(-RECENT_WINDOW);
  const recentSuccess = recent.filter(isSuccess).length;
  const recentRate = recent.length > 0 ? recentSuccess / recent.length : 0;
  const level = Math.min(Math.round(recentRate * 5), levelCap(trials));

  let recentStreak = 0;
  for (let i = outcomes.length - 1; i >= 0; i -= 1) {
    if (isSuccess(outcomes[i])) recentStreak += 1;
    else break;
  }

  // Tendance: fenetre recente vs la precedente.
  const prev = outcomes.slice(-(RECENT_WINDOW * 2), -RECENT_WINDOW);
  const prevRate =
    prev.length > 0 ? prev.filter(isSuccess).length / prev.length : recentRate;
  const trend: ReflexMastery["trend"] =
    recentRate > prevRate + 0.05 ? "up" : recentRate < prevRate - 0.05 ? "down" : "flat";

  return {
    service,
    label: SERVICE_LABELS[service],
    level,
    trials,
    successes,
    recentStreak,
    trend,
    lastOutcome: outcomes.at(-1) ?? "none"
  };
}

// Scenario d'entrainement ou ce service est pertinent ET cible: la ou le vendeur
// peut le travailler pour de vrai.
function scenarioForService(service: ServiceKey) {
  return (
    scenarios.find(
      (scenario) =>
        scenario.serviceEligibility.some(
          (item) => item.service === service && item.eligible
        ) &&
        scenario.serviceTargets.join(" ").toLowerCase().includes(serviceHint(service))
    ) ?? null
  );
}

function serviceHint(service: ServiceKey) {
  if (service === "cpay") return "cpay";
  if (service === "gld") return "gld";
  return "estaly";
}

function buildRecommendation(mastery: ReflexMastery[]): Recommendation | null {
  if (mastery.length === 0) {
    return null;
  }

  // Le reflexe le plus faible: niveau le plus bas, puis dernier resultat le pire.
  const severity: Record<OutcomeKind, number> = {
    error: 0,
    miss: 1,
    none: 2,
    abstain: 3,
    success: 4
  };
  const weakest = [...mastery].sort(
    (a, b) => a.level - b.level || severity[a.lastOutcome] - severity[b.lastOutcome]
  )[0];

  const scenario = scenarioForService(weakest.service);
  const reason =
    weakest.trials === 0
      ? `Reflexe ${weakest.label} pas encore travaille. On commence par la.`
      : weakest.lastOutcome === "miss"
        ? `Derniere fois, ${weakest.label} etait pertinent mais non propose. On le rejoue.`
        : weakest.lastOutcome === "error"
          ? `Derniere fois, ${weakest.label} a ete propose hors sujet. On retravaille l'eligibilite.`
          : `${weakest.label} est ton reflexe le plus fragile (niveau ${weakest.level}/5).`;

  return {
    service: weakest.service,
    label: weakest.label,
    reason,
    scenarioId: scenario?.id ?? null,
    scenarioTitle: scenario?.title ?? null
  };
}

export function computeProgress(sessions: MasterySession[]): ProgressSummary {
  // On ne garde que les sessions avec un review exploitable, triees du plus
  // ancien au plus recent.
  const usable = sessions
    .filter((session) => session.review?.services?.length)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const mastery = SERVICE_ORDER.map((service) => computeReflex(service, usable));

  return {
    totalSessions: usable.length,
    mastery,
    recommendation: buildRecommendation(mastery),
    recommendedDifficulty: recommendDifficulty(mastery.map((item) => item.level))
  };
}
