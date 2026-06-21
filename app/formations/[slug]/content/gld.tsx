/* eslint-disable react/no-unescaped-entities */

import { Bullets, Quote, Section } from "./section";

export function GldContent() {
  return (
    <>
      <Section title="Micro-learning 3 minutes" accent="forest">
        <Bullets
          items={[
            "Objectif: proposer la GLD sur un risque de panne concret, pas comme un reflexe vide.",
            "Attention: retiens 3 risques: panne, immobilisation, cout de reparation.",
            "Rappel actif: sans lire, donne un exemple de panne adapte au produit vendu."
          ]}
        />
      </Section>

      <Section title="Dans une vente en 5 tours" accent="forest">
        <ol className="space-y-2">
          <li>
            <strong>Tour 1.</strong> Questionner frequence d'usage et impact
            d'une panne.
          </li>
          <li>
            <strong>Tour 2.</strong> Reformuler: "Si ca tombe en panne, c'est
            surtout l'immobilisation qui vous gene."
          </li>
          <li>
            <strong>Tour 3.</strong> Proposer GLD avec un risque produit:
            batterie, moteur, electronique, mecanisme.
          </li>
          <li>
            <strong>Tour 4.</strong> Clarifier: panne couverte, usure/mauvais
            usage non couverts.
          </li>
          <li>
            <strong>Tour 5.</strong> Micro-closing: "On la met dans la
            simulation pour voir le budget complet ?"
          </li>
        </ol>
      </Section>

      <Section title="En une phrase" accent="forest">
        <p>
          La <strong>Garantie prolongee BUT</strong> est un contrat d'assurance
          facultatif qui prolonge la garantie legale en cas de{" "}
          <strong>panne</strong> de l'electromenager : reparation, echange a
          neuf ou carte avoir.
        </p>
      </Section>

      <Section title="Ce qui est couvert" accent="forest">
        <Bullets
          items={[
            "Panne soudaine et interne au bien : dysfonctionnement electrique, electronique, electromecanique ou mecanique.",
            "Reparation : pieces + main d'oeuvre + deplacement/transport (rayon 30 km autour d'un magasin BUT).",
            "Echange a neuf si la reparation est impossible ou si le cout depasse la valeur.",
            "En cas d'echange a neuf : carte avoir BUT du montant TTC d'origine, valable 1 an en magasin.",
            "Jusqu'a 3 interventions par contrat."
          ]}
        />
      </Section>

      <Section title="Ce qui n'est PAS couvert" accent="forest">
        <Bullets
          items={[
            "Usure normale, mauvais usage, non-respect de la notice.",
            "Esthetique pure (taches, rayures, brulures) -> c'est Estaly.",
            "Accessoires et pieces consommables (filtres, joints, ampoules).",
            "Procedures non suivies (declaration tardive, reparation tiers).",
            "Hors France metropolitaine + Corse."
          ]}
        />
      </Section>

      <Section title="Chiffres a retenir" accent="forest">
        <Bullets
          items={[
            "Souscription possible jusqu'a 90 jours apres l'achat (mais ideal le jour J).",
            "Un seul bien par contrat - en cas d'achats multiples, un contrat par produit.",
            "Carte avoir valable 1 an, utilisable en magasin BUT (pas sur but.fr).",
            "Conserver la facture : elle prouve l'adhesion et sera exigee en cas de sinistre."
          ]}
        />
      </Section>

      <Section title="Methode terrain - La GLD en 4 etapes" accent="forest">
        <ol className="space-y-2">
          <li>
            <strong>1. Partir du risque concret</strong> : "Sur un lave-linge,
            la panne la plus frequente, c'est la pompe ou le tambour. Et la
            reparation coute en moyenne X EUR."
          </li>
          <li>
            <strong>2. Donner un exemple</strong> : "L'an dernier, un client
            est revenu avec sa machine en panne au bout de 3 ans. Avec la GLD,
            il est reparti avec une neuve."
          </li>
          <li>
            <strong>3. Vendre la tranquillite</strong> : 0 EUR de surprise, 0
            EUR de devis, on s'occupe de tout.
          </li>
          <li>
            <strong>4. Verifier l'interet</strong> : "Vous voyez l'interet pour
            votre usage ?" Pas "vous la prenez ?". On laisse le client se
            positionner.
          </li>
        </ol>
      </Section>

      <Section title="Objections frequentes" accent="forest">
        <Quote>"La garantie c'est inutile, c'est neuf."</Quote>
        <p>
          → "Justement, c'est quand c'est neuf qu'on peut prolonger. Apres, ce
          n'est plus possible. Et la panne, ce n'est pas la 1re annee qu'elle
          arrive : c'est apres la garantie constructeur."
        </p>

        <Quote>"J'ai la garantie de ma carte bleue."</Quote>
        <p>
          → "Elle couvre souvent le vol ou la casse les premiers mois. La GLD,
          c'est specifique a la panne et ca peut durer plusieurs annees."
        </p>

        <Quote>"La garantie c'est des arnaques."</Quote>
        <p>
          → "Je comprends, j'en ai entendu parler. C'est pour ca que je vais
          etre clair : ca couvre la panne, pas l'usure ni l'esthetique. Si
          vous ne tombez pas en panne, vous n'utilisez pas, c'est tout."
        </p>
      </Section>

      <Section title="L'escalier de proposition" accent="forest">
        <p>
          On commence toujours par le meilleur package :
        </p>
        <Bullets
          items={[
            "1. GLD + Estaly (top du top).",
            "2. GLD seule si Estaly refusee.",
            "3. Estaly seule si GLD refusee.",
            "4. Au minimum la garantie legale (par defaut)."
          ]}
        />
      </Section>

      <Section title="Regle d'or" accent="forest">
        <p className="font-black">
          La panne, c'est pas si rare. Le risque, c'est de payer une
          reparation plein pot, ou de racheter neuf. La GLD, c'est 0 EUR
          d'imprevu.
        </p>
      </Section>

      <Section title="Mini-test avant simulation" accent="forest">
        <Bullets
          items={[
            "Associe un risque GLD a: lave-linge, aspirateur balais, TV, sommier mecanique.",
            "Redis sans lire la difference entre panne, usure et esthetique.",
            "Reponds en 10 secondes a: 'La garantie, ca sert a rien sur du neuf'."
          ]}
        />
      </Section>
    </>
  );
}
