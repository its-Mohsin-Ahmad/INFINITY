import type { Game } from "@/lib/types";

/* ===========================================================================
 * Client-side search
 * ---------------------------------------------------------------------------
 * The static export has no API runtime, so `/search` and the header overlay
 * query a prebuilt JSON index (`public/search-index.json`, written by
 * `scripts/generate-search-index.mjs`) directly in the browser. The index is
 * fetched once per session and cached in module scope.
 * ======================================================================== */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const INDEX_URL = `${BASE}/search-index.json`;

/**
 * Heavy editorial fields the index deliberately omits. Hydration restores them
 * as empty values so a hit can be rendered by the shared card components —
 * nothing on a results page reads them.
 */
const HEAVY: Pick<
  Game,
  | "screenshots"
  | "videos"
  | "longDescription"
  | "systemRequirements"
  | "controls"
  | "howToPlay"
  | "languages"
  | "features"
  | "relatedGames"
  | "officialStoreLinks"
  | "availability"
> = {
  screenshots: [],
  videos: [],
  longDescription: "",
  systemRequirements: {} as Game["systemRequirements"],
  controls: [],
  howToPlay: [],
  languages: [],
  features: [],
  relatedGames: [],
  officialStoreLinks: [],
  availability: [],
};

/** One game as stored in the index — a `Game` without the heavy fields. */
export type SearchHit = Omit<Game, keyof typeof HEAVY>;

/** Popular searches shown in the overlay and on the results page (§8). */
export const POPULAR_SEARCHES = [
  "GTA VI",
  "Call of Duty",
  "Red Dead Redemption 2",
  "Assassin's Creed",
  "Cyberpunk 2077",
  "Elden Ring",
] as const;

let cache: SearchHit[] | null = null;
let inflight: Promise<SearchHit[]> | null = null;

/** Fetch the index once; later calls resolve from module-scope cache. */
export function loadSearchIndex(): Promise<SearchHit[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch(INDEX_URL, { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`search index responded ${res.status}`);
        return res.json() as Promise<SearchHit[]>;
      })
      .then((rows) => {
        cache = rows;
        inflight = null;
        return rows;
      })
      .catch((err) => {
        inflight = null;
        throw err;
      });
  }
  return inflight;
}

/** Restore a hit into a full `Game` so the shared card components can render it. */
export function hydrate(hit: SearchHit): Game {
  return { ...HEAVY, ...hit };
}

/**
 * Relevance scoring — the same ladder the server-side `searchGames()` uses:
 * exact title beats prefix beats substring, then studio, publisher, genre and
 * tag matches, with popularity as a light tie-breaker.
 */
export function scoreHits(q: string, hits: SearchHit[], limit = 500): SearchHit[] {
  const term = q.trim().toLowerCase();
  if (!term) return hits.slice(0, limit);
  return hits
    .map((hit) => {
      const title = hit.title.toLowerCase();
      let score = 0;
      if (title === term) score += 120;
      else if (title.startsWith(term)) score += 80;
      else if (title.includes(term)) score += 50;
      if (hit.developer.toLowerCase().includes(term)) score += 26;
      if (hit.publisher.toLowerCase().includes(term)) score += 18;
      if (hit.genre.some((g) => g.includes(term))) score += 22;
      if (hit.tags.some((t) => t.toLowerCase().includes(term))) score += 12;
      if (score > 0) score += Math.min(20, hit.popularity / 90_000);
      return { hit, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.hit.rating - a.hit.rating)
    .slice(0, limit)
    .map((entry) => entry.hit);
}

/** Sort keys shared with the catalogue UI; values match `SORT_OPTIONS`. */
export type SearchSortKey = "popular" | "newest" | "released" | "rating" | "az" | "price-asc" | "price-desc";

export function sortHits(hits: SearchHit[], key: SearchSortKey): SearchHit[] {
  const price = (h: SearchHit) => (h.isFree ? 0 : h.price);
  const sorted = [...hits];
  switch (key) {
    case "newest":
      return sorted.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || b.popularity - a.popularity);
    case "released":
      return sorted.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate) || b.popularity - a.popularity);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "price-asc":
      return sorted.sort((a, b) => price(a) - price(b) || b.rating - a.rating);
    case "price-desc":
      return sorted.sort((a, b) => price(b) - price(a) || b.rating - a.rating);
    case "popular":
    default:
      return sorted.sort((a, b) => b.popularity - a.popularity || b.rating - a.rating);
  }
}
