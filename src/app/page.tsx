import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FeaturedGames } from "@/components/home/FeaturedGames";
import { CommunityBand, EsportsBand, GamePassBanner, NewsBand, SpotlightBanner, StatsBar } from "@/components/home/HomeBands";
import { EcosystemBand, ExploreTheInfinite, GenreLaneGrid, PlatformDiscovery, PulseBoard } from "@/components/home/HomeSections";
import { GameGrid, GameRow, RankedGamesTable } from "@/components/game/GameGrid";
import { Countdown } from "@/components/ui/interactive";
import { NewsletterForm } from "@/components/player/player-actions";
import {
  bestDeals,
  comingSoonGames,
  editorsPicks,
  freeToPlayGames,
  heroGames,
  mostDownloaded,
  newReleases,
  topRated,
  trendingGames,
} from "@/lib/catalogue/query";

/* ===========================================================================
 * Home — the INFINITY front door
 * ---------------------------------------------------------------------------
 * Section order follows the brief: hero → platform explorer → stats bar →
 * trending → AAA spotlight → new releases → popular → free → deals → genres →
 * charts → news → esports → community → newsletter. Everything is derived
 * from the live catalogue at request time, and every link resolves to a real
 * prerendered route (catalogue lanes live behind /games?tab=).
 * ======================================================================== */

const QUICK_LINKS = [
  { label: "New releases", href: "/games?tab=new" },
  { label: "Top rated", href: "/games?tab=top-rated" },
  { label: "Free to play", href: "/games?tab=free" },
  { label: "Deals", href: "/deals" },
  { label: "Coming soon", href: "/games?tab=soon" },
  { label: "Categories", href: "/categories" },
  { label: "Esports", href: "/esports" },
  { label: "News", href: "/news" },
];

export default function HomePage() {
  // Ten slides rather than six: the brief asks for a deep adventure reel, and
  // every slug below has real storefront photography, so none of the extra
  // slides can degrade into generated key art.
  const featured = heroGames(10);
  const trending = trendingGames(16);
  const fresh = newReleases(16);
  const popular = mostDownloaded(16);
  const deals = bestDeals(12);
  const free = freeToPlayGames(12);
  const picks = editorsPicks(12);
  const soon = comingSoonGames(12);
  const chart = topRated(10);

  return (
    <>
      <HeroCarousel games={featured} />

      {/* quick lane chips */}
      <div className="border-b border-line bg-bg-secondary/50">
        <div className="shell no-scrollbar flex gap-2 overflow-x-auto py-3">
          <span className="flex shrink-0 items-center gap-1.5 pr-2 font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Jump to
          </span>
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.12em] text-ink-secondary transition hover:border-accent hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="shell space-y-8 py-6 sm:space-y-16 sm:py-12">
        <PlatformDiscovery />

        <StatsBar />

        <GameRow
          eyebrow="Climbing fast"
          title="Trending across the universe"
          description="Ranked by plays, wishlists and review velocity over the current window."
          games={trending}
          href="/games"
          linkLabel="Browse all"
          ranked
        />

        {/* asymmetric anchor of the homepage: one dominant card + 2×2 support */}
        <FeaturedGames />

        <SpotlightBanner />

        <section>
          <div className="mb-5 flex items-end justify-between gap-3 border-b border-line pb-3">
            <div>
              <p className="eyebrow mb-1.5">Just landed</p>
              <h2 className="section-title">New releases this window</h2>
            </div>
            <Link
              href="/games?tab=new"
              className="group inline-flex items-center gap-1 border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-white"
            >
              All new releases
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          {/* medium tier (§31): a calmer, denser grid between the two rails */}
          <GameGrid games={fresh.slice(0, 8)} columns={4} variant="medium" />
        </section>

        <GameRow
          eyebrow="Everyone's playing"
          title="Popular right now"
          description="Ranked by downloads across the catalogue in the current window."
          games={popular}
          href="/games?tab=trending"
          linkLabel="See what's hot"
        />

        <section>
          <div className="mb-5 flex items-end justify-between gap-3 border-b border-line pb-3">
            <div>
              <p className="eyebrow mb-1.5">Zero cost</p>
              <h2 className="section-title">Free to play</h2>
            </div>
            <Link
              href="/games?tab=free"
              className="group inline-flex items-center gap-1 border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-white"
            >
              See all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <GameGrid games={free.slice(0, 8)} columns={4} />
        </section>

        <GameRow
          eyebrow="Save hard"
          title="Season sale — verified discounts"
          description="Prices, discounts and availability are re-read from the catalogue on every request."
          games={deals}
          href="/deals"
          linkLabel="All deals"
          action={<Countdown to="2026-12-31T23:59:59Z" label="Sale ends in" />}
        />

        {/* wide promo beat, then the calm catalogue grid (§31, §45) */}
        <GamePassBanner />

        <ExploreTheInfinite />

        <GenreLaneGrid limit={12} />

        <GameRow
          eyebrow="Handpicked"
          title={"Editors' picks"}
          description="Chosen by the INFINITY editorial desk for craft, innovation and cultural footprint."
          games={picks}
          href="/games?sort=rating"
          linkLabel="Rated highest"
        />

        {soon.length ? (
          <GameRow
            eyebrow="On the horizon"
            title="Coming soon"
            description="Wishlist a title and INFINITY will notify you when pre-orders or launch go live."
            games={soon}
            href="/games?tab=soon"
            linkLabel="See all soon"
            size="sm"
          />
        ) : null}

        <section>
          <div className="mb-5 border-b border-line pb-3">
            <p className="eyebrow mb-1.5">Critic approved</p>
            <h2 className="section-title">Top 10 rated on INFINITY</h2>
          </div>
          <RankedGamesTable games={chart} />
        </section>

        <PulseBoard />

        <EcosystemBand />

        <NewsBand />

        <EsportsBand />

        <CommunityBand />

        {/* newsletter */}
        <section className="relative overflow-hidden border border-line bg-bg-nav p-7 lg:p-10">
          <div className="aura-accent pointer-events-none absolute inset-0" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-2">The weekly drop</p>
              <h2 className="h-display text-3xl sm:text-4xl">
                One email,
                <br />
                every Friday
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-secondary">
                New arrivals, verified deals, patch notes and esports results — the whole week in a single digest. No
                filler, no resale of your address, unsubscribe in one click.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Releases", "Deals", "Patch notes", "Esports results"].map((tag) => (
                  <span
                    key={tag}
                    className="border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="border border-line bg-bg-card/60 p-5">
              <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">Join the list</p>
              <p className="mb-4 mt-1 text-xs text-ink-muted">
                Weekly drop report: releases, verified deals, patch notes and esports results.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

