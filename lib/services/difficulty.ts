import type { ClientDifficulty, Scenario } from "@/lib/types";

// Client adaptatif: le palier de difficulte module a quel point le client
// s'ouvre et resiste. On le recommande depuis la maitrise du vendeur pour le
// garder dans la zone de difficulte desirable (§9.1) — ni trop facile (pas
// d'apprentissage), ni trop dur (chute du sentiment d'efficacite, §12.2).

export const DIFFICULTY_ORDER: ClientDifficulty[] = [
  "ouvert",
  "neutre",
  "reticent",
  "presse"
];

export const DIFFICULTY_META: Record<
  ClientDifficulty,
  { label: string; hint: string }
> = {
  ouvert: {
    label: "Ouvert",
    hint: "Client cooperatif, donne ses signaux vite, accepte volontiers."
  },
  neutre: {
    label: "Neutre",
    hint: "Comportement standard, s'ouvre si tu questionnes et reformules."
  },
  reticent: {
    label: "Reticent",
    hint: "Prudent et presse, plusieurs objections a traiter avant d'accepter."
  },
  presse: {
    label: "Presse",
    hint: "Sur la defensive, phrases d'esquive, ne cede que si tu es excellent."
  }
};

export function difficultyLabel(difficulty: ClientDifficulty) {
  return DIFFICULTY_META[difficulty].label;
}

// Recommandation depuis les niveaux de maitrise (0-5) des reflexes. Un debutant
// (niveaux bas) affronte un client ouvert; un vendeur aguerri un client presse.
export function recommendDifficulty(levels: number[]): ClientDifficulty {
  if (levels.length === 0) {
    return "ouvert";
  }
  const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
  if (average < 1) return "ouvert";
  if (average < 2.5) return "neutre";
  if (average < 3.5) return "reticent";
  return "presse";
}

// Regles injectees dans le prompt client selon le palier.
export function difficultyRules(
  difficulty: ClientDifficulty,
  scenario: Scenario
): string {
  switch (difficulty) {
    case "ouvert":
      return `Niveau client: OUVERT. Tu es de bonne humeur et cooperatif. Tu
reveles tes besoins facilement des que le vendeur pose une question simple. Tu
acceptes volontiers un service des qu'il est relie a ton besoin, sans trop
resister. Une seule objection legere maximum sur toute la simulation.`;
    case "neutre":
      return `Niveau client: NEUTRE. Comportement standard: tu t'ouvres si le
vendeur questionne et reformule. Tu resistes un peu sur les services jusqu'a ce
qu'il fasse le lien avec ton risque ou ton frein, puis tu peux accepter.`;
    case "reticent":
      return `Niveau client: RETICENT. Tu es prudent et un peu presse. Tu ne
donnes tes signaux qu'au compte-goutte. Tu opposes au moins deux objections
(parmi: ${scenario.objections.join(" ; ")}) avant d'envisager un service, et
seulement si le vendeur traite vraiment l'objection. Un service mal amene ou
sans transparence, tu refuses.`;
    case "presse":
      return `Niveau client: PRESSE ET DIFFICILE. Tu es presse et sur la
defensive. Tu utilises des phrases d'esquive ("je vais reflechir", "envoyez-moi
juste le prix", "je verrai plus tard"). Tu ne t'ouvres que si le vendeur est
excellent: bonne question, reformulation juste, benefice concret. Tu refuses
tout service propose sans lien clair ou sans transparence. Au mieux tu acceptes
un seul service, et seulement s'il est tres bien vendu.`;
  }
}
