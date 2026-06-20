"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setBusy(true);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudo: pseudo.trim(), password })
    });
    setBusy(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Inscription impossible.");
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
              Etape 1
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight">
              Choisis un pseudo et un mot de passe
            </h1>
            <p className="mt-2 text-sm leading-5 text-black/65">
              Aucun email demande. Pseudo unique sur l'app.
            </p>
          </header>

          <form className="space-y-4" onSubmit={onSubmit}>
            <Field
              label="Pseudo"
              hint="2-24 caracteres, lettres, chiffres, - ou _"
              value={pseudo}
              onChange={setPseudo}
              maxLength={24}
              placeholder="ex: Nova42"
              autoComplete="username"
            />
            <Field
              label="Mot de passe"
              value={password}
              onChange={setPassword}
              type="password"
              maxLength={72}
              hint="6 caracteres minimum"
              autoComplete="new-password"
            />
            <Field
              label="Confirme le mot de passe"
              value={confirm}
              onChange={setConfirm}
              type="password"
              maxLength={72}
              autoComplete="new-password"
            />

            {error && <p className="text-sm font-bold text-tomato">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex h-14 w-full items-center justify-center rounded-md bg-tomato px-5 text-base font-black text-white shadow-soft disabled:opacity-60"
            >
              {busy ? "Creation..." : "Creer mon profil"}
            </button>
          </form>

          <p className="text-center text-sm text-black/65">
            Deja inscrit ?{" "}
            <Link href="/login" className="font-black text-ink underline">
              Connexion
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  type = "text",
  maxLength,
  placeholder,
  autoComplete
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  type?: string;
  maxLength?: number;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-1 h-12 w-full rounded-md border border-black/10 bg-white px-4 text-base font-bold text-ink outline-none ring-forest focus:ring-4"
      />
      {hint && <span className="mt-1 block text-xs text-black/55">{hint}</span>}
    </label>
  );
}
