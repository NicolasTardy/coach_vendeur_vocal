import { getPlaybookForService } from "@/lib/sales-playbooks";
import type { DiscoveryReview, Scenario, ServiceKey } from "@/lib/types";

// Modele expert (apprentissage vicariant, §12.2.2): un deroule ideal de la vente,
// genere de facon deterministe depuis les signaux du scenario et les vraies
// amorces BUT. Les reflexes rates dans la simulation sont surlignes pour que le
// vendeur voie exactement le rebond qu'il a manque.

export type ModelExchange = {
  client: string;
  expert: string;
  service?: ServiceKey;
  missed: boolean;
  note: string;
};

// Ordre du deroule: financement d'abord, puis garantie panne, puis protection
// esthetique (regle de l'escalier: garantie avant esthetique).
const SERVICE_ORDER: ServiceKey[] = ["cpay", "gld", "estaly"];

// Repli si aucun signal client ne pointe vers ce service.
const GENERIC_CUE: Record<ServiceKey, string> = {
  cpay: "Pour le budget, j'aimerais que ca reste raisonnable.",
  gld: "Ce qui m'embeterait, c'est une panne une fois la garantie finie.",
  estaly: "J'ai un peu peur de l'abimer au quotidien."
};

export function buildModelDialogue(
  scenario: Scenario,
  review: DiscoveryReview
): ModelExchange[] {
  const exchanges: ModelExchange[] = [];

  // 1. Reformulation du besoin avant d'enchainer.
  const choixSignal = scenario.capturedSignals.find(
    (signal) => signal.service === "choix"
  );
  const choixMissed = review.signals.some(
    (signal) => signal.service === "choix" && !signal.exploited
  );
  exchanges.push({
    client: choixSignal?.clientQuote ?? scenario.openingLine,
    expert:
      "Si je resume, vous etes convaincu sur le produit, il reste juste a choisir. Pour trancher, qu'est-ce qui compte le plus pour vous : le budget, la tranquillite dans le temps, ou l'usage au quotidien ?",
    missed: choixMissed,
    note: "Reformuler le besoin avant d'enchainer"
  });

  // 2. Un echange par service pertinent, avec sa vraie amorce.
  for (const service of SERVICE_ORDER) {
    const eligibility = scenario.serviceEligibility.find(
      (item) => item.service === service
    );
    if (!eligibility?.eligible) {
      continue;
    }

    const playbook = getPlaybookForService(service);
    if (!playbook) {
      continue;
    }

    const signal = scenario.capturedSignals.find(
      (item) => item.service === service
    );
    const verdict = review.services.find(
      (item) => item.service === service
    )?.verdict;

    exchanges.push({
      client: signal?.clientQuote ?? GENERIC_CUE[service],
      expert: playbook.amorces[0],
      service,
      missed: verdict === "manquee",
      note: `Reflexe ${playbook.title}`
    });
  }

  // 3. Micro-closing service par service.
  exchanges.push({
    client: "C'est note, je crois que je vais partir la-dessus.",
    expert:
      "Parfait. On valide le produit, et je vous ajoute les protections qu'on a vues : vous restez gagnant et tranquille. Je prepare le bon de commande ?",
    missed: false,
    note: "Micro-closing, ferme mais non force"
  });

  return exchanges;
}
