/* ===========================================================================
 * Deterministic generation helpers
 * ---------------------------------------------------------------------------
 * INFINITY derives a large amount of supporting content (key art, captions,
 * analytics counters, file sizes, requirements) from a stable seed per game.
 * Everything here is pure and deterministic: the same slug always produces
 * the same result on the server, in the browser and in CI.
 * ======================================================================== */

/** FNV-1a 32-bit hash — small, fast, stable across runtimes. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Seeded 32-bit PRNG (mulberry32). */
export function makeRng(seed: string | number) {
  let a = typeof seed === "number" ? seed >>> 0 : hashString(seed);
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic integer in [min, max] inclusive. */
export function seededInt(seed: string, min: number, max: number, salt = ""): number {
  const rng = makeRng(`${seed}::${salt}`);
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Deterministic float in [min, max] rounded to `digits`. */
export function seededFloat(
  seed: string,
  min: number,
  max: number,
  digits = 1,
  salt = "",
): number {
  const rng = makeRng(`${seed}::${salt}`);
  const v = rng() * (max - min) + min;
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

/** Deterministic pick from a list. */
export function seededPick<T>(seed: string, list: readonly T[], salt = ""): T {
  return list[seededInt(seed, 0, list.length - 1, salt)];
}

/** Deterministic, de-duplicated sample of `count` items. */
export function seededSample<T>(
  seed: string,
  list: readonly T[],
  count: number,
  salt = "",
): T[] {
  const rng = makeRng(`${seed}::${salt}::sample`);
  const pool = [...list];
  const out: T[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

/** Deterministic shuffle (Fisher-Yates driven by the seeded PRNG). */
export function seededShuffle<T>(seed: string, list: readonly T[]): T[] {
  const rng = makeRng(`${seed}::shuffle`);
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** URL-safe slug from a display title. */
export function slugify(input: string): string {
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

/** Compact number formatting used for catalogue counters. */
export function compactNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}K`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

/** "12 Jan 2026" style publication date. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** "3h ago" style relative time. */
export function timeAgo(iso: string, now = new Date("2026-09-26T12:00:00Z")): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;
  const diff = Math.max(0, now.getTime() - then.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatPrice(price: number, discount = 0): string {
  if (price === 0) return "Free";
  const final = discount > 0 ? price * (1 - discount / 100) : price;
  return `$${final.toFixed(2)}`;
}

export function discountedPrice(price: number, discount: number): number {
  if (discount <= 0) return price;
  return Math.round(price * (1 - discount / 100) * 100) / 100;
}

/** star string for compact ratings, e.g. "★★★★☆" */
export function stars(rating: number): string {
  const full = Math.round(rating / 2);
  return `${"★".repeat(full)}${"☆".repeat(Math.max(0, 5 - full))}`;
}
