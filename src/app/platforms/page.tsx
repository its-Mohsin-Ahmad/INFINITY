import type { Metadata } from "next";
import Link from "next/link";
import { PLATFORMS, PLATFORM_FAMILIES, PLATFORM_MAP } from "@/data/taxonomy";
import { computeStats } from "@/lib/catalogue";
import { byPlatform } from "@/lib/catalogue/query";
import { GameRow } from "@/components/game/GameGrid";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading, Stat } from "@/components/ui/primitives";

/* ===========================================================================
 * /platforms — the eight storefront / hardware lanes.
 * Counts are live; the accent colour of each card is the platform's own.
 * ======================================================================== */

export const metadata: Metadata = {
  title: "Platforms",
  description:
    "PC, PlayStation, Xbox, Nintendo and mobile — the eight platform lanes INFINITY tracks, with live catalogue counts.",
};

export default function PlatformsPage() {
  const stats = computeStats();
  const counts = new Map(
    PLATFORMS.map((p) => [p.slug, stats.games && p.slug ? byPlatform(p.slug, 10_000).length : 0]),
  );
  const pcTop = byPlatform("pc", 12);

  return (
    <>
      <PageHero
        eyebrow="Play where you are"
        title={
          <>
            Eight platforms,
            <br />
            one library
          </>
        }
        description="INFINITY tracks availability, editions and requirements per platform, so you always know where a game runs — and what it needs — before you buy."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(PLATFORMS.length)} label="Platforms" />
          <Stat value={String(PLATFORM_FAMILIES.length)} label="Families" />
          <Stat value={stats.games.toLocaleString()} label="Games" />
          <Stat value={String(stats.languages)} label="Languages" tone="accent" />
        </div>
      </PageHero>

      <div className="shell space-y-14 py-10">
        {/* ----------------------------------------------- platform cards */}
        <section>
          <SectionHeading
            eyebrow="Hardware & storefronts"
            title="Pick your platform"
            description="Each lane opens a prerendered page with the platform's top-rated, newest and free titles."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORMS.map((p) => (
              <Link
                key={p.slug}
                href={`/platforms/${p.slug}`}
                className="group relative overflow-hidden border border-line bg-bg-card/50 p-5 transition hover:border-accent hover:bg-bg-card"
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.5 opacity-70 transition group-hover:opacity-100"
                  style={{ background: p.accent }}
                />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                      {p.shortName}
                    </p>
                    <p className="mt-0.5 text-2xs uppercase tracking-wider text-ink-muted">{p.manufacturer}</p>
                  </div>
                  <span className="border border-line bg-bg-deep/70 px-2 py-1 font-display text-2xs font-bold tabular-nums text-accent">
                    {counts.get(p.slug) ?? 0}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-secondary">{p.blurb}</p>
                <p className="mt-3 flex items-center justify-between border-t border-line-soft pt-2.5 text-2xs uppercase tracking-wider text-ink-muted">
                  <span>{p.generation}</span>
                  <span>Since {p.launched}</span>
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ----------------------------------------------------- families */}
        <section>
          <SectionHeading
            eyebrow="Families"
            title="Grouped the way players think"
            description="PlayStation and Xbox generations, Nintendo's hybrid, the PC lane and mobile — each family links through to its platforms."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {PLATFORM_FAMILIES.map((family) => (
              <div key={family.slug} className="border border-line bg-bg-card/40 p-4">
                <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">{family.name}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {family.platforms.map((slug) => (
                    <Link
                      key={slug}
                      href={`/platforms/${slug}`}
                      className="border border-line bg-bg-deep/60 px-2 py-1 text-2xs uppercase tracking-wider text-ink-secondary transition hover:border-accent hover:text-white"
                    >
                      {PLATFORM_MAP[slug]?.shortName ?? slug}
                    </Link>
                  ))}
                </div>
                <p className="mt-3 border-t border-line-soft pt-2 text-2xs text-ink-muted">
                  {family.platforms.reduce((sum, slug) => sum + (counts.get(slug) ?? 0), 0)} titles across the family
                </p>
              </div>
            ))}
          </div>
        </section>

        {pcTop.length ? (
          <GameRow
            eyebrow="Most played on PC"
            title="Top of the PC lane"
            description="Ranked by popularity across every title with a Windows build."
            games={pcTop}
            href="/platforms/pc"
            linkLabel="PC page"
          />
        ) : null}
      </div>
    </>
  );
}
