import type { Genre, GenreSlug, Platform, PlatformSlug } from "@/lib/types";

/**
 * Genre taxonomy — 22 top-level lanes. Counts surfaced anywhere in the UI are
 * always computed from the live catalogue, never hard-coded.
 */
export const GENRES: Genre[] = [
  { slug: "action", name: "Action", blurb: "Reflex-driven combat, set pieces and relentless momentum.", hue: 356, icon: "Swords" },
  { slug: "adventure", name: "Adventure", blurb: "Exploration, puzzles and story-first journeys.", hue: 205, icon: "Compass" },
  { slug: "rpg", name: "RPG", blurb: "Deep progression, character builds and player choice.", hue: 268, icon: "Shield" },
  { slug: "open-world", name: "Open World", blurb: "Seamless sandboxes where the map is the main character.", hue: 158, icon: "Map" },
  { slug: "fps", name: "FPS", blurb: "First-person gunplay, from tactical to arcade.", hue: 12, icon: "Crosshair" },
  { slug: "tps", name: "Third Person", blurb: "Over-the-shoulder action, cover shooting and melee.", hue: 28, icon: "Target" },
  { slug: "racing", name: "Racing", blurb: "Circuit, arcade and sim racing at every tier.", hue: 45, icon: "Flag" },
  { slug: "sports", name: "Sports", blurb: "Football, basketball, cricket, combat sports and more.", hue: 130, icon: "Trophy" },
  { slug: "strategy", name: "Strategy", blurb: "RTS, 4X and tactics built on planning and tempo.", hue: 190, icon: "Castle" },
  { slug: "simulation", name: "Simulation", blurb: "Systems, cities, farms, vehicles and life sims.", hue: 96, icon: "Tractor" },
  { slug: "horror", name: "Horror", blurb: "Survival horror, psychological dread and co-op fear.", hue: 300, icon: "Ghost" },
  { slug: "survival", name: "Survival", blurb: "Craft, scavenge, build and outlast the environment.", hue: 78, icon: "Flame" },
  { slug: "fighting", name: "Fighting", blurb: "Frame-perfect combat, rosters and ranked ladders.", hue: 330, icon: "Fist" },
  { slug: "battle-royale", name: "Battle Royale", blurb: "Last-one-standing modes and drop-in lobbies.", hue: 24, icon: "Users" },
  { slug: "mmorpg", name: "MMORPG", blurb: "Persistent worlds, raids and living economies.", hue: 240, icon: "Globe" },
  { slug: "sandbox", name: "Sandbox", blurb: "Creative tools where players author the content.", hue: 172, icon: "Boxes" },
  { slug: "puzzle", name: "Puzzle", blurb: "Logic, physics and brain-bending mechanics.", hue: 216, icon: "Puzzle" },
  { slug: "co-op", name: "Co-op", blurb: "Built for squads — split-screen and online.", hue: 340, icon: "Handshake" },
  { slug: "multiplayer", name: "Multiplayer", blurb: "Competitive and social online ecosystems.", hue: 6, icon: "Radio" },
  { slug: "story", name: "Story Rich", blurb: "Narrative craft, performance capture and writing.", hue: 250, icon: "BookOpen" },
  { slug: "indie", name: "Indie", blurb: "Studio-scale experiments with outsized ideas.", hue: 284, icon: "Sparkles" },
  { slug: "family", name: "Family", blurb: "Couch co-op and all-ages adventures.", hue: 52, icon: "Home" },
];

export const GENRE_MAP: Record<string, Genre> = Object.fromEntries(
  GENRES.map((g) => [g.slug, g]),
);

export function genreName(slug: string): string {
  return GENRE_MAP[slug]?.name ?? slug;
}

export function genreHue(slug: string): number {
  return GENRE_MAP[slug]?.hue ?? 356;
}

/**
 * Sub-genre lanes. These are what let INFINITY surface 50+ distinct browsing
 * lanes (22 primary genres + 32 specialisations) from a single catalogue.
 */
export const SUBGENRES: { slug: string; name: string; lane: GenreSlug }[] = [
  { slug: "heist", name: "Heist", lane: "action" },
  { slug: "stealth", name: "Stealth", lane: "action" },
  { slug: "hack-and-slash", name: "Hack & Slash", lane: "action" },
  { slug: "beat-em-up", name: "Beat 'em Up", lane: "action" },
  { slug: "soulslike", name: "Soulslike", lane: "rpg" },
  { slug: "action-rpg", name: "Action RPG", lane: "rpg" },
  { slug: "turn-based-rpg", name: "Turn-Based RPG", lane: "rpg" },
  { slug: "tactical-rpg", name: "Tactical RPG", lane: "strategy" },
  { slug: "looter-shooter", name: "Looter Shooter", lane: "fps" },
  { slug: "tactical-shooter", name: "Tactical Shooter", lane: "fps" },
  { slug: "hero-shooter", name: "Hero Shooter", lane: "fps" },
  { slug: "extraction", name: "Extraction", lane: "fps" },
  { slug: "military", name: "Military", lane: "fps" },
  { slug: "cover-shooter", name: "Cover Shooter", lane: "tps" },
  { slug: "metroidvania", name: "Metroidvania", lane: "adventure" },
  { slug: "visual-novel", name: "Visual Novel", lane: "story" },
  { slug: "walking-sim", name: "Narrative Adventure", lane: "story" },
  { slug: "detective", name: "Detective", lane: "story" },
  { slug: "roguelike", name: "Roguelike", lane: "indie" },
  { slug: "roguelite", name: "Roguelite", lane: "indie" },
  { slug: "deckbuilder", name: "Deckbuilder", lane: "strategy" },
  { slug: "tower-defense", name: "Tower Defense", lane: "strategy" },
  { slug: "moba", name: "MOBA", lane: "multiplayer" },
  { slug: "hero-brawler", name: "Hero Brawler", lane: "multiplayer" },
  { slug: "arena-shooter", name: "Arena Shooter", lane: "fps" },
  { slug: "bullet-hell", name: "Bullet Hell", lane: "indie" },
  { slug: "city-builder", name: "City Builder", lane: "simulation" },
  { slug: "farming-sim", name: "Farming Sim", lane: "simulation" },
  { slug: "space-sim", name: "Space Sim", lane: "simulation" },
  { slug: "flight-sim", name: "Flight Sim", lane: "simulation" },
  { slug: "life-sim", name: "Life Sim", lane: "simulation" },
  { slug: "management", name: "Management", lane: "simulation" },
  { slug: "crafting", name: "Crafting", lane: "survival" },
  { slug: "milsim", name: "Military Sim", lane: "strategy" },
  { slug: "4x", name: "4X", lane: "strategy" },
  { slug: "rts", name: "Real-Time Strategy", lane: "strategy" },
  { slug: "arcade-racing", name: "Arcade Racing", lane: "racing" },
  { slug: "sim-racing", name: "Sim Racing", lane: "racing" },
  { slug: "kart", name: "Kart Racing", lane: "racing" },
  { slug: "football", name: "Football", lane: "sports" },
  { slug: "basketball", name: "Basketball", lane: "sports" },
  { slug: "cricket", name: "Cricket", lane: "sports" },
  { slug: "wrestling", name: "Wrestling", lane: "sports" },
  { slug: "golf", name: "Golf", lane: "sports" },
  { slug: "mma", name: "Combat Sports", lane: "sports" },
  { slug: "survival-horror", name: "Survival Horror", lane: "horror" },
  { slug: "psychological-horror", name: "Psychological Horror", lane: "horror" },
  { slug: "creature-feature", name: "Monster Hunt", lane: "horror" },
  { slug: "platformer", name: "Platformer", lane: "family" },
  { slug: "party", name: "Party", lane: "family" },
  { slug: "hidden-object", name: "Hidden Object", lane: "puzzle" },
  { slug: "physics-puzzle", name: "Physics Puzzle", lane: "puzzle" },
  { slug: "escape-room", name: "Escape Room", lane: "puzzle" },
  { slug: "rhythm", name: "Rhythm", lane: "family" },
  { slug: "sandbox-craft", name: "Sandbox Craft", lane: "sandbox" },
  { slug: "space-rpg", name: "Space RPG", lane: "mmorpg" },
  { slug: "pirate", name: "Naval", lane: "open-world" },
  { slug: "post-apocalyptic", name: "Post-Apocalyptic", lane: "survival" },
  { slug: "cyberpunk", name: "Cyberpunk", lane: "rpg" },
  { slug: "fantasy", name: "Fantasy", lane: "rpg" },
  { slug: "superhero", name: "Superhero", lane: "action" },
  { slug: "historical", name: "Historical", lane: "strategy" },
  { slug: "sci-fi", name: "Sci-Fi", lane: "action" },
  { slug: "mystery", name: "Mystery", lane: "story" },
  { slug: "idle", name: "Idle", lane: "indie" },
  { slug: "card-battler", name: "Card Battler", lane: "strategy" },
  { slug: "board-game", name: "Tabletop", lane: "strategy" },
];

export const SUBGENRE_MAP: Record<string, { slug: string; name: string; lane: GenreSlug }> =
  Object.fromEntries(SUBGENRES.map((s) => [s.slug, s]));

export function subgenreName(slug: string): string {
  return SUBGENRE_MAP[slug]?.name ?? slug;
}

/** Total distinct browsing lanes = primary genres + sub-genres (50+). */
export const TOTAL_GENRE_LANES = GENRES.length + SUBGENRES.length;

/**
 * Platform taxonomy — the 8 storefronts / hardware lanes tracked by INFINITY.
 */
export const PLATFORMS: Platform[] = [
  {
    slug: "pc",
    name: "PC / Windows",
    shortName: "PC",
    family: "pc",
    manufacturer: "Microsoft DirectX",
    generation: "Continuous",
    launched: "1993",
    blurb: "Ultrawide, high refresh, mod-friendly. The broadest catalogue on INFINITY.",
    accent: "#38BDF8",
  },
  {
    slug: "ps5",
    name: "PlayStation 5",
    shortName: "PS5",
    family: "playstation",
    manufacturer: "Sony",
    generation: "9th",
    launched: "2020",
    blurb: "Haptic triggers, near-instant loads and 4K performance modes.",
    accent: "#4E7CFF",
  },
  {
    slug: "ps4",
    name: "PlayStation 4",
    shortName: "PS4",
    family: "playstation",
    manufacturer: "Sony",
    generation: "8th",
    launched: "2013",
    blurb: "The largest install base of the last generation, still shipping hits.",
    accent: "#3B5FD9",
  },
  {
    slug: "xbox-series",
    name: "Xbox Series X|S",
    shortName: "Xbox X|S",
    family: "xbox",
    manufacturer: "Microsoft",
    generation: "9th",
    launched: "2020",
    blurb: "Quick Resume, Smart Delivery and 120Hz support across the line-up.",
    accent: "#33D17A",
  },
  {
    slug: "xbox-one",
    name: "Xbox One",
    shortName: "Xbox One",
    family: "xbox",
    manufacturer: "Microsoft",
    generation: "8th",
    launched: "2013",
    blurb: "Back-catalogue depth with Game Pass parity across generations.",
    accent: "#2AA35F",
  },
  {
    slug: "switch",
    name: "Nintendo Switch",
    shortName: "Switch",
    family: "nintendo",
    manufacturer: "Nintendo",
    generation: "8th / hybrid",
    launched: "2017",
    blurb: "Handheld-first design built for family and local co-op play.",
    accent: "#FF5A5F",
  },
  {
    slug: "android",
    name: "Android",
    shortName: "Android",
    family: "mobile",
    manufacturer: "Open ecosystem",
    generation: "Continuous",
    launched: "2008",
    blurb: "Touch and controller-native mobile catalogue with cross-save.",
    accent: "#7BD46A",
  },
  {
    slug: "ios",
    name: "iOS / iPadOS",
    shortName: "iOS",
    family: "mobile",
    manufacturer: "Apple",
    generation: "Continuous",
    launched: "2008",
    blurb: "Premium mobile experiences tuned for Metal and Apple silicon.",
    accent: "#C7CBD1",
  },
];

export const PLATFORM_MAP: Record<string, Platform> = Object.fromEntries(
  PLATFORMS.map((p) => [p.slug, p]),
);

export const PLATFORM_FAMILIES: { slug: string; name: string; platforms: PlatformSlug[] }[] = [
  { slug: "pc", name: "PC", platforms: ["pc"] },
  { slug: "playstation", name: "PlayStation", platforms: ["ps5", "ps4"] },
  { slug: "xbox", name: "Xbox", platforms: ["xbox-series", "xbox-one"] },
  { slug: "nintendo", name: "Nintendo", platforms: ["switch"] },
  { slug: "mobile", name: "Mobile", platforms: ["android", "ios"] },
];

export function platformName(slug: string): string {
  return PLATFORM_MAP[slug]?.name ?? slug;
}

export function platformShort(slug: string): string {
  return PLATFORM_MAP[slug]?.shortName ?? slug.toUpperCase();
}

export const GENRE_SLUGS = GENRES.map((g) => g.slug) as GenreSlug[];
export const PLATFORM_SLUGS = PLATFORMS.map((p) => p.slug) as PlatformSlug[];

