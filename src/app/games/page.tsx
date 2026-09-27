import type { Metadata } from "next";
import Link from "next/link";
import { GAMES, computeStats } from "@/lib/catalogue";
import {
  bestDeals,
  comingSoonGames,
  freeToPlayGames,
  newReleases,
  topRated,
  trendingGames,
} from "@/lib/catalogue/query";
import { BrowseTabs } from "@/components/browse/browse-tabs";
import { GameGrid } from "@/components/game/GameGrid";
import { GenreLaneGrid, PlatformDiscovery } from "@/components/home/HomeSections";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading, Stat } from "@/components/ui/primitives";
import type { Game } from "@/lib/types";

/* ===========================================================================
 * /games — the browse surface.
 * ---------------------------------------------------------------------------
 * Fully static: lane contents are computed at build time and the tab strip
 * only switches between prerendered panels (deep-link aware via ?sort= / ?tab=).
 * ======================================================================== */

export const metadata: Metadata = {
  title: "Browse games",
  description:
    "The full INFINITY catalogue — trending, new releases, top rated, deals, free-to-play and coming soon, plus every genre and platform lane.",
};

function LaneGrid({ games, moreHref, moreLabel }: { games: Game[]; moreHref: string; moreLabel: string }) {
  return (
    <div className="space-y-4">
      <GameGrid games={games} columns={6} />
      <p className="text-right">
        <Link
          href={moreHref}
          className="border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-white"
        >
          {moreLabel}
        </Link>
      </p>
    </div>
  );
}

export default function GamesPage() {
  const stats = computeStats();

  const lanes = [
    { id: "trending", label: "Trending", count: GAMES.filter((g) => g.isTrending && !g.isComingSoon).length, items: trendingGames(12), more: ["/categories", "Browse by lane"] },
    { id: "new", label: "New releases", count: GAMES.filter((g) => g.isNew).length, items: newReleases(12), more: ["/platforms", "By platform"] },
    { id: "top-rated", label: "Top rated", count: GAMES.length, items: topRated(12), more: ["/categories", "Browse by lane"] },
    { id: "deals", label: "Deals", count: GAMES.filter((g) => g.discount > 0).length, items: bestDeals(12, 30), more: ["/deals", "All deals"] },
    { id: "free", label: "Free to play", count: GAMES.filter((g) => g.isFree).length, items: freeToPlayGames(12), more: ["/categories", "Browse by lane"] },
    { id: "soon", label: "Coming soon", count: GAMES.filter((g) => g.isComingSoon).length, items: comingSoonGames(12), more: ["/categories", "Browse by lane"] },
  ];

  const tabs = lanes.map((lane) => ({
    id: lane.id,
    label: lane.label,
    badge: String(lane.count),
    content: <LaneGrid games={lane.items} moreHref={lane.more[0]} moreLabel={lane.more[1]} />,
  }));

  /* A–Z directory: plain links, so every title stays reachable without a
     search API. Grouped by first letter, alphabetically sorted. */
  const sorted = [...GAMES].sort((a, b) => a.title.localeCompare(b.title));
  const groups = new Map<string, Game[]>();
  for (const game of sorted) {
    const raw = game.title[0]?.toUpperCase() ?? "#";
    const letter = /[A-Z]/.test(raw) ? raw : "#";
    const list = groups.get(letter) ?? [];
    list.push(game);
    groups.set(letter, list);
  }
  const letters = [...groups.keys()].sort();

  return (
    <>
      <PageHero
        eyebrow="The catalogue"
        title={
          <>
            Browse every game
            <br />
            on INFINITY
          </>
        }
        description="Five hundred and forty verified titles across eight platforms. Every shelf below is computed from the live catalogue at build time — pick a lane, a platform or the full A–Z."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={stats.games.toLocaleString()} label="Games" />
          <Stat value={String(stats.genreLanes)} label="Genre lanes" />
          <Stat value={String(stats.platforms)} label="Platforms" />
          <Stat value={stats.averageRating.toFixed(1)} label="Avg. score" tone="accent" />
        </div>
      </PageHero>

      <div className="shell space-y-16 py-10">
        <section>
          <BrowseTabs tabs={tabs} />
        </section>

        <PlatformDiscovery />

        <GenreLaneGrid limit={12} />
        {/* ---------------------------------------------- A–Z directory */}
        <section>
          <SectionHeading
            eyebrow="Directory"
            title="Every title, A to Z"
            description={`${stats.games.toLocaleString()} games sorted alphabetically — use your browser's find (Ctrl+F) to jump straight to a title.`}
          />

          <nav className="no-scrollbar mb-5 flex flex-wrap gap-1.5 overflow-x-auto" aria-label="Jump to letter">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter.toLowerCase()}`}
                className="min-w-[34px] border border-line bg-bg-card/60 px-2 py-1.5 text-center font-display text-2xs font-bold uppercase tracking-widest text-ink-secondary transition hover:border-accent hover:text-white"
              >
                {letter}
              </a>
            ))}
          </nav>

          <div className="space-y-6">
            {letters.map((letter) => (
              <div key={letter} id={`letter-${letter.toLowerCase()}`} className="scroll-mt-24">
                <h3 className="mb-3 border-b border-line pb-2 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
                  {letter}
                </h3>
                <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                  {(groups.get(letter) ?? []).map((game) => (
                    <li key={game.slug}>
                      <Link
                        href={`/games/${game.slug}`}
                        className="block truncate border border-transparent px-2 py-1.5 text-xs text-ink-secondary transition hover:border-line hover:bg-bg-card/60 hover:text-white"
                      >
                        {game.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
