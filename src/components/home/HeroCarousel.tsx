"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { ChevronRight, Play, Star } from "lucide-react";
import type { Game } from "@/lib/types";
import { GameArt } from "@/components/art/GameArt";
import { Badge, PlatformPills, PriceTag } from "@/components/ui/primitives";
import { AddToCartButton, WishlistButton } from "@/components/player/player-actions";
import { genreName } from "@/data/taxonomy";

/* ===========================================================================
 * Hero carousel
 * ---------------------------------------------------------------------------
 * Auto-advancing feature reel. Ken-Burns on the key art, keyboard accessible
 * rail, pauses on hover/focus. The progress bar restarts on every slide
 * because it is keyed by the game slug.
 * ======================================================================== */

const DURATION = 7000;

export function HeroCarousel({ games }: { games: Game[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || games.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % games.length), DURATION);
    return () => window.clearInterval(id);
  }, [paused, games.length]);

  if (!games.length) return null;
  const game = games[Math.min(index, games.length - 1)];

  return (
    <section
      className="hero-carousel relative isolate overflow-hidden border-b border-line bg-bg-deep"
      data-paused={paused}
      aria-roledescription="carousel"
      aria-label="Featured games"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div key={game.slug} className="absolute inset-0 animate-fade-in">
        <div className="h-full w-full animate-kenburns">
          <GameArt game={game} variant="hero" showTitle={false} className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-bg-deep/90 to-bg-deep/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg-deep/60" />
      <div className="aura-accent absolute inset-0" />

      <div className="shell relative flex min-h-[520px] flex-col justify-end gap-8 pb-10 pt-14 lg:min-h-[620px] lg:flex-row lg:items-end lg:justify-between lg:pb-14">
        <div key={`${game.slug}-copy`} className="max-w-2xl animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Featured now</span>
            {game.isNew ? <Badge tone="new">New release</Badge> : null}
            {game.isTrending ? <Badge tone="live">Trending</Badge> : null}
            {game.isComingSoon ? <Badge tone="soon">Coming soon</Badge> : null}
          </div>

          <h1 className="h-display mt-3 text-4xl sm:text-5xl xl:text-6xl">{game.title}</h1>

          <p className="mt-3 font-display text-sm uppercase tracking-[0.18em] text-accent">
            {game.tagline ?? game.shortDescription}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-secondary sm:text-base">
            {game.shortDescription}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-secondary">
            <span className="flex items-center gap-1.5 font-display font-bold text-white">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {game.rating.toFixed(1)}
              <span className="font-normal text-ink-muted">/ 10</span>
            </span>
            <span>{game.genre.slice(0, 3).map(genreName).join(" · ")}</span>
            <span>{game.developer}</span>
            <span>{game.releaseDate}</span>
          </div>

          <div className="mt-4">
            <PlatformPills platforms={game.platforms} max={6} />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/games/${game.slug}`}
              className="inline-flex items-center gap-2 bg-accent px-6 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
            >
              <Play className="h-4 w-4" />
              Explore game
            </Link>
            <AddToCartButton game={game} platform={game.platforms[0] ?? null} className="w-auto min-w-[190px]" />
            <WishlistButton game={game} variant="wide" />
            <div className="hidden border-l border-line pl-4 sm:block">
              <PriceTag
                price={game.price}
                discount={game.discount}
                isFree={game.isFree}
                isComingSoon={game.isComingSoon}
                size="lg"
              />
            </div>
          </div>

          <div className="mt-8 h-px w-full max-w-md overflow-hidden bg-line">
            <div key={`${game.slug}-progress`} className="hero-progress" />
          </div>
        </div>

        {/* selection rail */}
        <div className="no-scrollbar flex w-full shrink-0 gap-2 overflow-x-auto lg:w-[248px] lg:flex-col lg:overflow-visible">
          {games.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${item.title}`}
              aria-current={i === index}
              className={clsx(
                "group relative flex h-16 w-28 shrink-0 items-end overflow-hidden border transition lg:h-[68px] lg:w-full",
                i === index ? "border-accent" : "border-line opacity-60 hover:opacity-100",
              )}
            >
              <GameArt game={item} variant="thumb" showTitle={false} className="h-full w-full" />
              <span className="relative w-full truncate bg-gradient-to-t from-bg-deep to-transparent px-2 pb-1.5 pt-4 text-left font-display text-2xs font-bold uppercase tracking-wider text-white">
                {item.title}
              </span>
              {i === index ? <span className="absolute inset-x-0 top-0 h-0.5 bg-accent" /> : null}
            </button>
          ))}
          <Link
            href="/games"
            className="flex h-16 w-28 shrink-0 items-center justify-center gap-1 border border-line px-2 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-white lg:h-[68px] lg:w-full"
          >
            All games
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

