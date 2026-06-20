import type { Scenario } from "@/lib/types";

type Playbook = {
  id: string;
  title: string;
  targetKeywords: string[];
  clientBrief: string;
  coachBrief: string;
};

type PlaybookMode = "client" | "coach";

export const salesPlaybooks: Playbook[] = [
  {
    id: "credit-carte-but-cpay",
    title: "Credit/carte BUT Cpay",
    targetKeywords: ["credit", "financement", "carte", "cpay", "paiement"],
    clientBrief:
      "Frein budget: ecoute si option facultative, claire, soumise acceptation. Carte Cpay: credit renouvelable + fidelite; credit seulement avec accord expres.",
    coachBrief:
      "Credit/carte: partir du frein budget, demander accord pour presenter, expliquer facultatif/soumis acceptation/credit renouvelable, verifier confort. Ne pas promettre taux, gratuite, mensualite ou acceptation."
  },
  {
    id: "garantie-prolongee-but",
    title: "Garantie prolongee",
    targetKeywords: ["garantie", "extension", "montage", "livraison", "transport"],
    clientBrief:
      "Accepte garantie si reliee au risque produit: panne, mecanisme, montage, transport/cuisine, immobilisation. Refuse si discours vague ou force.",
    coachBrief:
      "Garantie: relier au risque concret. Selon produit: +3 ans, reparation/echange, hotline, accessoires/tranquillite, capital reprise, cuisine transport/montage/demenagement. Exclure usure, mauvais usage, esthetique hors garantie, procedure non suivie."
  },
  {
    id: "estaly-protection-esthetique",
    title: "Protection Estaly",
    targetKeywords: ["esthetique", "esthetisme", "estaly", "tache", "rayure"],
    clientBrief:
      "Protection Estaly utile si tache/rayure/brulure/dechirure du quotidien. A presenter comme complement garantie, jamais comme panne, jamais comme assurance.",
    coachBrief:
      "Estaly: dire protection, pas assurance. 12/24 mois, bon d'achat si sinistre accepte, declaration photo, souscription jour achat. Couvert: tache/rayure/eclat/brulure/dechirure. Exclure panne, usure, animaux, entretien, transport, matieres exclues."
  }
];

export function buildSalesPlaybookContext(
  scenario: Scenario,
  mode: PlaybookMode = "coach"
) {
  return selectPlaybooks(scenario)
    .map((playbook) =>
      mode === "client"
        ? `${playbook.title}: ${playbook.clientBrief}`
        : `${playbook.title}: ${playbook.coachBrief}`
    )
    .join("\n");
}

function selectPlaybooks(scenario: Scenario) {
  const targets = scenario.serviceTargets.join(" ").toLowerCase();
  const relevant = salesPlaybooks.filter((playbook) =>
    playbook.targetKeywords.some((keyword) => targets.includes(keyword))
  );

  return relevant.length > 0 ? relevant : salesPlaybooks;
}
