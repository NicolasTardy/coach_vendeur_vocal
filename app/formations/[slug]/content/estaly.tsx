import { Bullets, Quote, Section } from "./section";

export function EstalyContent() {
  return (
    <>
      <Section title="En une phrase" accent="tomato">
        <p>
          Pendant <strong>12 ou 24 mois</strong>, si le produit du client prend
          une <strong>tache, rayure, griffure, eclat ou brulure</strong>, on
          lui fait un <strong>bon d'achat du montant de son produit</strong>.
          Traite dans la journee.
        </p>
      </Section>

      <Section title="Ce qui est couvert" accent="tomato">
        <Bullets
          items={[
            "Taches accidentelles : vin, cafe, feutre, gras, encre, maquillage.",
            "Rayures et griffures profondes : bois, verre, metal, cuir.",
            "Eclats et ebrechures suite a un choc accidentel.",
            "Brulures : cigarette, fer a repasser, plat chaud.",
            "Dechirures et perforations : tissus, cuirs, matieres synthetiques.",
            "Bonus : location courte duree (Airbnb < 90 jours) couverte - argument de vente."
          ]}
        />
      </Section>

      <Section title="Ce qui n'est PAS couvert" accent="tomato">
        <Bullets
          items={[
            "Usure normale (affaissement, boulochage, decoloration).",
            "Defauts de fabrication (-> garantie legale de conformite).",
            "Pannes mecaniques (-> GLD).",
            "Dommages causes par animaux (griffures, morsures, dejections).",
            "Defaut d'entretien (encrassement progressif, sebum).",
            "Matieres non eligibles : nubuck, soie, 'nettoyage a sec uniquement'."
          ]}
        />
        <p className="mt-2 rounded-md bg-paper p-3 text-xs font-bold">
          Regle simple : accident soudain = couvert. Usure ou negligence = pas
          couvert.
        </p>
      </Section>

      <Section title="Chiffres a retenir" accent="tomato">
        <Bullets
          items={[
            "80-90 % de dossiers acceptes.",
            "4 h de delai de traitement moyen.",
            "100 % de la valeur a neuf (sans vetuste).",
            "1 sinistre par contrat par an.",
            "Valeur max couverte : 2 000 EUR TTC.",
            "Souscription UNIQUEMENT le jour de l'achat - on ne peut pas rajouter apres."
          ]}
        />
      </Section>

      <Section title="La phrase d'amorce (au rayon)" accent="tomato">
        <Quote>
          "D'ailleurs, sur ce modele-la, il y a une protection taches et
          rayures a [X] EUR. Si ca arrive, c'est nous qui remboursons."
        </Quote>
        <p>
          Une phrase, naturelle, dans la conversation. Pas un pitch.
        </p>
      </Section>

      <Section title="La phrase au bon de commande" accent="tomato">
        <Quote>
          "Avant qu'on valide, je vous mets la protection ? C'est [X] EUR, et
          si votre canape prend une tache ou une rayure, on vous rembourse en
          bon d'achat."
        </Quote>
        <p>
          <strong>"Je vous mets"</strong> et non "est-ce que vous voulez" —
          presomption d'achat, plus efficace.
        </p>
      </Section>

      <Section title="3 reactions, 3 reponses" accent="tomato">
        <p>
          <strong>"C'est quoi exactement ?"</strong> Le client est interesse.
          On deroule : 12/24 mois, declaration en ligne avec photo, bon d'achat
          du montant du produit, traite dans la journee.
        </p>
        <p>
          <strong>"Non merci."</strong> On ne force pas, on plante la graine :
          "Pas de souci. Sachez juste que c'est disponible uniquement a
          l'achat. Si vous changez d'avis avant la caisse, dites-le-moi."
        </p>
        <p>
          <strong>"C'est trop cher."</strong> On met en perspective : "Sur 24
          mois, ca revient a [X] EUR. Si votre canape prend ne serait-ce
          qu'une tache, on rembourse [montant produit]. Le calcul est simple."
        </p>
      </Section>

      <Section title="Les mots qu'on ne dit JAMAIS" accent="tomato">
        <Bullets
          items={[
            "PAS 'assurance' -> on dit PROTECTION.",
            "PAS 'imaginez que' -> on dit 'si ca arrive' (factuel).",
            "PAS 'c'est ce que tout le monde pense' -> condescendant.",
            "PAS 'paiement fractionne' -> le client entend credit.",
            "PAS 'couverture complementaire' -> jargon d'assureur."
          ]}
        />
      </Section>

      <Section title="Regle d'or" accent="tomato">
        <p className="font-black">
          On ne contredit jamais le client : on valide, puis on deplace.
        </p>
        <p>
          Toujours proposer : le pire, c'est de ne rien dire. On ne peut pas
          rajouter Estaly apres l'achat.
        </p>
      </Section>
    </>
  );
}
