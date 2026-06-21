import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getFormation } from "@/lib/formations";
import { CarteCreditContent } from "./content/carte-credit";
import { EstalyContent } from "./content/estaly";
import { GldContent } from "./content/gld";

type Params = {
  params: Promise<{ slug: string }>;
};

export default async function FormationPage({ params }: Params) {
  const { slug } = await params;
  const formation = getFormation(slug);
  if (!formation) {
    notFound();
  }

  return (
    <main className="noise min-h-svh p-0 text-ink md:py-6">
      <div className="phone-shell bg-paper">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-paper/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <Link
              href="/formations"
              aria-label="Retour"
              className="grid size-9 place-items-center rounded-full border border-black/10 bg-white"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-forest">
                Formation
              </p>
              <h1 className="truncate text-base font-black leading-tight">
                {formation.title}
              </h1>
            </div>
          </div>
        </header>

        <article className="space-y-5 px-4 py-5">
          {slug === "carte-credit" && <CarteCreditContent />}
          {slug === "estaly" && <EstalyContent />}
          {slug === "gld" && <GldContent />}

          <Link
            href="/"
            className="flex h-12 w-full items-center justify-center rounded-md bg-ink px-5 text-sm font-black text-white"
          >
            Lancer une session
          </Link>
        </article>
      </div>
    </main>
  );
}
