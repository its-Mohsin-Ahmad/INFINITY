import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STUDIOS, getStudio } from "@/lib/catalogue/studios";
import { genreName } from "@/data/taxonomy";
import { GameGrid, RankedGamesTable } from "@/components/game/GameGrid";
import { PageHero } from "@/components/ui/page-hero";
import { Breadcrumbs, MetaRow, Panel, SectionHeading, Stat } from "@/components/ui/primitives";

/* ===========================================================================
 * /studios/[slug] — one developer's catalogue.
 * Slugs are `slugify(developer)`, built from the same index the homepage,
 * game pages and footer link with. Prerendered for every studio.
 * ======================================================================== */

export function generateStaticParams() {
  return STUDIOS.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const studio = getStudio(slug);
  if (!studio) return { title: "Studio not found" };
  return {
    title: `${studio.name} — ${studio.count} ${studio.count === 1 ? "game" : "games"}`,
    description: `Every ${studio.name} title on INFINITY: scores, platforms, release dates and the studio's highest-rated work.`,
  };
}
export default async function StudioPage({ params }: Props) {
  const { slug } = await params;
  const studio = getStudio(slug);
  if (!studio) notFound();

  const games = studio.games.slice(0, 24);
  const chart = studio.games.slice(0, 8);
  const blurb =
    `${studio.name} has ${studio.count} ${studio.count === 1 ? "title" : "titles"} on INFINITY` +
    (studio.publisher !== studio.name ? `, published with ${studio.publisher}` : "") +
    ` — debuting in ${studio.debutYear} with an average score of ${studio.avgRating.toFixed(1)}.`;

  const others = STUDIOS.filter((s) => s.slug !== studio.slug).slice(0, 12);

  return (
    <>
      <PageHero eyebrow="Studio" title={studio.name} description={blurb} tone="accent">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Studios", href: "/studios" },
            { label: studio.name },
          ]}
        />
        <div className="mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(studio.count)} label="Titles" />
          <Stat value={studio.avgRating.toFixed(1)} label="Avg. score" tone="accent" />
          <Stat value={studio.debutYear} label="Debut" />
          <Stat value={studio.topGame.rating.toFixed(1)} label="Top score" />
        </div>
      </PageHero>

      <div className="shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-10">
          <section>
            <SectionHeading
              eyebrow="Catalogue"
              title={`Games by ${studio.name}`}
              description={
                studio.count > games.length
                  ? `Showing the ${games.length} highest-rated of ${studio.count} titles.`
                  : undefined
              }
            />
            <GameGrid games={games} columns={4} />
          </section>

          <section>
            <SectionHeading eyebrow="Chart" title="Highest rated" />
            <RankedGamesTable games={chart} valueLabel="Score" />
          </section>
        </div>

        <aside className="space-y-5">
          <Panel title="Studio facts">
            <MetaRow label="Publisher" value={studio.publisher} />
            <MetaRow label="Titles" value={String(studio.count)} />
            <MetaRow label="Debut" value={studio.debutYear} />
            <MetaRow label="Avg. score" value={studio.avgRating.toFixed(1)} />
            <MetaRow label="Top genres" value={studio.genres.map(genreName).join(", ")} />
          </Panel>

          <div className="border border-line bg-bg-card/50 p-4">
            <p className="mb-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
              More studios
            </p>
            <div className="flex flex-wrap gap-2">
              {others.map((s) => (
                <Link
                  key={s.slug}
                  href={`/studios/${s.slug}`}
                  className="border border-line bg-bg-deep/60 px-2.5 py-1.5 text-2xs uppercase tracking-wider text-ink-secondary transition hover:border-accent hover:text-white"
                >
                  {s.name}
                </Link>
              ))}
            </div>
            <Link
              href="/studios"
              className="mt-4 block border border-line px-4 py-2.5 text-center font-display text-2xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
            >
              All {STUDIOS.length} studios
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

