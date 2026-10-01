import type { Metadata } from "next";
import Link from "next/link";
import { GAMES, computeStats } from "@/lib/catalogue";
import { freeToPlayGames } from "@/lib/catalogue/query";
import { BrowseTabs } from "@/components/browse/browse-tabs";
import { GameGrid } from "@/components/game/GameGrid";
import { PageHero } from "@/components/ui/page-hero";
import { Countdown } from "@/components/ui/interactive";
import { Stat } from "@/components/ui/primitives";
import { discountedPrice } from "@/lib/generate";
import type { Game } from "@/lib/types";

/* ===========================================================================
 * /deals — the verified-discount surface.
 * ---------------------------------------------------------------------------
 * Prices, discounts and the final figure are all derived from the catalogue
 * at build time (`discountedPrice` is the same rule the cart quotes with).
 * ======================================================================== */

export const metadata: Metadata = {
  title: "Deals",
  description:
    "Every discounted title on INFINITY, grouped by depth of discount and final price — with the same pricing rule the cart uses.",
};

const deals: Game[] = GAMES.filter((g) => g.discount > 0 && !g.isComingSoon).sort(
  (a, b) => b.discount - a.discount || b.rating - a.rating,
);

const deepDeals = deals.filter((g) => g.discount >= 50);
const budgetDeals = deals
  .filter((g) => g.price > 0 && discountedPrice(g.price, g.discount) <= 20)
  .sort((a, b) => b.rating - a.rating);

function DealGrid({ games, note }: { games: Game[]; note: string }) {
  if (!games.length) {
    return <p className="text-sm text-ink-secondary">{note}</p>;
  }
  return <GameGrid games={games} columns={6} />;
}

export default function DealsPage() {
  const stats = computeStats();
  const avgDiscount = deals.length
    ? Math.round(deals.reduce((sum, g) => sum + g.discount, 0) / deals.length)
    : 0;
  const biggest = deals[0]?.discount ?? 0;
  const free = freeToPlayGames(12);

  const tabs = [
    {
      id: "all-deals",
      label: "Biggest discounts",
      badge: String(deals.length),
      content: <DealGrid games={deals.slice(0, 12)} note="No active discounts right now — check back after the next sale window." />,
    },
    {
      id: "50-off",
      label: "50% and up",
      badge: String(deepDeals.length),
      content: <DealGrid games={deepDeals.slice(0, 12)} note="No titles are above 50% this week." />,
    },
    {
      id: "under-20",
      label: "Under $20",
      badge: String(budgetDeals.length),
      content: <DealGrid games={budgetDeals.slice(0, 12)} note="Nothing lands under $20 at the current discount depth." />,
    },
    {
      id: "free",
      label: "Free to play",
      badge: String(stats.freeGames),
      content: <DealGrid games={free} note="The free lane is empty — that has never happened." />,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Season sale"
        title={
          <>
            Deals that survive
            <br />
            checkout
          </>
        }
        description="Every price on this page is re-read from the catalogue and re-quoted with the cart's own pricing rule — what you see here is what you pay, including member stacking on INFINITY Plus."
        tone="accent"
      >
        <div className="flex flex-wrap items-end gap-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={String(deals.length)} label="Titles on sale" />
            <Stat value={`${avgDiscount}%`} label="Average discount" />
            <Stat value={`${biggest}%`} label="Deepest cut" tone="accent" />
            <Stat value={String(stats.freeGames)} label="Free forever" />
          </div>
          <div className="border border-line bg-bg-card/60 px-5 py-4">
            <Countdown to="2026-12-31T23:59:59Z" label="Season sale ends in" />
          </div>
        </div>
      </PageHero>

      <div className="shell space-y-12 py-10">
        <section>
          <BrowseTabs tabs={tabs} />
        </section>

        <section className="relative overflow-hidden border border-line bg-bg-nav p-7 lg:p-10">
          <div className="aura-accent pointer-events-none absolute inset-0" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-2">How pricing works</p>
              <h2 className="h-display text-2xl sm:text-3xl">One rule, three places</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                The discount shown on each card comes from the same function the cart uses to quote your line
                item, and — on Node deployments — the server re-validates it before the order completes. Wishlist
                a title and INFINITY will tell you if its price moves before the sale closes.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/games"
                className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
              >
                All games
              </Link>
              <Link
                href="/store"
                className="rounded-control bg-accent px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
              >
                Open the store
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
