import type {
  DiscoveryReview,
  FinalReport,
  Scenario,
  ServiceKey,
  TranscriptTurn
} from "@/lib/types";
import { analyzeDiscovery, SERVICE_LABELS } from "@/lib/services/signal-analysis";

// Note service deterministe pour le repli (sans IA): derivee du verdict mesure.
function serviceFallbackScore(review: DiscoveryReview, service: ServiceKey) {
  const verdict = review.services.find((item) => item.service === service)?.verdict;
  switch (verdict) {
    case "captee":
      return 16;
    case "bonne_abstention":
      return 22;
    default:
      return 4; // manquee, erreur_eligibilite ou inconnu
  }
}

export function buildFallbackReport(
  scenario: Scenario,
  transcript: TranscriptTurn[],
  review: DiscoveryReview = analyzeDiscovery(scenario, transcript)
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
    summary: buildReviewSummary(scenario, review),
    discoveryReview: review,
    score: {
      // Bareme recentre sur les reflexes services. Max global = 100.
      // decouverte 15 + mensualites/Cpay 25 + GLD 25 + Estaly/pertinence 25 + objections 5 + closing 5
      global: 45,
      accueil: 6,
      decouverte: 9,
      reformulation: 5,
      argumentationProduit: 6,
      argumentationServices: 5,
      financement: serviceFallbackScore(review, "cpay"),
      garantieExtension: serviceFallbackScore(review, "gld"),
      assuranceEsthetisme: serviceFallbackScore(review, "estaly"),
      objections: 3,
      closing: 3,
      relationnel: 6,
      strengths: [
        "Tu as garde un ton calme et professionnel.",
        "Tu as commence a explorer le besoin avant de pousser une solution."
      ],
      priorities: [
        "Reflexe: transformer l'hesitation en critere de choix. Mots a capter: j'hesite, budget, peur de me tromper. Phrase utile: pour choisir entre ces modeles, le plus important c'est le confort, le budget mensuel ou le risque a proteger ?",
        "Reflexe: ouvrir le budget en mensualites avant de reduire le projet. Mots a capter: cher, ca pique, je compare, on va reflechir. Phrase utile: on peut regarder le prix en mensualites pour voir si le meilleur choix reste confortable.",
        "Reflexe: proposer la bonne protection au bon risque. Mots a capter: enfant, tache, panne, batterie, dalle, usage quotidien. Phrase utile: justement, ce risque-la se protege avec GLD/Estaly, je vous explique concretement."
      ],
      recommendedExercises: [
        "But: automatiser Cpay. Etapes: annoncer prix, proposer mensualites possibles, demander accord, rappeler facultatif/soumis acceptation. Verification: le client peut refuser sans pression.",
        "But: vendre la bonne protection. Etapes: nommer le risque produit, choisir GLD ou Estaly, donner un exemple, verifier l'interet. Verification: aucun service hors sujet."
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
          "A capter: le client donne un indice de frein ou de risque. Reponse adaptee: je comprends; pour vous aider a choisir, c'est plutot le budget mensuel, le risque de panne ou le risque d'abimer le produit qui vous fait hesiter ?"
      }
    ],
    objections: [
      {
        objection: likelyObjection,
        givenAnswer: lastSellerTurn,
        betterAnswer:
          "Accueillir l'objection, questionner la vraie cause, puis relier mensualite, GLD ou Estaly au besoin exprime."
      }
    ],
    priorityTips: [
      "Dans une simulation courte, viser les services avant la 4e prise de parole vendeur.",
      "Ecouter les mots declencheurs: cher, enfant, tache, panne, autonomie, dalle, usage quotidien.",
      "Adapter la reponse: un mot client = une question courte = un service relie au risque.",
      "Terminer par une micro-decision: simulation Cpay, ajout GLD/Estaly ou refus respecte."
    ],
    spacedPlan: [
      { when: "Demain", task: "Sans relire, redire la phrase: prix total -> mensualite possible -> confort budget." },
      { when: "J+3", task: "S'entrainer sur 3 mots client: cher, enfant, panne. Donner une reponse adaptee pour chacun." },
      { when: "J+7", task: "Choisir GLD ou Estaly sur 3 produits differents et justifier par le risque capte." },
      { when: "J+14", task: "Refaire une vente en 5 tours: choix, budget, Cpay, protection, micro-closing." },
      { when: "J+30", task: "Mini-test melange: capter le mot client puis choisir la phrase vendeur utile." }
    ],
    memo: [
      "Prix: annoncer le total puis ouvrir une lecture en mensualites possibles.",
      "Cpay: option facultative, soumise a acceptation, jamais de promesse.",
      "GLD: panne, moteur, batterie, electronique, mecanisme, immobilisation.",
      "Estaly: protection esthetique contre tache, rayure, choc, brulure, accroc, seulement si produit eligible."
    ],
    rawText: ""
  };
}

// Synthese en 3 temps, deterministe: 1 reussite, l'occasion manquee n1, le
// reflexe a travailler. Sert de repli quand l'IA n'est pas disponible.
function buildReviewSummary(scenario: Scenario, review: DiscoveryReview) {
  const captured = review.services.find((service) => service.verdict === "captee");
  const abstention = review.services.find(
    (service) => service.verdict === "bonne_abstention"
  );
  const missed = review.services.find((service) => service.verdict === "manquee");
  const error = review.services.find(
    (service) => service.verdict === "erreur_eligibilite"
  );

  const win = captured
    ? `Bien joue: tu as propose ${SERVICE_LABELS[captured.service]}, pertinent ici.`
    : abstention
      ? `Bien joue: tu n'as pas propose ${SERVICE_LABELS[abstention.service]}, non pertinent sur ce produit.`
      : "Tu as garde un echange clair avec le client.";

  const gap = error
    ? `Occasion manquee n1: tu as propose ${SERVICE_LABELS[error.service]} alors qu'il n'est pas eligible ici.`
    : missed
      ? `Occasion manquee n1: ${SERVICE_LABELS[missed.service]} etait pertinent mais jamais propose.`
      : "Aucune occasion de service majeure manquee.";

  const next = missed
    ? `A travailler en priorite: declencher ${SERVICE_LABELS[missed.service]} sur le bon signal client.`
    : error
      ? "A travailler en priorite: verifier l'eligibilite avant de proposer une protection."
      : "A travailler en priorite: verrouiller le micro-closing service par service.";

  return `Simulation sur ${scenario.title}. ${win} ${gap} ${next}`;
}
