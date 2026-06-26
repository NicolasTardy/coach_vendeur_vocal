"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Sparkles,
  X,
  Zap
} from "lucide-react";
import {
  buildDrillRound,
  drillKindLabel,
  type DrillQuestion
} from "@/lib/drills";
import type { ServiceKey } from "@/lib/types";
import { cx } from "@/lib/utils";

const ROUND_SIZE = 8;
const FOCUS_VALUES: ServiceKey[] = ["cpay", "gld", "estaly"];

function readFocus(): ServiceKey | undefined {
  if (typeof window === "undefined") return undefined;
  const value = new URLSearchParams(window.location.search).get("focus");
  return FOCUS_VALUES.find((service) => service === value);
}

export default function DrillsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [round, setRound] = useState<DrillQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((response) => response.json())
      .then((data: { user?: { pseudo: string } | null }) => {
        if (!data.user) {
          router.replace("/welcome");
          return;
        }
        setAuthChecked(true);
        setRound(buildDrillRound(ROUND_SIZE, readFocus()));
      })
      .catch(() => router.replace("/welcome"));
  }, [router]);

  function startNewRound() {
    setRound(buildDrillRound(ROUND_SIZE, readFocus()));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  function answer(choiceIndex: number) {
    if (picked !== null) {
      return;
    }
    setPicked(choiceIndex);
    if (round[index].choices[choiceIndex].correct) {
      setScore((value) => value + 1);
    }
  }

  function next() {
    if (index + 1 >= round.length) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
  }

  const question = round[index];

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
                Entrainement flash
              </p>
              <h1 className="text-base font-black leading-tight">
                Reflexes services
              </h1>
            </div>
          </div>
          <Zap className="text-citron" size={22} />
        </header>

        <section className="space-y-5 px-4 py-5">
          {!authChecked && <p className="text-sm text-black/55">Chargement...</p>}

          {authChecked && !done && question && (
            <>
              <div className="flex items-center justify-between text-xs font-black">
                <span className="rounded-full bg-ink px-3 py-1 uppercase tracking-[0.08em] text-white">
                  {drillKindLabel(question.kind)}
                </span>
                <span className="text-black/55">
                  {index + 1}/{round.length} · score {score}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-1.5 rounded-full bg-forest transition-all"
                  style={{ width: `${(index / round.length) * 100}%` }}
                />
              </div>

              <div className="rounded-lg border border-black/10 bg-white p-4">
                <p className="text-[0.7rem] font-black uppercase tracking-[0.08em] text-tomato">
                  {question.context}
                </p>
                <p className="mt-2 text-lg font-bold leading-7">
                  {question.prompt}
                </p>

                <div className="mt-4 space-y-2">
                  {question.choices.map((choice, choiceIndex) => {
                    const isPicked = picked === choiceIndex;
                    const reveal = picked !== null;
                    const state = !reveal
                      ? "idle"
                      : choice.correct
                        ? "correct"
                        : isPicked
                          ? "wrong"
                          : "muted";
                    return (
                      <button
                        key={choice.label}
                        type="button"
                        disabled={reveal}
                        onClick={() => answer(choiceIndex)}
                        className={cx(
                          "flex w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-sm font-bold transition",
                          state === "idle" &&
                            "border-black/15 bg-white active:scale-[0.99]",
                          state === "correct" && "border-forest bg-forest/10 text-forest",
                          state === "wrong" && "border-tomato bg-tomato/10 text-tomato",
                          state === "muted" && "border-black/10 bg-white/60 text-black/45"
                        )}
                      >
                        <span>{choice.label}</span>
                        {state === "correct" && <Check size={18} className="shrink-0" />}
                        {state === "wrong" && <X size={18} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {picked !== null && (
                  <div className="mt-4 rounded-md bg-paper p-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
                      {question.choices[picked].correct ? "Bonne reponse" : "A retenir"}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-black/75">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>

              {picked !== null && (
                <button
                  type="button"
                  onClick={next}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-tomato px-4 text-sm font-black text-white shadow-soft"
                >
                  {index + 1 >= round.length ? "Voir le score" : "Suivant"}
                </button>
              )}
            </>
          )}

          {authChecked && done && (
            <div className="space-y-5">
              <div className="rounded-lg bg-ink p-5 text-white shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-citron">
                  Round termine
                </p>
                <p className="mt-2 text-5xl font-black">
                  {score}
                  <span className="text-2xl text-white/65">/{round.length}</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  {score === round.length
                    ? "Sans faute. Tes reflexes services sont nets."
                    : score >= round.length - 2
                      ? "Tres bien. Refais un round demain pour ancrer durablement."
                      : "Bon entrainement. La cle, c'est de revenir court et souvent, pas longtemps une fois."}
                </p>
              </div>

              <div className="rounded-lg border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <h2 className="text-base font-black">Pour ancrer</h2>
                </div>
                <p className="mt-2 text-sm leading-5 text-black/70">
                  Refais 2 minutes demain, puis a J+3 et J+7. Court et espace bat
                  une longue session unique.
                </p>
              </div>

              <button
                type="button"
                onClick={startNewRound}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-tomato px-4 text-sm font-black text-white shadow-soft"
              >
                <RotateCcw size={17} />
                Nouveau round
              </button>
              <Link
                href="/"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-4 text-sm font-black"
              >
                Retour a l&apos;entrainement
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
