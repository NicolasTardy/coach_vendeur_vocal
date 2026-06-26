export type UserRole = "seller" | "manager" | "admin";

export type User = {
  id: string;
  pseudo: string;
  role: UserRole;
  store?: string;
  department?: string;
  createdAt: string;
};

// Les 3 services vendables. Sert a relier un signal client a un service et a
// raisonner sur l'eligibilite de facon deterministe (pas seulement en prose).
export type ServiceKey = "cpay" | "gld" | "estaly";

// Un signal capte pendant la decouverte (deja faite avant la simulation).
// clientQuote: ce que le client a dit. reading: ce que ca revele (risque/frein).
// service: le service vers lequel ce signal oriente, ou "choix" pour aider a
// trancher entre les produits.
export type CapturedSignal = {
  clientQuote: string;
  reading: string;
  service: ServiceKey | "choix";
};

// Eligibilite d'un service pour ce produit. Permet d'enseigner le "quand NE PAS
// proposer" (connaissance conditionnelle) et de scorer sans ambiguite.
export type ServiceEligibility = {
  service: ServiceKey;
  eligible: boolean;
  reason: string;
};

export type Scenario = {
  id: string;
  title: string;
  department: string;
  serviceTargets: string[];
  trainingFocus: string[];
  productOptions: string[];
  openingLine: string;
  clientPersona: string;
  visibleNeed: string;
  hiddenNeed: string;
  budget: string;
  objections: string[];
  expectedSkills: string[];
  successCriteria: string[];
  // Brief de reprise: la decouverte est faite, le vendeur enchaine.
  discoveryRecap: string;
  capturedSignals: CapturedSignal[];
  serviceEligibility: ServiceEligibility[];
};

export type Speaker = "client" | "seller" | "coach";

// Palier de difficulte du client IA. Plus le vendeur maitrise, plus le client
// resiste (zone de difficulte desirable, §9.1).
export type ClientDifficulty = "ouvert" | "neutre" | "reticent" | "presse";

// Format de session: vente complete (5 tours, tous les reflexes) ou drill cible
// (3 tours, un seul reflexe a automatiser).
export type SessionMode = "full" | "drill";

export type TranscriptTurn = {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp: string;
  audioUrl?: string;
  contextIndex?: number;
};

export type ScoreReport = {
  global: number;
  accueil: number;
  decouverte: number;
  reformulation: number;
  argumentationProduit: number;
  argumentationServices: number;
  financement: number;
  garantieExtension: number;
  assuranceEsthetisme: number;
  objections: number;
  closing: number;
  relationnel: number;
  strengths: string[];
  priorities: string[];
  recommendedExercises: string[];
};

export type KeyMoment = {
  id: string;
  turnIndex: number;
  clientQuote: string;
  sellerQuote: string;
  issue: string;
  betterAnswer: string;
};

// Resultat deterministe (calcule en code, pas par l'IA) pour le scoring fiable
// des signaux et de l'eligibilite.
export type SignalOutcome = {
  clientQuote: string;
  reading: string;
  service: ServiceKey | "choix";
  exploited: boolean;
};

export type ServiceVerdict =
  | "captee" // service pertinent ET propose
  | "manquee" // service pertinent NON propose (occasion manquee)
  | "bonne_abstention" // service non pertinent et NON propose (bon reflexe)
  | "erreur_eligibilite"; // service non pertinent MAIS propose (erreur)

export type ServiceOutcome = {
  service: ServiceKey;
  eligible: boolean;
  proposed: boolean;
  verdict: ServiceVerdict;
  reason: string;
};

export type DiscoveryReview = {
  signals: SignalOutcome[];
  services: ServiceOutcome[];
  capturedCount: number;
  missedCount: number;
  eligibilityErrors: number;
};

export type FinalReport = {
  summary: string;
  score: ScoreReport;
  discoveryReview: DiscoveryReview;
  keyMoments: KeyMoment[];
  objections: Array<{
    objection: string;
    givenAnswer: string;
    betterAnswer: string;
  }>;
  priorityTips: string[];
  spacedPlan: Array<{
    when: "Demain" | "J+3" | "J+7" | "J+14" | "J+30";
    task: string;
  }>;
  memo: string[];
  rawText: string;
};

export type TrainingSession = {
  id: string;
  userId: string;
  pseudo: string;
  scenarioId: string;
  difficulty?: ClientDifficulty;
  mode?: SessionMode;
  focusService?: ServiceKey;
  startedAt: string;
  endedAt?: string;
  transcript: TranscriptTurn[];
  audioRefs?: string[];
  scores?: ScoreReport;
  finalReport?: FinalReport;
  replayFromTurnIndex?: number;
};

export type ClientMood = "open" | "neutral" | "guarded" | "closing";

export type ConversationState = {
  sessionId: string;
  scenarioId: string;
  mood: ClientMood;
  turnCount: number;
};
