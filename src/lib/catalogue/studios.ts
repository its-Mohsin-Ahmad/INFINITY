import type { Game } from "@/lib/types";
import { slugify } from "@/lib/generate";
import { GAMES } from "./index";

/* ===========================================================================
 * Studio index — grouped from the live catalogue exactly once per process.
 * Slugs follow the same rule as every other taxonomy surface
 * (`slugify(developer)`), so /studios/[slug] params can never drift from the
 * links rendered by the homepage, game pages and footer.
 * ======================================================================== */

export interface Studio {
  slug: string;
  name: string;
  /** The studio's most frequent publishing partner across its titles. */
  publisher: string;
  /** Sorted by rating, then popularity. */
  games: Game[];
  count: number;
  avgRating: number;
  topGame: Game;
  debutYear: string;
  /** Primary genre lanes, most frequent first (max 4). */
  genres: string[];
}

function buildStudios(): Studio[] {
  const bySlug = new Map<string, { name: string; games: Game[] }>();
  for (const game of GAMES) {
    const slug = slugify(game.developer);
    const entry = bySlug.get(slug) ?? { name: game.developer, games: [] };
    entry.games.push(game);
    bySlug.set(slug, entry);
  }

  const studios: Studio[] = [];
  for (const [slug, { name, games }] of bySlug) {
    const sorted = [...games].sort((a, b) => b.rating - a.rating || b.popularity - a.popularity);

    const publisherCount = new Map<string, number>();
    const genreCount = new Map<string, number>();
    for (const g of games) {
      publisherCount.set(g.publisher, (publisherCount.get(g.publisher) ?? 0) + 1);
      for (const genre of g.genre) genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
    }

    const publisher =
      [...publisherCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? name;
    const genres = [...genreCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([g]) => g);
    const avgRating = Math.round((games.reduce((s, g) => s + g.rating, 0) / games.length) * 10) / 10;
    const debutYear = games.map((g) => g.releaseDate.slice(0, 4)).sort()[0];

    studios.push({
      slug,
      name,
      publisher,
      games: sorted,
      count: games.length,
      avgRating,
      topGame: sorted[0],
      debutYear,
      genres,
    });
  }

  return studios.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const STUDIOS: Studio[] = buildStudios();
export const STUDIO_SLUGS: string[] = STUDIOS.map((s) => s.slug);
export const STUDIO_BY_SLUG: Map<string, Studio> = new Map(STUDIOS.map((s) => [s.slug, s]));

export function getStudio(slug: string): Studio | undefined {
  return STUDIO_BY_SLUG.get(slug);
}
