export type FormationModule = {
  slug: "carte-credit" | "estaly" | "gld";
  title: string;
  tagline: string;
  color: string;
  reading: string;
};

export const formations: FormationModule[] = [
  {
    slug: "carte-credit",
    title: "Carte BUT Cpay & credit",
    tagline: "Le bon usage, transparent et sans promesse interdite.",
    color: "bg-cobalt",
    reading: "3 min + mini-test"
  },
  {
    slug: "estaly",
    title: "Protection esthetique Estaly",
    tagline: "Taches, rayures, brulures : on dit protection, jamais assurance.",
    color: "bg-tomato",
    reading: "3 min + mini-test"
  },
  {
    slug: "gld",
    title: "GLD - Garantie Longue Duree",
    tagline: "Panne, mecanisme, transport : la tranquillite apres la garantie legale.",
    color: "bg-forest",
    reading: "3 min + mini-test"
  }
];

export function getFormation(slug: string) {
  return formations.find((module) => module.slug === slug);
}
