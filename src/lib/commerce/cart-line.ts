import { discountedPrice } from "@/lib/generate";
import type { Game } from "@/lib/types";

/* ===========================================================================
 * Cart pricing rules — the single source of truth
 * ---------------------------------------------------------------------------
 * This module is deliberately dependency-free (no catalogue import) so it can
 * run in three places:
 *   1. the `/api/cart/validate` route handler on a Node/server deployment;
 *   2. the browser, as the fallback when the API is not deployed (GitHub
 *      Pages is static-only and cannot host route handlers);
 *   3. any future checkout revalidation.
 *
 * The client never invents a price: it either asks the server, or — on a static
 * host — re-runs the exact same rule against the catalogue values that were
 * rendered into the page.
 * ======================================================================== */

export type PricedGame = Pick<
  Game,
  "slug" | "title" | "price" | "discount" | "isFree" | "isComingSoon" | "platforms"
>;

export type CartLineQuote =
  | { ok: true; unitPrice: number; discount: number }
  | { ok: false; status: number; message: string };

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * @param platformName Optional human label for error messages (server passes
 *        the resolved platform name; the browser only has the slug).
 */
export function quoteCartLine(
  game: PricedGame,
  platform: string | null,
  platformName?: string,
): CartLineQuote {
  if (game.isComingSoon) {
    return {
      ok: false,
      status: 409,
      message: `${game.title} is not on sale yet — wishlist it instead.`,
    };
  }

  if (platform && !(game.platforms as string[]).includes(platform)) {
    return {
      ok: false,
      status: 409,
      message: `${game.title} is not released on ${platformName ?? platform}.`,
    };
  }

  return {
    ok: true,
    unitPrice: game.isFree ? 0 : round2(discountedPrice(game.price, game.discount)),
    discount: game.isFree ? 0 : game.discount,
  };
}
