/**
 * Build `public/search-index.json` — the trimmed catalogue that powers the
 * client-side search overlay and the /search results page.
 *
 * The static export has no server runtime, so search cannot hit an API route.
 * Instead this script flattens every game into a lean hit record (no videos,
 * screenshots, prose or system-requirement blocks) and the browser fetches the
 * JSON on demand. ~540 games land in a few hundred kilobytes, loaded only when
 * someone actually searches — the homepage never pays for it.
 *
 * Runs automatically before `next build` (both targets) and on `npm run dev`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { register } from "node:module";

register("./ts-alias-loader.mjs", import.meta.url);

const { GAMES } = await import("../src/lib/catalogue/index.ts");

/**
 * Fields the results page and the suggestion dropdown never render. Dropping
 * them keeps the index small; `src/lib/search-index.ts` restores empty
 * defaults when a hit is hydrated back into a full `Game` for the card grid.
 */
const DROP = new Set([
  "screenshots",
  "videos",
  "longDescription",
  "systemRequirements",
  "controls",
  "howToPlay",
  "languages",
  "features",
  "relatedGames",
  "officialStoreLinks",
  "availability",
]);

const index = GAMES.map((game) => {
  const hit = {};
  for (const [key, value] of Object.entries(game)) {
    if (!DROP.has(key)) hit[key] = value;
  }
  return hit;
});

const outPath = path.join(process.cwd(), "public", "search-index.json");
mkdirSync(path.dirname(outPath), { recursive: true });
const payload = JSON.stringify(index);
writeFileSync(outPath, payload);

console.log(
  `[infinity] search index: ${index.length} games -> public/search-index.json (${Math.round(payload.length / 1024)} KB)`,
);
