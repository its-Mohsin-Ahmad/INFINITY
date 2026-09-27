import type { Game, GameFilters, GameSortKey, Paginated } from "@/lib/types";
import { GAMES } from "./index";

/* ===========================================================================
 * Query layer
 * ---------------------------------------------------------------------------
 * Pure functions over an array of Games. Nothing here touches React, which is
 * what allows the same helpers to run during a server render, inside an API
 * route, and in the verification script.
 * ======================================================================== */

export function matchesFilters(game: Game, filters: GameFilters): boolean {
  if (filters.q) {
    const q = filters.q.trim().toLowerCase();
    if (q) {
      const haystack = [game.title, game.developer, game.publisher, ...game.genre, ...game.tags]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
  }
  if (filters.genre?.length && !filters.genre.some((g) => (game.genre as string[]).includes(g))) {
    return false;
  }
  if (filters.platform?.length && !filters.platform.some((p) => (game.platforms as string[]).includes(p))) {
    return false;
  }
  if (filters.developer?.length && !filters.developer.includes(game.developer)) return false;
  if (filters.publisher?.length && !filters.publisher.includes(game.publisher)) return false;
  if (filters.mode?.length && !filters.mode.some((m) => (game.gameModes as string[]).includes(m))) {
    return false;
  }
  if (filters.minRating !== undefined && game.rating < filters.minRating) return false;
  if (filters.maxPrice !== undefined && game.price > filters.maxPrice) return false;
  if (filters.freeOnly && !game.isFree) return false;
  if (filters.discountedOnly && game.discount <= 0) return false;
  if (filters.comingSoon !== undefined && game.isComingSoon !== filters.comingSoon) return false;
  if (filters.tag?.length) {
    const lower = game.tags.map((t) => t.toLowerCase());
    if (!filters.tag.some((t) => lower.includes(t.toLowerCase()))) return false;
  }
  if (filters.yearFrom || filters.yearTo) {
    const year = Number.parseInt(game.releaseDate.slice(0, 4), 10);
    if (filters.yearFrom && year < filters.yearFrom) return false;
    if (filters.yearTo && year > filters.yearTo) return false;
  }
  return true;
}

export function filterGames(pool: Game[] = GAMES, filters: GameFilters = {}): Game[] {
  return pool.filter((g) => matchesFilters(g, filters));
}

export function sortGames(pool: Game[], key: GameSortKey = "popular"): Game[] {
  const arr = [...pool];
  switch (key) {
    case "az":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
      return arr.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    case "released":
      return arr.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price || b.rating - a.rating);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price || b.rating - a.rating);
    case "popular":
    default:
      return arr.sort((a, b) => b.popularity - a.popularity);
  }
}

export function queryGames(
  filters: GameFilters = {},
  sort: GameSortKey = "popular",
  pool: Game[] = GAMES,
): Game[] {
  return sortGames(filterGames(pool, filters), sort);
}

export function paginate<T>(items: T[], page = 1, perPage = 24): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total,
    page: safePage,
    perPage,
    totalPages,
  };
}

/** Weighted search used by the search page, the navbar and the API. */
/* --------------------------------------------------------------- collections */

export function trendingGames(limit = 12): Game[] {
  return sortGames(GAMES.filter((g) => g.isTrending && !g.isComingSoon), "popular").slice(0, limit);
}

export function featuredGames(limit = 10): Game[] {
  return sortGames(GAMES.filter((g) => g.isFeatured), "popular").slice(0, limit);
}

export function newReleases(limit = 12): Game[] {
  return sortGames(GAMES.filter((g) => g.isNew), "newest").slice(0, limit);
}

export function comingSoonGames(limit = 12): Game[] {
  return sortGames(GAMES.filter((g) => g.isComingSoon), "newest").slice(0, limit);
}

export function freeToPlayGames(limit = 12): Game[] {
  return sortGames(GAMES.filter((g) => g.isFree), "popular").slice(0, limit);
}

export function topRated(limit = 12): Game[] {
  return sortGames(GAMES, "rating").slice(0, limit);
}

export function bestDeals(limit = 12, minDiscount = 40): Game[] {
  return [...GAMES]
    .filter((g) => g.discount >= minDiscount)
    .sort((a, b) => b.discount - a.discount || b.rating - a.rating)
    .slice(0, limit);
}

export function mostWishlisted(limit = 12): Game[] {
  return [...GAMES].sort((a, b) => b.wishlistCount - a.wishlistCount).slice(0, limit);
}

export function mostDownloaded(limit = 12): Game[] {
  return [...GAMES].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, limit);
}

export function byPlatform(platform: string, limit = 12, sort: GameSortKey = "popular"): Game[] {
  return queryGames({ platform: [platform] }, sort).slice(0, limit);
}

export function byGenre(genre: string, limit = 12, sort: GameSortKey = "popular"): Game[] {
  return queryGames({ genre: [genre] }, sort).slice(0, limit);
}

export function byTag(tag: string, limit = 12): Game[] {
  return queryGames({ tag: [tag] }, "popular").slice(0, limit);
}

export function byDeveloper(developer: string, limit = 12): Game[] {
  return queryGames({ developer: [developer] }, "rating").slice(0, limit);
}

export function similarTo(game: Game, limit = 6): Game[] {
  const related = game.relatedGames
    .map((slug) => GAMES.find((g) => g.slug === slug))
    .filter((g): g is Game => Boolean(g));
  if (related.length >= limit) return related.slice(0, limit);
  const merged = [...related];
  const filler = sortGames(
    GAMES.filter((g) => g.slug !== game.slug && g.genre.some((x) => game.genre.includes(x))),
    "rating",
  );
  for (const g of filler) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.slug === g.slug)) merged.push(g);
  }
  return merged.slice(0, limit);
}

/** Stable "editor's pick" rotation — seeded so server and client agree. */
export function editorsPicks(limit = 8, seed = "2026-09-26"): Game[] {
  const pool = GAMES.filter((g) => g.rating >= 8.6);
  const out: Game[] = [];
  const offset = seed.length * 31;
  for (let i = 0; out.length < limit && i < pool.length * 3; i++) {
    const candidate = pool[(i * 977 + offset) % pool.length];
    if (candidate && !out.some((g) => g.slug === candidate.slug)) out.push(candidate);
  }
  return out.length ? out : sortGames(GAMES, "rating").slice(0, limit);
}

/** Weighted search used by the search page, the navbar and the API. */
export function searchGames(q: string, limit = 10, pool: Game[] = GAMES): Game[] {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return pool
    .map((g) => {
      const title = g.title.toLowerCase();
      let score = 0;
      if (title === term) score += 120;
      if (title.startsWith(term)) score += 80;
      if (title.includes(term)) score += 50;
      if (g.developer.toLowerCase().includes(term)) score += 26;
      if (g.publisher.toLowerCase().includes(term)) score += 18;
      if (g.genre.some((x) => x.includes(term))) score += 22;
      if (g.tags.some((t) => t.toLowerCase().includes(term))) score += 12;
      if (score > 0) score += Math.min(20, g.popularity / 90_000);
      return { game: g, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.game.rating - a.game.rating)
    .slice(0, limit)
    .map((s) => s.game);
}

/* ------------------------------------------------------------------- facets */

export function facetCounts(
  key: "genre" | "platform" | "developer" | "publisher",
  pool: Game[] = GAMES,
): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const g of pool) {
    const values =
      key === "genre"
        ? g.genre
        : key === "platform"
          ? g.platforms
          : key === "developer"
            ? [g.developer]
            : [g.publisher];
    for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function tagCounts(pool: Game[] = GAMES, limit = 60): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const g of pool) for (const t of g.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Distributions used by the admin analytics charts. */
export function genreDistribution(pool: Game[] = GAMES, limit = 12): { label: string; value: number }[] {
  return facetCounts("genre", pool)
    .slice(0, limit)
    .map((f) => ({ label: f.value, value: f.count }));
}

export function platformDistribution(pool: Game[] = GAMES): { label: string; value: number }[] {
  return facetCounts("platform", pool).map((f) => ({ label: f.value, value: f.count }));
}

export function releaseTrend(pool: Game[] = GAMES): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const g of pool) {
    const year = g.releaseDate.slice(0, 4);
    map.set(year, (map.get(year) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-14);
}

export function priceBuckets(pool: Game[] = GAMES): { label: string; value: number }[] {
  const buckets: { label: string; test: (p: number) => boolean }[] = [
    { label: "Free", test: (p) => p === 0 },
    { label: "Under $20", test: (p) => p > 0 && p < 20 },
    { label: "$20 - $40", test: (p) => p >= 20 && p < 40 },
    { label: "$40 - $60", test: (p) => p >= 40 && p < 60 },
    { label: "$60+", test: (p) => p >= 60 },
  ];
  return buckets.map((b) => ({ label: b.label, value: pool.filter((g) => b.test(g.price)).length }));
}

/** Rating distribution, bucketed for the analytics donut. */
export function ratingDistribution(pool: Game[] = GAMES): { label: string; value: number }[] {
  const buckets: { label: string; test: (r: number) => boolean }[] = [
    { label: "9.0+", test: (r) => r >= 9 },
    { label: "8.0 - 8.9", test: (r) => r >= 8 && r < 9 },
    { label: "7.0 - 7.9", test: (r) => r >= 7 && r < 8 },
    { label: "Below 7.0", test: (r) => r < 7 },
  ];
  return buckets.map((b) => ({ label: b.label, value: pool.filter((g) => b.test(g.rating)).length }));
}

/** Top developers by catalogue size — powers the Studios page and admin views. */
export function topDevelopers(limit = 24): { name: string; count: number; avgRating: number }[] {
  const map = new Map<string, { count: number; total: number }>();
  for (const g of GAMES) {
    const entry = map.get(g.developer) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += g.rating;
    map.set(g.developer, entry);
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, count: v.count, avgRating: Math.round((v.total / v.count) * 10) / 10 }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating)
    .slice(0, limit);
}

/** Top publishers by catalogue size. */
export function topPublishers(limit = 24): { name: string; count: number; avgRating: number }[] {
  const map = new Map<string, { count: number; total: number }>();
  for (const g of GAMES) {
    const entry = map.get(g.publisher) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += g.rating;
    map.set(g.publisher, entry);
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, count: v.count, avgRating: Math.round((v.total / v.count) * 10) / 10 }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating)
    .slice(0, limit);
}

