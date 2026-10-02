import type {
  AgeRating,
  Game,
  GameMode,
  MediaKind,
  PlatformAvailability,
  PlatformHowToPlay,
  PlatformSlug,
} from "@/lib/types";
import type { RawGameRow } from "@/data/game-records";
import { GENRE_MAP, PLATFORM_MAP, SUBGENRE_MAP } from "@/data/taxonomy";
import { steamArtFor } from "@/data/steam-art";
import { STORE_ART, STORE_ART_ENABLED } from "@/data/store-art";
import {
  hashString,
  seededInt,
  seededPick,
  seededSample,
  seededShuffle,
  slugify,
} from "@/lib/generate";
import {
  DESC_BODY,
  DESC_COMING_SOON_CLOSER,
  DESC_FREE_CLOSER,
  DESC_MODE_CLOSERS,
  DESC_OPENERS,
  DESC_PREMIUM_CLOSER,
  FALLBACK_FEATURES,
  GENRE_FEATURES,
  LANGUAGES,
  SUBGENRE_FEATURES,
} from "./pools";
import { MEDIA_KIND_LABELS, SCREENSHOT_CAPTIONS, VIDEO_TEMPLATES, officialChannelSearch } from "./media-pools";
import {
  ADVANCED_TIPS,
  GENRE_LABEL,
  GUIDE_STEPS,
  MODE_LABEL,
  OBJECTIVES,
  PLATFORM_MODE_LABELS,
  playFamilyOf,
} from "./guides";
import {
  buildRequirements,
  editionNameFor,
  fileSizeFor,
  officialStoreUrl,
  weightClassOf,
} from "./requirements";
import { controlsFor, deviceForPlatform } from "./tech-pools";


/** Slug overrides where a plain slugify would read badly. */
const SLUG_OVERRIDES: Record<string, string> = {
  "Grand Theft Auto V": "grand-theft-auto-v",
  "Grand Theft Auto VI": "grand-theft-auto-6",
  "Grand Theft Auto IV": "grand-theft-auto-4",
  "Grand Theft Auto: San Andreas": "grand-theft-auto-san-andreas",
  "Grand Theft Auto: Vice City": "grand-theft-auto-vice-city",
  "NieR: Automata": "nier-automata",
  "NieR Replicant ver.1.22474487139...": "nier-replicant",
  "The Elder Scrolls V: Skyrim Special Edition": "the-elder-scrolls-v-skyrim",
  "The Elder Scrolls IV: Oblivion Remastered": "the-elder-scrolls-iv-oblivion",
  "Sid Meier's Civilization VII": "civilization-7",
  "Sid Meier's Civilization VI": "civilization-6",
  "PUBG: Battlegrounds": "pubg-battlegrounds",
  "The Legend of Zelda: Tears of the Kingdom": "zelda-tears-of-the-kingdom",
  "The Legend of Zelda: Breath of the Wild": "zelda-breath-of-the-wild",
  "The Legend of Zelda: Echoes of Wisdom": "zelda-echoes-of-wisdom",
  "Marvel's Spider-Man 2": "marvels-spider-man-2",
  "Marvel's Spider-Man Remastered": "marvels-spider-man",
  "Marvel's Spider-Man: Miles Morales": "marvels-spider-man-miles-morales",
  "Marvel's Wolverine": "marvels-wolverine",
  "Mortal Kombat 1": "mortal-kombat-1",
  "Sekiro: Shadows Die Twice": "sekiro-shadows-die-twice",
  "Ori and the Will of the Wisps": "ori-and-the-will-of-the-wisps",
  "Ori and the Blind Forest": "ori-and-the-blind-forest",
  "Warhammer 40,000: Space Marine 2": "warhammer-40k-space-marine-2",
  "Warhammer 40,000: Rogue Trader": "warhammer-40k-rogue-trader",
  "Warhammer 40,000: Battlesector": "warhammer-40k-battlesector",
  "Warhammer 40,000: Mechanicus": "warhammer-40k-mechanicus",
  "The Last of Us Part I": "the-last-of-us-part-1",
  "The Last of Us Part II Remastered": "the-last-of-us-part-2",
  "Baldur's Gate 3": "baldurs-gate-3",
  "Assassin's Creed Shadows": "assassins-creed-shadows",
  "Assassin's Creed Mirage": "assassins-creed-mirage",
  "Assassin's Creed Valhalla": "assassins-creed-valhalla",
  "Rainbow Six Siege X": "rainbow-six-siege-x",
  "Dragon's Dogma 2": "dragons-dogma-2",
  "Kingdom Come: Deliverance II": "kingdom-come-deliverance-2",
  "Kingdom Come: Deliverance": "kingdom-come-deliverance",
  "Little Nightmares II": "little-nightmares-2",
  "Little Nightmares III": "little-nightmares-3",
  "Cricket 24: The Official Game of the Ashes": "cricket-24",
  "Call of Duty 4: Modern Warfare Remastered": "call-of-duty-4-modern-warfare-remastered",
  "Sid Meier's Civilization VI ": "civilization-6",
};

export function slugFor(title: string): string {
  return SLUG_OVERRIDES[title] ?? slugify(title);
}

export function yearOf(releaseDate: string): number {
  const y = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(y) ? y : 2020;
}

/** Game modes implied by a record's genres and flags. */
export function modesFor(row: RawGameRow): GameMode[] {
  const g = new Set(row.genres);
  const modes: GameMode[] = [];
  const add = (m: GameMode) => {
    if (!modes.includes(m)) modes.push(m);
  };

  const solo =
    g.has("story") ||
    g.has("adventure") ||
    g.has("rpg") ||
    g.has("open-world") ||
    g.has("horror") ||
    g.has("action") ||
    g.has("racing") ||
    g.has("simulation") ||
    g.has("strategy") ||
    g.has("puzzle") ||
    g.has("indie") ||
    g.has("tps") ||
    g.has("fps");

  const online =
    g.has("multiplayer") || g.has("battle-royale") || g.has("mmorpg") || g.has("co-op");

  if (solo) add("single-player");
  if (g.has("story") || g.has("adventure") || g.has("rpg") || g.has("open-world")) add("campaign");
  if (online) add("multiplayer");
  if (g.has("co-op")) add("co-op");
  if (g.has("multiplayer") || g.has("battle-royale")) add("online-pvp");
  if (g.has("co-op")) add("online-coop");
  if (g.has("family")) add("local-coop");
  if (g.has("sandbox")) add("sandbox");
  if (g.has("battle-royale") || g.has("multiplayer") || g.has("fighting") || g.has("sports")) add("ranked");
  if (row.platforms.length >= 4) add("cross-platform");
  if (!modes.length) add("single-player");
  return modes;
}

/** Content rating derived from the genre mix. */
export function ageRatingFor(row: RawGameRow): AgeRating {
  const g = new Set(row.genres);
  const subs = new Set(row.subgenres);
  if (g.has("family") && !g.has("horror") && !g.has("survival")) return "E";
  if (g.has("horror") || subs.has("psychological-horror") || subs.has("survival-horror")) return "M";
  if (g.has("fps") || g.has("fighting") || g.has("survival") || g.has("battle-royale")) return "M";
  if (g.has("sports") || g.has("racing") || g.has("simulation")) return "E10+";
  if (g.has("rpg") || g.has("strategy") || g.has("action")) return "T";
  return "T";
}

function pegiFor(rating: AgeRating): string {
  switch (rating) {
    case "E":
      return "PEGI 3";
    case "E10+":
      return "PEGI 7";
    case "T":
      return "PEGI 12";
    case "M":
      return "PEGI 18";
    default:
      return "PEGI 16";
  }
}

export function ageRatingLabel(rating: AgeRating): string {
  return `${rating} · ${pegiFor(rating)}`;
}

/** Deterministic engagement counters — used by rankings and the admin console. */
export function countersFor(row: RawGameRow, slug: string, year: number) {
  const age = Math.max(0, 2026 - year);
  const base =
    100_000 +
    Math.round((row.rating - 6) * 90_000) +
    (row.flags.trending ? 320_000 : 0) +
    (row.flags.featured ? 240_000 : 0) +
    (row.flags.newRelease ? 180_000 : 0) +
    (row.flags.free ? 260_000 : 0) +
    Math.max(0, 260_000 - age * 18_000);
  const popularity = Math.max(12_000, Math.round(base * (0.82 + (hashString(slug) % 100) / 260)));

  return {
    popularity,
    wishlistCount: Math.round(popularity * (row.flags.comingSoon ? 1.35 : 0.34)),
    viewCount: Math.round(popularity * 8.4),
    downloadCount: row.flags.free ? Math.round(popularity * 2.1) : Math.round(popularity * 0.28),
    reviewCount: Math.round(1_200 + popularity / 9),
  };
}

/** Almost every catalogue entry carries a launch discount window. */
export function discountFor(row: RawGameRow, slug: string): number {
  if (row.flags.free || row.price === 0 || row.flags.comingSoon) return 0;
  const roll = seededInt(slug, 0, 99, "discount-roll");
  if (roll < 34) return 0;
  const options = row.flags.trending ? [15, 20, 25, 30, 40, 50] : [10, 15, 20, 25, 30, 40, 50, 60, 70];
  return seededPick(slug, options, "discount-value");
}

/** Fills the {token} placeholders used throughout the copy pools. */
export function fillTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_m, key: string) => vars[key] ?? key);
}

/** Two-sentence summary for cards, previews and meta descriptions. */
export function shortDescriptionFor(row: RawGameRow, slug: string): string {
  const vars = copyVars(row, slug);
  const opener = seededPick(slug, DESC_OPENERS, "opener");
  const body = seededPick(slug, DESC_BODY, "body-short");
  return `${fillTemplate(opener, vars)} ${body}`;
}

/** Long-form description — three composed paragraphs, unique per record. */
export function longDescriptionFor(row: RawGameRow, slug: string): string[] {
  const vars = copyVars(row, slug);
  const openers = seededShuffle(slug, DESC_OPENERS);
  const bodies = seededShuffle(slug, DESC_BODY);

  const paragraphOne = `${fillTemplate(openers[0], vars)} ${bodies[0]}`;
  const paragraphTwo = `${fillTemplate(openers[1], vars)} ${bodies[1]} ${bodies[2]}`;

  const modeKey = modesFor(row).find((m) => DESC_MODE_CLOSERS[m.replace("-", "_")] || DESC_MODE_CLOSERS[m]);
  const modeLine = modeKey ? DESC_MODE_CLOSERS[modeKey.replace("-", "_")] ?? DESC_MODE_CLOSERS[modeKey] : null;
  const priceLine = row.flags.comingSoon
    ? DESC_COMING_SOON_CLOSER
    : row.flags.free
      ? DESC_FREE_CLOSER
      : DESC_PREMIUM_CLOSER;
  const paragraphThree = [bodies[3], modeLine, priceLine].filter(Boolean).join(" ");

  return [paragraphOne, paragraphTwo, paragraphThree];
}

function copyVars(row: RawGameRow, slug: string): Record<string, string> {
  const primary = row.genres[0] ?? "action";
  const genreLabel = GENRE_LABEL[primary] ?? primary.replace(/-/g, " ");
  const subNames = row.subgenres.map((s) => SUBGENRE_MAP[s]?.name ?? s.replace(/-/g, " "));
  const sub =
    subNames.length > 1
      ? `${subNames[0].toLowerCase()} and ${subNames[1].toLowerCase()}`
      : (subNames[0] ?? genreLabel).toLowerCase();

  return {
    title: row.title,
    genre: genreLabel,
    sub,
    dev: row.developer,
    pub: row.publisher,
    year: String(yearOf(row.releaseDate)),
    slug,
    platforms: String(row.platforms.length),
  };
}

/** Feature bullets: primary genre + sub-genre unlocks + mode-based additions. */
export function featuresFor(row: RawGameRow, slug: string): string[] {
  const out: string[] = [];
  const push = (v: string) => {
    if (!out.includes(v)) out.push(v);
  };

  for (const genre of row.genres.slice(0, 2)) {
    const pool = GENRE_FEATURES[genre];
    if (pool) seededSample(slug, pool, 3, `feat-${genre}`).forEach(push);
  }
  for (const sub of row.subgenres.slice(0, 3)) {
    const pool = SUBGENRE_FEATURES[sub];
    if (pool) seededSample(slug, pool, 1, `feat-${sub}`).forEach(push);
  }
  const modes = modesFor(row);
  if (modes.includes("co-op")) push("Co-op progression is fully synced, including achievements and unlocks");
  if (modes.includes("ranked")) push("Ranked seasons with visible rating changes and placement matches");
  if (modes.includes("cross-platform")) push("Cross-platform play and progression across every supported storefront");
  if (modes.includes("single-player")) push("Full offline single-player support with no always-online requirement");
  if (row.flags.comingSoon) push("Wishlist now — launch-day unlock is included in your INFINITY library");

  // Narrow records (single genre, no sub-genres) are topped up from the
  // fallback pool so every game page has a genuinely useful feature list.
  if (out.length < 6) {
    for (const filler of seededShuffle(slug, FALLBACK_FEATURES)) {
      if (out.length >= 6) break;
      push(filler);
    }
  }

  return out.slice(0, 8);
}

/** Descriptive tags powering search, similar-games and the tag filter. */
export function tagsFor(row: RawGameRow, slug: string): string[] {
  const tags: string[] = [];
  const push = (v: string) => {
    if (!tags.includes(v)) tags.push(v);
  };
  row.subgenres.forEach((s) => push(SUBGENRE_MAP[s]?.name ?? s.replace(/-/g, " ")));
  row.genres.forEach((g) => push(GENRE_MAP[g]?.name ?? g));
  modesFor(row).forEach((m) => push(MODE_LABEL[m] ?? m));

  const descriptors = [
    "Steam Deck verified",
    "Controller support",
    "Cloud saves",
    "HDR support",
    "Ray tracing",
    "Ultrawide support",
    "Photo mode",
    "Cross-save",
    "Mod support",
    "Accessibility options",
    "Original soundtrack",
    "Dual audio",
  ];
  seededSample(slug, descriptors, seededInt(slug, 3, 5, "tag-count"), "descriptors").forEach(push);
  return tags.slice(0, 12);
}

/** Languages, scaled by how widely a title shipped. */
export function languagesFor(row: RawGameRow, slug: string): string[] {
  const weight = weightClassOf(yearOf(row.releaseDate), row.platforms, row.rating, row.flags.free);
  const base = weight === "flagship" ? 14 : weight === "standard" ? 10 : 5;
  const count = Math.min(LANGUAGES.length, base + seededInt(slug, 0, 8, "lang"));
  const rest = LANGUAGES.slice(1);
  const extra = seededShuffle(slug, rest).slice(0, count - 1);
  return ["English", ...extra];
}

/** Screenshot set: 8-14 slots, each carrying its own caption and seed. */
export function screenshotsFor(row: RawGameRow, slug: string): ScreenshotAssetLike[] {
  const kinds: MediaKind[] = ["gameplay", "environments", "characters", "maps", "gameplay", "vehicles", "cinematics", "environments", "gameplay", "characters", "maps", "cinematics", "gameplay", "environments"];
  const total = seededInt(slug, 8, 14, "shot-count");
  const vars = copyVars(row, slug);
  const shots: ScreenshotAssetLike[] = [];

  for (let i = 0; i < total; i++) {
    const kind = kinds[i % kinds.length];
    const pool = SCREENSHOT_CAPTIONS[kind] ?? SCREENSHOT_CAPTIONS.gameplay;
    const caption = fillTemplate(pool[i % pool.length], vars);
    shots.push({
      id: `${slug}-shot-${i + 1}`,
      kind,
      caption: `${MEDIA_KIND_LABELS[kind]} ${i + 1} · ${caption}`,
      seed: seededInt(slug, 1, 999_999, `shot-seed-${i}`),
    });
  }
  return shots;
}

export interface ScreenshotAssetLike {
  id: string;
  kind: MediaKind;
  caption: string;
  seed: number;
}

/** Video centre: trailer, gameplay and one supporting feature. */
export function videosFor(row: RawGameRow, slug: string, publisher: string): VideoAssetLike[] {
  const wanted: VideoTemplateLike["category"][] = row.flags.comingSoon
    ? ["official-trailer", "cinematic", "developer"]
    : row.flags.newRelease
      ? ["official-trailer", "gameplay", "update", "developer"]
      : ["official-trailer", "gameplay", "cinematic", "update"];

  return wanted.map((category, index) => {
    const template = VIDEO_TEMPLATES.find((t) => t.category === category) ?? VIDEO_TEMPLATES[0];
    const year = yearOf(row.releaseDate);
    const month = String(seededInt(slug, 1, 12, `vid-month-${index}`)).padStart(2, "0");
    return {
      id: `${slug}-video-${index + 1}`,
      title: `${row.title} — ${template.label}`,
      category,
      duration: template.duration,
      publishedAt: `${index === 0 ? year : Math.min(2026, year + index)}-${month}-1${index}`,
      officialUrl: officialChannelSearch(publisher, row.title),
      channel: `${publisher} (official)`,
    };
  });
}

export interface VideoAssetLike {
  id: string;
  title: string;
  category: VideoTemplateLike["category"];
  duration: string;
  publishedAt: string;
  officialUrl: string;
  channel: string;
}

export interface VideoTemplateLike {
  category: "official-trailer" | "gameplay" | "cinematic" | "update" | "developer" | "behind-the-scenes";
  label: string;
  duration: string;
}

/** Expands a single authored row into a complete, publishable Game record. */
export function buildGame(row: RawGameRow): Game {
  const slug = slugFor(row.title);
  const year = yearOf(row.releaseDate);
  const weight = weightClassOf(year, row.platforms, row.rating, row.flags.free);
  const counters = countersFor(row, slug, year);
  const discount = discountFor(row, slug);
  const long = longDescriptionFor(row, slug);
  const shots = screenshotsFor(row, slug);
  const vids = videosFor(row, slug, row.publisher);
  const primaryGenre = row.genres[0] ?? "action";
  // Real box art when the resolver matched a storefront entry, else null so
  // the UI falls back to the generated key-art engine. Steam is consulted first;
  // STORE_ART covers the titles that are not on Steam at all (console exclusives,
  // mobile and free-to-play), which is the majority of what is left.
  const art = steamArtFor(slug);
  const storeArt = art ? null : STORE_ART_ENABLED ? STORE_ART[slug] : undefined;
  // Steam entries expose poster/hero/header; STORE_ART entries carry explicit
  // URLs. Normalise both to one shape so the record assignment stays simple.
  const poster = art?.poster ?? storeArt?.posterUrl ?? null;
  const header = art?.header ?? storeArt?.headerUrl ?? null;

  const availability: PlatformAvailability[] = row.platforms.map((platform) => {
    const store = officialStoreUrl(platform, row.title);
    return {
      platform,
      edition: editionNameFor(platform, year, row.flags.free),
      fileSize: fileSizeFor(platform, slug, weight, year),
      requirements: buildRequirements(platform, slug, weight, year),
      storeUrl: store.url,
      infinityBuild: false,
    };
  });

  const storeLinks = row.platforms.map((platform) => {
    const store = officialStoreUrl(platform, row.title);
    return {
      platform,
      retailer: store.retailer,
      label: `View on ${store.retailer}`,
      url: store.url,
    };
  });

  return {
    id: `inf-${slug}`,
    title: row.title,
    slug,
    shortDescription: shortDescriptionFor(row, slug),
    longDescription: long.join("\n\n"),
    coverImage: poster,
    heroImage: art?.hero ?? null,
    headerImage: header,
    screenshots: shots,
    videos: vids,
    genre: row.genres,
    platforms: row.platforms,
    developer: row.developer,
    publisher: row.publisher,
    releaseDate: row.releaseDate,
    rating: Math.round(row.rating * 10) / 10,
    reviewCount: counters.reviewCount,
    price: row.price,
    discount,
    currency: "USD",
    isFree: row.flags.free || row.price === 0,
    isFeatured: row.flags.featured,
    isTrending: row.flags.trending,
    isNew: row.flags.newRelease,
    isComingSoon: row.flags.comingSoon,
    gameModes: modesFor(row),
    features: featuresFor(row, slug),
    tags: tagsFor(row, slug),
    languages: languagesFor(row, slug),
    fileSize: fileSizeFor("pc", slug, weight, year),
    systemRequirements: buildRequirements("pc", slug, weight, year),
    controls: controlsForPlatforms(row, slug, row.platforms),
    howToPlay: [
      `Objective — ${OBJECTIVES[playFamilyOf(row.genres)]}`,
      ...seededSample(slug, GUIDE_STEPS[playFamilyOf(row.genres)], 6, "htp"),
      `Platform note — ${row.platforms.length} storefront${row.platforms.length > 1 ? "s" : ""} tracked on INFINITY, each with its own install size and requirements.`,
    ],
    ageRating: ageRatingFor(row),
    relatedGames: [],
    officialStoreLinks: storeLinks,
    availability,
    popularity: counters.popularity,
    wishlistCount: counters.wishlistCount,
    viewCount: counters.viewCount,
    downloadCount: counters.downloadCount,
    mediaCount: shots.length + vids.length,
    accentHue: (GENRE_MAP[primaryGenre]?.hue ?? 356) + (hashString(slug) % 24) - 12,
    tagline: null,
    createdAt: `${row.releaseDate}T00:00:00.000Z`,
  };
}

/**
 * Builds the whole catalogue and runs the similarity pass that fills
 * `relatedGames`. Similarity is genre overlap weighted by sub-genre overlap,
 * which keeps "more like this" genuinely relevant at 10,000+ records.
 */
export function buildCatalogue(rows: RawGameRow[]): Game[] {
  const games = rows.map(buildGame);
  const bySlug = new Map(games.map((g) => [g.slug, g]));

  for (const game of games) {
    const subSet = new Set(game.tags.map((t) => t.toLowerCase()));
    const scored = games
      .filter((other) => other.slug !== game.slug)
      .map((other) => {
        const genreOverlap = other.genre.filter((g) => game.genre.includes(g)).length;
        const subOverlap = other.tags.filter((t) => subSet.has(t.toLowerCase())).length;
        const devSame = other.developer === game.developer ? 2 : 0;
        const eraClose = Math.abs(yearOf(other.releaseDate) - yearOf(game.releaseDate)) <= 3 ? 1 : 0;
        const score = genreOverlap * 3 + subOverlap * 1.5 + devSame + eraClose;
        return { slug: other.slug, score, rating: other.rating };
      })
      .filter((s) => s.score > 2)
      .sort((a, b) => b.score - a.score || b.rating - a.rating)
      .slice(0, 8)
      .map((s) => s.slug);

    game.relatedGames = scored.filter((s) => bySlug.has(s));
  }

  return games;
}


/** Per-platform how-to-play blocks — objective, controls, tiered tips. */
export function controlsForPlatforms(
  row: RawGameRow,
  slug: string,
  platforms: PlatformSlug[],
): PlatformHowToPlay[] {
  const family = playFamilyOf(row.genres);
  const guide = GUIDE_STEPS[family];
  const advanced = ADVANCED_TIPS[family];
  const vars = copyVars(row, slug);

  // Only the four primary stores get a dedicated control block; the full
  // platform list is still shown in Availability.
  const primary: PlatformSlug[] = [];
  for (const p of ["pc", "ps5", "xbox-series", "switch", "android", "ios"] as PlatformSlug[]) {
    if (platforms.includes(p) && primary.length < 4) primary.push(p);
  }
  if (!primary.length) primary.push(platforms[0]);

  return primary.map((platform) => {
    const device = deviceForPlatform(platform);
    return {
      platform,
      label: PLATFORM_MAP[platform]?.name ?? platform,
      input: device,
      objective: OBJECTIVES[family],
      controls: controlsFor(device, family),
      modes: PLATFORM_MODE_LABELS[platform] ?? ["Standard controls"],
      beginnerGuide: seededSample(slug, guide, 6, `guide-${platform}`),
      tips: seededSample(slug, guide, 3, `tips-${platform}`),
      advanced: seededSample(slug, advanced, 3, `adv-${platform}`).map((t) =>
        fillTemplate(t, vars),
      ),
    };
  });
}



