/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react";
import { formations } from "@/lib/formations";

export default function FormationsPage() {
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
                Formations express
              </p>
              <h1 className="text-base font-black leading-tight">3 services qui font la marge</h1>
            </div>
          </div>
        </header>

        <section className="space-y-5 px-4 py-5">
          <div className="rounded-lg border border-black/10 bg-white p-4">
            <p className="text-sm leading-5 text-black/70">
              Micro-learning avant simulation : lis la fiche, recite une phrase
              sans modele, puis teste-la dans les 5 prises de parole vendeur.
              L'objectif est de proposer mensualites, Cpay et protections sans
              attendre la fin de l'echange.
            </p>
          </div>

          {formations.map((module) => (
            <Link
              key={module.slug}
              href={`/formations/${module.slug}`}
              className="block rounded-lg border border-black/10 bg-white p-4 active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span
                    className={`inline-block rounded-full ${module.color} px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.08em] text-white`}
                  >
                    {module.slug}
                  </span>
                  <h2 className="mt-2 text-lg font-black leading-snug">
                    {module.title}
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-black/65">
                    {module.tagline}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold text-black/55">
                    <Clock size={13} />
                    {module.reading}
                  </p>
                </div>
                <ChevronRight className="mt-1 shrink-0" size={20} />
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
