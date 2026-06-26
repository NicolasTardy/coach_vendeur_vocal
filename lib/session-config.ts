import type { SessionMode } from "@/lib/types";

// Deux formats de session, partages par le front et le back pour rester coherents.
// - Vente complete: la vente entiere en 5 tours (transfert, interleaving).
// - Drill cible: 3 tours sur UN seul reflexe (automatisation, experiences de
//   maitrise rapides, §12.2).

export function maxSellerTurns(mode: SessionMode = "full") {
  return mode === "drill" ? 3 : 5;
}

export function maxClientTurns(mode: SessionMode = "full") {
  return maxSellerTurns(mode);
}

export const SESSION_MODE_META: Record<
  SessionMode,
  { label: string; hint: string }
> = {
  full: {
    label: "Vente complete",
    hint: "5 tours, tous les reflexes : choix, budget, protections, closing."
  },
  drill: {
    label: "Drill cible",
    hint: "3 tours sur un seul reflexe a automatiser. Court et focalise."
  }
};
