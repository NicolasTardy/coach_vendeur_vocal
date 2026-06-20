import type { Scenario } from "@/lib/types";

type Playbook = {
  id: string;
  title: string;
  targetKeywords: string[];
  whenToUse: string[];
  customerBenefits: string[];
  pitchLines: string[];
  objectionResponses: Array<{
    objection: string;
    response: string;
  }>;
  compliance: string[];
  exclusions: string[];
};

export const salesPlaybooks: Playbook[] = [
  {
    id: "credit-carte-but-cpay",
    title: "Credit, financement et carte BUT Cpay Mastercard",
    targetKeywords: ["credit", "financement", "carte", "cpay", "paiement"],
    whenToUse: [
      "achat important avec frein budgetaire",
      "projet cuisine, literie, canape ou electromenager",
      "client qui veut garder de la souplesse de tresorerie",
      "client interesse par les avantages fidelite de la carte"
    ],
    customerBenefits: [
      "donner une option de paiement au lieu de reduire tout de suite le projet",
      "acceder au programme de fidelite BUT associe a la carte",
      "cumuler des points sur les achats regles avec la carte",
      "beneficier aussi des avantages fidelite en paiement comptant avec la carte"
    ],
    pitchLines: [
      "Pour le budget, je peux vous presenter une option de paiement avec la carte BUT Cpay Mastercard. C'est facultatif et soumis a acceptation, mais ca permet de garder le projet complet sans tout regler d'un coup.",
      "Vous pouvez aussi utiliser la carte en paiement comptant: les avantages fidelite existent independamment du recours au credit.",
      "Avant de parler de financement, je veux surtout verifier que la solution produit et services correspond bien a votre besoin."
    ],
    objectionResponses: [
      {
        objection: "Je ne veux pas prendre de credit.",
        response:
          "Je comprends. On ne part pas sur un credit si ce n'est pas confortable pour vous. Je vous l'explique simplement comme une option, et vous decidez."
      },
      {
        objection: "Le credit ca coute trop cher.",
        response:
          "C'est justement pour ca qu'il faut regarder les conditions clairement avant de choisir. Si le cout ne vous convient pas, on garde une solution comptant ou on ajuste le projet."
      },
      {
        objection: "Je n'aime pas les cartes de magasin.",
        response:
          "Je comprends. Ici, l'important est que ce soit facultatif et transparent. On peut separer les avantages fidelite, le paiement comptant avec la carte et l'utilisation du credit."
      }
    ],
    compliance: [
      "ne jamais presenter le credit comme automatique",
      "dire que l'acceptation depend de l'organisme preteur",
      "dire que la carte est facultative",
      "ne pas masquer qu'elle est associee a un credit renouvelable",
      "ne jamais pousser un client qui exprime une gene budgetaire forte",
      "ne pas promettre de taux, mensualite ou avantage non present dans les informations disponibles",
      "rappeler que l'utilisation du credit necessite l'accord expres du client"
    ],
    exclusions: [
      "ne pas dire paiement fractionne si cela masque le credit",
      "ne pas dire gratuit sauf condition documentee",
      "ne pas utiliser la carte pour contourner une objection budget non resolue"
    ]
  },
  {
    id: "garantie-prolongee-but",
    title: "Extension de garantie et services BUT",
    targetKeywords: ["garantie", "extension", "montage", "livraison", "transport"],
    whenToUse: [
      "electromenager avec risque de panne",
      "meuble ou siege avec mecanismes, montage, couture ou bris de verre",
      "cuisine avec risque transport, montage, erreur de metrage, demenagement ou dommages etendus",
      "client qui veut eviter une mauvaise surprise apres l'achat"
    ],
    customerBenefits: [
      "extension de 3 ans apres la garantie legale de 2 ans selon l'offre",
      "reparation ou echange/dedommagement quand les conditions sont reunies",
      "hotline et procedure encadree",
      "capital reprise: remise de 20% pour un nouveau bien avec nouvelle garantie, ou 30% si l'ancien bien a ete regle par carte BUT, dans les limites prevues",
      "sur electromenager en offre renforcee: accessoires rembourses et service tranquillite en cas de panne selon les conditions",
      "sur cuisine: garanties transport, premier montage, droit a l'erreur, dommages etendus et demenagement selon les conditions"
    ],
    pitchLines: [
      "La garantie prolongee sert surtout a proteger la duree d'usage: si un probleme couvert arrive apres la garantie legale, vous avez une procedure de prise en charge.",
      "Sur ce type de produit, le vrai sujet c'est le risque d'immobilisation ou de remplacement. La garantie evite de vous retrouver seul face au probleme.",
      "Je vous la presente en deux phrases, et vous me dites si ca a du sens pour votre usage."
    ],
    objectionResponses: [
      {
        objection: "La garantie ca ne sert a rien.",
        response:
          "Vous avez raison de verifier l'interet. Elle n'est utile que si elle couvre un risque concret pour vous: panne, mecanisme, montage ou usage dans la duree selon le produit."
      },
      {
        objection: "C'est encore une assurance.",
        response:
          "Oui, c'est une garantie facultative. L'important est de savoir exactement ce qu'elle couvre et ce qu'elle ne couvre pas avant de choisir."
      },
      {
        objection: "Je verrai plus tard.",
        response:
          "Sur certains produits, la souscription doit se faire au moment de l'achat ou dans un delai limite. Je prefere vous le dire maintenant pour que vous decidiez en connaissance de cause."
      }
    ],
    compliance: [
      "toujours relier la garantie a un risque produit concret",
      "ne pas promettre une prise en charge hors conditions",
      "ne pas confondre panne, dommage esthetique, montage, transport et usure",
      "indiquer que la garantie est facultative",
      "ne pas minimiser les exclusions",
      "ne pas laisser croire que l'usure normale ou la mauvaise utilisation sont couvertes"
    ],
    exclusions: [
      "usure normale",
      "dommages esthetiques n'affectant pas le bon fonctionnement, sauf garantie specifique",
      "mauvaise utilisation ou non-respect des consignes d'entretien",
      "dommages de transport ou demenagement hors cas couverts",
      "biens d'exposition, reconditionnes ou d'occasion selon les garanties",
      "reparations engagees sans suivre la procedure"
    ]
  },
  {
    id: "estaly-protection-esthetique",
    title: "Protection esthetique Estaly",
    targetKeywords: ["esthetique", "esthetisme", "estaly", "tache", "rayure"],
    whenToUse: [
      "canape, fauteuil, chaise, literie, meuble, table, buffet, bureau, rangement, chambre, decoration eligible",
      "client avec enfants, usage intensif, location courte duree ou peur des accidents du quotidien",
      "produit expose aux taches, rayures, griffures, eclats, brulures ou dechirures",
      "apres ou avec la garantie, comme complement et non comme doublon"
    ],
    customerBenefits: [
      "protection 12 ou 24 mois selon choix",
      "bon d'achat du montant du produit en cas de sinistre accepte",
      "traitement rapide: decision en moyenne dans la journee et bon d'achat sous 48h selon le support",
      "valeur a neuf sans vetuste",
      "complete la garantie fabricant ou extension: elle couvre les accidents esthetiques, pas les pannes",
      "souscription uniquement le jour de l'achat"
    ],
    pitchLines: [
      "D'ailleurs, sur ce modele-la, il y a une protection taches et rayures a [X] euros. Si ca arrive, vous declarez en ligne avec des photos et vous recevez un bon d'achat si c'est accepte.",
      "Avant qu'on valide, je vous mets la protection ? C'est [X] euros, et si votre produit prend une tache ou une rayure couverte, vous etes rembourse en bon d'achat.",
      "Ce n'est pas la garantie panne: c'est ce que la garantie ne couvre pas, les accidents du quotidien sur l'esthetique."
    ],
    objectionResponses: [
      {
        objection: "Non merci.",
        response:
          "Pas de souci. Sachez juste que c'est disponible uniquement a l'achat, on ne peut pas le rajouter apres. Si vous changez d'avis avant de passer en caisse, dites-le-moi."
      },
      {
        objection: "C'est trop cher.",
        response:
          "Je comprends. Sur 24 mois, si le produit prend ne serait-ce qu'une tache ou une rayure couverte, le bon d'achat peut representer le montant du produit. Le calcul depend surtout de votre usage."
      },
      {
        objection: "C'est une assurance cachee.",
        response:
          "Je comprends la reaction. Je vous le presente comme une protection facultative: tache, rayure, brulure, eclat ou dechirure accidentelle, avec des exclusions claires."
      }
    ],
    compliance: [
      "utiliser le mot protection plutot qu'assurance dans l'argumentaire vendeur",
      "ne pas proposer Estaly avant la garantie quand une garantie est pertinente",
      "ne pas relancer en caisse un client qui a deja refuse au vendeur",
      "dire que la souscription se fait uniquement le jour de l'achat",
      "ne pas creer de fausse attente sur les animaux, l'usure ou les matieres exclues",
      "ne pas confondre protection esthetique et panne"
    ],
    exclusions: [
      "pannes et defauts de fabrication",
      "usure normale, affaissement, boulochage, decoloration naturelle",
      "dommages animaux: griffures, morsures, dejections",
      "defaut d'entretien, encrassement progressif, taches de sebum",
      "transport ou demenagement",
      "nubuck, soie, tissus nettoyage a sec uniquement",
      "pelage, craquelure ou effritement du simili-cuir, PU ou bycast"
    ]
  }
];

export function buildSalesPlaybookContext(scenario: Scenario) {
  const relevant = salesPlaybooks.filter((playbook) =>
    scenario.serviceTargets.some((target) =>
      playbook.targetKeywords.some((keyword) =>
        target.toLowerCase().includes(keyword)
      )
    )
  );
  const selected = relevant.length > 0 ? relevant : salesPlaybooks;

  return selected
    .map(
      (playbook) => `
${playbook.title}
Quand l'utiliser: ${playbook.whenToUse.join(" | ")}
Benefices client: ${playbook.customerBenefits.join(" | ")}
Phrases terrain: ${playbook.pitchLines.join(" | ")}
Reponses objections: ${playbook.objectionResponses
        .map((item) => `${item.objection} -> ${item.response}`)
        .join(" | ")}
Vigilance/conformite: ${playbook.compliance.join(" | ")}
Exclusions a ne pas promettre: ${playbook.exclusions.join(" | ")}
`.trim()
    )
    .join("\n\n");
}
