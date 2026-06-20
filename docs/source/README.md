# Sources commerciales

Ce dossier contient les documents utilises pour construire les argumentaires de vente integres aux prompts de simulation et de coaching.

## Documents

- `A4_web__Conditions_Générales_Carte_BUT_Mastercard.pdf` : conditions de la carte BUT Cpay Mastercard et points de vigilance credit/fidelite.
- `garantie-prolongee-but.pdf` : garanties prolongees, services associes, exclusions et limites de prise en charge.
- `Estaly  BUT — Protection esthétique.pptx` : protection esthetique Estaly, parcours vendeur, objections et exclusions.

## Utilisation dans l'app

Les arguments terrain issus de ces sources sont consolides dans `lib/sales-playbooks.ts`, puis injectes dans les prompts client et coach via `lib/prompts.ts`.

Les points de conformite doivent rester explicites dans les prompts : caractere facultatif, absence de promesse hors conditions, distinction entre credit, garantie panne/services et protection esthetique.
