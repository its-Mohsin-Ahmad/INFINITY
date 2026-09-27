import clsx from "clsx";
import type { ReactNode } from "react";

/* ===========================================================================
 * PageHero — the shared header band for top-level routes.
 * ---------------------------------------------------------------------------
 * Keeps every index page visually identical: eyebrow, display headline,
 * supporting copy and an optional slot for stats / chips / actions.
 * ======================================================================== */

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  tone = "default",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "accent";
}) {
  return (
    <section className={clsx("relative overflow-hidden border-b border-line", className)}>
      <div
        className={clsx(
          "pointer-events-none absolute inset-0",
          tone === "accent" ? "aura-accent" : "divider-grid",
        )}
        aria-hidden="true"
      />
      <div className="shell relative py-10 lg:py-14">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="h-display text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">{description}</p>
        ) : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </section>
  );
}
