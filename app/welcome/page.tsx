import Link from "next/link";
import { Lock, ShieldCheck, Sparkles } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="noise min-h-svh p-0 text-ink md:py-6">
      <div className="phone-shell bg-paper">
        <section className="space-y-6 px-5 py-8">
          <div className="rounded-lg bg-ink p-6 text-white shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-citron">
              Coach Vente
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight">
              Entraine-toi a vendre les bons services.
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Simulation client realiste, feedback immediat. Focus sur Carte de
              paiement & credit, Estaly et GLD : les services qui font la marge.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Sparkles className="shrink-0 text-citron" size={22} />
              <p className="text-xs font-bold uppercase tracking-[0.06em] text-white/70">
                Une session, un client, un rapport
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-forest" size={20} />
              <div>
                <p className="text-sm font-black">App anonyme</p>
                <p className="text-sm leading-5 text-black/70">
                  Pas d'email, pas de nom reel : juste un pseudo et un mot de
                  passe.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 shrink-0 text-forest" size={20} />
              <div>
                <p className="text-sm font-black">Aucun audio conserve</p>
                <p className="text-sm leading-5 text-black/70">
                  La voix est utilisee pour transcrire puis effacee. Seuls les
                  rapports sont stockes, telechargeables et supprimables.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-forest" size={20} />
              <div>
                <p className="text-sm font-black">Donnees supprimees</p>
                <p className="text-sm leading-5 text-black/70">
                  Tu peux supprimer ton compte et toutes tes donnees a tout
                  moment depuis ton espace.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/signup"
              className="flex h-14 w-full items-center justify-center rounded-md bg-tomato px-5 text-base font-black text-white shadow-soft active:scale-[0.99]"
            >
              Creer un profil
            </Link>
            <Link
              href="/login"
              className="flex h-12 w-full items-center justify-center rounded-md border border-black/10 bg-white px-5 text-sm font-black text-ink"
            >
              J'ai deja un pseudo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
