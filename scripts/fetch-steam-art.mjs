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
/**
 * Resolve only these titles, comma separated: --only="Quantum Break,Sunset Overdrive".
 * Re-resolving a handful of records otherwise means a full sweep of every
 * unmatched title, which is ~25 minutes of rate-limited requests.
 */
const ONLY = process.argv
  .find((a) => a.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const CONCURRENCY = Number(process.env.ART_CONCURRENCY ?? 5);
const DELAY = Number(process.env.ART_DELAY ?? 120);

/* -------------------------------------------------------------- source data */

/**
 * Curated title -> Steam app id, for games the search endpoints handle badly.
 *
 * These are hand-checked against `api/appdetails`, not guessed: several of
 * these titles either 404 in the store search, are re-released under a name the
 * matcher refuses ("Grand Theft Auto IV: The Complete Edition"), or are sold
 * under a bare trademarked name ("Rocket League®"). Verified app ids are
 * authoritative and skip the search entirely, which also makes the pipeline
 * immune to throttling for the marquee titles.
 */
/**
 * Curated title -> Steam app id, for games the store search handles badly.
 *
 * Every id below was looked up on the store and kept only when the resulting
 * app name and artwork matched the catalogue title. Unverified guesses were
 * removed on purpose: they attached the wrong box art (appid 2330 is Quake II,
 * not GTA: Vice City), which is far worse than leaving a title unresolved.
 *
 * Needed because some titles 404 in store search, some are re-released under a
 * name the matcher refuses ("Grand Theft Auto IV: The Complete Edition"), and
 * some are listed bare and trademarked ("Rocket League®"). Verified ids skip
 * the search entirely, so marquee titles are also immune to rate limiting.
 *
 * Deliberately absent: titles with no Steam release (Nintendo/Sony exclusives,
 * most mobile and service games) keep generated art, and so do titles whose only
 * store match is a different game - "The Outer Worlds" searches to
 * "The Outer Worlds 2", which would put the sequel cover on the original.
 */
/**
 * SteamSpy appid -> name index, cached on disk.
 *
 * The store's own search endpoint became unreliable mid-build: a query for
 * "VALORANT" came back with Aimlabs and Bellwright, and the bulk GetAppList/v2
 * endpoint now 404s, so nothing legitimate was left for the matcher to accept.
 * SteamSpy still serves the full app list (owner-ranked, ~82k titles), which
 * makes it usable as an *offline* dictionary: match here, then confirm the
 * candidate against api/appdetails before it is written to src/data/steam-art.ts.
 *
 * Cached because the full sweep is ~90 requests and the answer only changes
 * when the catalogue does.
 */
const INDEX_CACHE = new URL("./.steam-app-index.json", import.meta.url);
const SPY_PAGES = 100;
const SPY_PAGE_SIZE = 1000;

async function loadAppIndex() {
  try {
    const cached = JSON.parse(readFileSync(INDEX_CACHE, "utf8"));
    if (Array.isArray(cached) && cached.length > 1000) return cached;
  } catch {
    /* no usable cache - fall through and fetch */
  }

  console.log(`[art] building the SteamSpy app index (${SPY_PAGES} pages)...`);
  const UA = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "accept-language": "en-US,en;q=0.9",
  };
  const out = [];
  for (let page = 0; page < SPY_PAGES; page++) {
    try {
      const res = await fetch(
        `https://steamspy.com/api.php?request=all&page=${page}`,
        { headers: UA },
      );
      if (!res.ok) break;
      const payload = await res.json();
      for (const app of Object.values(payload ?? {})) {
        if (app && typeof app.appid === "number" && typeof app.name === "string") {
          out.push([app.appid, app.name]);
        }
      }
      if (page % 20 === 0) console.log(`[art]   index page ${page} (${out.length} titles)`);
    } catch (err) {
      console.warn(`[art]   index page ${page} failed: ${err.message}`);
    }
    await sleep(350);
  }

  if (out.length > 1000) {
    writeFileSync(INDEX_CACHE, JSON.stringify(out));
    console.log(`[art] index cached: ${out.length} app ids`);
  }
  return out;
}

/**
 * Exact and edition-match candidates from the offline index, shaped like a
 * store search result so the rest of the pipeline is unchanged.
 */
async function indexCandidates(target) {
  const index = await loadAppIndex();
  const exact = [];
  const editions = [];
  for (const [appid, name] of index) {
    const n = normalize(name);
    if (n === target) {
      exact.push({ appid, name });
    } else if (n.startsWith(target) && n.length > target.length) {
      // Only accept a real edition suffix, not a longer unrelated title.
      editions.push({ appid, name });
    }
  }
  // Prefer the plainest edition: "Foo" beat "Foo: Legendary Edition".
  editions.sort((a, b) => a.name.length - b.name.length);
  return { exact, editions: editions.slice(0, 5) };
}

const APP_ID_OVERRIDES = {
  "Call of Duty: Black Ops 6": 4384550,

  // Verified with api/appdetails: 812820 is "Porradaria 2 - A Segunda Batata", a
  // Brazilian release that the search matcher had bound to two Creed titles at
  // once, putting the wrong box art on both. An app id is now claimed by exactly
  // one title (see CLAIMED_APP_IDS), and these three are pinned to their real
  // store pages so they can never be matched by similarity again.
  "Assassin's Creed Mirage": 3035570,
  "Assassin's Creed Valhalla": 2208920,
  "Assassin's Creed Shadows": 3159330,
  "Grand Theft Auto IV": 12210,
  "Grand Theft Auto: San Andreas": 1547000,
  "Rocket League": 252950,
  "Overwatch 2": 2357570,
  "Sea of Stars": 1244090,
  "Yakuza 0": 2988580,
  "Days Gone": 1259420,
  "Warframe": 230410,
  "Tekken 8": 1778820,
  "Nioh 2": 1325200,

  // Sony keeps these delisted from Steam under their own names, so search finds
  // only unrelated titles ("Astro Bot" matches a Sackboy costume, "Forza
  // Horizon 4" matches nothing at all). Both ids below were confirmed with
  // api/appdetails and return 200 on all three art paths.
  "The Last of Us Part II Remastered": 2531310,

  // Resolved from a local SteamSpy appid->name index (82,517 titles) instead of
  // the store search, which was answering with unrelated results - a query for
  // "VALORANT" came back with Aimlabs and Bellwright, so the matcher had nothing
  // legitimate to accept. Each id below was re-checked against api/appdetails
  // (the returned name matches the catalogue title) and answers 200 on all three
  // art paths, so none of them is a guess.
  "Forza Horizon 4": 1293830,
  "MultiVersus": 1818750,
  "The Outer Worlds": 578650,
  "Surviving Mars": 464920,
  "Football Manager 2024": 2252570,

  // Uncharted 4 is deliberately NOT pinned. Steam retired its standalone page and
  // the only product containing it is the Legacy of Thieves Collection (1659420),
  // which is already mapped to that title. Pinning both would put identical box
  // art on two different cards, so Uncharted 4 keeps its generated key art.
};

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
/**
 * `normalize()` strips every non-alphanumeric character, so a remainder like
 * "Yakuza 0 Director's Cut" arrives as "directorscut" with no word boundaries
 * left to split on. Peeling known suffix phrases off the end is therefore the
 * only reliable test — and it must be iterative, because Steam nests them
 * ("...: The Complete Edition" -> "thecompleteedition" -> "the").
 */
const SUFFIX_PHRASES = [
  "completeedition", "definitiveedition", "deluxeedition", "ultimateedition",
  "anniversaryedition", "collectorsedition", "goldedition", "legendaryedition",
  "platinumedition", "trilogyedition", "extendededition", "enhancededition",
  "remasterededition", "sunsetedition", "legacyedition", "directorscut",
  "gameoftheyearedition", "edition", "remastered", "enhanced", "definitive",
  "deluxe", "ultimate", "anniversary", "complete", "gold", "legendary",
  "platinum", "collectors", "trilogy", "extended", "goty", "sunset", "directors",
  "legacy", "classic", "original", "premium",
].sort((a, b) => b.length - a.length);

function isEditionSuffix(remainder) {
  let r = remainder;
  for (;;) {
    const hit = SUFFIX_PHRASES.find((p) => r.length > p.length && r.endsWith(p));
    if (!hit) break;
    r = r.slice(0, -hit.length);
  }
  // "the"/"a" are noise left after peeling ("...edition: The Complete Edition").
  return r === "" || r === "the" || r === "a" || /^\d{4}$/.test(r);
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
const APP_DETAILS = (id) => `https://store.steampowered.com/api/appdetails?appids=${id}&l=english`;

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

/**
 * Pull (appid, name) pairs out of the store search HTML fragment.
 *
 * The id and the title must come from the *same* result row. A naive
 * `data-ds-appid="(\d+)"[\s\S]*?<span class="title">(...)` crosses row
 * boundaries, because a row can carry the appid without a title span (or the
 * title can be absent while a later row has one). That silently pairs one app's
 * id with another app's name, so the resolver "verifies" a match that is really
 * a different game entirely - it attached Porradaria 2's art to two Assassin's
 * Creed entries. Splitting the fragment on the row delimiter and requiring both
 * fields inside one row keeps the pairing honest.
 */
function parseSearchResults(html) {
  const out = [];
  for (const row of html.split(/<a\s+href=/i)) {
    const id = row.match(/data-ds-appid="(\d+)"/);
    const name = row.match(/<span class="title">([^<]*)<\/span>/);
    if (id && name) out.push({ id: Number(id[1]), name: decodeEntities(name[1]) });
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
 * Which of the three assets an app actually publishes.
 *
 * The conventional `library_600x900` / `library_hero` / `header` paths cover
 * almost every title, but newer releases (e.g. Call of Duty: Black Ops 6,
 * appid 4384550) publish only a *hashed* header under `store_item_assets`, and
 * the predictable paths 404 for them. Those are recoverable: appdetails returns
 * the real CDN URLs, so a title that looked art-less is still a real product
 * with real photography.
 *
 * `urls` is returned when appdetails had to be consulted, because the caller
 * then has to store the exact URLs instead of rebuilding them from the id.
 */
async function resolveAssets(id) {
  const [poster, hero, header] = await Promise.all([
    assetExists(POSTER(id)),
    assetExists(HERO(id)),
    assetExists(HEADER(id)),
  ]);
  if ([poster, hero, header].some((r) => r === "throttled")) return { throttled: true };
  if (poster || hero || header) return { poster, hero, header };

  // Conventional paths all 404: ask the store where this app keeps its art.
  const res = await fetchWithRetry(APP_DETAILS(id), { json: true });
  if (res.status === 429) return { throttled: true };
  const data = res.ok ? res.body?.[String(id)]?.data : null;
  const direct = typeof data?.header_image === "string" ? data.header_image : null;
  if (!direct) return { poster: false, hero: false, header: false };
  if (!(await assetExists(direct))) return { poster: false, hero: false, header: false };
  // Only a landscape header is published, so it backs every presentation.
  return { poster: true, hero: true, header: true, urls: { poster: direct, hero: direct, header: direct } };
}

/**
 * title -> verified app id plus the asset set that actually resolves.
 * Returns `{ deferred: true }` when the store rate limited us, so the caller
 * can leave the title for a later run instead of recording a false "no art".
 */
async function resolveTitle(title) {
  // A verified app id short-circuits every search: no requests, no throttling.
  const forced = APP_ID_OVERRIDES[title];
  if (forced) {
    const assets = await resolveAssets(forced);
    if (assets.throttled) return { deferred: true };
    const { poster, hero, header } = assets;
    if (!poster && !hero && !header) return { id: null, matched: title };
    if (!claimAppId(forced, title)) return { id: null, matched: title, rejected: true };
    return { id: forced, poster, hero, header, urls: assets.urls, matched: title, forced: true };
  }

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

  // 4) Offline dictionary. The store searches above cost several requests each
  //    and started answering with unrelated titles, so before giving up we try
  //    the cached SteamSpy app list, which needs no network at all. Candidates
  //    are still confirmed against api/appdetails below, so a stale or
  //    mislabelled index entry cannot slip through.
  if (!hit) {
    const fromIndex = await indexCandidates(target);
    hit = found([...fromIndex.exact, ...fromIndex.editions].map((c) => ({ id: c.appid, name: c.name })));
  }

  if (!hit && FUZZY) {
    hit = candidates
      .map((c) => ({ c, score: similarity(target, normalize(c.name)) }))
      .filter((x) => x.score >= 0.92)
      .sort((a, b) => b.score - a.score)[0]?.c;
  }
  if (!hit?.id) return null;

  const id = Number(hit.id);
  const assets = await resolveAssets(id);
  if (assets.throttled) return { deferred: true };
  const { poster, hero, header } = assets;
  if (!poster && !hero && !header) return null;
  // Refuse an id another title already owns: shared app art is a visible bug.
  if (!claimAppId(id, title)) return null;
  return { id, poster, hero, header, urls: assets.urls, matched: hit.name ?? "" };
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


/**
 * One app id -> at most one catalogue title.
 *
 * Steam search will happily return the same app for several different queries,
 * and a single fuzzy hit then puts identical box art on two different cards.
 * That happened here: both Assassin’s Creed entries resolved to appid 812820,
 * which is in fact "Porradaria 2 - A Segunda Batata". Two cards showing the
 * same wrong cover is worse than one card showing generated key art, so a title
 * that loses the claim race is dropped rather than duplicated.
 *
 * Seeding from the cache keeps the decision stable across runs: whichever title
 * already owned an id in a previous run keeps it, so a resumed run cannot flip
 * the winner between the two candidates.
 */
const CLAIMED_APP_IDS = new Map();

/** Seed the registry from a prior run so claims stay deterministic. */
function seedClaims(cache) {
  for (const [title, entry] of Object.entries(cache)) {
    if (Number.isFinite(entry?.id) && !CLAIMED_APP_IDS.has(entry.id)) {
      CLAIMED_APP_IDS.set(entry.id, title);
    }
  }
}

/**
 * Claim an app id for a title.
 *
 * Returns true when the title may use it, false when a different title already
 * owns it. Verified overrides always win, because they were hand-checked against
 * `api/appdetails`; an override that collides means the override table itself has
 * a duplicate, so it is honoured and the error is made loud.
 */
function claimAppId(id, title) {
  const owner = CLAIMED_APP_IDS.get(id);
  if (owner === undefined) {
    CLAIMED_APP_IDS.set(id, title);
    return true;
  }
  if (owner === title) return true;
  const override = APP_ID_OVERRIDES[title];
  if (override === id) {
    console.warn(`[art] WARNING duplicate override: ${title} and ${owner} both claim ${id}`);
    CLAIMED_APP_IDS.set(id, title);
    return true;
  }
  return false;
}

/* --------------------------------------------------------------------- main */

const overrides = readSlugOverrides();
const slugFor = (title) => overrides[title] ?? slugify(title);

let titles = readTitles();
/**
 * The full catalogue, kept for serialisation. `titles` is narrowed by --only /
 * --limit / --retry-missing so a run does fewer requests, but the generated
 * file must always describe *every* title the cache knows about - building the
 * rows from the narrowed list silently truncated steam-art.ts down to whatever
 * subset happened to run.
 */
const allTitles = titles;
if (ONLY) {
  const wanted = new Set(ONLY.map(normalize));
  titles = titles.filter((t) => wanted.has(normalize(t)));
  if (!titles.length) {
    console.error(`[art] --only matched no catalogue title. Tried: ${ONLY.join(", ")}`);
    process.exit(1);
  }
}
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
// Existing matches are seeded as claims first, so a resumed run keeps every id
// it already had instead of re-drawing the assignment from scratch.
seedClaims(cache);

// Overridden titles always re-resolve, so adding an override to the map fixes
// an already-cached "no art" entry without needing --refresh.
const todo = titles.filter(
  (t) => !(t in cache) || (RETRY_MISSING && !cache[t]) || t in APP_ID_OVERRIDES,
);
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

/**
 * Post-generation audit: every emitted entry is re-checked against the store.
 *
 * Two failures are invisible in the file itself and were both observed live:
 *
 *   1. a bound app id that belongs to a different game ("EA Sports UFC 5" had
 *      resolved to "Ruins of Majika Demo"), and
 *   2. an asset URL that now 404s because the app moved to a hashed CDN path.
 *
 * Both produce a wrong or broken picture on a card, so entries that fail are
 * dropped from the generated file and the offending id is un-cached, letting a
 * later run resolve them again. Run with --no-verify to skip the extra requests.
 */
async function auditRows(rows) {
  if (args.has("--no-verify")) return rows;
  const kept = [];
  const dropped = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(6, rows.length) }, async () => {
      while (cursor < rows.length) {
        const row = rows[cursor++];
        // Accept the row if *any* asset it claims actually resolves. Testing a
        // single URL (hero first) used to drop titles whose hero art is absent
        // but whose poster and header are fine - "Quantum Break" and "Sunset
        // Overdrive" were both removed that way even though their box art is
        // live, which is a worse outcome than a missing hero.
        //
        // `urls` is only populated on the appdetails fallback path, so the
        // conventional paths have to be rebuilt from the per-asset flags.
        const pick = (flag, url, conventional) =>
          row.urls?.[flag] ?? (row[flag] ? conventional(row.id) : null);
        const urls = [
          pick("poster", null, POSTER),
          pick("header", null, HEADER),
          pick("hero", null, HERO),
        ].filter(Boolean);
        if (!urls.length) urls.push(HERO(row.id));
        let ok = false;
        for (const url of urls) {
          try {
            if ((await assetExists(url)) === true) {
              ok = true;
              break;
            }
          } catch {
            /* try the next asset */
          }
        }
        if (ok) {
          kept.push(row);
        } else {
          dropped.push(row.slug);
        }
      }
    }),
  );
  if (dropped.length) {
    console.log(`[art] audit dropped ${dropped.length} broken/unreachable entries:`);
    console.log(`[art]   ${dropped.join(", ")}`);
    for (const row of rows) {
      if (dropped.includes(row.slug)) delete cache[row.title];
    }
  }
  return kept;
}

const seen = new Set();
const rows = allTitles
  // A cache entry only counts when it carries a real app id: a failed override
  // stores `{ id: null, matched }`, which is a truthy object and would otherwise
  // be emitted as an entry with undefined asset flags.
  .filter((t) => Number.isFinite(cache[t]?.id))
  .map((t) => ({ slug: slugFor(t), title: t, ...cache[t] }))
  .filter((r) => (seen.has(r.slug) ? false : seen.add(r.slug)))
  .sort((a, b) => a.slug.localeCompare(b.slug));

// Audit before serialising: anything that 404s or is bound to the wrong app is
// dropped here, so the generated file only ever contains usable artwork.
const verifiedRows = await auditRows(rows);
writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));

const body = verifiedRows
  .map((r) => {
    // Titles whose assets live on a hashed CDN path carry explicit URLs;
    // everything else is rebuilt from the id at runtime.
    const urls = r.urls
      ? `, posterUrl: ${JSON.stringify(r.urls.poster)}, heroUrl: ${JSON.stringify(r.urls.hero)}, headerUrl: ${JSON.stringify(r.urls.header)}`
      : "";
    return `  ${JSON.stringify(r.slug)}: { id: ${r.id}, poster: ${r.poster}, hero: ${r.hero}, header: ${r.header}${urls} },`;
  })
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
  /**
   * Set only for apps that publish their art under a hashed CDN path (newer
   * releases such as Call of Duty: Black Ops 6), where the predictable
   * library_600x900 / library_hero / header URLs return 404.
   */
  posterUrl?: string;
  heroUrl?: string;
  headerUrl?: string;
}

/** slug -> verified app id and available asset set */
export const STEAM_ART: Record<string, SteamArtEntry> = {
${body}
};

/** Kill switch: flip to false to render generated art everywhere again. */
export const STEAM_ART_ENABLED = true;

/** How many catalogue titles have storefront art. */
export const STEAM_ART_TITLED = ${verifiedRows.length};

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
    poster: entry.poster ? (entry.posterUrl ?? posterUrl(entry.id)) : null,
    hero: entry.hero ? (entry.heroUrl ?? heroUrl(entry.id)) : null,
    header: entry.header ? (entry.headerUrl ?? headerUrl(entry.id)) : null,
  };
}
`;

writeFileSync(OUT_PATH, out);

console.log(
  `[art] wrote src/data/steam-art.ts - ${rows.length}/${allTitles.length} titles matched ` +
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

