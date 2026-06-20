import type { Scenario } from "@/lib/types";

// IMPORTANT: le produit (canape, matelas, TV...) est UNIQUEMENT la cle d'entree.
// Le vrai objectif de chaque scenario est de declencher au moins un service:
// 1) Carte de paiement & credit BUT Cpay
// 2) Protection esthetique Estaly
// 3) GLD (Garantie Longue Duree)
// trainingFocus, successCriteria et expectedSkills doivent refleter cette priorite.

export const scenarios: Scenario[] = [
  {
    id: "canape-famille-budget",
    title: "Canape familial - cle d'entree pour Estaly + GLD",
    department: "Canape",
    difficulty: "beginner",
    serviceTargets: [
      "protection esthetique Estaly",
      "GLD garantie longue duree",
      "carte/credit Cpay"
    ],
    trainingFocus: [
      "faire emerger Estaly sur le risque taches/enfants/animaux",
      "vendre la GLD sur le mecanisme et le tissu",
      "presenter Cpay comme option de confort budget"
    ],
    clientPersona: "Couple avec 2 enfants, 35-42 ans, prudents",
    visibleNeed: "Changer un canape use",
    hiddenNeed:
      "Peur de se tromper sur la solidite et l'entretien avec les enfants",
    budget: "900 a 1200 euros",
    objections: [
      "On va reflechir",
      "Estaly ca fait encore un truc en plus",
      "La garantie ca sert a rien",
      "On ne veut pas prendre de credit"
    ],
    expectedSkills: [
      "decouverte du risque (enfants, animaux, usage)",
      "vente Estaly avec exemple tache/accroc",
      "vente GLD sur mecanisme/tissu",
      "presentation Cpay transparente",
      "traitement objection prix vers une option de paiement"
    ],
    successCriteria: [
      "Estaly proposee et reliee a un risque visible",
      "GLD proposee et reliee a un risque concret",
      "Cpay proposee si frein budget exprime",
      "aucun service force, aucune promesse interdite"
    ]
  },
  {
    id: "literie-couple-indecis",
    title: "Literie - cle d'entree pour GLD + Cpay",
    department: "Literie",
    difficulty: "beginner",
    serviceTargets: [
      "GLD garantie longue duree",
      "carte/credit Cpay",
      "protection esthetique Estaly"
    ],
    trainingFocus: [
      "vendre la GLD comme reduction du risque de regret (10-15 ans)",
      "presenter Cpay sans pression pour rendre l'investissement accessible",
      "evoquer Estaly si tache/enfant/animaux dans la chambre"
    ],
    clientPersona: "Couple 40-50 ans, problemes de dos, peur de se tromper",
    visibleNeed: "Changer leur matelas",
    hiddenNeed: "Besoin de confort et peur de regretter un achat important",
    budget: "600 a 900 euros",
    objections: [
      "La garantie sur un matelas, je ne vois pas l'interet",
      "Le credit on prefere eviter",
      "Estaly pour un matelas, c'est exagere",
      "On ne sait pas trop quoi choisir"
    ],
    expectedSkills: [
      "decouverte besoin sante / duree de vie",
      "vente GLD comme protection long terme",
      "presentation Cpay pour soutenir le budget",
      "evocation Estaly si pertinent",
      "reassurance et closing progressif"
    ],
    successCriteria: [
      "GLD reliee a la duree de vie attendue et au risque mecanisme/sommier",
      "Cpay proposee transparente si budget tendu",
      "Estaly mentionnee si risque taches/enfants/animaux",
      "aucun service vendu sans accord du client"
    ]
  },
  {
    id: "cuisine-financement",
    title: "Cuisine - cle d'entree pour Cpay + GLD",
    department: "Cuisine",
    difficulty: "intermediate",
    serviceTargets: [
      "carte/credit Cpay",
      "GLD garantie longue duree",
      "protection esthetique Estaly"
    ],
    trainingFocus: [
      "transformer le frein budget en projet via Cpay",
      "vendre la GLD sur electromenager encastre + montage + transport",
      "evoquer Estaly sur le plan de travail et les facades"
    ],
    clientPersona:
      "Couple 30-40 ans, projet important, budget serre mais ambitieux",
    visibleNeed: "Refaire toute la cuisine",
    hiddenNeed: "Veut y mettre le prix mais peur du budget total",
    budget: "3000 a 5000 euros",
    objections: [
      "C'est trop cher pour nous",
      "Le credit j'aime pas ca",
      "La garantie c'est inutile c'est neuf",
      "On verra en fin d'annee"
    ],
    expectedSkills: [
      "decouverte du projet complet",
      "vente Cpay reliee au projet (option, pas pression)",
      "vente GLD sur electromenager + transport + montage",
      "Estaly sur plan de travail / facades",
      "closing par services successifs"
    ],
    successCriteria: [
      "Cpay presentee transparente et facultative",
      "GLD reliee a au moins 2 risques concrets",
      "Estaly mentionnee sur surface fragile",
      "ne pas perdre la vente services par peur de l'objection"
    ]
  },
  {
    id: "electromenager-comparateur",
    title: "Electromenager - cle d'entree pour GLD + Cpay",
    department: "Electromenager",
    difficulty: "intermediate",
    serviceTargets: [
      "GLD garantie longue duree",
      "carte/credit Cpay",
      "livraison rapide"
    ],
    trainingFocus: [
      "differencier le magasin d'internet par la GLD (panne, hotline, echange)",
      "vendre la GLD specifiquement sur le risque panne d'un lave-linge",
      "proposer Cpay rapidement pour ne pas ralentir le client"
    ],
    clientPersona:
      "Homme 28-38 ans, tres connecte, a deja compare les prix en ligne",
    visibleNeed: "Acheter un lave-linge",
    hiddenNeed: "Veut etre sur de faire le meilleur deal, besoin d'etre rassure",
    budget: "400 a 600 euros",
    objections: [
      "J'ai vu moins cher sur Amazon",
      "La garantie c'est inutile j'ai la CB",
      "Le credit pour un lave-linge, non merci",
      "Je peux pas attendre pour la livraison"
    ],
    expectedSkills: [
      "differenciation magasin vs internet par les services",
      "vente GLD sur risque panne / immobilisation",
      "presentation Cpay courte et transparente",
      "closing rapide sans ralentir le client"
    ],
    successCriteria: [
      "GLD presentee avec exemple concret de panne",
      "Cpay evoquee meme sur petit montant",
      "service magasin oppose a l'offre internet",
      "aucun forcing"
    ]
  },
  {
    id: "services-client-sceptique",
    title: "Client sceptique - vendre les 3 services en confiance",
    department: "Services",
    difficulty: "advanced",
    serviceTargets: [
      "GLD garantie longue duree",
      "protection esthetique Estaly",
      "carte/credit Cpay"
    ],
    trainingFocus: [
      "creer la confiance AVANT toute proposition de service",
      "vendre GLD avec un exemple concret de panne",
      "vendre Estaly comme complement (pas une assurance)",
      "presenter Cpay de facon transparente et non forcee"
    ],
    clientPersona: "Client 45-55 ans, mefiant, mauvaises experiences passees",
    visibleNeed: "Acheter un TV mais n'a pas encore decide",
    hiddenNeed: "A peur des arnaques et des mauvaises surprises",
    budget: "500 a 800 euros",
    objections: [
      "La garantie c'est des arnaques",
      "Estaly c'est encore une assurance cachee",
      "Le credit ca coute trop cher",
      "Je vais reflechir"
    ],
    expectedSkills: [
      "instaurer la confiance",
      "vente GLD avec exemple precis et transparence",
      "vente Estaly comme protection, jamais comme assurance",
      "presentation Cpay transparente, facultative, soumise acceptation",
      "closing patient apres autorisation"
    ],
    successCriteria: [
      "GLD proposee apres confiance etablie, avec exemple",
      "Estaly proposee avec vocabulaire correct (protection esthetique)",
      "Cpay presentee transparente, sans promesse interdite",
      "ne pas reculer face au scepticisme"
    ]
  }
];

export function getScenario(id: string) {
  return scenarios.find((scenario) => scenario.id === id);
}

export const departments = Array.from(
  new Set(scenarios.map((scenario) => scenario.department))
);
