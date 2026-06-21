/* eslint-disable react/no-unescaped-entities */

import { Bullets, Quote, Section } from "./section";

export function CarteCreditContent() {
  return (
    <>
      <Section title="Micro-learning 3 minutes" accent="cobalt">
        <Bullets
          items={[
            "Objectif: savoir presenter Cpay en 20 secondes, sans cacher le mot credit.",
            "Attention: retiens 3 mots seulement: mensualite, facultatif, acceptation.",
            "Rappel actif: ferme la fiche et redis la phrase d'autorisation a voix haute."
          ]}
        />
      </Section>

      <Section title="Dans une vente en 5 tours" accent="cobalt">
        <ol className="space-y-2">
          <li>
            <strong>Tour 1.</strong> Questionner usage + budget: "Vous aviez une
            enveloppe a ne pas depasser ?"
          </li>
          <li>
            <strong>Tour 2.</strong> Annoncer prix total puis mensualite
            possible: "On peut le regarder aussi en budget mensuel."
          </li>
          <li>
            <strong>Tour 3.</strong> Demander l'autorisation: "Je peux vous
            presenter l'option Cpay ?"
          </li>
          <li>
            <strong>Tour 4.</strong> Transparence: carte facultative, credit
            renouvelable, soumise a acceptation.
          </li>
          <li>
            <strong>Tour 5.</strong> Micro-closing: "On fait la simulation pour
            voir si ca vous convient ?"
          </li>
        </ol>
      </Section>

      <Section title="En une phrase" accent="cobalt">
        <p>
          La carte BUT Cpay Mastercard est une carte de fidelite associee a un
          credit renouvelable BNP Paribas Personal Finance. Elle est{" "}
          <strong>facultative, soumise a acceptation</strong>, et permet au
          client de cumuler des bons d'achat.
        </p>
      </Section>

      <Section title="Les chiffres a retenir" accent="cobalt">
        <Bullets
          items={[
            "Cotisation : 14,90 EUR/an, prelevee par Cetelem.",
            "1 point par tranche de 15 EUR d'achats (en magasin BUT ou ailleurs sur le reseau Mastercard).",
            "1 point = 0,30 EUR en bons d'achat.",
            "Minimum garanti : 30 EUR/an de bons d'achat pour les porteurs.",
            "Bons d'achat valables 2 mois, utilisables dans tous les magasins BUT France metropolitaine."
          ]}
        />
      </Section>

      <Section title="Ce qu'on dit, ce qu'on ne dit pas" accent="cobalt">
        <Bullets
          items={[
            "On dit : 'option de paiement', 'facultative', 'soumise a acceptation'.",
            "On dit : 'l'utilisation du credit depend de votre accord expres'.",
            "On NE promet PAS de taux, de mensualite, ni l'acceptation du dossier.",
            "On NE dit PAS 'paiement fractionne' au lieu de 'credit' : la transparence est la regle."
          ]}
        />
      </Section>

      <Section title="Methode terrain - L'enchainement gagnant" accent="cobalt">
        <ol className="space-y-2">
          <li>
            <strong>1. Accueillir le frein budget</strong> : le client dit
            "c'est cher", "on verra plus tard", "credit non merci". On ne
            balaie pas.
          </li>
          <li>
            <strong>2. Demander l'autorisation</strong> : "Je peux vous
            presenter une option qui pourrait rendre votre projet plus
            accessible ?"
          </li>
          <li>
            <strong>3. Presenter en 3 phrases courtes</strong> : carte Cpay,
            facultative, soumise a acceptation, avec fidelite.
          </li>
          <li>
            <strong>4. Verifier le confort</strong> : "Est-ce que cette option
            vous correspondrait ?"
          </li>
          <li>
            <strong>5. Micro-closing</strong> : on engage sur l'etape suivante
            (etude, simulation) sans pression.
          </li>
        </ol>
      </Section>

      <Section title="Objections frequentes" accent="cobalt">
        <Quote>"Le credit, j'aime pas ca."</Quote>
        <p>
          → "Je comprends. C'est totalement facultatif. Je voulais juste vous
          montrer qu'il existe une option si jamais c'etait utile. Et meme sans
          credit, la carte permet de cumuler des bons d'achat."
        </p>

        <Quote>"Le credit, ca coute trop cher."</Quote>
        <p>
          → "Vous avez raison de vous mefier des taux. L'avantage de la Cpay,
          c'est qu'utiliser le credit reste votre choix : on peut payer
          comptant ET garder la fidelite."
        </p>
      </Section>

      <Section title="Le piege a eviter" accent="cobalt">
        <p>
          Forcer la carte parce que le manager vous met la pression. Le client
          le sent, refuse, et vous perdez aussi la vente produit. Mieux vaut
          presenter calmement et perdre 30 secondes que perdre toute la vente.
        </p>
      </Section>

      <Section title="Mini-test avant simulation" accent="cobalt">
        <Bullets
          items={[
            "Redis sans lire: la phrase d'autorisation Cpay.",
            "Cite les 3 securites client: facultatif, soumis a acceptation, choix du client.",
            "Reponds en 10 secondes a: 'Je ne veux pas de credit'."
          ]}
        />
      </Section>
    </>
  );
}
