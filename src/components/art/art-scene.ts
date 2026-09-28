/**
 * INFINITY key-art engine - pure string generator.
 *
 * Kept free of JSX on purpose: `GameArt.tsx` is a thin wrapper around
 * `artSvg()`, so the artwork can be rendered and inspected from plain Node
 * (scripts render it to PNG for visual QA) without a React runtime.
 *
 * Every game page, card and gallery tile falls back to this generator when the
 * catalogue has no storefront photography for a title.
 *
 * Why generated art exists at all:
 *   - it is 100% original, so nothing is scraped, hotlinked or redistributed;
 *   - it is deterministic, so a game always looks the same everywhere;
 *   - it costs zero network requests and stays sharp at any size.
 *
 * An authorised CDN image is attached to a record through src/data/steam-art.ts;
 * when a title has one, the <img> path is used instead.
 */

import { hashString, makeRng } from "@/lib/generate";

export type ArtVariant = "poster" | "wide" | "hero" | "thumb" | "banner";


const RATIOS: Record<ArtVariant, [number, number]> = {
  poster: [600, 900],
  wide: [1280, 720],
  hero: [1920, 820],
  thumb: [640, 360],
  banner: [1600, 400],
};

/** Silhouette motif chosen from the game's primary genre cluster. */
export function motifFor(genres: string[]): string {
  const g = new Set(genres);
  if (g.has("racing")) return "road";
  if (g.has("strategy")) return "grid";
  if (g.has("sports")) return "stadium";
  if (g.has("horror")) return "forest";
  if (g.has("mmorpg") || g.has("sandbox")) return "monolith";
  if (g.has("fps") || g.has("tps") || g.has("battle-royale")) return "skyline";
  if (g.has("open-world") || g.has("adventure")) return "ridge";
  if (g.has("indie") || g.has("puzzle")) return "crystal";
  return "skyline";
}


/**
 * Parallax depth: a graded sky, a light source with atmospheric bloom, three
 * receding silhouette planes separated by haze, a rim-lit foreground and a
 * vignette. Reading depth rather than a flat shape is what stops the fallback
 * from looking like a placeholder.
 */
function scene(w: number, h: number, rng: () => number, hue: number, uid: string, motif: string) {
  const horizon = h * (0.6 + rng() * 0.16);
  const sunX = w * (0.16 + rng() * 0.68);
  const sunY = horizon * (0.2 + rng() * 0.34);
  // Keep the disc small: a big white ball reads as a logo, not a light source.
  const sunR = Math.min(w, h) * (0.028 + rng() * 0.03);

  // Three receding planes, each lighter and lower-contrast than the one in front.
  const planes: string[] = [];
  for (let i = 0; i < 3; i++) {
    const depth = i / 2; // 0 = far, 1 = near
    const baseY = horizon + depth * h * 0.1;
    const amp = h * (0.1 + depth * 0.3);
    const parts: string[] = [];
    let x = -60;
    let d = `M ${x} ${h + 10} L ${x} ${baseY}`;
    while (x < w + 80) {
      const step = w * (0.08 + rng() * 0.16);
      const peak = baseY - amp * (0.35 + rng() * 0.75);
      const kind = rng();
      if (motif === "road" && kind < 0.5) {
        // flat horizon runs, broken by distant structures
        d += ` L ${x + step * 0.5} ${peak * 0.985 + baseY * 0.015} L ${x + step} ${baseY - amp * 0.1}`;
      } else if (motif === "skyline" && kind < 0.55) {
        // towers
        const bw = step * 0.3;
        d += ` L ${x + step * 0.2} ${peak} L ${x + step * 0.2 + bw} ${peak + amp * 0.05} L ${x + step * 0.2 + bw} ${baseY}`;
        x += step * 0.2 + bw;
        d += ` L ${x} ${baseY}`;
      } else if (motif === "forest" && kind < 0.5) {
        // conifer teeth
        d += ` L ${x + step * 0.5} ${peak} L ${x + step} ${baseY - amp * 0.08}`;
      } else {
        d += ` L ${x + step * 0.5} ${peak} L ${x + step} ${baseY - amp * 0.12 * rng()}`;
      }
      x += step;
      d += ` L ${x} ${baseY - amp * 0.1 * rng()}`;
    }
    d += ` L ${w + 80} ${h + 10} Z`;
    // Atmospheric perspective: distant planes are lighter, desaturated and
    // closer to the sky, near planes are almost black. Flat greys at equal
    // contrast make the three planes read as one shape.
    const fill = `hsl(${hue} ${(34 - depth * 22).toFixed(0)}% ${(11 + depth * 5).toFixed(0)}%)`;
    parts.push(`<path d="${d}" fill="${fill}"/>`);
    // Rim light along the crest of each plane, facing the sun.
    const rim = `hsl(${hue} 96% 68%)`;
    const rimOp = (0.3 - depth * 0.24).toFixed(2);
    parts.push(
      `<path d="${d}" fill="none" stroke="${rim}" stroke-opacity="${rimOp}" ` +
        `stroke-width="${Math.max(1, w * 0.0022).toFixed(2)}" stroke-linejoin="round"/>`,
    );
    planes.push(parts.join(""));
  }

  return `
    <defs>
      <linearGradient id="sky-${uid}" x1="0" y1="0" x2="0.15" y2="1">
        <stop offset="0%" stop-color="#03080F"/>
        <stop offset="42%" stop-color="hsl(${hue} 70% 16%)"/>
        <stop offset="78%" stop-color="hsl(${hue} 88% 30%)"/>
        <stop offset="100%" stop-color="hsl(${hue} 95% 44%)"/>
      </linearGradient>
      <radialGradient id="sun-${uid}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
        <stop offset="18%" stop-color="hsl(${hue} 100% 82%)" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="hsl(${hue} 100% 60%)" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vig-${uid}" cx="50%" cy="42%" r="76%">
        <stop offset="0%" stop-color="#020B14" stop-opacity="0"/>
        <stop offset="62%" stop-color="#020B14" stop-opacity="0.34"/>
        <stop offset="100%" stop-color="#020B14" stop-opacity="0.95"/>
      </radialGradient>
      <!-- Haze has to fade at both ends: a flat rect leaves a visible seam
           across the middle of the poster, which reads as a rendering bug. -->
      <linearGradient id="haze-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="hsl(${hue} 90% 62%)" stop-opacity="0"/>
        <stop offset="40%" stop-color="hsl(${hue} 90% 62%)" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="hsl(${hue} 90% 62%)" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="plate-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#020B14" stop-opacity="0"/>
        <stop offset="45%" stop-color="#020B14" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="#020B14" stop-opacity="0.94"/>
      </linearGradient>
      <pattern id="grain-${uid}" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.5" fill="#ffffff" opacity="0.05"/>
        <circle cx="3" cy="3" r="0.4" fill="#000000" opacity="0.14"/>
      </pattern>
    </defs>

    <rect width="${w}" height="${h}" fill="url(#sky-${uid})"/>
    <circle cx="${sunX}" cy="${sunY}" r="${sunR * 3.2}" fill="url(#sun-${uid})"/>
    <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="#FFFFFF" opacity="0.7"/>
    ${planes.join("")}
    <!-- atmospheric haze sitting on the horizon -->
    <rect x="0" y="${horizon - h * 0.2}" width="${w}" height="${h * 0.38}" fill="url(#haze-${uid})"/>
    <rect width="${w}" height="${h}" fill="url(#grain-${uid})" opacity="0.55"/>
    <rect width="${w}" height="${h}" fill="url(#vig-${uid})"/>
  `;
}

/** Genre set-dressing drawn over the parallax planes. */
function dressing(motif: string, w: number, h: number, hue: number, ink: string): string {
  const p: string[] = [];
  switch (motif) {
    case "road":
      p.push(
        `<path d="M ${w * 0.45} ${h} L ${w * 0.488} ${h * 0.66} L ${w * 0.512} ${h * 0.66} L ${w * 0.55} ${h} Z" fill="${ink}" opacity="0.88"/>`,
      );
      for (let i = 0; i < 6; i++) {
        const t = 0.7 + i * 0.05;
        p.push(
          `<rect x="${(w * 0.5 - w * 0.004).toFixed(1)}" y="${h * t}" width="${(w * 0.008 + i * w * 0.004).toFixed(1)}" height="${h * 0.02}" fill="#FFFFFF" opacity="${(0.34 - i * 0.04).toFixed(2)}"/>`,
        );
      }
      break;
    case "monolith":
      for (let i = 0; i < 3; i++) {
        const bw = w * (0.05 + i * 0.014);
        const bh = h * (0.26 + i * 0.1);
        const x = w * (0.16 + i * 0.27);
        p.push(`<rect x="${x}" y="${h - bh}" width="${bw}" height="${bh}" fill="${ink}" opacity="0.93" rx="${(bw * 0.06).toFixed(1)}"/>`);
        p.push(`<rect x="${x}" y="${h - bh}" width="${(bw * 0.14).toFixed(1)}" height="${bh}" fill="#FFFFFF" opacity="0.09"/>`);
      }
      break;
    case "crystal":
      for (let i = 0; i < 4; i++) {
        const x = w * (0.15 + i * 0.23);
        const bh = h * (0.13 + ((i * 7) % 5) * 0.05);
        const bw = w * 0.11;
        const base = h * 0.84;
        p.push(
          `<path d="M ${x} ${base} L ${x - bw / 2} ${base - bh * 0.45} L ${x} ${base - bh} L ${x + bw / 2} ${base - bh * 0.45} Z" fill="${ink}" opacity="0.92"/>`,
        );
        p.push(`<path d="M ${x} ${base - bh} L ${x + bw / 2} ${base - bh * 0.45} L ${x} ${base} Z" fill="#FFFFFF" opacity="0.08"/>`);
      }
      break;
    case "stadium":
      p.push(`<ellipse cx="${w * 0.5}" cy="${h * 0.8}" rx="${w * 0.46}" ry="${h * 0.2}" fill="${ink}" opacity="0.78"/>`);
      p.push(`<ellipse cx="${w * 0.5}" cy="${h * 0.8}" rx="${w * 0.32}" ry="${h * 0.115}" fill="hsl(${hue} 80% 42%)" opacity="0.34"/>`);
      p.push(
        `<ellipse cx="${w * 0.5}" cy="${h * 0.8}" rx="${w * 0.32}" ry="${h * 0.115}" fill="none" stroke="#FFFFFF" stroke-opacity="0.24" stroke-width="${Math.max(1, w * 0.003)}"/>`,
      );
      break;
    case "grid":
      for (let i = 0; i < 10; i++) {
        const hh = h * (0.14 + ((i * 17) % 9) / 42);
        p.push(
          `<rect x="${w * 0.07 + i * w * 0.089}" y="${h * 0.84 - hh}" width="${w * 0.042}" height="${hh}" fill="${ink}" opacity="0.9"/>`,
        );
      }
      break;
    default:
      break;
  }
  return p.join("");
}

/** SVG text content must be escaped or a title like "Tom & Jerry" breaks the document. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface ArtSubject {
  slug: string;
  title: string;
  genre: string[];
  accentHue: number;
  rating: number;
}

export interface ArtSvgOptions {
  variant?: ArtVariant;
  index?: number;
  hue?: number;
  showTitle?: boolean;
  /** CSS class applied to the wrapper element. */
  className?: string;
  /** Accessible name; defaults to "<title> key art". */
  ariaLabel?: string;
}
/** Airborne dust catching the light - the cheapest convincing "photograph" cue. */
function bokeh(w: number, h: number, rng: () => number, hue: number): string {
  const out: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = Math.min(w, h) * (0.004 + rng() * 0.016);
    out.push(
      `<circle cx="${(rng() * w).toFixed(1)}" cy="${(rng() * h * 0.85).toFixed(1)}" r="${r.toFixed(1)}" fill="hsl(${hue} 90% 78%)" opacity="${(0.06 + rng() * 0.16).toFixed(2)}"/>`,
    );
  }
  return out.join("");
}

/**
 * Build a complete, standalone SVG document for a game.
 *
 * Deterministic in (slug, variant, index): the same record always produces the
 * same artwork, on the server and in the browser.
 */
export function artSvg(game: ArtSubject, options: ArtSvgOptions = {}): string {
  const { variant = "poster", index = 0, hue, showTitle, ariaLabel } = options;
  const [w, h] = RATIOS[variant];
  const seed = `${game.slug}::${variant}::${index}`;
  const rng = makeRng(seed);
  const resolvedHue = typeof hue === "number" ? hue : game.accentHue;
  const ink = "#020B14";
  const motif = motifFor(game.genre);
  const withTitle = showTitle ?? (variant === "poster" || variant === "hero" || variant === "wide");
  const uid = hashString(seed).toString(36);

  // Foreground crest: the nearest, sharpest plane, plus a rim light along it.
  const crest = [
    h * (0.9 + rng() * 0.03),
    h * (0.86 + rng() * 0.04),
    h * (0.93 + rng() * 0.02),
    h * (0.88 + rng() * 0.04),
  ];
  const foreground =
    `<path d="M -20 ${h + 10} L -20 ${crest[0]} L ${w * 0.3} ${crest[1]} L ${w * 0.62} ${crest[2]} ` +
    `L ${w + 20} ${crest[3]} L ${w + 20} ${h + 10} Z" fill="${ink}" opacity="0.95"/>` +
    `<path d="M -20 ${crest[0]} L ${w * 0.3} ${crest[1]}" stroke="#FFFFFF" stroke-opacity="0.18" ` +
    `stroke-width="${Math.max(1, w * 0.0022).toFixed(2)}" fill="none"/>`;

  const titleSize =
    variant === "hero" ? 78 : variant === "banner" ? 48 : variant === "wide" ? 52 : variant === "thumb" ? 28 : 40;
  const words = game.title.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines: string[] =
    game.title.length > 24 && words.length > 1
      ? [words.slice(0, half).join(" "), words.slice(half).join(" ")]
      : [game.title];

  // A dark stroke behind the glyphs keeps long titles legible over bright sky.
  const titleBlock = withTitle
    ? lines
        .map((line, i) => {
          const y = h - (variant === "hero" ? 128 : 96) + i * titleSize * 0.96;
          return (
            `<text x="${w * 0.06}" y="${y}" fill="#FFFFFF" stroke="#020B14" ` +
            `stroke-width="${(titleSize * 0.08).toFixed(1)}" stroke-linejoin="round" paint-order="stroke" ` +
            `font-family="var(--font-display), Impact, Haettenschweiler, sans-serif" font-size="${titleSize}" ` +
            `font-weight="800" letter-spacing="-1">${escapeXml(line.toUpperCase())}</text>`
          );
        })
        .join("")
    : "";

  return (
    `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" ` +
    // Fill the wrapper so the same className utilities work on the fallback
    // that callers pass for the <img> branch (h-full w-full aspect-*, ...).
    `width="100%" height="100%" style="display:block" ` +
    `aria-label="${escapeXml(ariaLabel ?? `${game.title} key art`)}" preserveAspectRatio="xMidYMid slice">` +
    scene(w, h, rng, resolvedHue, uid, motif) +
    bokeh(w, h, rng, resolvedHue) +
    dressing(motif, w, h, resolvedHue, ink) +
    foreground +
    `<rect width="${w}" height="${h}" fill="url(#vig-${uid})"/>` +
    // Scrim behind the type block: a scrim is what real key art uses so the
    // title survives a bright sky, and it beats a heavy stroke on every glyph.
    `<rect x="0" y="${h - (variant === "hero" ? 210 : 170)}" width="${w}" height="${variant === "hero" ? 210 : 170}" fill="url(#plate-${uid})"/>` +
    titleBlock +
    // INFINITY lockup: a red rule, then the wordmark. The old angled slash sat
    // underneath the wordmark and collided with it at poster sizes.
    `<rect x="${w * 0.06}" y="${h - (variant === "hero" ? 86 : 74)}" width="${w * 0.16}" height="${Math.max(2, h * 0.006)}" fill="#E5092F"/>` +
    `<text x="${w * 0.06}" y="${h - (variant === "hero" ? 58 : 48)}" fill="#E5092F" ` +
    `font-family="var(--font-display), Impact, sans-serif" font-size="${variant === "hero" ? 22 : 15}" ` +
    `font-weight="700" letter-spacing="5">INFINITY</text>` +
    `</svg>`
  );
}
