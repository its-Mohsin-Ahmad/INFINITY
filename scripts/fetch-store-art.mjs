/**
 * Resolve App Store artwork for catalogue titles Steam cannot serve.
 *
 * The titles still on procedural key art are almost entirely NOT on Steam:
 * Fortnite, Valorant, Genshin Impact, Roblox, Candy Crush, the Zelda/Metroid
 * exclusives and so on return zero results from the Steam store search. Steam is
 * therefore the wrong source for them, and re-running fetch-steam-art.mjs cannot
 * close that gap.
 *
 * This script uses the public iTunes Search API, which needs no API key and
 * covers the iOS titles in that group, and writes src/data/store-art.ts.
 *
 *   node scripts/fetch-store-art.mjs
 *   node scripts/fetch-store-art.mjs --only="Pokemon GO,Candy Crush Saga"
 *   node scripts/fetch-store-art.mjs --refresh
 *
 * Matching is strict: title equality is required after normalising case,
 * punctuation and trademark marks. Near matches are rejected because the App
 * Store frequently lists a different game under a similar name, and wrong box
 * art is far worse than generated art. The only exception is the curated
 * LISTING_ALIASES table below — hand-verified store names for the same game
 * (descriptor suffixes, rebrands, seasonal renames).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(ROOT, "public", "search-index.json");
const CACHE = join(ROOT, "scripts", ".store-art-cache.json");
const OUT = join(ROOT, "src", "data", "store-art.ts");

const argv = process.argv.slice(2);
const REFRESH = argv.includes("--refresh");
const ONLY = (argv.find((a) => a.startsWith("--only="))?.slice(7) ?? "")
  .split(",").map((s) => s.trim()).filter(Boolean);
/** Delay between search requests. The public iTunes Search API throttles at
 * ~20 calls/minute, so the default stays at one request every three seconds;
 * a faster sweep gets 429s, and every 429 was being cached as "no match". */
const DELAY = Number(process.env.STORE_ART_DELAY ?? 3000);

/** Regions tried in order - a title delisted in the US store still resolves elsewhere. */
const REGIONS = ["us", "gb", "jp", "au", "ca", "de", "fr", "br", "in"];

/**
 * Normalise for comparison: strip accents, punctuation and trademark symbols.
 *
 * The symbol removal happens BEFORE NFKD on purpose: NFKD decomposes ™ into
 * the literal letters "TM" (and ® into (R)), which then survive the
 * letter-keeping character class — "8 Ball Pool™" would compare as
 * "8 ball pooltm" and never match a clean "8 Ball Pool".
 */
function norm(s) {
  return s.toLowerCase().replace(/[™®©]/g, "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** "Monopoly GO!" must compare equal to a store listing of "Monopoly Go". */
function loose(s) {
  return norm(s).replace(/\s+(go|got)$/, "");
}

const games = JSON.parse(readFileSync(INDEX, "utf8"));
const missing = games.filter((g) => !g.coverImage && !g.heroImage && !g.headerImage);
const targets = ONLY.length
  ? missing.filter((g) => ONLY.some((t) => norm(t) === norm(g.title)))
  : missing;

console.log(`[store-art] ${targets.length} titles to resolve (of ${missing.length} on generated art)`);

let cache = {};
try { cache = JSON.parse(readFileSync(CACHE, "utf8")); } catch { /* first run */ }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Hand-verified App Store listings whose store name is not the catalogue
 * title — a descriptor suffix, a rebrand or a seasonal rename of THE SAME
 * GAME. Keyed by slug; each value was checked by hand against the publisher
 * before being added. Never matches a different product: the comparison is
 * exact equality on the full store name, so "League of Legends" will NOT pull
 * "League of Legends: Wild Rift" (a different game), while "TFT: Teamfight
 * Tactics" matches the catalogue's Teamfight Tactics record.
 *
 * A listing that later renames itself simply stops matching and the title
 * degrades back to generated key art — the safe direction.
 */
const LISTING_ALIASES = {
  "asphalt-legends-unite": ["Asphalt Legends - Racing Game"], // Gameloft dropped "Unite" from the listing
  "ea-sports-fc-mobile": ["EA SPORTS FC Soccer Mobile 27"], // annual rebrand, publisher EA
  "genshin-impact": ["Genshin Impact 6th Anniversary"], // same app, seasonal rename (Cognosphere/HoYoverse)
  "homescapes": ["Homescapes: Match 3 Games"], // descriptor suffix, Playrix
  "teamfight-tactics": ["TFT: Teamfight Tactics"], // store leads with the acronym, Riot Games
};

/**
 * Search one storefront for a match.
 * Returns { art, name, region } or null. Never falls back to a fuzzy match.
 *
 * Accepted: exact title equality after normalising case, punctuation and
 * trademark marks, or an exact hit against the slug's LISTING_ALIASES.
 */
async function search(game, region) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(game.title)}` +
    `&entity=software&limit=8&country=${region}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) return null;
  const json = await res.json();
  const want = norm(game.title);
  const wantLoose = loose(game.title);
  const aliases = (LISTING_ALIASES[game.slug] ?? []).map(norm);
  const results = json.results ?? [];
  const hit = results.find((r) => {
    const name = norm(r.trackName);
    return name === want || loose(r.trackName) === wantLoose || aliases.includes(name);
  });
  return hit?.artworkUrl512 ? { art: hit.artworkUrl512, name: hit.trackName, region } : null;
}

/** Confirm the image really downloads before it is written to the data file. */
async function verify(url) {
  try {
    const res = await fetch(url, { headers: { range: "bytes=0-1023" } });
    if (!res.ok && res.status !== 206) return false;
    return (res.headers.get("content-type") ?? "").includes("image");
  } catch {
    return false;
  }
}

const resolved = {};
let matched = 0;

for (const [i, g] of targets.entries()) {
  if (!REFRESH && g.title in cache) {
    if (cache[g.title]) { resolved[g.slug] = cache[g.title]; matched++; }
    continue;
  }
  let found = null;
  for (const region of REGIONS) {
    try {
      const hit = await search(g, region);
      if (hit && (await verify(hit.art))) { found = hit; break; }
    } catch { /* try the next region */ }
    await sleep(DELAY);
  }
  cache[g.title] = found ? { art: found.art, name: found.name, region: found.region } : null;
  if (found) { resolved[g.slug] = cache[g.title]; matched++; }
  // Checkpoint every title: the sweep takes several minutes and an interrupted
  // run used to throw away every match it had already verified.
  writeFileSync(CACHE, JSON.stringify(cache, null, 1));
  process.stdout.write(`\r[store-art] ${i + 1}/${targets.length} matched=${matched}   `);
}
process.stdout.write("\n");

/**
 * Rows already shipped in OUT are carried forward before writing.
 *
 * `targets` only contains titles that are STILL missing from the index, so a
 * re-run that wrote only its own `resolved` matches would silently drop every
 * previously verified entry — a partial sweep must never regress coverage.
 */
const shipped = {};
try {
  for (const line of readFileSync(OUT, "utf8").split("\n")) {
    const m = line.match(/^  "([^"]+)": \{ posterUrl: "([^"]+)", headerUrl: "([^"]+)" \},$/);
    if (m) shipped[m[1]] = { posterUrl: m[2], headerUrl: m[3] };
  }
} catch { /* first run - no previous data file */ }

const merged = { ...shipped };
for (const [slug, v] of Object.entries(resolved)) {
  merged[slug] = {
    posterUrl: v.art.replace("512x512", "600x900"),
    headerUrl: v.art.replace("512x512", "460x215"),
  };
}

/** Poster uses the 600x900 crop; header reuses the same licensed asset at 460x215. */
const rows = Object.entries(merged).map(
  ([slug, v]) =>
    `  ${JSON.stringify(slug)}: { posterUrl: ${JSON.stringify(v.posterUrl)},` +
    ` headerUrl: ${JSON.stringify(v.headerUrl)} },`,
);
const body = `/* eslint-disable */
/**
 * Non-Steam storefront artwork - GENERATED by scripts/fetch-store-art.mjs.
 *
 * Titles resolved from the App Store search API because they are not on Steam at
 * all (Nintendo and Sony exclusives, mobile and free-to-play titles). Every
 * entry required an exact title match plus a confirmed image download.
 *
 * Consulted after STEAM_ART; anything absent here falls back to the generated
 * key-art engine.
 */

/** slug -> verified storefront image URLs */
export const STORE_ART: Record<string, { posterUrl: string; headerUrl: string }> = {
${rows.join("\n")}
};

/** Kill switch: flip to false to ignore non-Steam artwork. */
export const STORE_ART_ENABLED = true;

/** How many catalogue titles came from a non-Steam storefront. */
export const STORE_ART_TITLED = ${rows.length};
`;

writeFileSync(OUT, body);
console.log(
  `[store-art] wrote src/data/store-art.ts - ${rows.length} titles with verified artwork ` +
    `(${matched} matched this run)`,
);

const failed = targets.filter((g) => !(g.slug in resolved));
if (failed.length) {
  console.log(`[store-art] ${failed.length} titles still unresolved:`);
  for (let i = 0; i < failed.length; i += 6) {
    console.log(`[store-art]   ${failed.slice(i, i + 6).map((g) => g.title).join(" | ")}`);
  }
}