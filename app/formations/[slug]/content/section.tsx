import type { ReactNode } from "react";

export function Section({
  title,
  children,
  accent = "forest"
}: {
  title: string;
  children: ReactNode;
  accent?: "forest" | "tomato" | "cobalt";
}) {
  const color =
    accent === "tomato" ? "text-tomato" : accent === "cobalt" ? "text-cobalt" : "text-forest";
  return (
    <section className="rounded-lg border border-black/10 bg-white p-4">
      <h2
        className={`text-xs font-black uppercase tracking-[0.08em] ${color}`}
      >
        {title}
      </h2>
      <div className="mt-3 space-y-2 text-sm leading-5 text-black/75">
        {children}
      </div>
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-ink" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="rounded-md bg-paper p-3 text-sm font-bold italic leading-5">
      {children}
    </blockquote>
  );
}
