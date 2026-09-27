import Link from "next/link";
import { ArrowUpRight, Download, Radio, Ticket, Users } from "lucide-react";
import { GENRES, PLATFORMS } from "@/data/taxonomy";
import type { Genre } from "@/lib/types";
import {
  genreDistribution,
  platformDistribution,
  releaseTrend,
  ratingDistribution,
  topDevelopers,
} from "@/lib/catalogue/query";
import { computeStats } from "@/lib/catalogue";
import { Stat } from "@/components/ui/primitives";
import { ProgressBar } from "@/components/ui/interactive";
import { slugify } from "@/lib/generate";

/* ===========================================================================
 * Homepage sections (server components — no client JS unless imported below)
 * ======================================================================== */

/** The 8 platform lanes, with live counts from the catalogue. */
export function PlatformDiscovery() {
  const counts = new Map(platformDistribution().map((d) => [d.label, d.value]));

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <p className="eyebrow mb-1.5">Play where you are</p>
          <h2 className="section-title">Every platform, one library</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-secondary">
            INFINITY tracks availability per platform, so you always know where a game runs before you buy it.
          </p>
        </div>
        <Link
          href="/platforms"
          className="group inline-flex items-center gap-1 border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-white"
        >
          All platforms
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {PLATFORMS.map((p) => (
          <Link
            key={p.slug}
            href={`/platforms/${p.slug}`}
            className="group relative overflow-hidden border border-line bg-bg-card/50 p-4 transition hover:border-accent hover:bg-bg-card"
          >
            <span
              className="absolute inset-x-0 top-0 h-0.5 opacity-70 transition group-hover:opacity-100"
              style={{ background: p.accent }}
            />
            <p className="font-display text-lg font-extrabold uppercase tracking-tight text-white">{p.shortName}</p>
            <p className="mt-0.5 line-clamp-1 text-2xs uppercase tracking-wider text-ink-muted">{p.name}</p>
            <p className="mt-3 font-display text-xl font-extrabold tabular-nums text-white">
              {(counts.get(p.name) ?? 0).toLocaleString()}
            </p>
            <p className="text-2xs uppercase tracking-wider text-ink-muted">games</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Genre lanes — the primary discovery surface. Counts are computed live. */
export function GenreLaneGrid({ limit = 12 }: { limit?: number }) {
  const dist = genreDistribution(undefined, limit);
  const bySlug = new Map<string, Genre>(GENRES.map((g) => [g.slug, g]));
  const max = Math.max(1, ...dist.map((d) => d.value));

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <p className="eyebrow mb-1.5">Browse by lane</p>
          <h2 className="section-title">Find your genre</h2>
        </div>
        <Link
          href="/categories"
          className="group inline-flex items-center gap-1 border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-white"
        >
          All {GENRES.length} genres
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dist.map((d) => {
          const genre = bySlug.get(d.label);
          return (
            <Link
              key={d.label}
              href={`/categories/${d.label}`}
              className="group relative overflow-hidden border border-line bg-bg-card/40 p-4 transition hover:border-accent"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold uppercase tracking-[0.1em] text-white group-hover:text-accent">
                    {genre?.name ?? d.label}
                  </p>
                  <p className="mt-1 line-clamp-1 text-2xs text-ink-muted">{genre?.blurb}</p>
                </div>
                <span className="shrink-0 font-display text-lg font-extrabold tabular-nums text-ink-secondary">
                  {d.value}
                </span>
              </div>
              <div className="mt-3 h-1 w-full bg-line">
                <div
                  className="h-full bg-accent transition-all duration-700"
                  style={{ width: `${Math.round((d.value / max) * 100)}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** The four ecosystem pillars that make INFINITY more than a store. */
export function EcosystemBand() {
  const pillars = [
    {
      icon: Download,
      title: "INFINITY Launcher",
      body: "One client for every storefront: unified library, patch manager, mod manager and cloud saves.",
      href: "/launcher",
      cta: "Download for Windows",
    },
    {
      icon: Ticket,
      title: "INFINITY Pass",
      body: "One membership, hundreds of titles, day-one releases and member-only discounts in the store.",
      href: "/game-pass",
      cta: "See plans",
    },
    {
      icon: Radio,
      title: "Esports Hub",
      body: "Live fixtures, brackets, standings and prize pools across the competitive titles you already play.",
      href: "/esports",
      cta: "View schedule",
    },
    {
      icon: Users,
      title: "Community",
      body: "Reviews, long-form guides, crew finder and discussions moderated around verified play records.",
      href: "/community",
      cta: "Join in",
    },
  ];

  return (
    <section>
      <div className="mb-5 border-b border-line pb-3">
        <p className="eyebrow mb-1.5">Beyond the store</p>
        <h2 className="section-title">One ecosystem around every game</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pillars.map((p) => (
          <Link
            key={p.title}
            href={p.href}
            className="group relative flex flex-col justify-between overflow-hidden border border-line bg-gradient-to-b from-bg-card/70 to-bg-muted/40 p-5 transition hover:border-accent hover:shadow-softglow"
          >
            <div>
              <p.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 font-display text-base font-extrabold uppercase tracking-tight text-white">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{p.body}</p>
            </div>
            <p className="mt-5 inline-flex items-center gap-1 font-display text-2xs font-bold uppercase tracking-[0.14em] text-accent">
              {p.cta}
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Live pulse board: catalogue scale, release trend and rating spread. */
export function PulseBoard() {
  const stats = computeStats();
  const trend = releaseTrend().slice(-14);
  const ratings = ratingDistribution();
  const devs = topDevelopers(8);
  const maxTrend = Math.max(1, ...trend.map((t) => t.value));
  const maxRating = Math.max(1, ...ratings.map((r) => r.value));

  return (
    <section className="border border-line bg-bg-nav/60 p-5 lg:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="eyebrow mb-1.5">Verified catalogue</p>
          <h2 className="section-title">The pulse of INFINITY</h2>
        </div>
        <p className="max-w-md text-xs text-ink-muted">
          Every number here is computed from the live catalogue at request time — no marketing rounding.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
        <div className="grid grid-cols-2 gap-3">
          <Stat value={stats.games.toLocaleString()} label="Games tracked" />
          <Stat value={stats.developers.toLocaleString()} label="Studios" />
          <Stat value={String(stats.platforms)} label="Platforms" />
          <Stat value={String(stats.genreLanes)} label="Genre lanes" />
          <Stat value={stats.publishers.toLocaleString()} label="Publishers" />
          <Stat value={String(stats.languages)} label="Languages" />
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-3 font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
              Releases per year
            </p>
            <div className="flex h-28 items-end gap-1.5">
              {trend.map((t) => (
                <Link
                  key={t.label}
                  href={`/games?year=${t.label}`}
                  title={`${t.label}: ${t.value} releases`}
                  className="group relative flex-1"
                >
                  <span
                    className="block origin-bottom bg-accent/70 transition group-hover:bg-accent"
                    style={{ height: `${Math.max(6, (t.value / maxTrend) * 100)}px` }}
                  />
                  <span className="mt-1 block truncate text-center text-[9px] uppercase text-ink-muted">
                    {t.label.slice(2)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-3 font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                Rating spread
              </p>
              <div className="space-y-2">
                {ratings.map((r) => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span className="w-10 shrink-0 text-2xs tabular-nums text-ink-secondary">{r.label}</span>
                    <ProgressBar value={r.value} max={maxRating} />
                    <span className="w-8 shrink-0 text-right text-2xs tabular-nums text-ink-muted">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                Most tracked studios
              </p>
              <ul className="space-y-1.5">
                {devs.map((d) => (
                  <li key={d.name} className="flex items-center justify-between gap-3 text-xs">
                    <Link
                      href={`/studios/${slugify(d.name)}`}
                      className="truncate text-ink-secondary transition hover:text-accent"
                    >
                      {d.name}
                    </Link>
                    <span className="shrink-0 tabular-nums text-ink-muted">
                      {d.count} · {d.avgRating.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


 