import type { Scenario } from "@/lib/types";

export const scenarios: Scenario[] = [
  {
    id: "canape-famille-budget",
    title: "Canape familial - Budget serre",
    department: "Canape",
    difficulty: "beginner",
    serviceTargets: [
      "extension de garantie",
      "assurance esthetisme",
      "livraison"
    ],
    trainingFocus: [
      "vendre la protection du canape avec les enfants",
      "relier l'assurance esthetisme aux taches et petits accidents",
      "presenter le financement comme une option de confort budgetaire"
    ],
    clientPersona: "Couple avec 2 enfants, 35-42 ans, prudents",
    visibleNeed: "Changer un canape use",
    hiddenNeed:
      "Peur de se tromper sur la solidite et l'entretien avec les enfants",
    budget: "900 a 1200 euros",
    objections: [
      "C'est trop cher",
      "On va reflechir",
      "On a vu moins cher sur internet",
      "La garantie ca ne sert a rien",
      "L'assurance esthetisme ca fait encore un truc en plus",
      "On ne veut pas prendre de credit"
    ],
    expectedSkills: [
      "decouverte besoin cache",
      "reformulation",
      "argumentation durabilite",
      "traitement objection prix",
      "vente garantie",
      "vente assurance esthetisme",
      "presentation financement"
    ],
    successCriteria: [
      "questionner l'usage reel",
      "reformuler le besoin cache",
      "proposer garantie, assurance esthetisme ou livraison",
      "closing doux"
    ]
  },
  {
    id: "literie-couple-indecis",
    title: "Literie - Couple indecis",
    department: "Literie",
    difficulty: "beginner",
    serviceTargets: ["extension de garantie", "livraison", "financement"],
    trainingFocus: [
      "vendre la garantie comme reduction du risque de regret",
      "presenter le financement sans pression",
      "rassurer par une methode de choix explicite"
    ],
    clientPersona: "Couple 40-50 ans, problemes de dos, peur de se tromper",
    visibleNeed: "Changer leur matelas",
    hiddenNeed: "Besoin de confort et peur de regretter un achat important",
    budget: "600 a 900 euros",
    objections: [
      "On ne sait pas trop quoi choisir",
      "C'est cher pour un matelas",
      "On peut pas l'essayer longtemps",
      "La garantie sur un matelas, je ne vois pas l'interet",
      "Le financement, on prefere eviter"
    ],
    expectedSkills: [
      "decouverte besoin sante",
      "argumentation confort et duree de vie",
      "reassurance",
      "closing progressif",
      "vente garantie",
      "presentation financement"
    ],
    successCriteria: [
      "questionner le confort et la sante",
      "valoriser l'investissement long terme",
      "rassurer sur le choix",
      "proposer une solution de paiement ou de protection adaptee"
    ]
  },
  {
    id: "cuisine-financement",
    title: "Cuisine - Projet financement",
    department: "Cuisine",
    difficulty: "intermediate",
    serviceTargets: ["financement", "garantie", "livraison", "montage"],
    trainingFocus: [
      "faire accepter le credit comme outil de projet",
      "relier financement, livraison et montage au projet global",
      "traiter la peur du budget sans minimiser"
    ],
    clientPersona:
      "Couple 30-40 ans, projet important, budget serre mais projet ambitieux",
    visibleNeed: "Refaire toute la cuisine",
    hiddenNeed: "Veut y mettre le prix mais peur du budget total",
    budget: "3000 a 5000 euros",
    objections: [
      "C'est trop cher pour nous",
      "Le credit j'aime pas ca",
      "On verra en fin d'annee"
    ],
    expectedSkills: [
      "decouverte projet",
      "argumentation services financement",
      "decomplexer le credit",
      "closing sur le projet global",
      "vente garantie",
      "vente livraison montage"
    ],
    successCriteria: [
      "explorer le projet complet",
      "presenter le financement naturellement",
      "interets rembourses en bon d'achat",
      "lier les services au risque projet"
    ]
  },
  {
    id: "electromenager-comparateur",
    title: "Electromenager - Client presse comparateur",
    department: "Electromenager",
    difficulty: "intermediate",
    serviceTargets: ["extension de garantie", "livraison rapide", "financement"],
    trainingFocus: [
      "differencier magasin vs internet par le service",
      "vendre la garantie comme solution de tranquillite",
      "presenter une option de paiement sans ralentir le client"
    ],
    clientPersona:
      "Homme 28-38 ans, tres connecte, a deja compare les prix en ligne",
    visibleNeed: "Acheter un lave-linge",
    hiddenNeed: "Veut etre sur de faire le meilleur deal, besoin d'etre rassure",
    budget: "400 a 600 euros",
    objections: [
      "J'ai vu moins cher sur Amazon",
      "Je peux pas attendre pour la livraison",
      "La garantie c'est inutile j'ai la CB",
      "Le credit pour un lave-linge, non merci"
    ],
    expectedSkills: [
      "differenciation vs internet",
      "argumentation services",
      "rapidite et efficacite",
      "closing ferme",
      "vente garantie",
      "presentation financement courte"
    ],
    successCriteria: [
      "valoriser les services magasin",
      "repondre a l'objection internet",
      "conclure rapidement",
      "proposer garantie ou livraison sans alourdir"
    ]
  },
  {
    id: "services-client-sceptique",
    title: "Services - Client sceptique",
    department: "Services",
    difficulty: "advanced",
    serviceTargets: [
      "extension de garantie",
      "assurance esthetisme",
      "credit",
      "livraison",
      "montage"
    ],
    trainingFocus: [
      "creer la confiance avant de proposer les services",
      "vendre garantie et assurance esthetisme avec exemples concrets",
      "presenter le credit de facon transparente et non forcee"
    ],
    clientPersona: "Client 45-55 ans, mefiant, mauvaises experiences passees",
    visibleNeed: "Acheter un TV mais n'a pas encore decide",
    hiddenNeed: "A peur des arnaques et des mauvaises surprises",
    budget: "500 a 800 euros",
    objections: [
      "La garantie c'est des arnaques",
      "L'assurance esthetisme, c'est encore une assurance cachee",
      "Le credit ca coute trop cher",
      "J'ai pas besoin de montage",
      "Je vais reflechir"
    ],
    expectedSkills: [
      "instaurer la confiance",
      "valoriser garantie concretement",
      "valoriser assurance esthetisme concretement",
      "presenter credit avec interets rembourses",
      "closing patient"
    ],
    successCriteria: [
      "creer la confiance avant de proposer les services",
      "citer des exemples concrets de garantie",
      "citer des exemples concrets d'assurance esthetisme",
      "ne pas forcer"
    ]
  }
];

export function getScenario(id: string) {
  return scenarios.find((scenario) => scenario.id === id);
}

export const departments = Array.from(
  new Set(scenarios.map((scenario) => scenario.department))
);
