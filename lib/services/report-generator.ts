import type { FinalReport, Scenario, TranscriptTurn } from "@/lib/types";

export function buildFallbackReport(
  scenario: Scenario,
  transcript: TranscriptTurn[]
): FinalReport {
  const sellerTurns = transcript.filter((turn) => turn.speaker === "seller");
  const lastSellerTurn = sellerTurns.at(-1)?.text ?? "Pas encore de reponse vendeur.";
  const likelyObjection =
    scenario.objections.find((objection) =>
      transcript.some((turn) =>
        turn.text.toLowerCase().includes(objection.toLowerCase().slice(0, 8))
      )
    ) ?? scenario.objections[0];

  return {
    summary: `Simulation sur ${scenario.title}. Le client cherchait ${scenario.visibleNeed.toLowerCase()} avec un budget de ${scenario.budget}.`,
    score: {
      global: 68,
      accueil: 7,
      decouverte: 9,
      reformulation: 6,
      argumentationProduit: 10,
      argumentationServices: 7,
      financement: 5,
      garantieExtension: 5,
      assuranceEsthetisme: 5,
      objections: 8,
      closing: 5,
      relationnel: 8,
      strengths: [
        "Tu as garde un ton calme et professionnel.",
        "Tu as commence a explorer le besoin avant de pousser une solution."
      ],
      priorities: [
        "Reformuler explicitement le besoin cache du client.",
        "Relier credit, garantie ou assurance esthetisme a un risque client formule.",
        "Traiter l'objection avec une question avant d'argumenter."
      ],
      recommendedExercises: [
        "Refaire une objection credit en 3 minutes avec la methode accueillir-questionner-presenter-verifier.",
        "S'entrainer a proposer une garantie ou assurance esthetisme a partir d'un risque client reel."
      ]
    },
    keyMoments: [
      {
        id: "moment_0",
        turnIndex: Math.max(0, transcript.length - 2),
        clientQuote: likelyObjection,
        sellerQuote: lastSellerTurn,
        issue: "La reponse ne transforme pas assez l'hesitation en information utile.",
        betterAnswer:
          "Je comprends. Pour vous aider a comparer utilement, c'est plutot le budget, la livraison ou la solidite qui vous fait hesiter ?"
      }
    ],
    objections: [
      {
        objection: likelyObjection,
        givenAnswer: lastSellerTurn,
        betterAnswer:
          "Accueillir l'objection, questionner la vraie cause, puis relier la reponse au besoin du client."
      }
    ],
    priorityTips: [
      "Pose une question courte avant chaque argument.",
      "Reformule avec les mots du client.",
      "Termine par une micro-decision: essai, devis, livraison ou garantie."
    ],
    spacedPlan: [
      { when: "Demain", task: "Refaire l'objection prioritaire a voix haute." },
      { when: "J+3", task: "Reformuler besoin visible + risque service." },
      { when: "J+7", task: "S'entrainer au credit et au closing doux." },
      { when: "J+14", task: "Refaire une simulation complete." }
    ],
    memo: [
      "Objection prix: accueillir, questionner, valoriser, proposer une alternative, closer.",
      "Un service se vend mieux quand il protege un risque exprime par le client.",
      "Credit: transparence, confort budgetaire, verification, jamais de forcing.",
      "Assurance esthetisme: taches, accrocs, usage quotidien, exemple concret."
    ],
    rawText: ""
  };
}
