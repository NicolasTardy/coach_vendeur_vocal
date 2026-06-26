import type { Scenario, ServiceKey } from "@/lib/types";

// Contenu issu des documents sources du dossier docs/source:
// - "Estaly BUT — Protection esthetique.pptx" (21 slides: amorces, objections,
//   escalier, mots interdits, exclusions, eligibilite)
// - "garantie-prolongee-but.pdf" (GLD: couverture panne, exclusions)
// - "A4_web Conditions Generales Carte BUT Mastercard.pdf" (Cpay: credit
//   renouvelable BNP Paribas Personal Finance, sous reserve d'acceptation)
//
// Objectif: les prompts client/coach et le rapport s'appuient sur les VRAIS
// scripts BUT au lieu d'improviser.

type ObjectionScript = {
  objection: string;
  response: string;
};

type Playbook = {
  id: string;
  service: ServiceKey;
  title: string;
  targetKeywords: string[];
  // Brief court injecte dans le prompt CLIENT (ce a quoi le client reagit).
  clientBrief: string;
  // Brief court injecte dans le prompt COACH (ce qu'il faut evaluer).
  coachBrief: string;
  // Phrases d'amorce reelles, naturelles, integrees a la conversation.
  amorces: string[];
  // Scripts de reponse aux objections les plus frequentes.
  objections: ObjectionScript[];
  // Ce qui est couvert / exclu, pour eviter les fausses promesses.
  covered: string[];
  excluded: string[];
  // Mots a bannir -> mot a employer a la place (surtout Estaly).
  wordsToAvoid: Array<{ instead: string; say: string }>;
  // Points de conformite a ne jamais enfreindre.
  compliance: string[];
};

export const salesPlaybooks: Playbook[] = [
  {
    id: "credit-carte-but-cpay",
    service: "cpay",
    title: "Credit / carte BUT Cpay",
    targetKeywords: ["credit", "financement", "carte", "cpay", "paiement"],
    clientBrief:
      "Frein budget: tu ecoutes si l'option est facultative, claire et sans surprise. La carte Cpay = credit renouvelable + fidelite, soumis a acceptation. Tu refuses si on te force ou si on te promet un taux/une acceptation.",
    coachBrief:
      "Partir du frein budget, annoncer le prix total, puis proposer une lecture en mensualites possibles. Demander l'accord avant de presenter Cpay. Rester transparent: facultatif, soumis a etude et acceptation (BNP Paribas Personal Finance/Cetelem), credit renouvelable. Verifier le confort, puis micro-closing.",
    amorces: [
      "Le modele qu'on a choisi est a [X] euros. Si vous voulez, on peut le regarder en mensualites possibles pour voir si ca reste confortable. Je vous montre ?",
      "Pour ne pas rogner sur le meilleur choix, il existe la carte BUT, qui permet d'etaler. C'est facultatif et soumis a acceptation. Vous voulez que je vous explique ?"
    ],
    objections: [
      {
        objection: "Je ne veux pas de credit",
        response:
          "Je comprends. C'est vous qui decidez, c'est totalement facultatif. L'idee c'est juste de garder le meilleur modele sans peser d'un coup sur le budget. Si ca ne vous parle pas, on reste sur le paiement classique."
      },
      {
        objection: "C'est quoi le taux / ca va me couter combien en plus",
        response:
          "Le financement passe par un organisme partenaire et depend d'une etude, donc je ne peux rien vous promettre sur le taux ou l'acceptation. Ce que je peux faire, c'est vous montrer une simulation indicative, et vous restez libre."
      },
      {
        objection: "Je n'aime pas les cartes de magasin",
        response:
          "Pas de souci, on n'est pas obliges. La carte sert surtout a etaler et a cumuler de la fidelite, mais si vous preferez payer comptant, on fait comme ca."
      }
    ],
    covered: [
      "Etalement du paiement via credit renouvelable",
      "Programme de fidelite BUT associe a la carte"
    ],
    excluded: [
      "Aucune acceptation garantie: tout est soumis a etude (BNP Paribas Personal Finance)",
      "Pas de promesse de taux, de mensualite exacte, de gratuite ou d'acceptation"
    ],
    wordsToAvoid: [],
    compliance: [
      "Toujours dire facultatif et soumis a acceptation",
      "Ne jamais promettre un taux, une mensualite, une gratuite ou une acceptation",
      "Distinguer clairement credit (Cpay) et protection (GLD/Estaly)"
    ]
  },
  {
    id: "garantie-prolongee-but",
    service: "gld",
    title: "Garantie longue duree (GLD)",
    targetKeywords: ["garantie", "extension", "montage", "livraison", "transport"],
    clientBrief:
      "Tu acceptes la garantie si elle est reliee a un risque produit concret: panne, moteur, batterie, electronique, mecanisme, montage, transport, immobilisation. Tu refuses si le discours est vague ou pousse sans lien avec ton usage.",
    coachBrief:
      "Partir d'un risque d'usage concret (panne, moteur, batterie, electronique, dalle, mecanisme, immobilisation), donner un exemple parlant, puis le benefice tranquillite (reparation/echange, +annees apres garantie fabricant), et verifier l'interet. Ne pas vendre la GLD sur l'esthetique.",
    amorces: [
      "Sur ce type de produit, le vrai risque c'est la panne une fois la garantie fabricant terminee. La GLD prolonge la prise en charge: si ca tombe en panne, c'est repare ou echange.",
      "Vu que c'est un usage quotidien, la garantie longue duree vous met a l'abri d'une immobilisation: vous n'avez pas a avancer une reparation couteuse."
    ],
    objections: [
      {
        objection: "La garantie ca ne sert a rien sur du neuf",
        response:
          "Sur le neuf vous avez la garantie fabricant, c'est vrai. La GLD prend le relais apres, justement quand une panne devient a votre charge. C'est la que ca evite la grosse depense imprevue."
      },
      {
        objection: "Pour ce prix-la je ne vais pas prendre une garantie",
        response:
          "Je comprends. Le point c'est que sur ce produit la piece qui lache le plus (batterie/moteur) coute souvent une bonne partie du prix neuf. La GLD couvre exactement ce risque-la."
      },
      {
        objection: "Je veux juste savoir le prix final",
        response:
          "Bien sur. Je vous donne le prix, et je vous montre juste l'option garantie en une phrase: vous etes couvert en cas de panne apres le fabricant. Vous gardez ou pas, comme vous voulez."
      }
    ],
    covered: [
      "Panne apres garantie fabricant: reparation ou echange",
      "Pieces a risque selon le produit: moteur, batterie, electronique, mecanisme",
      "Prise en charge transport/montage selon le produit"
    ],
    excluded: [
      "Usure normale et mauvais usage",
      "Dommages esthetiques (c'est le perimetre d'Estaly, pas la GLD)",
      "Procedure non suivie / produit non designe sur la facture"
    ],
    wordsToAvoid: [],
    compliance: [
      "Relier la garantie a un risque concret, jamais un discours vague",
      "Ne pas confondre panne (GLD) et esthetique (Estaly)"
    ]
  },
  {
    id: "estaly-protection-esthetique",
    service: "estaly",
    title: "Protection esthetique Estaly",
    targetKeywords: ["esthetique", "esthetisme", "estaly", "tache", "rayure"],
    clientBrief:
      "La protection Estaly te parle si le risque est concret au quotidien: tache, rayure, griffure, eclat, brulure, dechirure sur un meuble visible. Tu refuses le mot 'assurance' et tu n'en veux pas si le produit n'est pas concerne. Souscription uniquement le jour de l'achat.",
    coachBrief:
      "Dire PROTECTION, jamais assurance. Partir d'un risque visible deja formule par le client (tache, rayure, eclat, brulure, dechirure). Amorce courte en presomption ('je vous mets la protection ?'), bon d'achat du montant du produit si sinistre accepte, traite dans la journee, souscription UNIQUEMENT le jour de l'achat. Proposer APRES la garantie (escalier), jamais avant. Eligible uniquement sur le mobilier (pas electromenager/image-son).",
    amorces: [
      "D'ailleurs, sur ce modele-la, il y a une protection taches et rayures a [X] euros. Si ca arrive, c'est nous qui remboursons en bon d'achat.",
      "Avant qu'on valide, je vous mets la protection ? C'est [X] euros, et si votre meuble prend une tache ou une rayure, on vous rembourse le montant en bon d'achat."
    ],
    objections: [
      {
        objection: "C'est quoi exactement ?",
        response:
          "C'est simple: pendant 12 ou 24 mois, si votre produit prend un coup (tache, rayure, brulure, eclat), vous declarez en ligne avec une photo, et on vous fait un bon d'achat du montant de votre produit. C'est traite dans la journee, et ca couvre ce que la garantie fabricant ne prend pas."
      },
      {
        objection: "Non merci",
        response:
          "Pas de souci. Sachez juste que c'est disponible uniquement le jour de l'achat, on ne peut pas le rajouter apres. Si vous changez d'avis avant la caisse, dites-le-moi."
      },
      {
        objection: "C'est trop cher / ca fait un truc en plus",
        response:
          "Je comprends. Sur 24 mois ca revient a [montant]. Si votre meuble prend ne serait-ce qu'une tache, on vous rembourse [montant du produit] en bon d'achat. Le calcul se fait tout seul."
      }
    ],
    covered: [
      "Taches accidentelles (vin, cafe, gras, encre, maquillage)",
      "Rayures et griffures profondes (bois, verre, metal, cuir)",
      "Eclats et ebrechures suite a un choc",
      "Brulures (cigarette, fer a repasser, plat chaud)",
      "Dechirures et perforations (tissus, cuirs, synthetiques)"
    ],
    excluded: [
      "Pannes et defauts (garantie fabricant/extension, pas Estaly)",
      "Usure normale, affaissement, boulochage, decoloration",
      "Dommages animaux (griffures, morsures, dejections)",
      "Defaut d'entretien et transport/demenagement",
      "Matieres non eligibles: nubuck, soie, 'nettoyage a sec uniquement'",
      "Produits non mobilier: electromenager, image et son, reconditionne/occasion"
    ],
    wordsToAvoid: [
      { instead: "Assurance", say: "Protection" },
      { instead: "Imaginez que...", say: "Si ca arrive... (factuel)" },
      { instead: "Paiement fractionne", say: "C'est [X] euros, c'est tout" },
      { instead: "Couverture complementaire", say: "Ca couvre ce que la garantie ne couvre pas" }
    ],
    compliance: [
      "Toujours dire protection, jamais assurance",
      "Souscription possible uniquement le jour de l'achat",
      "Proposer la protection APRES la garantie, jamais avant (regle de l'escalier)",
      "Ne pas creer de fausse attente sur les exclusions (animaux, transport, matieres)"
    ]
  }
];

type PlaybookMode = "client" | "coach";

export function buildSalesPlaybookContext(
  scenario: Scenario,
  mode: PlaybookMode = "coach"
) {
  return selectPlaybooks(scenario)
    .map((playbook) =>
      mode === "client"
        ? `${playbook.title}: ${playbook.clientBrief}`
        : formatCoachPlaybook(playbook)
    )
    .join("\n\n");
}

// Contexte coach detaille: amorces, scripts d'objection, couvert/exclu et mots
// interdits, pour que le rapport cite de vrais scripts BUT.
function formatCoachPlaybook(playbook: Playbook) {
  const amorces = playbook.amorces.map((line) => `  - ${line}`).join("\n");
  const objections = playbook.objections
    .map((item) => `  - "${item.objection}" -> ${item.response}`)
    .join("\n");
  const words =
    playbook.wordsToAvoid.length > 0
      ? `\nMots interdits -> a dire:\n${playbook.wordsToAvoid
          .map((item) => `  - ${item.instead} -> ${item.say}`)
          .join("\n")}`
      : "";

  return [
    `${playbook.title}: ${playbook.coachBrief}`,
    `Phrases d'amorce:\n${amorces}`,
    `Reponses objections:\n${objections}`,
    `Couvert: ${playbook.covered.join("; ")}`,
    `Exclu: ${playbook.excluded.join("; ")}${words}`,
    `Conformite: ${playbook.compliance.join("; ")}`
  ].join("\n");
}

// Donnees structurees pour les indices vendeur (carte d'aide en magasin).
// Reutilise par l'UI: amorces + couvert/exclu du service.
export function getPlaybookForService(service: ServiceKey) {
  return salesPlaybooks.find((playbook) => playbook.service === service);
}

function selectPlaybooks(scenario: Scenario) {
  const targets = scenario.serviceTargets.join(" ").toLowerCase();
  const relevant = salesPlaybooks.filter((playbook) =>
    playbook.targetKeywords.some((keyword) => targets.includes(keyword))
  );

  return relevant.length > 0 ? relevant : salesPlaybooks;
}
