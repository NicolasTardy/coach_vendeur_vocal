"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudo: pseudo.trim(), password })
    });
    setBusy(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Connexion impossible.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="noise min-h-svh p-0 text-ink md:py-6">
      <div className="phone-shell bg-paper">
        <section className="space-y-5 px-5 py-8">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-forest">
              Connexion
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight">
              Pseudo et mot de passe
            </h1>
          </header>

          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="text-sm font-bold text-ink">Pseudo</span>
              <input
                value={pseudo}
                onChange={(event) => setPseudo(event.target.value)}
                maxLength={24}
                autoComplete="username"
                className="mt-1 h-12 w-full rounded-md border border-black/10 bg-white px-4 text-base font-bold text-ink outline-none ring-forest focus:ring-4"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-ink">Mot de passe</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                maxLength={72}
                autoComplete="current-password"
                className="mt-1 h-12 w-full rounded-md border border-black/10 bg-white px-4 text-base font-bold text-ink outline-none ring-forest focus:ring-4"
              />
            </label>

            {error && <p className="text-sm font-bold text-tomato">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex h-14 w-full items-center justify-center rounded-md bg-tomato px-5 text-base font-black text-white shadow-soft disabled:opacity-60"
            >
              {busy ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-black/65">
            Pas encore de profil ?{" "}
            <Link href="/signup" className="font-black text-ink underline">
              Creer un compte
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
