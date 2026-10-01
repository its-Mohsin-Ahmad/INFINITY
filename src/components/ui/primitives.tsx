import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import type { PlatformSlug } from "@/lib/types";
import { PLATFORM_MAP } from "@/data/taxonomy";
import { discountedPrice } from "@/lib/generate";

/* ===========================================================================
 * INFINITY UI primitives (server-safe — no hooks, no browser APIs)
 * ======================================================================== */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("eyebrow", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
      <div>
        {eyebrow ? <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow> : null}
        <h2 className="section-title">{title}</h2>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-ink-secondary">{description}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {action}
        {href ? (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-white"
          >
            {linkLabel}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

const BADGE_TONES = {
  accent: "border-accent/60 bg-accent/15 text-white",
  live: "border-accent bg-accent text-white",
  neutral: "border-line bg-bg-muted text-ink-secondary",
  new: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  soon: "border-sky-500/50 bg-sky-500/10 text-sky-300",
  gold: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  outline: "border-line-strong bg-transparent text-white",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof BADGE_TONES;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 border px-2 py-[3px] font-display text-2xs font-bold uppercase tracking-[0.12em]",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ScoreBadge({ rating, className }: { rating: number; className?: string }) {
  const tone =
    rating >= 9
      ? "border-emerald-400/70 text-emerald-300"
      : rating >= 8
        ? "border-accent text-white"
        : "border-line-strong text-ink-secondary";
  return (
    <span
      className={clsx(
        "inline-flex min-w-[42px] items-center justify-center border bg-bg-deep/85 px-1.5 py-1 font-display text-xs font-extrabold tabular-nums backdrop-blur",
        tone,
        className,
      )}
      title={`INFINITY score ${rating.toFixed(1)} / 10`}
    >
      {rating.toFixed(1)}
    </span>
  );
}

export function PriceTag({
  price,
  discount = 0,
  isFree,
  isComingSoon,
  size = "md",
}: {
  price: number;
  discount?: number;
  isFree?: boolean;
  isComingSoon?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  if (isComingSoon) {
    return (
      <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-sky-300">Coming soon</span>
    );
  }
  if (isFree || price === 0) {
    return <span className="font-display font-extrabold uppercase tracking-wide text-emerald-400">Free</span>;
  }
  const final = discountedPrice(price, discount);
  return (
    <span className="inline-flex items-baseline gap-2">
      {discount > 0 ? (
        <>
          <span className="rounded-control bg-accent px-1.5 py-[2px] font-display text-2xs font-bold text-white">-{discount}%</span>
          <span className="text-xs text-ink-muted line-through">${price.toFixed(2)}</span>
        </>
      ) : null}
      <span
        className={clsx(
          "font-display font-extrabold tabular-nums text-white",
          size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg",
        )}
      >
        ${final.toFixed(2)}
      </span>
    </span>
  );
}

export function PlatformPills({
  platforms,
  max = 8,
  className,
}: {
  platforms: PlatformSlug[];
  max?: number;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-wrap items-center gap-1", className)}>
      {platforms.slice(0, max).map((p) => (
        <span
          key={p}
          title={PLATFORM_MAP[p]?.name ?? p}
          className="border border-line bg-bg-deep/70 px-1.5 py-[2px] font-display text-[10px] font-bold uppercase tracking-wider text-ink-secondary"
        >
          {PLATFORM_MAP[p]?.shortName ?? p}
        </span>
      ))}
      {platforms.length > max ? (
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          +{platforms.length - max}
        </span>
      ) : null}
    </div>
  );
}

export function Stat({
  value,
  label,
  hint,
  tone = "default",
}: {
  value: string;
  label: string;
  hint?: string;
  tone?: "default" | "accent";
}) {
  return (
    <div className="border border-line bg-bg-card/60 px-5 py-4">
      <p
        className={clsx(
          "font-display text-3xl font-extrabold tabular-nums sm:text-4xl",
          tone === "accent" ? "text-accent" : "text-white",
        )}
      >
        {value}
      </p>
      <p className="mt-1 font-display text-xs font-bold uppercase tracking-[0.16em] text-ink-secondary">{label}</p>
      {hint ? <p className="mt-1 text-2xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("relative overflow-hidden rounded-card bg-bg-muted/70", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

export function EmptyState({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="border border-dashed border-line bg-bg-card/40 px-8 py-14 text-center">
      <p className="font-display text-xl font-bold uppercase tracking-wide text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">{body}</p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex border border-accent bg-accent px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-2xs uppercase tracking-[0.14em] text-ink-muted"
    >
      {items.map((item, i) => (
        <span key={item.label + i} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-secondary">{item.label}</span>
          )}
          {i < items.length - 1 ? <ChevronRight className="h-3 w-3 text-ink-muted" /> : null}
        </span>
      ))}
    </nav>
  );
}

export function TagList({
  tags,
  limit = 12,
  hrefBase = "/search?tag=",
}: {
  tags: string[];
  limit?: number;
  hrefBase?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, limit).map((t) => (
        <Link
          key={t}
          href={`${hrefBase}${encodeURIComponent(t)}`}
          className="border border-line bg-bg-muted/60 px-2 py-1 text-2xs uppercase tracking-[0.1em] text-ink-secondary transition hover:border-accent hover:text-white"
        >
          {t}
        </Link>
      ))}
    </div>
  );
}

export function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-soft py-2.5 last:border-b-0">
      <span className="font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">{label}</span>
      <span className="text-right text-sm text-white">{value}</span>
    </div>
  );
}

export function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={clsx("border border-line bg-bg-card/50", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

