import type { Scenario } from "@/lib/types";

// Chaque scenario correspond au produit que le vendeur annonce vendre.
// L'objectif d'apprentissage reste le meme: creer le reflexe de presenter
// le budget en mensualites et de proposer les protections pertinentes.

export const scenarios: Scenario[] = [
  {
    id: "machine-laver-linge",
    title: "Machine a laver le linge",
    department: "Lavage",
    serviceTargets: ["carte/credit Cpay", "GLD garantie longue duree"],
    trainingFocus: [
      "annoncer le prix aussi en mensualites possibles",
      "proposer Cpay de facon transparente apres le frein budget",
      "vendre la GLD sur le risque panne et immobilisation"
    ],
    productOptions: [
      "modele 8 kg a 499 euros, simple et disponible",
      "modele 9 kg plus silencieux a 649 euros",
      "modele 10 kg avec vapeur a 799 euros"
    ],
    openingLine:
      "Merci, vos conseils sont clairs. J'hesite encore entre les modeles 8 kg, 9 kg et celui avec vapeur. Les trois peuvent aller, mais je ne sais pas lequel choisir.",
    clientPersona:
      "Client presse, famille de 4 personnes, lave-linge en panne depuis 2 jours",
    visibleNeed: "Acheter une machine a laver fiable rapidement",
    hiddenNeed:
      "Peur de payer cher puis de se retrouver sans machine en cas de panne",
    budget: "450 a 700 euros",
    objections: [
      "J'ai vu moins cher sur internet",
      "Je ne veux pas de credit",
      "La garantie ca ne sert a rien sur du neuf",
      "Je veux juste savoir le prix final"
    ],
    expectedSkills: [
      "questionner l'urgence et l'usage familial",
      "presenter le prix en mensualites possibles sans masquer le credit",
      "proposer la GLD avec un exemple de panne concret",
      "verifier le confort budgetaire avant de closer",
      "ne pas proposer Estaly sur un produit non eligible"
    ],
    successCriteria: [
      "le prix est reformule avec une option de mensualite",
      "Cpay est presentee comme facultative et soumise a acceptation",
      "GLD est reliee au risque panne/immobilisation",
      "le vendeur ne decide pas a la place du client"
    ],
    discoveryRecap:
      "Famille de 4, lave-linge en panne depuis 2 jours, besoin rapide. Le conseil produit est fait: le client hesite entre 8 kg, 9 kg et le modele vapeur.",
    capturedSignals: [
      {
        clientQuote: "Mon lave-linge est en panne depuis 2 jours",
        reading: "Urgence et peur de se retrouver de nouveau sans machine en cas de panne",
        service: "gld"
      },
      {
        clientQuote: "On est une famille de 4",
        reading: "Usage intensif quotidien qui sollicite le moteur et le tambour",
        service: "gld"
      },
      {
        clientQuote: "Je voudrais rester autour de 450 a 700 euros",
        reading: "Frein budget: le total peut bloquer le passage au meilleur modele",
        service: "cpay"
      },
      {
        clientQuote: "Les trois peuvent aller, je ne sais pas lequel choisir",
        reading: "Decision bloquee sur un critere a clarifier (capacite, silence, budget)",
        service: "choix"
      }
    ],
    serviceEligibility: [
      {
        service: "gld",
        eligible: true,
        reason: "Gros electromenager: panne, moteur, immobilisation rendent la GLD pertinente"
      },
      {
        service: "cpay",
        eligible: true,
        reason: "Le budget est un frein possible: mensualites/Cpay utiles au bon moment"
      },
      {
        service: "estaly",
        eligible: false,
        reason: "Electromenager exclu d'Estaly: NE PAS proposer la protection esthetique"
      }
    ]
  },
  {
    id: "canape-3-places",
    title: "Canape 3 places",
    department: "Salon",
    serviceTargets: [
      "protection esthetique Estaly",
      "GLD garantie longue duree",
      "carte/credit Cpay"
    ],
    trainingFocus: [
      "faire emerger le risque tache/rayure/accroc du quotidien",
      "proposer Estaly comme protection et non comme assurance",
      "presenter Cpay pour proteger le budget sans reduire le projet"
    ],
    productOptions: [
      "canape tissu fixe a 899 euros",
      "canape convertible a 1199 euros",
      "canape relax avec revetement plus resistant a 1399 euros"
    ],
    openingLine:
      "Franchement merci, vous m'avez bien aide. J'hesite entre le tissu fixe, le convertible et le relax plus resistant. Les conseils sont bons, maintenant c'est surtout le choix final qui me bloque.",
    clientPersona:
      "Couple avec un enfant, veut un canape confortable mais facile a garder propre",
    visibleNeed: "Acheter un canape 3 places pour le salon",
    hiddenNeed:
      "Peur des taches, accrocs et de regretter un achat visible tous les jours",
    budget: "800 a 1300 euros",
    objections: [
      "Estaly ca fait encore un truc en plus",
      "On va reflechir",
      "La garantie ca sert a rien",
      "Le credit on prefere eviter"
    ],
    expectedSkills: [
      "questionner enfants, repas dans le salon, usage et matiere",
      "proposer Estaly avec exemple tache/rayure et souscription jour achat",
      "proposer la GLD si mecanisme ou usage long terme pertinent",
      "presenter le budget en mensualites possibles",
      "traiter le refus sans forcer"
    ],
    successCriteria: [
      "Estaly est reliee a un risque visible formule par le client",
      "le mot protection est utilise, pas assurance",
      "Cpay est presentee si le budget devient un frein",
      "une micro-decision est proposee sans pression"
    ],
    discoveryRecap:
      "Couple avec un enfant, veut du confort facile a garder propre. Le conseil produit est fait: le client hesite entre le tissu fixe, le convertible et le relax plus resistant.",
    capturedSignals: [
      {
        clientQuote: "On a un enfant a la maison",
        reading: "Risque taches et accrocs du quotidien sur un meuble visible chaque jour",
        service: "estaly"
      },
      {
        clientQuote: "Je veux quelque chose de facile a garder propre",
        reading: "Peur des taches et de regretter un achat visible: protection esthetique",
        service: "estaly"
      },
      {
        clientQuote: "Le credit on prefere eviter",
        reading: "Resistance credit a traiter avec transparence, mensualite possible",
        service: "cpay"
      },
      {
        clientQuote: "C'est surtout le choix final qui me bloque",
        reading: "Critere de choix a trancher: resistance du revetement vs budget",
        service: "choix"
      }
    ],
    serviceEligibility: [
      {
        service: "estaly",
        eligible: true,
        reason: "Univers Siege (canapes/fauteuils) sous 2000 euros: Estaly eligible (taches, rayures)"
      },
      {
        service: "gld",
        eligible: true,
        reason: "Pertinente si mecanisme (convertible/relax) ou usage long terme; a proposer AVANT Estaly"
      },
      {
        service: "cpay",
        eligible: true,
        reason: "Budget 800-1300: la mensualite aide a garder le modele resistant sans rogner le projet"
      }
    ]
  },
  {
    id: "matelas-sommier",
    title: "Matelas et sommier",
    department: "Literie",
    serviceTargets: [
      "GLD garantie longue duree",
      "protection esthetique Estaly",
      "carte/credit Cpay"
    ],
    trainingFocus: [
      "relier le prix a un investissement de sommeil sur plusieurs annees",
      "proposer Cpay pour lisser le budget",
      "proposer la protection pertinente selon usage et risques"
    ],
    productOptions: [
      "ensemble matelas mousse + sommier a 999 euros",
      "ensemble ressorts ensaches plus ferme a 1299 euros",
      "ensemble premium avec meilleur soutien a 1599 euros"
    ],
    openingLine:
      "Vos explications m'ont rassure. J'hesite entre l'ensemble mousse, le ressorts ensaches et le premium. Je sens les differences, mais je ne sais pas si ca vaut le budget.",
    clientPersona:
      "Couple 40-55 ans, douleurs de dos, hesite a monter en gamme",
    visibleNeed: "Changer un matelas et un sommier",
    hiddenNeed:
      "Peur de se tromper sur un achat important utilise chaque nuit",
    budget: "900 a 1600 euros",
    objections: [
      "C'est cher pour un lit",
      "On peut pas vraiment savoir si ca ira",
      "Le credit on n'aime pas trop",
      "La protection, je ne vois pas l'interet"
    ],
    expectedSkills: [
      "questionner sommeil, douleur, morphologie et duree d'usage",
      "presenter le prix en mensualites possibles",
      "relier GLD/protection au sommier, a l'usage long terme et aux accidents",
      "faire reformuler le client avant d'argumenter",
      "donner une phrase de choix claire"
    ],
    successCriteria: [
      "le budget est traduit en confort mensuel possible",
      "Cpay est transparent et non force",
      "la protection proposee est reliee a un risque concret",
      "le vendeur verifie l'interet avant de closer"
    ],
    discoveryRecap:
      "Couple 40-55 ans, douleurs de dos, hesite a monter en gamme. Le conseil produit est fait: le client hesite entre l'ensemble mousse, les ressorts ensaches et le premium.",
    capturedSignals: [
      {
        clientQuote: "On a des douleurs de dos",
        reading: "Achat soutien important, utilise chaque nuit pendant des annees",
        service: "choix"
      },
      {
        clientQuote: "Je ne sais pas si ca vaut le budget",
        reading: "Frein budget sur la montee en gamme: lisser en mensualites",
        service: "cpay"
      },
      {
        clientQuote: "Peur de me tromper sur un achat utilise chaque nuit",
        reading: "Besoin de tranquillite et risque taches/usure visibles sur la literie",
        service: "estaly"
      },
      {
        clientQuote: "C'est cher pour un lit",
        reading: "Objection prix sur l'ensemble matelas + sommier",
        service: "cpay"
      }
    ],
    serviceEligibility: [
      {
        service: "cpay",
        eligible: true,
        reason: "Budget 900-1600: la mensualite evite de rogner la gamme de soutien"
      },
      {
        service: "estaly",
        eligible: true,
        reason: "Univers Literie (matelas/sommiers) sous 2000 euros: Estaly eligible (taches accidentelles)"
      },
      {
        service: "gld",
        eligible: true,
        reason: "Pertinente sur le sommier/mecanisme et l'usage long terme; a proposer AVANT Estaly"
      }
    ]
  },
  {
    id: "aspirateur-balais",
    title: "Aspirateur balais",
    department: "Electromenager",
    serviceTargets: ["GLD garantie longue duree", "carte/credit Cpay"],
    trainingFocus: [
      "ne pas oublier les services sur un panier plus petit",
      "proposer la GLD sur batterie, moteur et usage quotidien",
      "presenter Cpay simplement si le prix bloque"
    ],
    productOptions: [
      "modele leger a 279 euros",
      "modele plus puissant a 399 euros",
      "modele premium avec meilleure autonomie a 499 euros"
    ],
    openingLine:
      "Merci, c'est beaucoup plus clair. J'hesite entre le modele leger, le plus puissant et celui avec plus d'autonomie. Je veux juste eviter de me tromper.",
    clientPersona:
      "Client compare les modeles, veut legerete et autonomie pour usage quotidien",
    visibleNeed: "Acheter un aspirateur balais performant",
    hiddenNeed:
      "Peur que la batterie faiblisse ou que le produit tombe en panne trop vite",
    budget: "250 a 500 euros",
    objections: [
      "Pour ce prix la je ne vais pas prendre une garantie",
      "Je vais regarder les avis avant",
      "Le credit pour un aspirateur, non merci",
      "Je veux surtout qu'il tienne dans le temps"
    ],
    expectedSkills: [
      "questionner frequence d'usage, surface et autonomie",
      "proposer GLD avec risque batterie/moteur",
      "evoquer Cpay court et transparent si frein prix",
      "ne pas proposer Estaly sur un produit non eligible",
      "conclure rapidement"
    ],
    successCriteria: [
      "GLD est proposee malgre un panier plus petit",
      "le vendeur relie le service a batterie/moteur/usage quotidien",
      "Cpay est proposee uniquement comme option claire",
      "le closing reste court"
    ],
    discoveryRecap:
      "Client qui compare les modeles, veut legerete et autonomie pour un usage quotidien. Le conseil produit est fait: il hesite entre le leger, le plus puissant et le premium autonomie.",
    capturedSignals: [
      {
        clientQuote: "Je veux surtout qu'il tienne dans le temps",
        reading: "Peur que la batterie faiblisse ou d'une panne precoce: GLD batterie/moteur",
        service: "gld"
      },
      {
        clientQuote: "C'est pour un usage quotidien",
        reading: "Sollicitation forte de la batterie et du moteur",
        service: "gld"
      },
      {
        clientQuote: "Pour ce prix-la je ne vais pas prendre une garantie",
        reading: "Objection panier reduit: a traiter par le risque batterie concret",
        service: "gld"
      },
      {
        clientQuote: "Le credit pour un aspirateur, non merci",
        reading: "Cpay peu pertinent sur petit panier: ne pas forcer",
        service: "cpay"
      }
    ],
    serviceEligibility: [
      {
        service: "gld",
        eligible: true,
        reason: "Risque batterie/moteur/usage quotidien: GLD pertinente malgre le petit panier"
      },
      {
        service: "cpay",
        eligible: true,
        reason: "Possible mais petit panier: a proposer seulement si le prix bloque vraiment"
      },
      {
        service: "estaly",
        eligible: false,
        reason: "Petit electromenager exclu d'Estaly: NE PAS proposer la protection esthetique"
      }
    ]
  },
  {
    id: "salle-manger-table-chaises",
    title: "Salle a manger table et chaises",
    department: "Meuble",
    serviceTargets: [
      "protection esthetique Estaly",
      "GLD garantie longue duree",
      "carte/credit Cpay"
    ],
    trainingFocus: [
      "faire verbaliser les risques repas/enfants/invites",
      "proposer Estaly sur taches, rayures, eclats et brulures",
      "presenter le budget en mensualites pour garder l'ensemble complet"
    ],
    productOptions: [
      "table + 4 chaises a 1099 euros",
      "table extensible + 6 chaises a 1499 euros",
      "ensemble plus resistant avec plateau ceramique a 1799 euros"
    ],
    openingLine:
      "Merci, je comprends mieux les differences. J'hesite entre l'ensemble simple, la table extensible avec 6 chaises et le plateau ceramique. On recoit souvent, donc je ne veux pas regretter.",
    clientPersona:
      "Famille qui recoit souvent, cherche une table et six chaises assorties",
    visibleNeed: "Acheter une salle a manger table et chaises",
    hiddenNeed:
      "Peur d'abimer vite un ensemble visible avec repas, enfants et invites",
    budget: "1000 a 1800 euros",
    objections: [
      "On va peut-etre prendre seulement la table",
      "La protection ca fait monter le prix",
      "On fera attention",
      "Je n'aime pas les cartes de magasin"
    ],
    expectedSkills: [
      "questionner usage repas, enfants, invites et matieres",
      "proposer Estaly avec exemples tache/rayure/brulure",
      "proposer Cpay pour conserver table + chaises sans rogner le projet",
      "proposer GLD si montage, mecanismes ou risques meuble pertinents",
      "faire choisir sans pression"
    ],
    successCriteria: [
      "Estaly est reliee aux accidents de repas",
      "le vendeur ne reduit pas le panier avant d'avoir propose la mensualite",
      "Cpay est transparent et facultatif",
      "le client garde le choix"
    ],
    discoveryRecap:
      "Famille qui recoit souvent, cherche une table et six chaises assorties. Le conseil produit est fait: le client hesite entre l'ensemble simple, la table extensible 6 chaises et le plateau ceramique.",
    capturedSignals: [
      {
        clientQuote: "On recoit souvent",
        reading: "Repas frequents: risque taches, rayures, brulures sur un meuble visible",
        service: "estaly"
      },
      {
        clientQuote: "Je ne veux pas regretter",
        reading: "Peur d'abimer vite un ensemble visible: protection esthetique",
        service: "estaly"
      },
      {
        clientQuote: "On va peut-etre prendre seulement la table",
        reading: "Reflexe de reduire le panier: a traiter par la mensualite avant de rogner",
        service: "cpay"
      },
      {
        clientQuote: "Je n'aime pas les cartes de magasin",
        reading: "Resistance Cpay: rester transparent et facultatif",
        service: "cpay"
      }
    ],
    serviceEligibility: [
      {
        service: "estaly",
        eligible: true,
        reason: "Univers Sejour/Chaises (tables, chaises) sous 2000 euros: Estaly eligible"
      },
      {
        service: "cpay",
        eligible: true,
        reason: "Budget 1000-1800: la mensualite permet de garder table + chaises completes"
      },
      {
        service: "gld",
        eligible: true,
        reason: "Pertinente si mecanisme table extensible ou montage; a proposer AVANT Estaly"
      }
    ]
  },
  {
    id: "television-led-65",
    title: "Television LED 65 pouces",
    department: "Image",
    serviceTargets: ["GLD garantie longue duree", "carte/credit Cpay"],
    trainingFocus: [
      "presenter le prix en mensualites pour un achat plaisir important",
      "proposer GLD sur electronique, dalle et immobilisation",
      "traiter l'objection internet par le service et la tranquillite"
    ],
    productOptions: [
      "TV LED 65 pouces a 749 euros",
      "TV QLED 65 pouces a 999 euros",
      "TV premium 65 pouces meilleure fluidite a 1199 euros"
    ],
    openingLine:
      "Merci pour les explications, c'est vraiment clair. J'hesite entre la LED, la QLED et la premium plus fluide. Je veux me faire plaisir, mais je compare encore.",
    clientPersona:
      "Client amateur de sport et streaming, compare les prix en ligne",
    visibleNeed: "Acheter une television LED 65 pouces",
    hiddenNeed:
      "Veut se faire plaisir sans depasser son budget et eviter une panne couteuse",
    budget: "700 a 1200 euros",
    objections: [
      "Je l'ai vue moins chere en ligne",
      "Une garantie sur une TV neuve, bof",
      "Je ne veux pas de credit",
      "Je vais attendre les promos"
    ],
    expectedSkills: [
      "questionner usage sport, streaming, recul et budget",
      "presenter le prix en mensualites possibles",
      "proposer GLD avec risque electronique/dalle",
      "ne pas proposer Estaly sur un produit non eligible",
      "faire un closing doux sur le confort budgetaire"
    ],
    successCriteria: [
      "Cpay est proposee comme option pour proteger le budget",
      "GLD est reliee au risque electronique",
      "le vendeur reste transparent sur le credit",
      "le service magasin est valorise face a internet"
    ],
    discoveryRecap:
      "Client amateur de sport et streaming, compare les prix en ligne. Le conseil produit est fait: il hesite entre la LED, la QLED et la premium plus fluide.",
    capturedSignals: [
      {
        clientQuote: "Je l'ai vue moins chere en ligne",
        reading: "Comparaison internet: valoriser le service magasin et la tranquillite GLD",
        service: "gld"
      },
      {
        clientQuote: "Je veux me faire plaisir sans depasser mon budget",
        reading: "Achat plaisir avec frein budget: mensualites/Cpay pour proteger le budget",
        service: "cpay"
      },
      {
        clientQuote: "J'aimerais eviter une panne couteuse",
        reading: "Peur d'une panne electronique/dalle hors garantie fabricant: GLD",
        service: "gld"
      },
      {
        clientQuote: "Je vais peut-etre attendre les promos",
        reading: "Temporisation: closer en douceur sur le confort budget et la dispo",
        service: "choix"
      }
    ],
    serviceEligibility: [
      {
        service: "gld",
        eligible: true,
        reason: "Electronique et dalle, panne couteuse hors garantie fabricant: GLD pertinente"
      },
      {
        service: "cpay",
        eligible: true,
        reason: "Achat plaisir 700-1200: la mensualite protege le budget"
      },
      {
        service: "estaly",
        eligible: false,
        reason: "Image et son exclus d'Estaly: NE PAS proposer la protection esthetique"
      }
    ]
  }
];

export function getScenario(id: string) {
  return scenarios.find((scenario) => scenario.id === id);
}

export const departments = Array.from(
  new Set(scenarios.map((scenario) => scenario.department))
);
