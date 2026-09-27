import type { Game } from "@/lib/types";
import { RAW_ROWS, CATALOGUE_SIZE } from "@/data/game-records";
import { GENRES, PLATFORMS, SUBGENRES, TOTAL_GENRE_LANES } from "@/data/taxonomy";
import { buildCatalogue } from "./build";

/**
 * The catalogue is expanded exactly once per server process. Because every
 * field is derived deterministically, the same records are produced in dev,
 * in production and in CI.
 *
 * To move this to a database, swap the two lines below for an async repository
 * read and keep the exported shape identical — nothing downstream changes.
 */
export const GAMES: Game[] = buildCatalogue(RAW_ROWS);

export const GAME_BY_SLUG: Map<string, Game> = new Map(GAMES.map((g) => [g.slug, g]));

export const ALL_GAME_SLUGS: string[] = GAMES.map((g) => g.slug);

export function getGame(slug: string): Game | undefined {
  return GAME_BY_SLUG.get(slug);
}

export function getGames(slugs: string[]): Game[] {
  return slugs.map((s) => GAME_BY_SLUG.get(s)).filter((g): g is Game => Boolean(g));
}

/** Live platform statistics. Every number here is derived from the data. */
export interface CatalogueStats {
  games: number;
  genres: number;
  subgenres: number;
  genreLanes: number;
  platforms: number;
  developers: number;
  publishers: number;
  freeGames: number;
  discountedGames: number;
  comingSoon: number;
  mediaItems: number;
  screenshots: number;
  videos: number;
  languages: number;
  averageRating: number;
  totalReviews: number;
  totalWishlists: number;
  totalDownloads: number;
}

export function computeStats(games: Game[] = GAMES): CatalogueStats {
  const developers = new Set<string>();
  const publishers = new Set<string>();
  const languages = new Set<string>();
  let screenshots = 0;
  let videos = 0;
  let ratingSum = 0;
  let reviews = 0;
  let wishlists = 0;
  let downloads = 0;
  let free = 0;
  let discounted = 0;
  let coming = 0;

  for (const g of games) {
    developers.add(g.developer);
    publishers.add(g.publisher);
    g.languages.forEach((l) => languages.add(l));
    screenshots += g.screenshots.length;
    videos += g.videos.length;
    ratingSum += g.rating;
    reviews += g.reviewCount;
    wishlists += g.wishlistCount;
    downloads += g.downloadCount;
    if (g.isFree) free += 1;
    if (g.discount > 0) discounted += 1;
    if (g.isComingSoon) coming += 1;
  }

  return {
    games: games.length,
    genres: GENRES.length,
    subgenres: SUBGENRES.length,
    genreLanes: TOTAL_GENRE_LANES,
    platforms: PLATFORMS.length,
    developers: developers.size,
    publishers: publishers.size,
    freeGames: free,
    discountedGames: discounted,
    comingSoon: coming,
    mediaItems: screenshots + videos,
    screenshots,
    videos,
    languages: languages.size,
    averageRating: games.length ? Math.round((ratingSum / games.length) * 100) / 100 : 0,
    totalReviews: reviews,
    totalWishlists: wishlists,
    totalDownloads: downloads,
  };
}

/** Authored row count, before expansion — used by the verification script. */
export const AUTHORED_ROWS = CATALOGUE_SIZE;
