"use client";

import { useState, type CSSProperties } from "react";
import clsx from "clsx";
import type { Game } from "@/lib/types";
import { GameArt, type ArtVariant } from "./GameArt";

/* ===========================================================================
 * Art renderer
 * ---------------------------------------------------------------------------
 * Every visual on the site goes through here so real photography is used
 * whenever the catalogue resolved a storefront entry, and the generated
 * key-art engine covers everything else:
 *
 *   · the title is console-only (Switch, mobile) or delisted on the store;
 *   · the image is blocked, offline or fails to load at runtime;
 *   · STEAM_ART_ENABLED is flipped off in src/data/steam-art.ts.
 *
 * Fallback is decided per-image at runtime, so a broken CDN link degrades to
 * generated art instead of an empty box.
 * ======================================================================== */

export type ArtSubject = Pick<Game, "slug" | "title" | "genre" | "accentHue" | "rating"> &
  Partial<Pick<Game, "coverImage" | "heroImage" | "headerImage">>;

/** Best available asset for a presentation, or null to use generated art. */
export function artSourceFor(game: ArtSubject, variant: ArtVariant): string | null {
  switch (variant) {
    case "poster":
      return game.coverImage ?? null;
    case "thumb":
      return game.headerImage ?? game.coverImage ?? null;
    default:
      // hero / wide / banner read best from the ultra-wide library art, then
      // the landscape header, then the vertical box art as a last resort.
      return game.heroImage ?? game.headerImage ?? game.coverImage ?? null;
  }
}

export interface ArtImageProps {
  game: ArtSubject;
  variant?: ArtVariant;
  /** Secondary seed, so generated fallback tiles still differ from each other. */
  index?: number;
  className?: string;
  /** Load immediately (above-the-fold art) instead of lazily. */
  eager?: boolean;
  /** Alt text; defaults to "<title> cover art". */
  alt?: string;
  showTitle?: boolean;
  /** Passed to the generated fallback only. */
  hue?: number;
  /**
   * Inline style, used mainly for `objectPosition` so a card can set a
   * per-game focal point without baking the value into a class name.
   */
  style?: CSSProperties;
}

export function ArtImage({
  game,
  variant = "poster",
  index = 0,
  className,
  eager = false,
  alt,
  showTitle,
  hue,
  style,
}: ArtImageProps) {
  const [failed, setFailed] = useState(false);
  const src = artSourceFor(game, variant);

  if (!src || failed) {
    return (
      <GameArt
        game={game}
        variant={variant}
        index={index}
        showTitle={showTitle}
        hue={hue}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? `${game.title} ${variant === "poster" ? "cover art" : "artwork"}`}
      loading={eager ? "eager" : "lazy"}
      decoding={eager ? "sync" : "async"}
      onError={() => setFailed(true)}
      style={style}
      className={clsx("bg-bg-deep object-cover", className)}
    />
  );
}
