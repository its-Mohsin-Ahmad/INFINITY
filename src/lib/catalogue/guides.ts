import type { GenreSlug, PlatformSlug } from "@/lib/types";

/* ===========================================================================
 * How-to-play pools
 * ---------------------------------------------------------------------------
 * A "family" is a cluster of genres that share control logic. Every generated
 * guide is composed from the family steps plus the game's own metadata, so the
 * instructions on a game page always describe that game's loop.
 * ======================================================================== */

export type PlayFamily =
  | "shooter"
  | "brawler"
  | "racing"
  | "sports"
  | "strategy"
  | "simulation"
  | "openworld"
  | "survival"
  | "horror"
  | "party"
  | "fighting"
  | "general";

export function playFamilyOf(genres: string[]): PlayFamily {
  const g = new Set(genres);
  if (g.has("fps") || g.has("tps") || g.has("battle-royale")) return "shooter";
  if (g.has("fighting")) return "fighting";
  if (g.has("racing")) return "racing";
  if (g.has("sports")) return "sports";
  if (g.has("strategy")) return "strategy";
  if (g.has("simulation")) return "simulation";
  if (g.has("mmorpg") || g.has("open-world") || g.has("sandbox")) return "openworld";
  if (g.has("survival")) return "survival";
  if (g.has("horror")) return "horror";
  if (g.has("family") || g.has("co-op") || g.has("multiplayer")) return "party";
  if (g.has("action") || g.has("adventure") || g.has("rpg")) return "brawler";
  return "general";
}

/** What the player is actually trying to achieve, per family. */
export const OBJECTIVES: Record<PlayFamily, string> = {
  shooter:
    "Hold angles, manage ammunition and convert map control into an objective rather than a body count.",
  brawler:
    "Chain offence and defence mid-combat, reading enemy tells before committing to a heavy attack.",
  racing:
    "Find consistent lap time through braking discipline and clean exits, then use it where overtaking is possible.",
  sports:
    "Control tempo, keep shape and take the highest-percentage option available in each phase of play.",
  strategy: "Convert economy into tempo, then commit to an attack only when the intelligence supports it.",
  simulation: "Balance throughput against cost, and expand only as fast as logistics can sustain.",
  openworld: "Set your own route through a living map, treating exploration itself as progression.",
  survival: "Establish shelter and a resource loop before pushing into higher-risk regions.",
  horror: "Manage light, noise and inventory so that every encounter is one you chose to pick.",
  party: "Keep the group laughing while quietly engineering the round-ending play.",
  fighting: "Control spacing and frame advantage, then punish predictable behaviour with a full combo.",
  general: "Read the systems the game presents, then specialise once the core loop makes sense.",
};

/** Beginner guide steps, selected per family. */
export const GUIDE_STEPS: Record<PlayFamily, string[]> = {
  shooter: [
    "Complete the opening training range so sensitivity and field of view are locked in before matchmaking.",
    "Pick one weapon class and stay with it for your first ten matches so recoil becomes muscle memory.",
    "Practise hip-fire versus aim-down-sights at three distances: close, mid and long.",
    "Learn two maps by concentrating on one objective route rather than roaming the whole layout.",
    "Use audio cues — footsteps, reloads and ability calls — to pre-aim before contact.",
    "Play the objective. Kills create space, but objective progress wins matches.",
    "Rebind grenade, melee and ping to inputs you can reach without releasing movement.",
    "Review one lost match per session and identify the single decision that cost the round.",
  ],
  brawler: [
    "Start on standard difficulty and use early encounters to learn the dodge window rather than trading hits.",
    "Unlock the first tier of the skill tree and commit to one damage path instead of spreading points.",
    "Practise cancelling heavy attacks into a dodge until the timing feels automatic.",
    "Upgrade one weapon fully before buying a second; scaling beats variety early on.",
    "Use the environment — ledges, hazards and choke points — to control multi-enemy fights.",
    "Learn which attacks are unblockable; those are the ones you must dodge, not parry.",
    "Keep a ranged or throwable option for enemies that punish pure melee aggression.",
    "Set aside time for optional challenges: they usually unlock the strongest tools in the game.",
  ],
  racing: [
    "Turn off driving assists one at a time, starting with automatic braking, then traction control.",
    "Drive a single car for ten laps on a single circuit before changing either variable.",
    "Brake in a straight line, then release and turn — trail braking comes later.",
    "Use the ghost of your fastest lap to compare entry speed rather than exit speed.",
    "Adjust tyre pressures before aero; grip is worth more than top speed for consistency.",
    "Race shorter events first so mistakes cost fewer laps.",
    "Watch replays from the chase camera to spot where time is lost under braking.",
    "Once lap times stabilise, add fuel and tyre strategy to your planning.",
  ],
  sports: [
    "Play the training drills before your first competitive match so the timing windows are clear.",
    "Choose a formation or tactic that matches how you actually play, not the most popular preset.",
    "Use the simpler difficulty for one full season to learn the systems without heavy punishment.",
    "Master one skill move or set-piece routine and use it until it becomes automatic.",
    "Rotate your squad deliberately; stamina and form matter more than raw ratings.",
    "Study the match stats after each game — possession and pass completion tell the story.",
    "Adjust sliders gradually, one value per match, to find your preferred balance.",
    "Move online once the fundamentals feel routine, and expect the pace to jump.",
  ],
  strategy: [
    "Play the tutorial campaign, then restart on a higher difficulty once you understand the economy.",
    "Scout before committing — information is cheaper than armies.",
    "Build a stable economy first; early aggression only works if losses can be replaced.",
    "Group units by role and bind them to control groups you can reach quickly.",
    "Hold terrain that compounds value: resources, chokepoints and supply routes.",
    "Save before major offensives so you can experiment with different approaches.",
    "Read the opponent's composition and counter it rather than out-producing it.",
    "Use the speed controls — pausing and fast-forwarding is part of the toolkit.",
  ],
  simulation: [
    "Start in sandbox or creative mode to learn the building and automation tools without pressure.",
    "Set up the first resource chain end to end before adding a second.",
    "Watch the analytics panels to find the bottleneck rather than expanding everything at once.",
    "Use blueprints for anything you will build more than twice.",
    "Keep spare capacity in power, storage and transport so growth is never gated by infrastructure.",
    "Save often, and label saves before large redesigns.",
    "Play one long session with a single goal in mind; simulation games reward clear objectives.",
    "Once the basics are automatic, increase demand and see which system fails first.",
  ],
  openworld: [
    "Follow the main path for the first few hours — it usually unlocks key traversal or ability upgrades.",
    "Clear nearby points of interest before moving to a new region so fast travel is always covered.",
    "Upgrade inventory or carrying capacity early; it compounds for the entire game.",
    "Talk to every named NPC once. Many open side quests and reward chains.",
    "Use map markers to note places you cannot access yet.",
    "Save before entering unknown territory; open worlds punish overconfidence late at night.",
    "Mix quest types to avoid fatigue: a main mission, a side story, then free exploration.",
    "Return to earlier regions once abilities open up — gated content is often the best content.",
  ],
  survival: [
    "Prioritise food, water and shelter in the first hour; everything else is optional.",
    "Craft the basic tool set before exploring further than you can walk back.",
    "Build a small base near resources but away from high-traffic enemy paths.",
    "Store duplicate resources — the inventory you lose on death is the one that hurts.",
    "Track day-night and weather cycles; both change which threats are active.",
    "Bring a dedicated combat loadout when gathering, and a gathering loadout when fighting.",
    "Play with one friend early; co-op scales difficulty but doubles carrying capacity.",
    "Do not fight every fight. Running is a valid response to a bad engagement.",
  ],
  horror: [
    "Play with headphones. Spatial audio is the primary information channel in this game.",
    "Check every room for resources, but never linger once you have what you need.",
    "Learn the safe room locations and treat them as planning points, not just save points.",
    "Conserve ammunition by disabling or avoiding enemies where the layout allows.",
    "Keep your inventory light enough to pick up anything you find.",
    "Note where threats patrol; routes that were dangerous early often become quiet later.",
    "Set brightness deliberately — too dark hides mechanics, too bright kills the atmosphere.",
    "Take breaks. Tension degrades decision-making faster than it degrades the game.",
  ],
  party: [
    "Play the tutorial stage with everyone in the room so nobody is learning alone.",
    "Assign roles based on what each player enjoys, not on who is objectively best.",
    "Use voice or proximity chat — these games are built on communication.",
    "Try one full round with default rules before adding modifiers.",
    "If someone is struggling, hand them the support role; it is usually the most valuable one.",
    "Keep sessions to ninety minutes or less; comedy has diminishing returns.",
    "Rotate hosts so everyone keeps their progression.",
    "Screenshot the results screen. You will want them later.",
  ],
  fighting: [
    "Complete the tutorial and the character-specific combo trials before ranked.",
    "Learn one character's normals, one anti-air and one reliable punish.",
    "Practise blocking low attacks on reaction, then add delayed tech.",
    "Use training mode's frame data display to check whether moves are safe on block.",
    "Play long sets rather than first-to-one; adaptation is the real skill.",
    "Watch your own replays and count how often you press a button while minus.",
    "Set a ranked goal per session and stop when you hit it, win or lose.",
    "Learn the matchup for the character you lose to most before learning a new fighter.",
  ],
  general: [
    "Play the introduction and check the settings menu before starting; most options are best set early.",
    "Keep notes for the first few hours — systems-heavy games reward a little bookkeeping.",
    "Finish the first act on default difficulty before experimenting with modifiers.",
    "Upgrade along one clear path rather than spreading investment evenly.",
    "Use every tool the game gives you at least once, even the ones that look situational.",
    "Save frequently and rotate save slots before major decisions.",
    "Check the accessibility options; several are quality-of-life improvements for every player.",
    "Once comfortable, raise the difficulty a tier — most of these games are balanced above default.",
  ],
};

/** Advanced techniques, per family. */
export const ADVANCED_TIPS: Record<PlayFamily, string[]> = {
  shooter: [
    "Pre-aim common angles while strafing so the crosshair arrives before the target does.",
    "Keep two-second peek discipline: never re-peek the same angle the same way twice.",
    "Call ability cooldowns out loud in a squad — tempo decisions follow from them.",
  ],
  brawler: [
    "Use animation cancels to shave frames off heavy attacks.",
    "Learn the enemy poise thresholds so you know exactly which hit staggers.",
    "Bait an attack, dodge through it, then punish with your highest-damage combo.",
  ],
  racing: [
    "Trail brake into the apex and open the wheel as you add throttle out.",
    "Use engine braking instead of the pedal for stability in high-speed corners.",
    "Short-shift on corner exits to hold traction and cut wheelspin.",
  ],
  sports: [
    "Use player instructions to overload one flank before switching the point of attack.",
    "Learn the finesse-finishing timing window; it scales far better than power.",
    "Manage substitutions by stamina curve rather than by overall rating.",
  ],
  strategy: [
    "Deny vision rather than gaining it — removing enemy intelligence beats adding your own.",
    "Raid economy lines instead of fighting the main army head-on.",
    "Stagger production so reinforcements arrive in waves, not a trickle.",
  ],
  simulation: [
    "Design for the failure case first: what happens when one link in the chain breaks?",
    "Solve throughput with priorities and routing, not with more buildings.",
    "Overprovision power and storage, then tune down — it is cheaper than rebuilding.",
  ],
  openworld: [
    "Route exploration in loops so each session ends near a fast-travel point.",
    "Stack buffs and consumables before long expeditions rather than during them.",
    "Save large side-quest chains for after the main story so the world still feels alive.",
  ],
  survival: [
    "Build redundant forward bases so a single death never costs a full day.",
    "Farm at the edge of your comfort zone — it is the fastest progression in the genre.",
    "Use traps and terrain instead of ammunition wherever possible.",
  ],
  horror: [
    "Manipulate AI pathing with thrown noise to clear routes instead of fighting through them.",
    "Track resource spawn logic and time your return visits accordingly.",
    "Keep one high-damage option in reserve for a threat you cannot avoid.",
  ],
  party: [
    "Engineer the round-ending play two rounds in advance.",
    "Communicate in three calls only: position, intent, danger.",
    "Save the funny-but-useless option for a round you are already winning.",
  ],
  fighting: [
    "Practise hit-confirms so you only commit to supers on contact.",
    "Spend meter on guaranteed damage rather than speculative reversals.",
    "Study your opponent's wake-up habits in round one, then exploit them in round two.",
  ],
  general: [
    "Re-read the tooltips after ten hours; they mean something different once you know the systems.",
    "Speedrun a section to learn its layout without the fear of failure.",
    "Join a community group — shared knowledge compresses the learning curve sharply.",
  ],
};

/** Platform capability labels shown on the game page's how-to-play tab. */
export const PLATFORM_MODE_LABELS: Record<PlatformSlug, string[]> = {
  pc: ["Keyboard & mouse", "Controller", "Ultrawide", "Cloud save"],
  ps5: ["DualSense haptics", "Adaptive triggers", "Activity cards", "Cloud save"],
  ps4: ["DualShock 4", "Share Play", "Cloud save", "Remote Play"],
  "xbox-series": ["Quick Resume", "Smart Delivery", "120Hz mode", "Cloud save"],
  "xbox-one": ["Controller", "Cloud save", "Achievements", "Remote Play"],
  switch: ["Handheld mode", "Docked mode", "Local wireless", "Cloud save"],
  android: ["Touch controls", "Controller support", "Cloud save", "Offline mode"],
  ios: ["Touch controls", "Controller support", "Cloud save", "Offline mode"],
};

/** Human readable genre adjectives used inside composed copy. */
export const GENRE_LABEL: Record<string, string> = {
  action: "action",
  adventure: "adventure",
  rpg: "role-playing",
  "open-world": "open-world",
  fps: "first-person shooter",
  tps: "third-person action",
  racing: "racing",
  sports: "sports",
  strategy: "strategy",
  simulation: "simulation",
  horror: "horror",
  survival: "survival",
  fighting: "fighting",
  "battle-royale": "battle royale",
  mmorpg: "massively multiplayer",
  sandbox: "sandbox",
  puzzle: "puzzle",
  "co-op": "co-operative",
  multiplayer: "multiplayer",
  story: "story-driven",
  indie: "independent",
  family: "family-friendly",
};

export const MODE_LABEL: Record<string, string> = {
  "single-player": "Single-player",
  multiplayer: "Multiplayer",
  "co-op": "Co-op",
  "online-pvp": "Online PvP",
  "online-coop": "Online co-op",
  "local-coop": "Local co-op",
  campaign: "Campaign",
  sandbox: "Sandbox",
  ranked: "Ranked",
  "cross-platform": "Cross-platform",
};

/** Canonical genre order used when expanding a record into a Game. */
export const GENRE_LIST: GenreSlug[] = [
  "action",
  "adventure",
  "rpg",
  "open-world",
  "fps",
  "tps",
  "racing",
  "sports",
  "strategy",
  "simulation",
  "horror",
  "survival",
  "fighting",
  "battle-royale",
  "mmorpg",
  "sandbox",
  "puzzle",
  "co-op",
  "multiplayer",
  "story",
  "indie",
  "family",
];


