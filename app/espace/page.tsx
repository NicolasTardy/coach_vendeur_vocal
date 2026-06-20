"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileText, Trash2 } from "lucide-react";

type ReportSummary = {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  globalScore: number;
  summary: string;
  createdAt: string;
};

export default function EspacePage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportSummary[] | null>(null);
  const [pseudo, setPseudo] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then((response) => response.json()),
      fetch("/api/reports").then((response) => response.json())
    ])
      .then(([me, list]: [
        { user?: { pseudo: string } | null },
        { reports?: ReportSummary[] }
      ]) => {
        if (!me.user) {
          router.replace("/welcome");
          return;
        }
        setPseudo(me.user.pseudo);
        setReports(list.reports ?? []);
      })
      .catch(() => router.replace("/welcome"));
  }, [router]);

  async function deleteAccount() {
    if (
      !window.confirm(
        "Supprimer ton compte et toutes tes donnees ? Cette action est definitive."
      )
    ) {
      return;
    }
    setDeleting(true);
    await fetch("/api/me", { method: "DELETE" });
    router.replace("/welcome");
  }

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
                Mon espace
              </p>
              <h1 className="text-base font-black leading-tight">
                {pseudo || "..."}
              </h1>
            </div>
          </div>
        </header>

        <section className="space-y-5 px-4 py-5">
          <div className="rounded-lg border border-black/10 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
              Rapports d'entrainement
            </p>
            <p className="mt-1 text-sm text-black/65">
              Telechargeables au format PDF. Aucun audio n'est conserve.
            </p>
          </div>

          {reports === null && (
            <p className="text-sm text-black/55">Chargement...</p>
          )}

          {reports?.length === 0 && (
            <div className="rounded-lg border border-dashed border-black/15 bg-white/60 p-6 text-center">
              <FileText className="mx-auto text-black/35" size={28} />
              <p className="mt-3 text-sm font-bold">Aucun rapport encore</p>
              <p className="mt-1 text-sm text-black/55">
                Lance une session depuis l'accueil pour generer ton premier
                rapport.
              </p>
            </div>
          )}

          {reports?.map((report) => (
            <article
              key={report.id}
              className="rounded-lg border border-black/10 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-tomato">
                    {report.scenarioTitle}
                  </p>
                  <p className="mt-1 text-xs text-black/55">
                    {new Date(report.createdAt).toLocaleString("fr-FR")}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-black/75">
                    {report.summary}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">{report.globalScore}</p>
                  <p className="text-[0.65rem] font-bold uppercase text-black/55">
                    /100
                  </p>
                </div>
              </div>
              <a
                href={`/api/reports/${report.id}/pdf`}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cobalt px-4 text-sm font-black text-white"
              >
                <Download size={16} />
                Telecharger le PDF
              </a>
            </article>
          ))}

          <div className="rounded-lg border border-tomato/30 bg-white p-4">
            <p className="text-sm font-black">Supprimer mon compte</p>
            <p className="mt-1 text-xs text-black/65">
              Efface ton profil et tous tes rapports. Action irreversible.
            </p>
            <button
              type="button"
              onClick={deleteAccount}
              disabled={deleting}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-tomato px-4 text-sm font-black text-white disabled:opacity-60"
            >
              <Trash2 size={16} />
              {deleting ? "Suppression..." : "Supprimer definitivement"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
