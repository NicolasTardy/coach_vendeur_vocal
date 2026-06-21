export type UserRole = "seller" | "manager" | "admin";

export type User = {
  id: string;
  pseudo: string;
  role: UserRole;
  store?: string;
  department?: string;
  createdAt: string;
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
};

export type Speaker = "client" | "seller" | "coach";

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

export type FinalReport = {
  summary: string;
  score: ScoreReport;
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
