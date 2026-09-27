import type { EsportsEvent, EsportsTeam, StandingsRow } from "@/lib/types";
import { seededPick } from "@/lib/generate";
import { slugInGenre } from "./resolve";

/* ===========================================================================
 * Esports â€” teams and the competitive circuit.
 * ---------------------------------------------------------------------------
 * Team `gameSlug` values resolve against the live catalogue (seeded, so the
 * same team always represents the same title). Matches, brackets and
 * standings are derived in the /esports page from these records.
 * ======================================================================== */

export const ESPORTS_TEAMS: EsportsTeam[] = [
  { id: "t-vanguard", name: "Vanguard", tag: "VNT", region: "EU", gameSlug: slugInGenre("fps", "t-vanguard"), seed: 1101, wins: 24, losses: 7, titles: 3, roster: ["Kestrel", "moth", "Rune", "sable", "Orbit"] },
  { id: "t-obsidian", name: "Obsidian Core", tag: "OBS", region: "EU", gameSlug: slugInGenre("fps", "t-obsidian"), seed: 1102, wins: 21, losses: 10, titles: 2, roster: ["Vex", "nyx", "Halcyon", "pyre", "Quill"] },
  { id: "t-royalguard", name: "Royal Guard", tag: "RYL", region: "EU", gameSlug: slugInGenre("multiplayer", "t-royalguard"), seed: 1103, wins: 19, losses: 12, titles: 1, roster: ["Aster", "corvi", "Magna", "tide", "Bram"] },
  { id: "t-nomadwolves", name: "Nomad Wolves", tag: "NMW", region: "EU", gameSlug: slugInGenre("battle-royale", "t-nomadwolves"), seed: 1104, wins: 17, losses: 14, titles: 1, roster: ["fennec", "ash", "Tundra", "wolfie", "Rook"] },
  { id: "t-apex", name: "Apex Division", tag: "APX", region: "NA", gameSlug: slugInGenre("fps", "t-apex"), seed: 1105, wins: 23, losses: 8, titles: 4, roster: ["crisp", "Vertex", "m0chi", "Saint", "pine"] },
  { id: "t-sledge", name: "Sledge Union", tag: "SLG", region: "NA", gameSlug: slugInGenre("fps", "t-sledge"), seed: 1106, wins: 18, losses: 13, titles: 1, roster: ["hamr", "juno", "kiln", "Moxie", "drift"] },
  { id: "t-titan", name: "Titan Protocol", tag: "TITN", region: "NA", gameSlug: slugInGenre("multiplayer", "t-titan"), seed: 1107, wins: 20, losses: 11, titles: 2, roster: ["aeg1s", "hex", "Locke", "nova", "brass"] },
  { id: "t-phantom", name: "Phantom Circuit", tag: "PHNT", region: "NA", gameSlug: slugInGenre("battle-royale", "t-phantom"), seed: 1108, wins: 16, losses: 15, titles: 0, roster: ["echo", "vVv", "mirror", "glass", "shft"] },
  { id: "t-kinetic", name: "Kinetic Storm", tag: "KRZN", region: "APAC", gameSlug: slugInGenre("fps", "t-kinetic"), seed: 1109, wins: 22, losses: 9, titles: 3, roster: ["rai", "zen", "kunoichi", "tempest", "ashi"] },
  { id: "t-shogun", name: "Shogun Axis", tag: "SHRN", region: "APAC", gameSlug: slugInGenre("fighting", "t-shogun"), seed: 1110, wins: 19, losses: 12, titles: 2, roster: ["ronin", "kaji", "sora", "yumi", "taro"] },
  { id: "t-viper", name: "Viper Syndicate", tag: "VYPR", region: "APAC", gameSlug: slugInGenre("multiplayer", "t-viper"), seed: 1111, wins: 15, losses: 16, titles: 0, roster: ["fang", "co1d", "mamba", "hiss", "venom"] },
  { id: "t-dragon", name: "Dragon Standard", tag: "DGL", region: "APAC", gameSlug: slugInGenre("battle-royale", "t-dragon"), seed: 1112, wins: 18, losses: 13, titles: 1, roster: ["ember", "qilin", "fury", "scale", "wu"] },
  { id: "t-gilded", name: "Gilded Five", tag: "GLD", region: "LATAM", gameSlug: slugInGenre("fps", "t-gilded"), seed: 1113, wins: 14, losses: 17, titles: 0, roster: ["sol", "pibe", "luz", "grito", "rey"] },
  { id: "t-panther", name: "Panther Bloc", tag: "PNTH", region: "LATAM", gameSlug: slugInGenre("multiplayer", "t-panther"), seed: 1114, wins: 13, losses: 18, titles: 0, roster: ["onca", "lua", "tico", "bravo", "negro"] },
  { id: "t-vertex", name: "Vertex Sand", tag: "VRTX", region: "MENA", gameSlug: slugInGenre("fps", "t-vertex"), seed: 1115, wins: 12, losses: 19, titles: 0, roster: ["sahar", "dune", "mirage", "qasr", "falcon"] },
  { id: "t-snowline", name: "Snowline Athletic", tag: "SNWN", region: "OCE", gameSlug: slugInGenre("sports", "t-snowline"), seed: 1116, wins: 11, losses: 20, titles: 0, roster: ["kiwi", "reef", "tui", "mako", "anchor"] },
];

export const TEAM_BY_ID: Map<string, EsportsTeam> = new Map(ESPORTS_TEAMS.map((t) => [t.id, t]));

export const ESPORTS_REGIONS: string[] = [...new Set(ESPORTS_TEAMS.map((t) => t.region))];
export const ESPORTS_EVENTS: EsportsEvent[] = [
  {
    id: "evt-autumn-split",
    slug: "autumn-split-berlin",
    name: "INFINITY Masters â€” Autumn Split",
    gameSlug: slugInGenre("fps", "evt-autumn"),
    headline: "Eight teams, one arena, three days of Circuit points",
    description:
      "The Autumn Split is the last stop before the World Stage. Sixteen qualification slots were cut to eight, and the playoff bracket has already produced two elimination upsets.",
    venue: "Mercedes-Benz Arena",
    location: "Berlin, Germany",
    region: "EU",
    startsAt: "2026-09-24T10:00:00Z",
    endsAt: "2026-09-27T22:00:00Z",
    prizePool: 500000,
    currency: "USD",
    tier: "S",
    teamIds: ["t-vanguard", "t-obsidian", "t-royalguard", "t-nomadwolves", "t-apex", "t-sledge", "t-titan", "t-kinetic"],
    matches: [
      { id: "m-a01", teamA: "t-vanguard", teamB: "t-sledge", scoreA: 2, scoreB: 0, status: "completed", startsAt: "2026-09-24T11:00:00Z", stage: "Group A", format: "Bo3" },
      { id: "m-a02", teamA: "t-obsidian", teamB: "t-titan", scoreA: 2, scoreB: 1, status: "completed", startsAt: "2026-09-24T14:00:00Z", stage: "Group A", format: "Bo3" },
      { id: "m-a03", teamA: "t-royalguard", teamB: "t-kinetic", scoreA: 1, scoreB: 2, status: "completed", startsAt: "2026-09-24T17:00:00Z", stage: "Group B", format: "Bo3" },
      { id: "m-a04", teamA: "t-apex", teamB: "t-nomadwolves", scoreA: 2, scoreB: 0, status: "completed", startsAt: "2026-09-25T11:00:00Z", stage: "Group B", format: "Bo3" },
      { id: "m-a05", teamA: "t-vanguard", teamB: "t-obsidian", scoreA: 2, scoreB: 1, status: "completed", startsAt: "2026-09-25T15:00:00Z", stage: "Quarterfinal", format: "Bo3" },
      { id: "m-a06", teamA: "t-apex", teamB: "t-royalguard", scoreA: 2, scoreB: 1, status: "completed", startsAt: "2026-09-25T18:30:00Z", stage: "Quarterfinal", format: "Bo3" },
      { id: "m-a07", teamA: "t-kinetic", teamB: "t-titan", scoreA: 2, scoreB: 0, status: "completed", startsAt: "2026-09-26T11:00:00Z", stage: "Quarterfinal", format: "Bo3" },
      { id: "m-a08", teamA: "t-nomadwolves", teamB: "t-sledge", scoreA: 2, scoreB: 1, status: "completed", startsAt: "2026-09-26T12:45:00Z", stage: "Quarterfinal", format: "Bo3" },
      { id: "m-a09", teamA: "t-vanguard", teamB: "t-kinetic", scoreA: 1, scoreB: 0, status: "live", startsAt: "2026-09-26T16:00:00Z", stage: "Semifinal", format: "Bo3" },
      { id: "m-a10", teamA: "t-apex", teamB: "t-nomadwolves", scoreA: null, scoreB: null, status: "live", startsAt: "2026-09-26T16:00:00Z", stage: "Semifinal", format: "Bo3" },
      { id: "m-a11", teamA: "t-obsidian", teamB: "t-royalguard", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-09-26T19:30:00Z", stage: "Placement", format: "Bo3" },
      { id: "m-a12", teamA: "t-sledge", teamB: "t-titan", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-09-27T12:00:00Z", stage: "Placement", format: "Bo3" },
      { id: "m-a13", teamA: "t-vanguard", teamB: "t-apex", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-09-27T18:00:00Z", stage: "Grand Final", format: "Bo5" },
    ],
    bracket: [
      {
        name: "Quarterfinals",
        matches: [
          { a: "t-vanguard", b: "t-obsidian", scoreA: 2, scoreB: 1, winner: "t-vanguard" },
          { a: "t-apex", b: "t-royalguard", scoreA: 2, scoreB: 1, winner: "t-apex" },
          { a: "t-kinetic", b: "t-titan", scoreA: 2, scoreB: 0, winner: "t-kinetic" },
          { a: "t-nomadwolves", b: "t-sledge", scoreA: 2, scoreB: 1, winner: "t-nomadwolves" },
        ],
      },
      {
        name: "Semifinals",
        matches: [
          { a: "t-vanguard", b: "t-kinetic", scoreA: 1, scoreB: 0, winner: "" },
          { a: "t-apex", b: "t-nomadwolves", scoreA: 0, scoreB: 0, winner: "" },
        ],
      },
      { name: "Grand Final", matches: [{ a: "t-vanguard", b: "t-apex", scoreA: 0, scoreB: 0, winner: "" }] },
    ],
    format: "Groups â†’ single elimination â†’ Bo5 grand final",
    heroSeed: 9021,
  },
  {
    id: "evt-continental-clash",
    slug: "continental-clash-americas",
    name: "Continental Clash â€” Americas",
    gameSlug: slugInGenre("battle-royale", "evt-clash"),
    headline: "Sixteen regional slots collide in Miami for the last Americas major",
    description:
      "The Americas' final major of the year sends its top four straight to the World Stage. The rest fight through the lower bracket on Sunday.",
    venue: "Kaseya Center",
    location: "Miami, USA",
    region: "NA",
    startsAt: "2026-10-09T16:00:00Z",
    endsAt: "2026-10-11T23:00:00Z",
    prizePool: 250000,
    currency: "USD",
    tier: "A",
    teamIds: ["t-apex", "t-sledge", "t-titan", "t-phantom", "t-gilded", "t-panther", "t-obsidian", "t-vertex"],
    matches: [
      { id: "m-b01", teamA: "t-apex", teamB: "t-panther", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-10-09T17:00:00Z", stage: "Group A", format: "Bo3" },
      { id: "m-b02", teamA: "t-sledge", teamB: "t-vertex", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-10-09T20:00:00Z", stage: "Group A", format: "Bo3" },
      { id: "m-b03", teamA: "t-titan", teamB: "t-gilded", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-10-10T17:00:00Z", stage: "Group B", format: "Bo3" },
      { id: "m-b04", teamA: "t-phantom", teamB: "t-obsidian", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-10-10T20:00:00Z", stage: "Group B", format: "Bo3" },
      { id: "m-b05", teamA: "t-apex", teamB: "t-titan", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-10-11T18:00:00Z", stage: "Semifinal", format: "Bo3" },
      { id: "m-b06", teamA: "t-sledge", teamB: "t-phantom", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-10-11T21:00:00Z", stage: "Grand Final", format: "Bo5" },
    ],
    bracket: [
      {
        name: "Playoffs",
        matches: [
          { a: "t-apex", b: "t-panther", scoreA: 0, scoreB: 0, winner: "" },
          { a: "t-sledge", b: "t-vertex", scoreA: 0, scoreB: 0, winner: "" },
          { a: "t-titan", b: "t-gilded", scoreA: 0, scoreB: 0, winner: "" },
          { a: "t-phantom", b: "t-obsidian", scoreA: 0, scoreB: 0, winner: "" },
        ],
      },
      { name: "Finals day", matches: [{ a: "t-apex", b: "t-sledge", scoreA: 0, scoreB: 0, winner: "" }] },
    ],
    format: "Groups â†’ single elimination â†’ Bo5 grand final",
    heroSeed: 7710,
  },
  {
    id: "evt-frontier-invitational",
    slug: "frontier-invitational-apac",
    name: "Frontier Invitational â€” APAC",
    gameSlug: slugInGenre("multiplayer", "evt-frontier"),
    headline: "Four APAC regions meet in Singapore for the biggest prize pool outside the majors",
    description:
      "A four-region invitational with a double-elimination main bracket and a 40-hour practice window published in advance.",
    venue: "Singapore Indoor Stadium",
    location: "Singapore",
    region: "APAC",
    startsAt: "2026-11-06T09:00:00Z",
    endsAt: "2026-11-08T18:00:00Z",
    prizePool: 200000,
    currency: "USD",
    tier: "A",
    teamIds: ["t-kinetic", "t-shogun", "t-viper", "t-dragon", "t-snowline", "t-vanguard", "t-titan", "t-royalguard"],
    matches: [
      { id: "m-c01", teamA: "t-kinetic", teamB: "t-dragon", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-11-06T10:00:00Z", stage: "Upper round 1", format: "Bo3" },
      { id: "m-c02", teamA: "t-shogun", teamB: "t-viper", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-11-06T13:00:00Z", stage: "Upper round 1", format: "Bo3" },
      { id: "m-c03", teamA: "t-snowline", teamB: "t-royalguard", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-11-07T10:00:00Z", stage: "Upper round 2", format: "Bo3" },
      { id: "m-c04", teamA: "t-vanguard", teamB: "t-titan", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-11-07T13:00:00Z", stage: "Upper round 2", format: "Bo3" },
      { id: "m-c05", teamA: "t-kinetic", teamB: "t-shogun", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-11-08T11:00:00Z", stage: "Upper final", format: "Bo3" },
      { id: "m-c06", teamA: "t-kinetic", teamB: "t-vanguard", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-11-08T16:00:00Z", stage: "Grand Final", format: "Bo5" },
    ],
    bracket: [
      {
        name: "Upper bracket",
        matches: [
          { a: "t-kinetic", b: "t-dragon", scoreA: 0, scoreB: 0, winner: "" },
          { a: "t-shogun", b: "t-viper", scoreA: 0, scoreB: 0, winner: "" },
          { a: "t-kinetic", b: "t-shogun", scoreA: 0, scoreB: 0, winner: "" },
        ],
      },
      { name: "Grand Final", matches: [{ a: "t-kinetic", b: "t-vanguard", scoreA: 0, scoreB: 0, winner: "" }] },
    ],
    format: "Double elimination â†’ Bo5 grand final",
    heroSeed: 5540,
  },
  {
    id: "evt-champions-circuit",
    slug: "champions-circuit-world-stage",
    name: "Champions Circuit â€” World Stage",
    gameSlug: slugInGenre("fps", "evt-worlds"),
    headline: "The season finale: sixteen teams, one million dollars, four days",
    description:
      "The Champions Circuit closes the year with every qualified team in a single elimination bracket. Seeds are locked; the trophy is not.",
    venue: "Etihad Arena",
    location: "Abu Dhabi, UAE",
    region: "Global",
    startsAt: "2026-12-12T12:00:00Z",
    endsAt: "2026-12-15T22:00:00Z",
    prizePool: 1000000,
    currency: "USD",
    tier: "S",
    teamIds: [
      "t-vanguard", "t-apex", "t-kinetic", "t-obsidian", "t-titan", "t-shogun", "t-royalguard", "t-dragon",
      "t-nomadwolves", "t-sledge", "t-phantom", "t-viper", "t-gilded", "t-panther", "t-vertex", "t-snowline",
    ],
    matches: [
      { id: "m-d01", teamA: "t-vanguard", teamB: "t-snowline", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-12-12T13:00:00Z", stage: "Round of 16", format: "Bo3" },
      { id: "m-d02", teamA: "t-apex", teamB: "t-vertex", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-12-12T16:00:00Z", stage: "Round of 16", format: "Bo3" },
      { id: "m-d03", teamA: "t-kinetic", teamB: "t-panther", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-12-13T13:00:00Z", stage: "Round of 16", format: "Bo3" },
      { id: "m-d04", teamA: "t-obsidian", teamB: "t-gilded", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-12-13T16:00:00Z", stage: "Quarterfinal", format: "Bo3" },
      { id: "m-d05", teamA: "t-titan", teamB: "t-shogun", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-12-14T17:00:00Z", stage: "Semifinal", format: "Bo3" },
      { id: "m-d06", teamA: "t-vanguard", teamB: "t-kinetic", scoreA: null, scoreB: null, status: "upcoming", startsAt: "2026-12-15T19:00:00Z", stage: "Grand Final", format: "Bo5" },
    ],
    bracket: [
      {
        name: "Round of 16",
        matches: [
          { a: "t-vanguard", b: "t-snowline", scoreA: 0, scoreB: 0, winner: "" },
          { a: "t-apex", b: "t-vertex", scoreA: 0, scoreB: 0, winner: "" },
          { a: "t-kinetic", b: "t-panther", scoreA: 0, scoreB: 0, winner: "" },
          { a: "t-obsidian", b: "t-gilded", scoreA: 0, scoreB: 0, winner: "" },
        ],
      },
      { name: "Finals", matches: [{ a: "t-vanguard", b: "t-kinetic", scoreA: 0, scoreB: 0, winner: "" }] },
    ],
    format: "Single elimination â†’ Bo5 grand final",
    heroSeed: 8800,
  },
];

/* -------------------------------------------------------------- standings */

/** Group standings derived from an event's roster â€” deterministic streaks. */
export function standingsFor(event: EsportsEvent): StandingsRow[] {
  const rows = event.teamIds
    .map((teamId) => TEAM_BY_ID.get(teamId))
    .filter((t): t is EsportsTeam => Boolean(t))
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
    .map((t, i) => ({
      rank: i + 1,
      teamId: t.id,
      played: t.wins + t.losses,
      wins: t.wins,
      losses: t.losses,
      points: t.wins * 3,
      streak: seededPick(`${event.id}-${t.id}`, ["W1", "W2", "W3", "L1", "L2"] as const),
    }));
  return rows;
}

export const FEATURED_EVENT: EsportsEvent = ESPORTS_EVENTS[0];

/** The event containing the next live or upcoming match. */
export function nextEvent(): EsportsEvent {
  return ESPORTS_EVENTS.find((e) => e.endsAt >= "2026-09-26") ?? ESPORTS_EVENTS[0];
}
