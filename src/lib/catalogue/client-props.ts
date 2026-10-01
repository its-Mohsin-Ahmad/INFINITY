import type { Game } from "@/lib/types";

/* ===========================================================================
 * Client-island projections
 * ---------------------------------------------------------------------------
 * Client components declare narrow prop types (`Pick<Game, "slug" | "title">`),
 * but React's RSC payload serialises the object that is ACTUALLY passed — not
 * the declared type. Handing a whole `Game` to a small island therefore ships
 * `screenshots`, `videos`, `longDescription` and every other field into the
 * HTML for every card on the page.
 *
 * On a game detail page that happened ~13 times per game, which made ~76% of
 * the document RSC payload and a 670KB page — brutal on a phone and large
 * enough to time out the static deploy push. These helpers pass only the
 * fields each island actually reads.
 * ======================================================================== */

/** Fields `WishlistButton` / `CompareButton` read. */
export function wishlistGame(game: Game) {
  return { slug: game.slug, title: game.title };
}

/** Fields `AddToCartButton` reads (price block + platform list). */
export function cartGame(game: Game) {
  return {
    slug: game.slug,
    title: game.title,
    price: game.price,
    discount: game.discount,
    isFree: game.isFree,
    isComingSoon: game.isComingSoon,
    platforms: game.platforms,
  };
}

/** Fields `TrailerButton` / the trailer modal read. */
export function trailerGame(game: Game) {
  return {
    slug: game.slug,
    title: game.title,
    genre: game.genre,
    accentHue: game.accentHue,
    rating: game.rating,
    coverImage: game.coverImage,
    heroImage: game.heroImage,
    headerImage: game.headerImage,
    publisher: game.publisher,
  };
}