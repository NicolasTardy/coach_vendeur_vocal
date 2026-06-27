import type {
  DiscoveryReview,
  Scenario,
  ScoreReport,
  ServiceKey,
  ServiceOutcome,
  SignalOutcome,
  TranscriptTurn
} from "@/lib/types";

// Analyse DETERMINISTE (sans IA) de la simulation: on scanne ce que le vendeur a
// reellement dit pour savoir quels services il a proposes, s'il a exploite les
// signaux du brief et s'il a respecte l'eligibilite. Sert de socle fiable au
// scoring et au rapport: ces faits ne sont jamais hallucines.

export const SERVICE_LABELS: Record<ServiceKey | "choix", string> = {
  cpay: "Cpay (financement)",
  gld: "GLD (garantie panne)",
  estaly: "Estaly (protection esthetique)",
  choix: "Aide au choix produit"
};

// Mots-cles (texte normalise sans accent) qui trahissent la proposition d'un
// service par le vendeur.
const SERVICE_KEYWORDS: Record<ServiceKey, RegExp> = {
  cpay: /(cpay|carte but|mensualit|credit|financ|plusieurs fois|en \d+ fois|etaler|paiement en|a credit)/,
  gld: /(gld|garantie|extension|en panne|de panne|longue duree|reparation|repare|echange|immobilisation)/,
  estaly: /(estaly|esthet|une tache|des taches|rayure|griffure|eclat|brulure|dechirure)/
};

// Le vendeur a-t-il aide a trancher le choix produit ?
const CHOICE_KEYWORDS =
  /(je vous (conseille|recommande|propose|orienterais)|le mieux|le plus adapte|je partirais|plutot (le|la|sur)|entre les (deux|trois)|pour (bien )?choisir|le bon choix|celui qui|je prendrais)/;

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function sellerCorpus(transcript: TranscriptTurn[]) {
  return normalize(
    transcript
      .filter((turn) => turn.speaker === "seller")
      .map((turn) => turn.text)
      .join(" \n ")
  );
}

function verdictReason(verdict: ServiceOutcome["verdict"], label: string) {
  switch (verdict) {
    case "captee":
      return `${label}: pertinent et propose. Bien joue.`;
    case "manquee":
      return `${label}: pertinent mais jamais propose. Occasion manquee.`;
    case "bonne_abstention":
      return `${label}: non pertinent ici, et tu ne l'as pas propose. Bon reflexe.`;
    case "erreur_eligibilite":
      return `${label}: non pertinent sur ce produit, mais tu l'as propose. A eviter.`;
  }
}

export function analyzeDiscovery(
  scenario: Scenario,
  transcript: TranscriptTurn[],
  focusService?: ServiceKey
): DiscoveryReview {
  const corpus = sellerCorpus(transcript);

  const proposed: Record<ServiceKey, boolean> = {
    cpay: SERVICE_KEYWORDS.cpay.test(corpus),
    gld: SERVICE_KEYWORDS.gld.test(corpus),
    estaly: SERVICE_KEYWORDS.estaly.test(corpus)
  };

  const relevantSignals = focusService
    ? scenario.capturedSignals.filter((signal) => signal.service === focusService)
    : scenario.capturedSignals;
  const signals: SignalOutcome[] = relevantSignals.map((signal) => {
    const exploited =
      signal.service === "choix"
        ? CHOICE_KEYWORDS.test(corpus)
        : proposed[signal.service];
    return {
      clientQuote: signal.clientQuote,
      reading: signal.reading,
      service: signal.service,
      exploited
    };
  });

  const relevantServices = focusService
    ? scenario.serviceEligibility.filter((item) => item.service === focusService)
    : scenario.serviceEligibility;
  const services: ServiceOutcome[] = relevantServices.map((item) => {
    const isProposed = proposed[item.service];
    const verdict: ServiceOutcome["verdict"] = item.eligible
      ? isProposed
        ? "captee"
        : "manquee"
      : isProposed
        ? "erreur_eligibilite"
        : "bonne_abstention";
    return {
      service: item.service,
      eligible: item.eligible,
      proposed: isProposed,
      verdict,
      reason: verdictReason(verdict, SERVICE_LABELS[item.service])
    };
  });

  return {
    signals,
    services,
    capturedCount: signals.filter((signal) => signal.exploited).length,
    missedCount: services.filter((service) => service.verdict === "manquee").length,
    eligibilityErrors: services.filter(
      (service) => service.verdict === "erreur_eligibilite"
    ).length
  };
}

// Quelle note de competence correspond a quel service.
const SERVICE_SCORE_FIELD: Record<
  ServiceKey,
  "financement" | "garantieExtension" | "assuranceEsthetisme"
> = {
  cpay: "financement",
  gld: "garantieExtension",
  estaly: "assuranceEsthetisme"
};

const SERVICE_SCORE_MAX = 25;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Garde-fous deterministes sur les 3 notes services: on contraint la note (que
// l'IA estime sur la qualite) a rester coherente avec les faits mesures. La
// qualite reste a l'IA quand le service a bien ete propose.
export function clampServiceScores(
  score: ScoreReport,
  review: DiscoveryReview
): ScoreReport {
  const next = { ...score };
  for (const outcome of review.services) {
    const field = SERVICE_SCORE_FIELD[outcome.service];
    const current = next[field];
    let adjusted = current;
    switch (outcome.verdict) {
      case "manquee":
      case "erreur_eligibilite":
        adjusted = Math.min(current, 6);
        break;
      case "bonne_abstention":
        adjusted = Math.max(current, 20);
        break;
      case "captee":
        adjusted = Math.max(current, 10);
        break;
    }
    next[field] = clamp(adjusted, 0, SERVICE_SCORE_MAX);
  }
  return next;
}

// Resume texte du review, injecte dans le prompt coach comme faits fiables.
export function formatDiscoveryReview(review: DiscoveryReview) {
  const signals = review.signals
    .map(
      (signal) =>
        `- "${signal.clientQuote}" -> ${
          signal.exploited ? "EXPLOITE" : "NON EXPLOITE"
        } (${SERVICE_LABELS[signal.service]})`
    )
    .join("\n");

  const services = review.services
    .map((service) => `- ${service.reason}`)
    .join("\n");

  return `Signaux (mesure deterministe):\n${signals}\n\nServices (mesure deterministe):\n${services}`;
}
