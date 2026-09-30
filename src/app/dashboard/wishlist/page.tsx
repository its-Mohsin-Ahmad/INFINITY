/* ===========================================================================
 * /dashboard/wishlist — saved titles, read from the persisted player store.
 * ---------------------------------------------------------------------------
 * The heart button on every card writes here, so this page is the payoff of the
 * wishlist action rather than a dead end.
 * ======================================================================== */

"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/lib/store/player-store";
import { getGames } from "@/lib/catalogue";
import { GameGrid } from "@/components/game/GameGrid";
import { EmptyState } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/page-hero";

export default function WishlistPage() {
  const wishlist = usePlayer((s) => s.wishlist);
  const clearWishlist = usePlayer((s) => s.clearWishlist);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Preserve the order the player saved them in rather than the catalogue order.
  const games = mounted
    ? getGames(wishlist).sort(
        (a, b) => wishlist.indexOf(a.slug) - wishlist.indexOf(b.slug),
      )
    : [];

  return (
    <>
      <PageHero
        eyebrow="Your library"
        title="Wishlist"
        description="Titles you have saved on this device. INFINITY re-reads every price in this list against the live catalogue so you can spot a drop before the sale closes."
        tone="accent"
      >
        {mounted && wishlist.length ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-secondary">
              {wishlist.length} saved
            </p>
            <button
              type="button"
              onClick={clearWishlist}
              className="flex min-h-[44px] items-center border border-line px-4 font-display text-2xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-accent hover:text-accent"
            >
              Clear wishlist
            </button>
          </div>
        ) : null}
      </PageHero>

      <div className="shell py-10">
        {!mounted || !games.length ? (
          <EmptyState
            title="Nothing saved yet"
            body="Tap the heart on any game card and it lands here, stored on this device only."
            ctaHref="/games"
            ctaLabel="Browse games"
          />
        ) : (
          <GameGrid games={games} columns={5} />
        )}
      </div>
    </>
  );
}