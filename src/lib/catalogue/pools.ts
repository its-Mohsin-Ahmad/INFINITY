import type { GenreSlug } from "@/lib/types";

/* ===========================================================================
 * Catalogue content pools
 * ---------------------------------------------------------------------------
 * Everything in this file is original INFINITY copy. These pools are combined
 * with per-game metadata (title, studio, genre, sub-genre, modes, year) to
 * compose unique editorial content for every title in the catalogue. Nothing
 * here references or reproduces third-party marketing text.
 * ======================================================================== */

/** Supported languages, ordered so slices stay realistic. */
export const LANGUAGES = [
  "English",
  "French",
  "Italian",
  "German",
  "Spanish (Spain)",
  "Spanish (Latin America)",
  "Portuguese (Brazil)",
  "Portuguese (Portugal)",
  "Polish",
  "Russian",
  "Turkish",
  "Arabic",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Czech",
  "Hungarian",
  "Greek",
  "Ukrainian",
  "Romanian",
  "Japanese",
  "Korean",
  "Simplified Chinese",
  "Traditional Chinese",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Hindi",
];

/** Per-genre feature bullets, used to build the Features tab. */
export const GENRE_FEATURES: Record<GenreSlug, string[]> = {
  action: [
    "Weighty melee and firearm combat with animation-driven hit reactions",
    "Escalating set pieces that always hand control back to the player",
    "Ability progression that reshapes how encounters are approached",
    "Boss encounters built around readable tells and punish windows",
    "Photo mode with depth-of-field, focal length and filter controls",
    "Adaptive difficulty that scales aggression, not enemy health",
  ],
  adventure: [
    "Environment-driven storytelling with no cut-scene interruptions",
    "Interconnected level design that rewards curiosity",
    "Optional lore collectibles that fill in the world's history",
    "Puzzle systems that combine two or more mechanics at once",
    "Companion and dialogue systems with branching responses",
    "Accessibility suite covering navigation, timing and colour",
  ],
  rpg: [
    "Deep build crafting across skill trees, gear stats and passives",
    "Dialogue choices that persist long after the conversation ends",
    "Companion arcs with approval states and unique questlines",
    "Endgame progression with ascending difficulty tiers",
    "Crafting, enchanting and upgrade loops tied to exploration",
    "Hand-authored side quests with consequences beyond the reward",
  ],
  "open-world": [
    "Seamless traversal with no loading transitions between regions",
    "A living map of dynamic events, convoys and emergent encounters",
    "Discovery-led design — landmarks are the map marker",
    "Distinct biomes with their own wildlife, weather and factions",
    "Cinematic camera and photo mode for capture enthusiasts",
    "Fast travel that unlocks only once a zone has been explored",
  ],
  fps: [
    "Gunplay tuned for controller and mouse alike, with no aim-assist tax",
    "Weapon sandbox with distinct recoil, handling and TTK per class",
    "Custom loadouts with attachment-level trade-offs",
    "Destruction and bullet penetration modelled on real materials",
    "Full-spectrum audio with occlusion and distance falloff",
    "Sensitivity, FOV and controller response fully configurable",
  ],
  tps: [
    "Cover-driven combat with contextual vaults, slides and dodges",
    "Camera tuned for both close-range melee and long-range shooting",
    "Squad and companion commands on a dedicated radial",
    "Gear progression that changes the visual loadout as well as stats",
    "Cinematic camera work that never takes control away",
    "Photo mode with pose, lens and lighting controls",
  ],
  racing: [
    "Handling model with per-surface grip and tyre wear simulation",
    "Tuning suite for gear ratios, suspension, camber and aero",
    "Rewind, ghost and rival-lap systems for repeat attempts",
    "Dynamic time of day and weather across the full calendar",
    "Replay tooling with camera rigs and telemetry overlays",
    "Ranked racing with licences and a clean-driving rating",
  ],
  sports: [
    "Licensed clubs, athletes and authentic competition structures",
    "Skill-based timing mechanics that separate the ranks",
    "A full career mode with transfers, training and press duties",
    "Online seasons with promotion and relegation ladders",
    "Configurable tactics, formations and set-piece routines",
    "Broadcast-quality presentation with commentary packages",
  ],
  strategy: [
    "Fog-of-war intelligence, scouting and counter-scouting",
    "Multi-layered economy, logistics and supply modelling",
    "Doctrines and tech trees with genuine opportunity costs",
    "Terrain, elevation and line-of-sight driven combat maths",
    "AI opponents that commit to strategies, not scripted pushes",
    "Mod support with exposed data files and tooling",
  ],
  simulation: [
    "Interlocking systems where every resource has a supply chain",
    "Simulation depth with difficulty modifiers and sandbox toggles",
    "Detailed statistics and analytics dashboards",
    "Blueprint, layout and automation tooling",
    "Dynamic events and disasters that force replanning",
    "Long-tail progression measured in hundreds of hours",
  ],
  horror: [
    "Sound design that prioritises spatial cues over cheap jumps",
    "Finite resources that make every decision count",
    "Persistent threats that learn and reposition",
    "Sanity, light and stamina systems that raise tension",
    "Multiple endings driven by in-run choices",
    "Optional one-life mode for the committed",
  ],
  survival: [
    "Crafting trees spanning tools, shelter, medicine and vehicles",
    "Environmental threats ranging from weather to predators",
    "Base building with structural and defensive layers",
    "Deep inventory and weight management",
    "Day-night and seasonal cycles that change what is available",
    "Co-op scaling that keeps the challenge intact for a full squad",
  ],
  fighting: [
    "Rollback netcode with region-aware matchmaking",
    "Frame data and training tools built into the client",
    "Tutorial and combo challenges for every character archetype",
    "Ranked ladders with per-character rating",
    "Extensive customisation across outfits and colour channels",
    "Full story mode with hand-animated cinematics",
  ],
  "battle-royale": [
    "Large-scale matches with drop-in, respawn and revival systems",
    "Seasonal content drops with map, weapon and mode rotations",
    "Squad play with pings, comms and role specialisation",
    "Ranked progression with placement matches and decay",
    "Cosmetics-only monetisation for competitive modes",
    "Cross-play with input-based matchmaking pools",
  ],
  mmorpg: [
    "Persistent world with a genuinely player-driven economy",
    "Group content from small dungeons to large-format raids",
    "Deep character progression with respec flexibility",
    "Faction, guild and territory systems with real stakes",
    "Seasonal story arcs with full voice performance",
    "Social tooling — emotes, housing, guild halls and banks",
  ],
  sandbox: [
    "Creative tools with sharing and remix support",
    "Logic, wiring and scripting systems for advanced creators",
    "Moderation and reporting tooling for shared spaces",
    "Progression-free play where creativity is the reward",
    "Cross-platform worlds with host controls",
    "Community showcase feeds and featured builds",
  ],
  puzzle: [
    "Mechanics introduced one at a time, then combined",
    "Zero-fail design that keeps the emphasis on thinking",
    "Hint system that escalates without giving the answer away",
    "Colour-blind safe palette and audio cue alternatives",
    "Leaderboards, ghosts and speedrun timers",
    "Level editor with sharing and curated picks",
  ],
  "co-op": [
    "Designed from the ground up for two to four players",
    "Asymmetric roles that demand genuine coordination",
    "Friends Pass access so a squad only needs one copy",
    "Drop-in and drop-out with join-in-progress checkpoints",
    "Proximity voice with optional speech-to-text",
    "Difficulty that scales with player count",
  ],
  multiplayer: [
    "Dedicated server architecture with a 60Hz+ tick rate",
    "Skill-based matchmaking with transparent rating tiers",
    "Seasonal progression with challenges and rewards",
    "Anti-cheat, reporting and spectator review tooling",
    "Cross-platform parties and shared progression",
    "Full stat tracking with match history and replays",
  ],
  story: [
    "Performance-captured dialogue with a full ensemble cast",
    "Choice systems that alter relationships, not only endings",
    "Environmental storytelling layered into every set",
    "Director commentary and behind-the-scenes features",
    "Narrative difficulty options for combat-averse players",
    "Chapter select and scene replay after completion",
  ],
  indie: [
    "Hand-crafted art direction with a signature visual identity",
    "Tight, focused runtime built around one strong idea",
    "Original score with adaptive audio systems",
    "Regular post-launch updates funded by the community",
    "Full controller and Steam Deck verification",
    "Accessibility options shipped on day one",
  ],
  family: [
    "Local split-screen and pass-and-play support",
    "Simple onboarding that teaches without tutorials",
    "Family-friendly audio and avatar customisation",
    "Cross-generation play across living-room platforms",
    "Generous checkpointing for younger players",
    "Assist modes that any player in the room can enable",
  ],
};

/** Fallback bullets used to guarantee depth on very narrow records. */
export const FALLBACK_FEATURES = [
  "Regular balance and quality-of-life updates from the studio",
  "Full remapping for keyboard, controller and accessibility devices",
  "Subtitles, colour-blind palettes and adjustable camera shake",
  "Localised interface with multiple voice-over options",
  "Cloud saves with cross-device continuation",
  "Performance and quality modes on current-generation hardware",
  "Photo, replay or capture tooling built in",
  "Long-tail progression with completion tracking per activity",
];

/** Extra feature bullets unlocked by a game's sub-genre tags. */
export const SUBGENRE_FEATURES: Record<string, string[]> = {
  heist: [
    "Multi-stage operations with planning, infiltration and escape",
    "Loud or quiet approaches with different payouts",
  ],
  soulslike: [
    "Stamina-driven combat with precise dodge timing",
    "Lost-currency retrieval and shortcut-driven level design",
  ],
  roguelike: [
    "Procedurally arranged runs built from hand-authored templates",
    "Meta-progression that unlocks new starting options",
  ],
  roguelite: [
    "Run-based upgrades that persist between attempts",
    "Mutators for player-authored difficulty",
  ],
  metroidvania: [
    "Ability-gated world that loops back on itself",
    "Hand-drawn map with player-placed pins",
  ],
  stealth: [
    "Detection cones, disguises and social stealth",
    "Ghost, assault and mixed approach scoring",
  ],
  "tactical-shooter": [
    "Utility-first combat where information beats raw aim",
    "Economy rounds with buy-phase decisions",
  ],
  "looter-shooter": [
    "Rarity and affix systems with endgame crafting",
    "Build-defining weapon and gear sets",
  ],
  extraction: [
    "Risk-and-reward raids where death costs your kit",
    "Player-market pricing on every extracted item",
  ],
  "hero-shooter": [
    "Distinct hero kits with hard counters",
    "Role queue and clear team-composition feedback",
  ],
  "arena-shooter": [
    "Map control, pickups and respawn economy",
    "Short match formats built for ranked play",
  ],
  "cover-shooter": [
    "Blind fire, snap cover and flank-happy AI",
    "Squad commands issued on the fly",
  ],
  "hack-and-slash": [
    "Combo chains with style-ranking feedback",
    "Mid-combo weapon and ability switching",
  ],
  "beat-em-up": [
    "Crowd-control combat with juggles and throws",
    "Co-op brawling with shared combo meters",
  ],
  "bullet-hell": [
    "Pattern reading with tight, forgiving hitboxes",
    "Ranked scoring with graze and chain mechanics",
  ],
  "turn-based-rpg": [
    "Party composition with elemental weaknesses",
    "Turn-order manipulation and status stacking",
  ],
  "action-rpg": [
    "Real-time combat with stat-driven damage maths",
    "Loot affixes that reshape entire builds",
  ],
  "tactical-rpg": [
    "Grid-based tactics with height and cover",
    "Class change and promotion systems",
  ],
  moba: [
    "Lane maps with neutral objectives and jungle rotations",
    "Draft and ban phases with role queue",
  ],
  "tower-defense": [
    "Wave planning with upgrade branching",
    "Persistent base layouts between sessions",
  ],
  "city-builder": [
    "Zoning, traffic and utility simulation at district scale",
    "Policy and taxation systems with visible effects",
  ],
  "deckbuilder": [
    "Deck construction with relic and artefact synergy",
    "Ascension-style modifiers for repeat runs",
  ],
  "card-battler": [
    "Draft, build and counter enemy archetypes",
    "Seasonal card sets with regular balance patches",
  ],
  "sim-racing": [
    "Tyre temperature and fuel-load strategy across race distance",
    "Force-feedback profiles and telemetry output",
  ],
  "arcade-racing": [
    "Boost, drift and nitro mechanics tuned for instant fun",
    "Ghost races against friends and rivals",
  ],
  kart: [
    "Power-up economy balanced for comeback racing",
    "Grand Prix cups and time-trial leaderboards",
  ],
  "survival-horror": [
    "Ammo scarcity and inventory management under pressure",
    "Safe rooms with item boxes and save stations",
  ],
  "psychological-horror": [
    "Unreliable narration and shifting environments",
    "No-combat stretches that rely on atmosphere",
  ],
  "creature-feature": [
    "Monster AI with sensory perception and stalking behaviour",
    "Creature design grounded in practical-effect horror",
  ],
  "visual-novel": [
    "Branching narrative flowcharts with skip-read text",
    "Multiple voiced routes and gallery unlocks",
  ],
  "walking-sim": [
    "Exploration-first pacing with no fail states",
    "Diegetic UI and in-world documentation",
  ],
  detective: [
    "Evidence board with deduction linking",
    "Observation and interrogation minigames",
  ],
  "sandbox-craft": [
    "Creative and survival modes with world seeds",
    "Logic, wiring and automation systems",
  ],
  "space-sim": [
    "Newtonian flight with docking and trade routes",
    "System-scale maps with orbital mechanics",
  ],
  "flight-sim": [
    "Real-world terrain with live weather injection",
    "Checklist-driven cockpit procedures",
  ],
  "farming-sim": [
    "Vehicle fleet with attachment compatibility",
    "Seasonal crop, livestock and contract loops",
  ],
  "life-sim": [
    "Needs, relationships and career simulation",
    "Build and interior design tools",
  ],
  "4x": [
    "Explore, expand, exploit and exterminate across eras",
    "Diplomacy with treaties, vassals and espionage",
  ],
  rts: [
    "Base building and unit composition in real time",
    "Control groups, hotkeys and formation orders",
  ],
  milsim: [
    "Authentic ballistics, suppression and stamina",
    "Squad-level radio orders and command hierarchy",
  ],
  historical: [
    "Historically grounded settings, equipment and tactics",
    "Archive-quality research and art direction",
  ],
  fantasy: [
    "Magic schools with distinct resource economies",
    "Bestiary of mythical species with unique behaviours",
  ],
  "sci-fi": [
    "Speculative technology with in-world justification",
    "Hardware, ship and station design language",
  ],
  cyberpunk: [
    "Augmentation systems with body-mod trade-offs",
    "Neon-drenched vertical urban environments",
  ],
  superhero: [
    "Traversal powers with city-scale freedom",
    "Dual hero and villain narrative beats",
  ],
  "post-apocalyptic": [
    "Scavenging in ruined landscapes under faction pressure",
    "Improvised gear and radiation systems",
  ],
  mystery: [
    "Clue chains that can be solved out of order",
    "Red herrings that respect player intelligence",
  ],
  "party": [
    "Four-player chaos with rubber-banded stakes",
    "Custom rules and round modifiers",
  ],
  platformer: [
    "Precision movement with coyote time and air control",
    "Collectibles and time trials per stage",
  ],
  "physics-puzzle": [
    "Systems-first puzzles with many valid solutions",
    "Sandbox levels for experimenting with mechanics",
  ],
  "escape-room": [
    "Timed cooperative puzzle chains",
    "Environmental clues that reward observation",
  ],
  rhythm: [
    "Beat-synced combat and level design",
    "Custom track support with difficulty grading",
  ],
  idle: [
    "Offline progress with meaningful return rewards",
    "Prestige loops with permanent multipliers",
  ],
  golf: [
    "Shot shaping with wind, lie and ball physics",
    "Course editor with community sharing",
  ],
  basketball: [
    "Authentic pace, spacing and playbook systems",
    "Career progression with on-court decisions",
  ],
  football: [
    "Tactical depth with roles and player instructions",
    "Squad building with chemistry and evolution",
  ],
  cricket: [
    "Ball-by-ball simulation with pitch and weather effects",
    "Full career and franchise modes",
  ],
  wrestling: [
    "Match types ranging from ladder to cage",
    "Create-a-wrestler with shareable movesets",
  ],
  mma: [
    "Strikes, clinch and ground game with stamina cost",
    "Career ladder across sanctioned promotions",
  ],
  management: [
    "Staff, morale and logistics across departments",
    "Financial modelling with real consequences",
  ],
  esports: [
    "Tournament-grade spectator tools and observer UI",
    "Official competitive rulesets and seasons",
  ],
  comedy: [
    "Comedy embedded in the systems, not only the cutscenes",
    "Player-authored comedic outcomes",
  ],
  noir: [
    "Rain-slicked city atmosphere with investigative pacing",
    "Stylised graphic-novel presentation",
  ],
};

/* ------------------------------------------------- published copy templates */

/** Opening sentence frames. One is selected per game from a stable seed. */
export const DESC_OPENERS = [
  "{title} is a {genre} experience from {dev}, built around {sub}.",
  "{dev} returns with {title}, a {genre} title that leans hard into {sub}.",
  "{title} takes the {genre} blueprint and rebuilds it around {sub}.",
  "Released in {year}, {title} is {dev}'s take on modern {genre} design with {sub} at its centre.",
  "{title} pairs {genre} systems with {sub}, and it is a stronger game for it.",
  "From {dev}, {title} is a {genre} game where {sub} drives almost every decision.",
  "{title} is what happens when {dev} commits fully to {genre} and {sub}.",
  "{dev} built {title} as a {genre} sandbox first and a showcase second, with {sub} as the spine.",
  "In {title}, {dev} uses {genre} conventions as a foundation and {sub} as the differentiator.",
  "{title} is the rare {genre} release that treats {sub} as a core mechanic rather than a bullet point.",
  "{title} marks another {genre} entry from {dev}, and {sub} is the thread that ties it together.",
  "First launched in {year}, {title} remains a reference point for {genre} design built on {sub}.",
];

/** Second sentence frames — mechanics and structure. */
export const DESC_BODY = [
  "The core loop rewards planning: scout the situation, commit resources, then adapt when the plan collapses.",
  "Session length is flexible, so a run can be fifteen minutes or a full evening without either feeling wrong.",
  "Difficulty is a dial rather than a wall — assists can be layered without ever feeling like training wheels.",
  "Systems interlock cleanly, so mastery in one area visibly improves outcomes in another.",
  "Progression is generous but earned, with new tools arriving exactly when the challenge curve demands them.",
  "The pacing alternates between tense build-up and explosive payoff, which keeps long sessions from flattening out.",
  "Every mechanic feeds the fantasy: if it looks like it should work, the simulation generally allows it.",
  "Controls are readable within minutes and deep enough that advanced players keep finding new tech.",
  "Performance scales well across hardware, with sensible presets and no pointless bloat in the settings menu.",
  "The presentation is confident — strong art direction, an adaptive score and clean, uncluttered HUD work.",
  "Post-launch support has been steady, with content drops that add rather than dilute.",
  "Accessibility is treated as a first-class feature, covering remapping, subtitles and timing tolerance.",
];

/** Closing sentence frames — reflects the game's flags and mode support. */
export const DESC_FREE_CLOSER =
  "It is free to play, with cosmetics-first monetisation rather than pay-to-win shortcuts.";
export const DESC_PREMIUM_CLOSER = "It is a premium release with no live-service grind bolted on.";
export const DESC_COMING_SOON_CLOSER =
  "It is available to wishlist on INFINITY ahead of launch, with platform pre-load details to follow.";
export const DESC_MODE_CLOSERS: Record<string, string> = {
  "single-player":
    "A full single-player campaign is included and can be finished without ever touching the online modes.",
  multiplayer: "Online play is the main event, with dedicated servers and skill-based matchmaking.",
  "co-op": "Co-op is supported end to end, including progress that stays synced for every player in the party.",
  "online-coop": "Online co-op is fully supported, with shared progression and drop-in sessions.",
  "online-pvp": "Competitive play is central, with ranked ladders and seasonal resets.",
  "local-coop": "Local split-screen co-op is supported on top of the online modes.",
  ranked: "Ranked play includes placement matches, tier decay and transparent rating changes.",
  sandbox: "Sandbox options let players reshape the rules without breaking progression.",
  campaign: "A structured campaign provides a strong ramp before the deeper systems open up.",
  "cross-platform": "Cross-platform play and cross-progression are supported across every available storefront.",
};




