/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import {
  CreditCard,
  FileText,
  Lock,
  Mic2,
  ShieldCheck,
  ShieldPlus,
  Sparkles
} from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="noise min-h-svh p-0 text-ink md:py-6">
      <div className="phone-shell bg-paper">
        <section className="space-y-5 px-5 pb-7 pt-5">
          <div className="hero-panel rounded-lg p-6 text-white shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-citron">
                  Coach Vente
                </p>
                <h1 className="mt-3 text-3xl font-black leading-[1.04]">
                  Proteger le budget de nos clients.
                </h1>
              </div>
              <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-white/12 text-citron">
                <Mic2 size={25} />
              </div>
            </div>

            <p className="mt-4 max-w-[20rem] text-sm leading-6 text-white/78">
              Simulation client realiste, feedback immediat. On s'entraine a
              proposer Carte de paiement & credit, Estaly et GLD avec le bon
              sens commercial.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="service-pill">
                <CreditCard size={15} />
                Cpay & credit
              </span>
              <span className="service-pill">
                <ShieldPlus size={15} />
                GLD
              </span>
              <span className="service-pill">
                <Sparkles size={15} />
                Estaly
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-lg font-black">1</p>
                <p className="text-[0.68rem] font-bold uppercase text-white/62">
                  client IA
                </p>
              </div>
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-lg font-black">3</p>
                <p className="text-[0.68rem] font-bold uppercase text-white/62">
                  services
                </p>
              </div>
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-lg font-black">PDF</p>
                <p className="text-[0.68rem] font-bold uppercase text-white/62">
                  rapport
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="mini-metric">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.08em] text-cobalt">
                Carte
              </p>
              <p className="mt-1 text-sm font-black leading-4">budget clair</p>
            </div>
            <div className="mini-metric">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.08em] text-forest">
                GLD
              </p>
              <p className="mt-1 text-sm font-black leading-4">risque panne</p>
            </div>
            <div className="mini-metric">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.08em] text-tomato">
                Estaly
              </p>
              <p className="mt-1 text-sm font-black leading-4">tache rayure</p>
            </div>
          </div>

          <div className="app-card rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
              Pourquoi proposer les services ?
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-black/75">
              Vendre des services, c'est rendre service. On ne pense pas a la
              place du client : on lui donne le choix, clairement, au bon
              moment.
            </p>
            <p className="mt-3 text-sm leading-6 text-black/68">
              Notre role est de proteger son budget avec des mensualites
              adaptees, une protection contre la panne avec la GLD, et une
              protection contre les degradations esthetiques avec Estaly.
            </p>
          </div>

          <div className="app-card space-y-4 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <span className="icon-tile">
                <ShieldCheck size={19} />
              </span>
              <div>
                <p className="text-sm font-black">App anonyme</p>
                <p className="text-sm leading-5 text-black/70">
                  Pas d'email, pas de nom reel : juste un pseudo et un mot de
                  passe.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="icon-tile">
                <Lock size={18} />
              </span>
              <div>
                <p className="text-sm font-black">Aucun audio conserve</p>
                <p className="text-sm leading-5 text-black/70">
                  La voix est utilisee pour transcrire puis effacee. Seuls les
                  rapports sont stockes, telechargeables et supprimables.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="icon-tile">
                <FileText size={18} />
              </span>
              <div>
                <p className="text-sm font-black">Rapports utiles</p>
                <p className="text-sm leading-5 text-black/70">
                  Tes rapports restent consultables, telechargeables en PDF et
                  supprimables avec ton compte.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-1">
            <Link
              href="/signup"
              className="action-primary px-5 text-base"
            >
              Creer un profil
            </Link>
            <Link
              href="/login"
              className="action-secondary px-5 text-sm"
            >
              J'ai deja un pseudo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
