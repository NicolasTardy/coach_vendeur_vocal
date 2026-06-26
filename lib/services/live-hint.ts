import { analyzeDiscovery } from "@/lib/services/signal-analysis";
import type {
  ClientDifficulty,
  Scenario,
  ServiceKey,
  TranscriptTurn
} from "@/lib/types";

// Feedback per-tour a estompage: un indice discret quand un reflexe pertinent
// n'est pas encore exploite, alors qu'il reste un tour pour agir (§2.1: feedback
// proche dans le temps). L'estompage (fading) est pilote par la difficulte, donc
// par la maitrise: debutant -> indices explicites, intermediaire -> vagues,
// confirme -> silence (on ne coupe plus l'engagement actif).

const MAX_SELLER_TURNS = 5;
const SERVICE_PRIORITY: ServiceKey[] = ["cpay", "gld", "estaly"];

type HintMode = "explicit" | "vague" | "off";

export type LiveHint = {
  tone: "explicit" | "vague";
  text: string;
} | null;

const EXPLICIT_HINT: Record<ServiceKey, string> = {
  cpay: "Frein budget capte : propose une lecture en mensualites (Cpay), avec transparence.",
  gld: "Risque de panne capte : c'est le moment de placer la GLD sur un exemple concret.",
  estaly:
    "Risque taches/rayures capte : Estaly se propose ici, comme protection (pas assurance)."
};

function hintMode(difficulty: ClientDifficulty): HintMode {
  if (difficulty === "ouvert") return "explicit";
  if (difficulty === "neutre") return "vague";
  return "off"; // reticent / presse: plus d'indices, le vendeur est autonome
}

export function buildLiveHint(
  scenario: Scenario,
  transcript: TranscriptTurn[],
  difficulty: ClientDifficulty
): LiveHint {
  const mode = hintMode(difficulty);
  if (mode === "off") {
    return null;
  }

  const sellerTurns = transcript.filter((turn) => turn.speaker === "seller").length;
  const remaining = MAX_SELLER_TURNS - sellerTurns;
  // Indice utile seulement s'il reste un tour pour agir.
  if (remaining < 1) {
    return null;
  }

  const review = analyzeDiscovery(scenario, transcript);
  const missed = SERVICE_PRIORITY.find((service) =>
    review.services.some(
      (item) => item.service === service && item.verdict === "manquee"
    )
  );
  if (!missed) {
    return null;
  }

  if (mode === "explicit") {
    return { tone: "explicit", text: EXPLICIT_HINT[missed] };
  }

  return {
    tone: "vague",
    text: `Un signal client (frein ou risque) n'est pas encore exploite — il te reste ${remaining} tour${
      remaining > 1 ? "s" : ""
    }.`
  };
}
