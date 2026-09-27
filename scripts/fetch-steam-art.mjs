/**
 * Resolve real storefront artwork for every catalogue title.
 *
 * The catalogue is authored as pipe-delimited rows (see src/data/records/*.ts)
 * and carries no storefront ids, so this script maps title -> Steam app id via
 * the public store search endpoint, then verifies which image assets actually
 * exist for that app. Results are written to src/data/steam-art.ts, which the
 * catalogue build reads to fill coverImage / heroImage / headerImage.
 *
 *   node scripts/fetch-steam-art.mjs            # only unresolved titles
 *   node scripts/fetch-steam-art.mjs --refresh  # ignore the cache
 *   node scripts/fetch-steam-art.mjs --limit=20 # sample run
 *   node scripts/fetch-steam-art.mjs --fuzzy    # allow >=0.92 similarity
 *
 * Matching is deliberately strict: a wrong cover is worse than no cover, since
 * the UI falls back to the generated key art whenever an image is missing.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_PATH = join(ROOT, "scripts", ".steam-art-cache.json");
const OUT_PATH = join(ROOT, "src", "data", "steam-art.ts");

const args = new Set(process.argv.slice(2));
const REFRESH = args.has("--refresh");
const FUZZY = args.has("--fuzzy");
/** Re-resolve titles that are cached as "no art" (used after a throttled run). */
const RETRY_MISSING = args.has("--retry-missing");
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? NaN);
const CONCURRENCY = Number(process.env.ART_CONCURRENCY ?? 5);
const DELAY = Number(process.env.ART_DELAY ?? 120);

/* -------------------------------------------------------------- source data */

/** Mirrors slugify() in src/lib/generate.ts. */
function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();
}

/** Pulled from build.ts so generated slugs always match the catalogue. */
function readSlugOverrides() {
  const src = readFileSync(join(ROOT, "src", "lib", "catalogue", "build.ts"), "utf8");
  const body = src.match(/SLUG_OVERRIDES[^=]*=\s*\{([\s\S]*?)\n\};/);
  const out = {};
  if (!body) return out;
  for (const line of body[1].split("\n")) {
    const m = line.match(/^\s*"(.*)":\s*"(.*)",?\s*$/);
    if (m) out[m[1].replace(/\\"/g, '"')] = m[2];
  }
  return out;
}

/** First pipe field of every authored row, in catalogue order. */
function readTitles() {
  const dir = join(ROOT, "src", "data", "records");
  const titles = [];
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .sort()) {
    const src = readFileSync(join(dir, file), "utf8");
    const body = src.match(/BLOCK = `([\s\S]*?)`;/);
    if (!body) continue;
    for (const line of body[1].split("\n")) {
      const row = line.trim();
      if (!row || row.split("|").length < 8) continue;
      titles.push(row.split("|")[0]);
    }
  }
  return [...new Set(titles)];
}

/* ------------------------------------------------------------------ network */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Trademark glyphs are stripped *before* NFKD on purpose: NFKD expands
 * "™" to "TM" and "®" to "RB", which would turn "Street Fighter™ 6" into
 * "streetfightertm6" and make an exact match against the catalogue title
 * impossible. Steam uses these glyphs on a large share of its box art.
 */
const TRADEMARKS = /[\u2122\u00ae\u00a9\u2117\u2120]/g;

function normalize(value) {
  return value
    .replace(TRADEMARKS, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Steam re-releases marquee titles under edition names, so an exact title match
 * misses games that are plainly on the store ("Age of Empires IV: Anniversary
 * Edition", "Sea of Thieves: 2026 Edition"). These suffixes are safe to accept;
 * anything else is a different product and stays refused, which is what keeps
 * "Minecraft" from resolving to "Minecraft Dungeons".
 */
const EDITION_WORDS = new Set([
  "anniversary", "complete", "enhanced", "remastered", "reloaded", "definitive",
  "deluxe", "collector", "legendary", "gold", "platinum", "trilogy", "collection",
  "extended", "goty", "gameoftheyear", "ultimate", "bundler", "definitiveedition",
]);

function isEditionSuffix(remainder) {
  const r = remainder.replace(/edition$/, "");
  if (!r) return true;
  if (/^\d{4}$/.test(r)) return true;
  return EDITION_WORDS.has(r);
}

/** 0..1 similarity, used only when --fuzzy is opted into. */
function similarity(a, b) {
  if (a === b) return 1;
  if (a.length < 6 || b.length < 6) return 0;
  const rows = Array.from({ length: b.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return 1 - rows[a.length][b.length] / Math.max(a.length, b.length);
}

/**
 * Shared cooldown so a 429 from one worker pauses every worker. The store
 * throttles bursts rather than banning, so a short shared pause is enough.
 */
let cooldownUntil = 0;

async function waitForCooldown() {
  const wait = cooldownUntil - Date.now();
  if (wait > 0) await sleep(wait);
}

/**
 * The store answers ~200 requests in a burst and then starts refusing, so the
 * resolver keeps a minimum gap between *every* request rather than per title.
 * `ART_PACE` (ms) tunes it; 0 disables pacing.
 */
const PACE = Number(process.env.ART_PACE ?? 700);
let lastRequestAt = 0;

async function pace() {
  if (!PACE) return;
  const gap = PACE - (Date.now() - lastRequestAt);
  if (gap > 0) await sleep(gap);
  lastRequestAt = Date.now();
}

async function fetchWithRetry(url, { json = false, text = false, tries = 3 } = {}) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    await waitForCooldown();
    await pace();
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20000),
        headers: {
          // Steam throttles unknown clients hard; a browser signature keeps
          // the resolver inside the same rate limit the store itself uses.
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
        },
      });
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after")) || 0;
        const waitMs = Math.max(retryAfter * 1000, 20_000 * attempt);
        cooldownUntil = Date.now() + waitMs;
        continue;
      }
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) return { ok: false, status: res.status };
      if (json) return { ok: true, status: res.status, body: await res.json() };
      if (text) return { ok: true, status: res.status, body: await res.text() };
      return { ok: true, status: res.status, body: null };
    } catch {
      if (attempt === tries) return { ok: false, status: 0 };
      await sleep(800 * attempt);
    }
  }
  return { ok: false, status: 429 };
}

/**
 * Two sources, because each misses titles the other finds: the store
 * front-end search (knows delisted + very recent apps) and the legacy JSON
 * endpoint (knows soundtracks and DLC). Results are only accepted on an exact
 * normalized name match unless --fuzzy is passed.
 */
const STORE_SEARCH = (term, start = 0) =>
  `https://store.steampowered.com/search/results/?query&term=${encodeURIComponent(term)}` +
  `&start=${start}&count=50&infinite=1&cc=US&l=english`;
const JSON_SEARCH = (term) =>
  `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=US`;
/**
 * The full store search page. It uses the same result markup as the JSON
 * endpoint (so the same parser applies) but is rate limited separately, which
 * makes it the most reliable source when the JSON endpoint starts refusing.
 */
const HTML_SEARCH = (term) => `https://store.steampowered.com/search/?term=${encodeURIComponent(term)}&ndl=1`;

const ENTITIES = [
  ["&amp;", "&"],
  ["&quot;", '"'],
  ["&#039;", "'"],
  ["&rsquo;", "\u2019"],
  ["&apos;", "'"],
];

function decodeEntities(value) {
  let out = value;
  for (const [from, to] of ENTITIES) out = out.split(from).join(to);
  return out.replace(/\s+/g, " ").trim();
}

/** Pull (appid, name) pairs out of the store search HTML fragment. */
function parseSearchResults(html) {
  const out = [];
  const re = /data-ds-appid="(\d+)"[\s\S]*?<span class="title">([^<]*)<\/span>/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    out.push({ id: Number(match[1]), name: decodeEntities(match[2]) });
  }
  return out;
}
const POSTER = (id) => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`;
const HERO = (id) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_hero.jpg`;
const HEADER = (id) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`;

/** true / false, or "throttled" when the store rate limited the HEAD check. */
async function assetExists(url) {
  const res = await fetchWithRetry(url);
  if (res.status === 429) return "throttled";
  return res.ok && res.status === 200;
}

/**
 * title -> verified app id plus the asset set that actually resolves.
 * Returns `{ deferred: true }` when the store rate limited us, so the caller
 * can leave the title for a later run instead of recording a false "no art".
 */
async function resolveTitle(title) {
  const terms = [title.trim()];
  const withoutEdition = title.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (withoutEdition !== title.trim()) terms.push(withoutEdition);

  const target = normalize(title);
  const exact = (items) => items.find((c) => normalize(c.name) === target);
  /**
   * Accept a re-release whose name is the target plus an edition suffix, and take
   * the *shortest* one so "Dying Light 2 Stay Human" prefers the plain build over
   * "... : Gunslinger Bundle" if the store ever lists both.
   */
  const byEdition = (items) =>
    items
      .filter((c) => {
        const n = normalize(c.name);
        return n.length > target.length && n.startsWith(target) && isEditionSuffix(n.slice(target.length));
      })
      .sort((a, b) => normalize(a.name).length - normalize(b.name).length)[0];
  const found = (items) => exact(items) ?? byEdition(items);
  const candidates = [];

  for (const term of terms) {
    // 1) the full search page - deepest result set, separate rate-limit budget.
    const htmlRes = await fetchWithRetry(HTML_SEARCH(term), { text: true });
    if (htmlRes.status === 429) return { deferred: true };
    if (htmlRes.ok) {
      candidates.push(...parseSearchResults(htmlRes.body ?? ""));
      if (found(candidates)) break;
    }

    // 2) the JSON search fragment, which pages further into the long tail.
    for (const start of [0, 50, 100]) {
      const res = await fetchWithRetry(STORE_SEARCH(term, start), { json: true });
      if (res.status === 429) return { deferred: true };
      const html = res.ok && typeof res.body?.results_html === "string" ? res.body.results_html : "";
      const items = parseSearchResults(html);
      candidates.push(...items);
      if (found(candidates) || items.length < 50) break;
      if (res.status === 0) break; // network trouble: stop paging
    }
    if (found(candidates)) break;

    // Second opinion from the legacy JSON endpoint.
    const res = await fetchWithRetry(JSON_SEARCH(term), { json: true });
    if (res.status === 429) return { deferred: true };
    if (res.ok && Array.isArray(res.body?.items)) {
      candidates.push(
        ...res.body.items.map((i) => ({ id: Number(i.id), name: decodeEntities(i.name ?? "") })),
      );
    }
    if (found(candidates)) break;
  }

  let hit = found(candidates);
  if (!hit && FUZZY) {
    hit = candidates
      .map((c) => ({ c, score: similarity(target, normalize(c.name)) }))
      .filter((x) => x.score >= 0.92)
      .sort((a, b) => b.score - a.score)[0]?.c;
  }
  if (!hit?.id) return null;

  const id = Number(hit.id);
  const checks = await Promise.all([assetExists(POSTER(id)), assetExists(HERO(id)), assetExists(HEADER(id))]);
  if (checks.includes("throttled")) return { deferred: true };
  const [poster, hero, header] = checks;
  if (!poster && !hero && !header) return null;
  return { id, poster, hero, header, matched: hit.name ?? "" };
}

async function pool(items, worker, size = CONCURRENCY) {
  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index], index);
      }
    }),
  );
  return results;
}


/* --------------------------------------------------------------------- main */

const overrides = readSlugOverrides();
const slugFor = (title) => overrides[title] ?? slugify(title);

let titles = readTitles();
if (Number.isFinite(LIMIT)) titles = titles.slice(0, LIMIT);
console.log(`[art] ${titles.length} unique titles in the catalogue`);

let cache = {};
if (existsSync(CACHE_PATH) && !REFRESH) {
  try {
    cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } catch {
    cache = {};
  }
}
const todo = titles.filter((t) => !(t in cache) || (RETRY_MISSING && !cache[t]));
console.log(
  `[art] ${titles.length - todo.length} already known, ${todo.length} to resolve` +
    `${REFRESH ? " (--refresh)" : RETRY_MISSING ? " (--retry-missing)" : ""} @ concurrency ${CONCURRENCY}`,
);

let done = 0;
let hits = 0;
let deferred = 0;
await pool(todo, async (title) => {
  const previous = cache[title];
  const entry = await resolveTitle(title);
  if (entry?.deferred) {
    // Rate limited: leave the title uncached so a later run retries it.
    deferred++;
    done++;
    return;
  }
  // Never downgrade a resolved title to "no art" on a transient failure.
  cache[title] = entry ?? (RETRY_MISSING && previous ? previous : null);
  if (cache[title]) hits++;
  done++;
  if (done % 10 === 0 || done === todo.length) {
    console.log(
      `[art] ${done}/${todo.length} resolved (${hits} matched${deferred ? `, ${deferred} deferred` : ""})`,
    );
    // Checkpoint so a throttled or interrupted run never loses its work.
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
  }
  await sleep(DELAY);
});

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));

const seen = new Set();
const rows = titles
  .filter((t) => cache[t])
  .map((t) => ({ slug: slugFor(t), ...cache[t] }))
  .filter((r) => (seen.has(r.slug) ? false : seen.add(r.slug)))
  .sort((a, b) => a.slug.localeCompare(b.slug));

const body = rows
  .map(
    (r) =>
      `  ${JSON.stringify(r.slug)}: { id: ${r.id}, poster: ${r.poster}, hero: ${r.hero}, header: ${r.header} },`,
  )
  .join("\n");


const out = `/* eslint-disable */
/**
 * Storefront artwork index - GENERATED, do not edit by hand.
 *
 * Produced by \`node scripts/fetch-steam-art.mjs\` (npm run fetch:art).
 * Maps a catalogue slug to the app id whose box art, hero art and header were
 * verified to resolve, so the UI can show real photography and fall back to the
 * generated key-art engine for titles that have none.
 *
 * Set STEAM_ART_ENABLED to false to fall back to generated art site-wide.
 */

export interface SteamArtEntry {
  id: number;
  poster: boolean;
  hero: boolean;
  header: boolean;
}

/** slug -> verified app id and available asset set */
export const STEAM_ART: Record<string, SteamArtEntry> = {
${body}
};

/** Kill switch: flip to false to render generated art everywhere again. */
export const STEAM_ART_ENABLED = true;

/** How many catalogue titles have storefront art. */
export const STEAM_ART_TITLED = ${rows.length};

const posterUrl = (id: number) =>
  \`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/\${id}/library_600x900.jpg\`;
const heroUrl = (id: number) => \`https://cdn.cloudflare.steamstatic.com/steam/apps/\${id}/library_hero.jpg\`;
const headerUrl = (id: number) => \`https://cdn.cloudflare.steamstatic.com/steam/apps/\${id}/header.jpg\`;

export interface SteamArtUrls {
  /** 2:3 vertical box art - game cards. */
  poster: string | null;
  /** Ultra-wide banner - hero reel and detail pages. */
  hero: string | null;
  /** 460x215 landscape - list rows, rails and tiles. */
  header: string | null;
}

/** Resolved artwork for a slug, or null when the title has none. */
export function steamArtFor(slug: string): SteamArtUrls | null {
  if (!STEAM_ART_ENABLED) return null;
  const entry = STEAM_ART[slug];
  if (!entry) return null;
  return {
    poster: entry.poster ? posterUrl(entry.id) : null,
    hero: entry.hero ? heroUrl(entry.id) : null,
    header: entry.header ? headerUrl(entry.id) : null,
  };
}
`;

writeFileSync(OUT_PATH, out);

console.log(
  `[art] wrote src/data/steam-art.ts - ${rows.length}/${titles.length} titles matched ` +
    `(${rows.filter((r) => r.poster).length} poster, ${rows.filter((r) => r.hero).length} hero, ` +
    `${rows.filter((r) => r.header).length} header)`,
);

const unresolved = titles.filter((t) => !(t in cache));
const unmatched = titles.filter((t) => t in cache && !cache[t]);
if (deferred) {
  console.log(
    `[art] ${deferred} titles were rate limited and stay unresolved - re-run ` +
      `"npm run fetch:art -- --retry-missing" later to fill them.`,
  );
}
if (unresolved.length) {
  console.log(`[art] ${unresolved.length} titles still queued (not attempted).`);
}
if (unmatched.length) {
  console.log(`[art] ${unmatched.length} titles have no storefront art and keep generated art:`);
  for (let i = 0; i < unmatched.length; i += 8) {
    console.log(`[art]   ${unmatched.slice(i, i + 8).join(" | ")}`);
  }
}

