import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PLATFORMS, PLATFORM_MAP, PLATFORM_FAMILIES } from "@/data/taxonomy";
import { queryGames } from "@/lib/catalogue/query";
import { BrowseTabs } from "@/components/browse/browse-tabs";
import { GameGrid } from "@/components/game/GameGrid";
import { PageHero } from "@/components/ui/page-hero";
import { Breadcrumbs, MetaRow, Panel, Stat } from "@/components/ui/primitives";

/* ===========================================================================
 * /platforms/[slug] — one platform lane.
 * Prerendered for all eight platforms; unknown slugs 404.
 * ======================================================================== */

export function generateStaticParams() {
  return PLATFORMS.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const platform = PLATFORM_MAP[slug];
  if (!platform) return { title: "Platform not found" };
  return {
    title: platform.name,
    description: `${platform.blurb} Top-rated, newest, free and discounted games on ${platform.name}.`,
  };
}
export default async function PlatformPage({ params }: Props) {
  const { slug } = await params;
  const platform = PLATFORM_MAP[slug];
  if (!platform) notFound();

  const pool = queryGames({ platform: [slug] }, "popular");
  const top = queryGames({ platform: [slug] }, "rating").slice(0, 12);
  const newest = queryGames({ platform: [slug] }, "newest").slice(0, 12);
  const free = queryGames({ platform: [slug], freeOnly: true }, "popular").slice(0, 12);
  const deals = queryGames({ platform: [slug], discountedOnly: true }, "popular").slice(0, 12);

  const freeCount = pool.filter((g) => g.isFree).length;
  const dealCount = pool.filter((g) => g.discount > 0).length;
  const soon = pool.filter((g) => g.isComingSoon).length;
  const avg = pool.length
    ? Math.round((pool.reduce((sum, g) => sum + g.rating, 0) / pool.length) * 10) / 10
    : 0;

  const family = PLATFORM_FAMILIES.find((f) => (f.platforms as string[]).includes(slug)) ?? null;
  const siblings = (family?.platforms ?? []).filter((s) => s !== slug);

  const tabs = [
    { id: "top-rated", label: "Top rated", content: <GameGrid games={top} columns={6} /> },
    { id: "new", label: "Newest", content: <GameGrid games={newest} columns={6} /> },
    { id: "free", label: "Free to play", badge: String(freeCount), content: <GameGrid games={free} columns={6} /> },
    { id: "deals", label: "Deals", badge: String(dealCount), content: <GameGrid games={deals} columns={6} /> },
  ];

  return (
    <>
      <PageHero eyebrow="Platform" title={platform.name} description={platform.blurb} tone="accent">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Platforms", href: "/platforms" },
            { label: platform.shortName },
          ]}
        />
        <div className="mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(pool.length)} label="Titles" />
          <Stat value={avg.toFixed(1)} label="Avg. score" tone="accent" />
          <Stat value={String(freeCount)} label="Free to play" />
          <Stat value={String(soon)} label="Coming soon" />
        </div>
        <span
          className="mt-6 block h-1 w-full max-w-xl"
          style={{ background: platform.accent }}
          aria-hidden="true"
        />
      </PageHero>

      <div className="shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <BrowseTabs tabs={tabs} />
        </div>

        <aside className="space-y-5">
          <Panel title="Platform facts">
            <MetaRow label="Manufacturer" value={platform.manufacturer} />
            <MetaRow label="Generation" value={platform.generation} />
            <MetaRow label="Launched" value={platform.launched} />
            <MetaRow label="Catalogue" value={`${pool.length} titles`} />
            <MetaRow label="Family" value={family?.name ?? "—"} />
          </Panel>

          {siblings.length && family ? (
            <div className="border border-line bg-bg-card/50 p-4">
              <p className="mb-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
                Also in {family.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <Link
                    key={s}
                    href={`/platforms/${s}`}
                    className="border border-line bg-bg-deep/60 px-2.5 py-1.5 text-2xs uppercase tracking-wider text-ink-secondary transition hover:border-accent hover:text-white"
                  >
                    {PLATFORM_MAP[s]?.shortName ?? s}
                  </Link>
                ))}
                <Link
                  href="/platforms"
                  className="border border-line px-2.5 py-1.5 text-2xs uppercase tracking-wider text-ink-secondary transition hover:border-accent hover:text-white"
                >
                  All platforms
                </Link>
              </div>
            </div>
          ) : null}

          <div className="border border-line bg-bg-card/50 p-4">
            <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white">Availability</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              Every game page lists this platform&apos;s edition, file size, requirements and store links — plus
              whether cross-save and cross-play are supported.
            </p>
            <Link
              href="/games"
              className="mt-4 block bg-accent px-4 py-2.5 text-center font-display text-2xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
            >
              Browse all games
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

