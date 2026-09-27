import { GAMES } from "@/lib/catalogue";
import type { Game } from "@/lib/types";
import { seededPick, seededSample } from "@/lib/generate";

/* ===========================================================================
 * Title/genre resolution for the editorial data files (news, esports,
 * community, store). Every lookup is deterministic and falls back to a
 * seeded pick, so a missing record can never break a page build.
 * ======================================================================== */

/** Exact-title lookup against the live catalogue. */
export function gameByTitle(title: string): Game | undefined {
  return GAMES.find((g) => g.title.toLowerCase() === title.toLowerCase());
}

/** Slug for a known title; deterministic seeded fallback if it is absent. */
export function slugForTitle(title: string, salt: string): string {
  return gameByTitle(title)?.slug ?? seededPick(salt, GAMES.map((g) => g.slug));
}

/** A slug from a primary genre lane (e.g. "fps"), seeded for stability. */
export function slugInGenre(genre: string, salt: string): string {
  const pool = GAMES.filter((g) => (g.genre as string[]).includes(genre)).map((g) => g.slug);
  return pool.length ? seededPick(salt, pool) : seededPick(salt, GAMES.map((g) => g.slug));
}

/** `count` distinct, random-but-stable slugs for related-content rails. */
export function slugs(count: number, salt: string): string[] {
  return seededSample(salt, GAMES.map((g) => g.slug), count);
}
