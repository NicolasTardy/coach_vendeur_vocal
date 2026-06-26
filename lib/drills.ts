import { scenarios } from "@/lib/scenarios";
import { salesPlaybooks, getPlaybookForService } from "@/lib/sales-playbooks";
import type { ServiceKey } from "@/lib/types";

// Micro-drills: recuperation active a haute frequence (testing effect, §9.2).
// Tout est genere depuis les donnees deja en place — aucune IA, reponses fiables.
// Chaque question donne un feedback immediat avec le "pourquoi" (§9.4: se tester
// sans correction renforce l'erreur).

export type DrillKind = "signal" | "eligibility" | "forbidden-word" | "coverage";

export type DrillChoice = {
  label: string;
  correct: boolean;
};

export type DrillQuestion = {
  id: string;
  kind: DrillKind;
  context: string;
  prompt: string;
  choices: DrillChoice[];
  explanation: string;
  // Service concerne, pour pouvoir cibler un round sur un reflexe faible.
  service?: ServiceKey;
};

const KIND_LABELS: Record<DrillKind, string> = {
  signal: "Quel reflexe ?",
  eligibility: "Pertinent ou pas ?",
  "forbidden-word": "Les mots d'Estaly",
  coverage: "Couvert ou pas ?"
};

export function drillKindLabel(kind: DrillKind) {
  return KIND_LABELS[kind];
}

const SERVICE_NAME: Record<ServiceKey, string> = {
  cpay: "Cpay (financement)",
  gld: "GLD (garantie panne)",
  estaly: "Estaly (protection esthetique)"
};

// "Le client dit X -> quel service declencher ?" (depuis les signaux captes).
function signalDrills(): DrillQuestion[] {
  return scenarios.flatMap((scenario) =>
    scenario.capturedSignals.map((signal, index) => ({
      id: `signal-${scenario.id}-${index}`,
      kind: "signal" as const,
      context: scenario.title,
      prompt: `Le client dit : « ${signal.clientQuote} ». Quel reflexe declencher ?`,
      choices: [
        { label: SERVICE_NAME.cpay, correct: signal.service === "cpay" },
        { label: SERVICE_NAME.gld, correct: signal.service === "gld" },
        { label: SERVICE_NAME.estaly, correct: signal.service === "estaly" },
        { label: "Aucun service — aider au choix", correct: signal.service === "choix" }
      ],
      explanation: signal.reading,
      service: signal.service === "choix" ? undefined : signal.service
    }))
  );
}

// "Sur ce produit, proposer tel service ?" (depuis l'eligibilite).
function eligibilityDrills(): DrillQuestion[] {
  return scenarios.flatMap((scenario) =>
    scenario.serviceEligibility.map((item, index) => ({
      id: `elig-${scenario.id}-${index}`,
      kind: "eligibility" as const,
      context: scenario.title,
      prompt: `Sur « ${scenario.title} », proposer ${SERVICE_NAME[item.service]} ?`,
      choices: [
        { label: "Oui, c'est pertinent", correct: item.eligible },
        { label: "Non, pas pertinent ici", correct: !item.eligible }
      ],
      explanation: item.reason,
      service: item.service
    }))
  );
}

// "Par quoi remplacer ce mot interdit ?" (depuis les mots a bannir d'Estaly).
function forbiddenWordDrills(): DrillQuestion[] {
  const estaly = getPlaybookForService("estaly");
  if (!estaly || estaly.wordsToAvoid.length < 2) {
    return [];
  }

  return estaly.wordsToAvoid.map((word, index) => ({
    id: `word-${index}`,
    kind: "forbidden-word" as const,
    context: "Estaly — vocabulaire",
    prompt: `Estaly : par quoi remplacer « ${word.instead} » ?`,
    choices: estaly.wordsToAvoid.map((other) => ({
      label: other.say,
      correct: other.say === word.say
    })),
    explanation: `On bannit « ${word.instead} » -> on dit « ${word.say} ».`,
    service: "estaly"
  }));
}

// "Ce cas est-il couvert par GLD / Estaly ?" (depuis covered/excluded).
function coverageDrills(): DrillQuestion[] {
  return salesPlaybooks
    .filter((playbook) => playbook.service !== "cpay")
    .flatMap((playbook) => {
      const covered = playbook.covered.map((item, index) => ({
        id: `cov-${playbook.service}-ok-${index}`,
        kind: "coverage" as const,
        context: playbook.title,
        prompt: `${playbook.title} — ce cas est-il couvert : « ${item} » ?`,
        choices: [
          { label: "Oui, couvert", correct: true },
          { label: "Non, exclu", correct: false }
        ],
        explanation: `Couvert par ${playbook.title}.`,
        service: playbook.service
      }));

      const excluded = playbook.excluded.map((item, index) => ({
        id: `cov-${playbook.service}-no-${index}`,
        kind: "coverage" as const,
        context: playbook.title,
        prompt: `${playbook.title} — ce cas est-il couvert : « ${item} » ?`,
        choices: [
          { label: "Oui, couvert", correct: false },
          { label: "Non, exclu", correct: true }
        ],
        explanation: `Exclu de ${playbook.title}.`,
        service: playbook.service
      }));

      return [...covered, ...excluded];
    });
}

export function generateAllDrills(): DrillQuestion[] {
  return [
    ...signalDrills(),
    ...eligibilityDrills(),
    ...forbiddenWordDrills(),
    ...coverageDrills()
  ];
}

// Melange de Fisher-Yates (copie, ne mute pas l'entree).
export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Entrelace les questions par type (interleaving, §9.1) pour ne pas enchainer 8
// questions du meme genre.
function interleaveByKind(questions: DrillQuestion[], size: number): DrillQuestion[] {
  const byKind: Record<DrillKind, DrillQuestion[]> = {
    signal: [],
    eligibility: [],
    "forbidden-word": [],
    coverage: []
  };
  for (const question of questions) {
    byKind[question.kind].push(question);
  }

  const pools = Object.values(byKind)
    .map((pool) => shuffle(pool))
    .filter((pool) => pool.length > 0);

  const round: DrillQuestion[] = [];
  let poolIndex = 0;
  while (round.length < size && pools.some((pool) => pool.length > 0)) {
    const pool = pools[poolIndex % pools.length];
    const next = pool.pop();
    if (next) round.push(next);
    poolIndex += 1;
  }
  return round;
}

// Un round de 8 questions. Avec un focus (reflexe faible), ~60% des questions
// portent sur ce service; le reste reste varie pour ne pas tout concentrer.
export function buildDrillRound(size = 8, focus?: ServiceKey): DrillQuestion[] {
  const all = generateAllDrills();
  let round: DrillQuestion[];

  if (focus) {
    const focused = all.filter((question) => question.service === focus);
    const rest = all.filter((question) => question.service !== focus);
    const focusCount = Math.min(focused.length, Math.ceil(size * 0.6));
    const focusPart = interleaveByKind(focused, focusCount);
    const restPart = interleaveByKind(rest, size - focusPart.length);
    round = shuffle([...focusPart, ...restPart]);
  } else {
    round = interleaveByKind(all, size);
  }

  // Choix melanges pour ne pas toujours mettre la bonne reponse au meme endroit.
  return round.map((question) => ({
    ...question,
    choices: shuffle(question.choices)
  }));
}
