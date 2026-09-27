import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GENRE_MAP, SUBGENRES, SUBGENRE_MAP, GENRES } from "@/data/taxonomy";
import { GAMES } from "@/lib/catalogue";
import { queryGames, sortGames } from "@/lib/catalogue/query";
import { BrowseTabs } from "@/components/browse/browse-tabs";
import { GameGrid, RankedGamesTable } from "@/components/game/GameGrid";
import { PageHero } from "@/components/ui/page-hero";
import { Breadcrumbs, EmptyState, SectionHeading, Stat } from "@/components/ui/primitives";
import type { Game } from "@/lib/types";

/* ===========================================================================
 * /categories/[slug] — one browsing lane.
 * ---------------------------------------------------------------------------
 * Accepts both primary genre slugs (22) and specialisation slugs (67).
 * The catalogue is closed: params are enumerated at build time and unknown
 * slugs 404 instead of rendering on demand (`dynamicParams = false`).
 * ======================================================================== */

export function generateStaticParams() {
  return [...GENRES.map((g) => ({ slug: g.slug })), ...SUBGENRES.map((s) => ({ slug: s.slug }))];
}

export const dynamicParams = false;

type Lane =
  | { kind: "genre"; slug: string; name: string; blurb: string; hue: number; parent: null }
  | { kind: "sub"; slug: string; name: string; blurb: string; hue: number; parent: string };

function resolveLane(slug: string): Lane | null {
  const genre = GENRE_MAP[slug];
  if (genre) {
    return { kind: "genre", slug, name: genre.name, blurb: genre.blurb, hue: genre.hue, parent: null };
  }
  const sub = SUBGENRE_MAP[slug];
  if (sub) {
    const parentGenre = GENRE_MAP[sub.lane];
    return {
      kind: "sub",
      slug,
      name: sub.name,
      blurb: `${sub.name} titles from the ${parentGenre?.name ?? sub.lane} lane — ranked live from the catalogue.`,
      hue: parentGenre?.hue ?? 356,
      parent: sub.lane,
    };
  }
  return null;
}

function poolFor(slug: string): Game[] {
  const genre = GENRE_MAP[slug];
  if (genre) return queryGames({ genre: [slug] }, "popular");
  const sub = SUBGENRE_MAP[slug];
  if (!sub) return [];
  const name = sub.name.toLowerCase();
  return sortGames(
    GAMES.filter((g) => g.tags.some((t) => t.toLowerCase() === name)),
    "popular",
  );
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lane = resolveLane(slug);
  if (!lane) return { title: "Category not found" };
  return {
    title: `${lane.name} games`,
    description: `${lane.blurb} Browse, compare and buy ${lane.name} games on INFINITY.`,
  };
}
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const lane = resolveLane(slug);
  if (!lane) notFound();

  const pool = poolFor(slug);
  const top = sortGames(pool, "rating").slice(0, 12);
  const newest = sortGames(pool, "newest").slice(0, 12);
  const all = pool.slice(0, 24);
  const free = pool.filter((g) => g.isFree).length;
  const soon = pool.filter((g) => g.isComingSoon).length;
  const avg = pool.length
    ? Math.round((pool.reduce((sum, g) => sum + g.rating, 0) / pool.length) * 10) / 10
    : 0;

  /* Sibling lanes: specialisations of this genre, or peers of this one. */
  const siblings = (
    lane.kind === "genre"
      ? SUBGENRES.filter((s) => s.lane === lane.slug)
      : SUBGENRES.filter((s) => s.lane === lane.parent && s.slug !== lane.slug)
  ).map((s) => ({ slug: s.slug, name: s.name }));
  const parentLane = lane.parent ? GENRE_MAP[lane.parent] : null;

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: lane.name },
  ];

  if (!pool.length) {
    return (
      <>
        <PageHero eyebrow="Category" title={lane.name} description={lane.blurb} tone="accent">
          <Breadcrumbs items={crumbs} />
        </PageHero>
        <div className="shell py-10">
          <EmptyState
            title="No titles in this lane yet"
            body="Nothing in the catalogue carries this tag right now. The lane stays live so the moment a title ships with it, it appears here."
            ctaHref="/categories"
            ctaLabel="All categories"
          />
        </div>
      </>
    );
  }

  const tabs = [
    { id: "top-rated", label: "Top rated", content: <GameGrid games={top} columns={6} /> },
    { id: "new", label: "Newest", content: <GameGrid games={newest} columns={6} /> },
    {
      id: "all",
      label: "All in lane",
      badge: String(pool.length),
      content: <GameGrid games={all} columns={6} />,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={lane.kind === "genre" ? "Genre lane" : "Specialisation"}
        title={lane.name}
        description={lane.blurb}
        tone="accent"
      >
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(pool.length)} label="Titles" />
          <Stat value={avg.toFixed(1)} label="Avg. score" tone="accent" />
          <Stat value={String(free)} label="Free to play" />
          <Stat value={String(soon)} label="Coming soon" />
        </div>
        <span
          className="mt-6 block h-1 w-full max-w-xl"
          style={{ background: `hsl(${lane.hue} 90% 55%)` }}
          aria-hidden="true"
        />
      </PageHero>

      <div className="shell space-y-12 py-10">
        <BrowseTabs tabs={tabs} />
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <SectionHeading eyebrow="Chart" title={`Top 10 in ${lane.name}`} />
            <RankedGamesTable games={pool.slice(0, 10)} valueLabel="Score" />
          </section>

          <section>
            <SectionHeading
              eyebrow="Keep exploring"
              title={parentLane ? `More ${parentLane.name} lanes` : "Specialisations of this lane"}
              href={parentLane ? `/categories/${parentLane.slug}` : "/categories"}
              linkLabel={parentLane ? "Genre page" : "All categories"}
            />
            {siblings.length ? (
              <div className="flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/categories/${s.slug}`}
                    className="border border-line bg-bg-deep/60 px-3 py-2 text-2xs uppercase tracking-[0.1em] text-ink-secondary transition hover:border-accent hover:text-white"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-secondary">
                This is the full set of {lane.name} lanes — head back to the index for the rest of the catalogue.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/platforms"
                className="border border-line px-4 py-2.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-accent"
              >
                By platform
              </Link>
              <Link
                href="/studios"
                className="border border-line px-4 py-2.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-accent"
              >
                By studio
              </Link>
              <Link
                href="/deals"
                className="border border-line px-4 py-2.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-accent"
              >
                On sale now
              </Link>
            </div>
          </section>
        </div>

      </div>
    </>
  );
}

