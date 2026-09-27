import type { Game } from "@/lib/types";
import { hashString, makeRng } from "@/lib/generate";

/* ===========================================================================
 * INFINITY key-art engine
 * ---------------------------------------------------------------------------
 * Every game page, card and gallery tile is rendered from this generator.
 *
 * Why generated art instead of third-party box art:
 *   · it is 100% original, so nothing is scraped, hotlinked or redistributed;
 *   · it is deterministic, so a game always looks the same everywhere;
 *   · it costs zero network requests and stays sharp at any size.
 *
 * An authorised CDN image can be attached to any record later through the
 * admin CMS; when `coverImage` is present the <img> path is used instead.
 * ======================================================================== */

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

function silhouette(motif: string, w: number, h: number, rng: () => number, ink: string): string {
  const parts: string[] = [];
  const baseY = h * 0.82;

  switch (motif) {
    case "ridge": {
      let x = -40;
      let d = `M ${x} ${baseY + 60} L ${x} ${baseY}`;
      while (x < w + 60) {
        const step = 60 + rng() * 150;
        const peak = baseY - (40 + rng() * h * 0.42);
        x += step;
        d += ` L ${x} ${peak} L ${x + step * 0.6} ${baseY + (rng() * 40 - 10)}`;
      }
      d += ` L ${w + 60} ${h} L -40 ${h} Z`;
      parts.push(`<path d="${d}" fill="${ink}" opacity="0.9"/>`);
      break;
    }
    case "skyline": {
      let x = -30;
      let d = `M ${x} ${h} L ${x} ${baseY + 40}`;
      while (x < w + 30) {
        const bw = 34 + rng() * 76;
        const bh = 60 + rng() * h * 0.5;
        d += ` L ${x} ${baseY + 40 - bh} L ${x + bw * 0.14} ${baseY + 22 - bh} L ${x + bw} ${baseY + 40 - bh}`;
        x += bw;
        d += ` L ${x} ${baseY + 40}`;
      }
      d += ` L ${x} ${h} Z`;
      parts.push(`<path d="${d}" fill="${ink}" opacity="0.92"/>`);
      break;
    }
    case "road": {
      const cx = w * 0.5;
      parts.push(
        `<path d="M ${cx - 60} ${h} L ${cx - 10} ${h * 0.44} L ${cx + 10} ${h * 0.44} L ${cx + 60} ${h} Z" fill="${ink}" opacity="0.85"/>`,
      );
      for (let i = 0; i < 7; i++) {
        const t = 0.46 + i * 0.078;
        parts.push(
          `<rect x="${cx - (1 - t) * 14}" y="${h * t}" width="${3 + i * 2}" height="${6 + i * 4}" fill="${ink}" opacity="0.5"/>`,
        );
      }
      break;
    }
    case "forest": {
      for (let i = 0; i < 26; i++) {
        const x = rng() * w;
        const th = 90 + rng() * h * 0.6;
        const tw = 14 + rng() * 26;
        parts.push(
          `<path d="M ${x} ${h} L ${x - tw / 2} ${h - th * 0.42} L ${x} ${h - th} L ${x + tw / 2} ${h - th * 0.42} Z" fill="${ink}" opacity="${(0.4 + rng() * 0.5).toFixed(2)}"/>`,
        );
      }
      break;
    }
    case "grid": {
      for (let i = 0; i < 9; i++) {
        const x = (w / 9) * i + rng() * 12;
        const bh = 70 + rng() * h * 0.34;
        parts.push(
          `<rect x="${x}" y="${baseY - bh}" width="${w / 15}" height="${bh}" fill="${ink}" opacity="0.66"/>`,
        );
      }
      break;
    }
    case "stadium": {
      parts.push(
        `<ellipse cx="${w * 0.5}" cy="${h * 0.78}" rx="${w * 0.42}" ry="${h * 0.2}" fill="${ink}" opacity="0.7"/>`,
        `<ellipse cx="${w * 0.5}" cy="${h * 0.78}" rx="${w * 0.3}" ry="${h * 0.13}" fill="#020B14" opacity="0.55"/>`,
      );
      break;
    }
    case "crystal": {
      for (let i = 0; i < 5; i++) {
        const x = w * (0.12 + i * 0.19);
        const hh = h * (0.2 + rng() * 0.36);
        const ww = 40 + rng() * 90;
        parts.push(
          `<path d="M ${x} ${h - 10} L ${x - ww / 2} ${h - hh * 0.5} L ${x} ${h - hh} L ${x + ww / 2} ${h - hh * 0.5} Z" fill="${ink}" opacity="${(0.35 + rng() * 0.4).toFixed(2)}"/>`,
        );
      }
      break;
    }
    case "monolith": {
      for (let i = 0; i < 3; i++) {
        const x = w * (0.2 + i * 0.24);
        const bh = h * (0.35 + rng() * 0.35);
        parts.push(
          `<rect x="${x}" y="${h - bh}" width="${34 + rng() * 40}" height="${bh}" fill="${ink}" opacity="0.88" rx="6"/>`,
        );
      }
      break;
    }
    default:
      parts.push(`<rect x="0" y="${baseY}" width="${w}" height="${h - baseY}" fill="${ink}" opacity="0.85"/>`);
      break;
  }

  return parts.join("");
}

/** Angles, shards, grain and vignette — the shared lighting pass. */
function lighting(w: number, h: number, rng: () => number, hue: number, uid: string) {
  const shards: string[] = [];
  for (let i = 0; i < 5; i++) {
    const x1 = rng() * w;
    const x2 = x1 + (rng() * w) / 2;
    const off = rng() * h;
    shards.push(
      `<polygon points="${x1},0 ${x2},0 ${x2 - off * 0.4},${h} ${x1 - off * 0.4},${h}" fill="hsl(${hue} 84% 52%)" opacity="${(0.05 + rng() * 0.1).toFixed(3)}"/>`,
    );
  }
  return `
    <defs>
      <linearGradient id="bg-${uid}" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stop-color="hsl(${hue} 62% 13%)"/>
        <stop offset="55%" stop-color="#050F1A"/>
        <stop offset="100%" stop-color="#020B14"/>
      </linearGradient>
      <radialGradient id="glow-${uid}" cx="72%" cy="22%" r="62%">
        <stop offset="0%" stop-color="hsl(${hue} 92% 55%)" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="hsl(${hue} 92% 55%)" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="vig-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#020B14" stop-opacity="0.12"/>
        <stop offset="62%" stop-color="#020B14" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="#020B14" stop-opacity="0.96"/>
      </linearGradient>
      <pattern id="grain-${uid}" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.5" fill="#ffffff" opacity="0.05"/>
        <circle cx="3" cy="3" r="0.4" fill="#000000" opacity="0.12"/>
      </pattern>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg-${uid})"/>
    ${shards.join("")}
    <rect width="${w}" height="${h}" fill="url(#glow-${uid})"/>
    <rect width="${w}" height="${h}" fill="url(#grain-${uid})" opacity="0.6"/>
  `;
}

export interface GameArtProps {
  game: Pick<Game, "slug" | "title" | "genre" | "accentHue" | "rating">;
  variant?: ArtVariant;
  /** Secondary seed so gallery tiles differ from the card art. */
  index?: number;
  /** Override the hue (degrees). Defaults to the game's accent hue. */
  hue?: number;
  className?: string;
  showTitle?: boolean;
  ariaLabel?: string;
}

export function GameArt({
  game,
  variant = "poster",
  index = 0,
  hue,
  className,
  showTitle,
  ariaLabel,
}: GameArtProps) {
  const [w, h] = RATIOS[variant];
  const seed = `${game.slug}::${variant}::${index}`;
  const rng = makeRng(seed);
  const resolvedHue = typeof hue === "number" ? hue : game.accentHue;
  const ink = "#020B14";
  const motif = motifFor(game.genre as string[]);
  const withTitle = showTitle ?? (variant === "poster" || variant === "hero" || variant === "wide");
  const uid = hashString(seed).toString(36);

  const titleSize =
    variant === "hero" ? 78 : variant === "banner" ? 48 : variant === "wide" ? 52 : variant === "thumb" ? 28 : 42;
  const words = game.title.split(" ");
  const lines: string[] =
    game.title.length > 26 && words.length > 1
      ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")]
      : [game.title];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      role="img"
      aria-label={ariaLabel ?? `${game.title} key art`}
      preserveAspectRatio="xMidYMid slice"
    >
      {lighting(w, h, rng, resolvedHue, uid)}
      {silhouette(motif, w, h, rng, ink)}
      <rect width={w} height={h} fill={`url(#vig-${uid})`} />
      {/* accent slash — the INFINITY signature mark */}
      <polygon
        points={`${w * 0.06},${h * 0.95} ${w * 0.42},${h * 0.95} ${w * 0.3},${h * 0.985} ${w * 0.02},${h * 0.985}`}
        fill="#E5092F"
      />
      {withTitle
        ? lines.map((line, i) => (
            <text
              key={line + i}
              x={w * 0.06}
              y={h - (variant === "hero" ? 152 : 104) + i * titleSize * 0.94}
              fill="#FFFFFF"
              fontFamily="var(--font-display), Impact, Haettenschweiler, sans-serif"
              fontSize={titleSize}
              fontWeight="800"
              letterSpacing="-1"
            >
              {line.toUpperCase()}
            </text>
          ))
        : null}
      <text
        x={w * 0.06}
        y={h - (variant === "hero" ? 108 : 62)}
        fill="#E5092F"
        fontFamily="var(--font-display), Impact, sans-serif"
        fontSize={variant === "hero" ? 24 : 17}
        fontWeight="700"
        letterSpacing="5"
      >
        INFINITY
      </text>
    </svg>
  );
}

