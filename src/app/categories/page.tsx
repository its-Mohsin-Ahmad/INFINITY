import type { Metadata } from "next";
import Link from "next/link";
import { GENRES, GENRE_MAP, SUBGENRES, TOTAL_GENRE_LANES } from "@/data/taxonomy";
import { GAMES, computeStats } from "@/lib/catalogue";
import { facetCounts } from "@/lib/catalogue/query";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading, Stat } from "@/components/ui/primitives";

/* ===========================================================================
 * /categories — every browsing lane: 22 primary genres + 67 specialisations.
 * Counts are computed live from the catalogue, never hard-coded.
 * ======================================================================== */

export const metadata: Metadata = {
  title: "Categories",
  description: `All ${TOTAL_GENRE_LANES} INFINITY browsing lanes — ${GENRES.length} primary genres and ${SUBGENRES.length} specialisations, with live catalogue counts.`,
};

export default function CategoriesPage() {
  const stats = computeStats();

  /* Primary genre counts come from the genre facet; sub-genre counts are
     matched against the descriptive tags the catalogue builder emits. */
  const genreCounts = new Map(facetCounts("genre").map((f) => [f.value, f.count]));
  const subCounts = new Map(
    SUBGENRES.map((s) => {
      const name = s.name.toLowerCase();
      return [s.slug, GAMES.filter((g) => g.tags.some((t) => t.toLowerCase() === name)).length] as const;
    }),
  );

  const subByLane = new Map<string, typeof SUBGENRES>();
  for (const sub of SUBGENRES) {
    const list = subByLane.get(sub.lane) ?? [];
    list.push(sub);
    subByLane.set(sub.lane, list);
  }

  return (
    <>
      <PageHero
        eyebrow="Discovery"
        title={
          <>
            {TOTAL_GENRE_LANES} ways into
            <br />
            the catalogue
          </>
        }
        description="Primary genres carry the big ideas; specialisations narrow them to the exact flavour you are after. Every lane is a page, every count is live."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(GENRES.length)} label="Primary genres" />
          <Stat value={String(SUBGENRES.length)} label="Specialisations" />
          <Stat value={stats.games.toLocaleString()} label="Games" />
          <Stat value={stats.averageRating.toFixed(1)} label="Avg. score" tone="accent" />
        </div>
      </PageHero>

      <div className="shell space-y-14 py-10">
        <section>
          <SectionHeading
            eyebrow="Primary lanes"
            title="Browse by genre"
            description="The 22 top-level genres. Each opens a prerendered lane page with top-rated, newest and full-grid views."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GENRES.map((genre) => (
              <Link
                key={genre.slug}
                href={`/categories/${genre.slug}`}
                className="group relative overflow-hidden border border-line bg-bg-card/40 p-4 transition hover:border-accent"
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.5 opacity-70 transition group-hover:opacity-100"
                  style={{ background: `hsl(${genre.hue} 90% 55%)` }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold uppercase tracking-[0.1em] text-white group-hover:text-accent">
                      {genre.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-2xs leading-relaxed text-ink-muted">{genre.blurb}</p>
                  </div>
                  <span className="shrink-0 font-display text-lg font-extrabold tabular-nums text-ink-secondary">
                    {genreCounts.get(genre.slug) ?? 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        {/* ----------------------------------------------- specialisations */}
        <section>
          <SectionHeading
            eyebrow="Specialisations"
            title="Narrow it down"
            description="Sub-genre lanes grouped under their parent genre — from Soulslike to Sim Racing."
          />
          <div className="space-y-6">
            {[...subByLane.entries()].map(([lane, subs]) => (
              <div key={lane} className="border border-line bg-bg-card/30 p-4">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-line-soft pb-2">
                  <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white">
                    {GENRE_MAP[lane]?.name ?? lane}
                  </p>
                  <Link
                    href={`/categories/${lane}`}
                    className="text-2xs uppercase tracking-[0.14em] text-ink-muted transition hover:text-accent"
                  >
                    View genre page
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subs.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/categories/${sub.slug}`}
                      className="group inline-flex items-center gap-2 border border-line bg-bg-deep/60 px-2.5 py-1.5 text-2xs uppercase tracking-[0.1em] text-ink-secondary transition hover:border-accent hover:text-white"
                    >
                      {sub.name}
                      <span className="tabular-nums text-ink-muted group-hover:text-accent">
                        {subCounts.get(sub.slug) ?? 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-3 border-t border-line pt-8">
          <Link
            href="/platforms"
            className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
          >
            Browse platforms
          </Link>
          <Link
            href="/studios"
            className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
          >
            Browse studios
          </Link>
          <Link
            href="/games"
            className="bg-accent px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
          >
            Full catalogue
          </Link>
        </section>

      </div>
    </>
  );
}
