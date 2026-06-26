"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Flame,
  Minus,
  Play,
  Target,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";
import { cx } from "@/lib/utils";

type ReflexMastery = {
  service: string;
  label: string;
  level: number;
  trials: number;
  successes: number;
  recentStreak: number;
  trend: "up" | "flat" | "down";
  lastOutcome: string;
};

type Recommendation = {
  service: string;
  label: string;
  reason: string;
  scenarioId: string | null;
  scenarioTitle: string | null;
};

type ProgressSummary = {
  totalSessions: number;
  mastery: ReflexMastery[];
  recommendation: Recommendation | null;
};

function TrendIcon({ trend }: { trend: ReflexMastery["trend"] }) {
  if (trend === "up") return <TrendingUp size={16} className="text-forest" />;
  if (trend === "down") return <TrendingDown size={16} className="text-tomato" />;
  return <Minus size={16} className="text-black/40" />;
}

export default function ProgressionPage() {
  const router = useRouter();
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((response) => {
        if (response.status === 401) {
          router.replace("/welcome");
          return null;
        }
        return response.json();
      })
      .then((payload: ProgressSummary | null) => {
        if (payload) setData(payload);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const reco = data?.recommendation;

  return (
    <main className="noise min-h-svh p-0 text-ink md:py-6">
      <div className="phone-shell bg-paper">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-paper/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Retour"
              className="grid size-9 place-items-center rounded-full border border-black/10 bg-white"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-forest">
                Ma progression
              </p>
              <h1 className="text-base font-black leading-tight">
                Maitrise des reflexes
              </h1>
            </div>
          </div>
          <Target className="text-citron" size={22} />
        </header>

        <section className="space-y-5 px-4 py-5">
          {loading && <p className="text-sm text-black/55">Chargement...</p>}

          {!loading && data && data.totalSessions === 0 && (
            <div className="rounded-lg border border-dashed border-black/15 bg-white/60 p-6 text-center">
              <Zap className="mx-auto text-black/35" size={28} />
              <p className="mt-3 text-sm font-bold">Pas encore de donnees</p>
              <p className="mt-1 text-sm text-black/55">
                Termine une simulation pour voir tes reflexes progresser ici.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-tomato px-4 text-sm font-black text-white"
              >
                <Play size={16} />
                Lancer une session
              </Link>
            </div>
          )}

          {!loading && data && data.totalSessions > 0 && (
            <>
              <p className="text-xs font-bold text-black/55">
                {data.totalSessions} session
                {data.totalSessions > 1 ? "s" : ""} analysee
                {data.totalSessions > 1 ? "s" : ""}
              </p>

              {data.mastery.map((reflex) => (
                <div
                  key={reflex.service}
                  className="rounded-lg border border-black/10 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-black">{reflex.label}</h2>
                    <div className="flex items-center gap-2">
                      {reflex.recentStreak >= 2 && (
                        <span className="flex items-center gap-1 text-xs font-black text-tomato">
                          <Flame size={14} />
                          {reflex.recentStreak}
                        </span>
                      )}
                      <TrendIcon trend={reflex.trend} />
                      <span className="text-sm font-black">{reflex.level}/5</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <span
                        key={step}
                        className={cx(
                          "h-2.5 flex-1 rounded-full",
                          step <= reflex.level ? "bg-forest" : "bg-black/10"
                        )}
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-black/55">
                    {reflex.successes}/{reflex.trials} sessions reussies
                  </p>
                </div>
              ))}

              {reco && (
                <div className="rounded-lg bg-ink p-5 text-white shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-citron">
                    Ta prochaine etape
                  </p>
                  <p className="mt-2 text-base font-black leading-snug">
                    {reco.reason}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <Link
                      href={`/drills?focus=${reco.service}`}
                      className="flex h-11 items-center justify-center gap-2 rounded-md bg-citron px-4 text-sm font-black text-ink"
                    >
                      <Zap size={16} />
                      Drill cible : {reco.label}
                    </Link>
                    {reco.scenarioId && (
                      <Link
                        href={`/?scenario=${reco.scenarioId}`}
                        className="flex h-11 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 text-sm font-black text-white"
                      >
                        <Play size={16} />
                        Vente : {reco.scenarioTitle}
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-black/10 bg-white p-4">
                <p className="text-sm leading-5 text-black/65">
                  Le niveau monte avec des reussites recentes et regulieres. Reviens
                  court et souvent : c&apos;est l&apos;espacement qui ancre le reflexe.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
