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
      // Bareme recentre sur les 3 services. Max global = 100.
      // decouverte 15 + financement 25 + GLD 25 + Estaly 25 + objections 5 + closing 5
      global: 45,
      accueil: 6,
      decouverte: 9,
      reformulation: 5,
      argumentationProduit: 6,
      argumentationServices: 5,
      financement: 10,
      garantieExtension: 10,
      assuranceEsthetisme: 10,
      objections: 3,
      closing: 3,
      relationnel: 6,
      strengths: [
        "Tu as garde un ton calme et professionnel.",
        "Tu as commence a explorer le besoin avant de pousser une solution."
      ],
      priorities: [
        "Faire emerger au moins un des 3 services (Cpay, GLD, Estaly) en le reliant a un risque concret.",
        "Demander l'autorisation avant de presenter Cpay, puis rester transparent (facultatif, soumis acceptation).",
        "Relier la GLD ou Estaly a un exemple precis du produit choisi."
      ],
      recommendedExercises: [
        "Refaire un pitch GLD en 60 secondes a partir d'un risque concret.",
        "S'entrainer a presenter Cpay en 3 phrases transparentes apres une objection budget."
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
      "Protection Estaly: taches, accrocs, usage quotidien, exemple concret."
    ],
    rawText: ""
  };
}
