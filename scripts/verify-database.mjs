/**
 * INFINITY — catalogue integrity verification
 * ---------------------------------------------------------------------------
 * Run with:  npm run verify
 *
 * This is the gate that keeps the catalogue honest. It asserts the properties
 * the platform promises on its own UI — 400+ real games, no duplicates, no
 * placeholder rows, every record complete — and prints the live statistics the
 * marketing surfaces read from. Exits non-zero on any failure so it can be
 * wired straight into CI.
 */
import { register } from "node:module";

register("./ts-alias-loader.mjs", import.meta.url);

const { GAMES, computeStats, AUTHORED_ROWS } = await import("../src/lib/catalogue/index.ts");
const { GENRES, PLATFORMS, SUBGENRES } = await import("../src/data/taxonomy.ts");

const MIN_GAMES = 400;
const failures = [];
const warnings = [];

const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

/* ------------------------------------------------------------------ 1. size */

const stats = computeStats(GAMES);

console.log("\n=== INFINITY CATALOGUE REPORT ===\n");
console.log(`Authored rows ............ ${AUTHORED_ROWS}`);
console.log(`Expanded games ........... ${stats.games}`);
console.log(`Genres / sub-genres ...... ${stats.genres} / ${stats.subgenres} (${stats.genreLanes} lanes)`);
console.log(`Platforms ................ ${stats.platforms}`);
console.log(`Developers ............... ${stats.developers}`);
console.log(`Publishers ............... ${stats.publishers}`);
console.log(`Languages ................ ${stats.languages}`);
console.log(`Screenshots .............. ${stats.screenshots}`);
console.log(`Videos ................... ${stats.videos}`);
console.log(`Total media items ........ ${stats.mediaItems}`);
console.log(`Free to play ............. ${stats.freeGames}`);
console.log(`Discounted now ........... ${stats.discountedGames}`);
console.log(`Coming soon .............. ${stats.comingSoon}`);
console.log(`Average rating ........... ${stats.averageRating}`);
console.log(`Total reviews ............ ${stats.totalReviews.toLocaleString()}`);
console.log(`Total wishlists .......... ${stats.totalWishlists.toLocaleString()}`);
console.log(`Total downloads .......... ${stats.totalDownloads.toLocaleString()}\n`);

if (AUTHORED_ROWS !== stats.games) {
  fail(`Authored rows (${AUTHORED_ROWS}) do not match expanded games (${stats.games}).`);
}
if (stats.games < MIN_GAMES) {
  fail(`Catalogue has ${stats.games} games but the platform promises at least ${MIN_GAMES}.`);
}
if (stats.genres + stats.subgenres < 50) {
  fail(`Only ${stats.genres + stats.subgenres} genre lanes; the platform promises 50+.`);
}
if (stats.platforms < 8) {
  fail(`Only ${stats.platforms} platforms tracked; the platform promises 8+.`);
}
if (stats.mediaItems < 1000) {
  fail(`Only ${stats.mediaItems} media items; the platform promises 1000+.`);
}

/* ------------------------------------------------ 2. identity & uniqueness */

const slugs = new Map();
const titles = new Map();
const ids = new Map();

for (const g of GAMES) {
  if (slugs.has(g.slug)) fail(`Duplicate slug "${g.slug}" (${g.title} vs ${slugs.get(g.slug)}).`);
  slugs.set(g.slug, g.title);

  const key = g.title.trim().toLowerCase();
  if (titles.has(key)) fail(`Duplicate title "${g.title}".`);
  titles.set(key, g.slug);

  if (ids.has(g.id)) fail(`Duplicate id "${g.id}".`);
  ids.set(g.id, g.slug);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.slug)) {
    fail(`Slug "${g.slug}" is not URL safe.`);
  }
  // Placeholder detection targets real filler patterns ("game-001",
  // "untitled-placeholder") without tripping over genuine titles such as
  // "Test Drive Unlimited" or "MXGP 24: The Official Game".
  const looksPlaceholder =
    /^(game|title|item|entry|asset|catalog)[-_]?\d+$/.test(g.slug) ||
    /(^|[-_])(placeholder|lorem|dummy|tbd|todo|untitled|xxx|foobar)([-_]|$)/.test(g.slug) ||
    /^(game|title|item|entry)\s*\d+$/i.test(g.title.trim());
  if (looksPlaceholder) {
    fail(`Record "${g.title}" looks like a placeholder row.`);
  }
}

/* ---------------------------------------------------------- 3. completeness */

const missingByField = new Map();
const noteMissing = (field) => missingByField.set(field, (missingByField.get(field) ?? 0) + 1);

for (const g of GAMES) {
  if (!g.title || g.title.length < 2) noteMissing("title");
  if (!g.developer) noteMissing("developer");
  if (!g.publisher) noteMissing("publisher");
  if (!g.genre.length) noteMissing("genres");
  if (!g.platforms.length) noteMissing("platforms");
  if (!(g.rating > 0 && g.rating <= 10)) noteMissing("rating");
  if (Number.isNaN(new Date(g.releaseDate).getTime())) noteMissing("releaseDate");
  if (g.shortDescription.length < 60) noteMissing("shortDescription");
  if (g.longDescription.split("\n\n").length < 3) noteMissing("longDescription");
  if (g.screenshots.length < 8) noteMissing("screenshots");
  if (g.videos.length < 3) noteMissing("videos");
  if (g.features.length < 5) noteMissing("features");
  if (g.tags.length < 5) noteMissing("tags");
  if (g.languages.length < 5) noteMissing("languages");
  if (!g.gameModes.length) noteMissing("gameModes");
  if (g.availability.length !== g.platforms.length) noteMissing("availability");
  if (g.officialStoreLinks.length !== g.platforms.length) noteMissing("officialStoreLinks");
  if (!g.controls.length) noteMissing("controls");
  if (g.howToPlay.length < 5) noteMissing("howToPlay");
  if (!g.systemRequirements.minimum.length || !g.systemRequirements.recommended.length) {
    noteMissing("systemRequirements");
  }
  if (g.relatedGames.length < 3) noteMissing("relatedGames");
  if (!g.ageRating) noteMissing("ageRating");
}

for (const [field, count] of missingByField) {
  fail(`${count} record(s) are incomplete on field "${field}".`);
}

/* ------------------------------------------------------- 4. value integrity */

for (const g of GAMES) {
  if (g.isFree && g.price !== 0) fail(`${g.slug}: flagged free but price is ${g.price}.`);
  if (!g.isFree && g.price === 0) fail(`${g.slug}: not flagged free but has a zero price.`);
  if (g.discount < 0 || g.discount > 70) fail(`${g.slug}: discount ${g.discount}% is out of range.`);
  if (g.reviewCount <= 0) fail(`${g.slug}: review count must be positive.`);
  for (const platform of g.platforms) {
    if (!PLATFORMS.some((p) => p.slug === platform)) fail(`${g.slug}: unknown platform "${platform}".`);
  }
  for (const genre of g.genre) {
    if (!GENRES.some((x) => x.slug === genre)) fail(`${g.slug}: unknown genre "${genre}".`);
  }
  for (const link of g.officialStoreLinks) {
    const official = /^https:\/\/(store\.steampowered\.com|www\.playstation\.com|www\.xbox\.com|www\.nintendo\.com|play\.google\.com|apps\.apple\.com)/;
    if (!official.test(link.url)) {
      fail(`${g.slug}: store link is not an official storefront (${link.url}).`);
    }
  }
  for (const video of g.videos) {
    if (!video.officialUrl.startsWith("https://www.youtube.com/results")) {
      fail(`${g.slug}: video source is not an official channel reference.`);
    }
  }
  for (const shot of g.screenshots) {
    if (!shot.caption || shot.caption.length < 12) fail(`${g.slug}: screenshot caption too short.`);
  }
  for (const block of g.controls) {
    if (block.controls.length < 8) {
      fail(`${g.slug}: platform "${block.platform}" has too few control bindings.`);
    }
  }
}

/* --------------------------------------------------- 5. taxonomy coverage */

for (const platform of PLATFORMS) {
  const count = GAMES.filter((g) => g.platforms.includes(platform.slug)).length;
  if (count === 0) fail(`Platform "${platform.slug}" has no games.`);
  else if (count < 20) warn(`Platform "${platform.slug}" only has ${count} games.`);
}

for (const genre of GENRES) {
  const count = GAMES.filter((g) => g.genre.includes(genre.slug)).length;
  if (count === 0) fail(`Genre "${genre.slug}" has no games.`);
  else if (count < 8) warn(`Genre "${genre.slug}" only has ${count} games.`);
}

const referencedTags = new Set(GAMES.flatMap((g) => g.tags));
const unusedSubgenres = SUBGENRES.filter((s) => !referencedTags.has(s.name));
if (unusedSubgenres.length) {
  warn(`${unusedSubgenres.length} sub-genre lane(s) are not referenced by any game yet.`);
}

/* --------------------------------------------------------------- 6. spread */

const byDecade = {};
for (const g of GAMES) {
  const decade = `${g.releaseDate.slice(0, 3)}0s`;
  byDecade[decade] = (byDecade[decade] ?? 0) + 1;
}
console.log("Release spread:", byDecade, "\n");

const developerCounts = {};
for (const g of GAMES) developerCounts[g.developer] = (developerCounts[g.developer] ?? 0) + 1;
console.log("Top 10 developers by catalogue size:");
for (const [name, count] of Object.entries(developerCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)) {
  console.log(`  ${name.padEnd(36, ".")} ${count}`);
}

const platformsRanked = PLATFORMS.map((p) => ({
  name: p.shortName,
  count: GAMES.filter((g) => g.platforms.includes(p.slug)).length,
})).sort((a, b) => b.count - a.count);
console.log("\nGames per platform:");
for (const p of platformsRanked) console.log(`  ${p.name.padEnd(14, ".")} ${p.count}`);

/* ------------------------------------------------------------------ verdict */

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ! ${w}`);
}

if (failures.length) {
  console.error(`\n${failures.length} FAILURE(S):`);
  for (const f of failures) console.error(`  x ${f}`);
  console.error("\nCatalogue verification FAILED.\n");
  process.exit(1);
}

console.log(
  `\nCatalogue verification PASSED — ${stats.games} unique games, ${stats.mediaItems} media items, ${stats.genreLanes} genre lanes.\n`,
);


