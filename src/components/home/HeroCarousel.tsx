"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";
import type { Game } from "@/lib/types";
import { ArtImage } from "@/components/art/ArtImage";
import { Badge, PlatformPills, PriceTag } from "@/components/ui/primitives";
import { TrailerButton } from "@/components/home/TrailerModal";
import { WishlistButton } from "@/components/player/player-actions";
import { genreName } from "@/data/taxonomy";
import { compactNumber } from "@/lib/generate";

/* ===========================================================================
 * Hero carousel
 * ---------------------------------------------------------------------------
 * Auto-advancing feature reel. Ken-Burns on the key art, arrow controls on the
 * edges, a dot rail under the copy and a progress line along the bottom edge.
 * Pauses on hover/focus. The progress bar restarts on every slide because it
 * is keyed by the game slug.
 *
 * The copy block follows the storefront feature layout: eyebrow, marquee
 * title, tagline, blurb, taxonomy row, score out of ten, platform row and the
 * action row. The thumbnail rail is gone — slides are addressed through the
 * edge arrows and the dots, which is what the reference layout asks for.
 * ======================================================================== */

const DURATION = 7000;

export function HeroCarousel({ games }: { games: Game[] }) {
  const [index, setIndex] = useState(0);
  /** `hovering` covers the pointer and focus; `held` is the manual pause toggle. */
  const [hovering, setHovering] = useState(false);
  const [held, setHeld] = useState(false);
  const paused = hovering || held;
  /** Horizontal swipe origin — phones page the reel by dragging, not by arrows. */
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || games.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % games.length), DURATION);
    return () => window.clearInterval(id);
  }, [paused, games.length]);

  /*
   * Keyboard navigation (WCAG 2.1.1): ArrowLeft/ArrowRight page through the
   * reel from anywhere on the page, Space holds or resumes it. Typing targets
   * and the trailer dialog are excluded so a keypress is never stolen mid-form
   * or mid-video, and Space is ignored while a button or link holds focus so
   * native activation still wins.
   */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
        if (target.closest('[role="dialog"]')) return;
        if (event.key === " " && (tag === "BUTTON" || tag === "A")) return;
      }
      if (event.key === "ArrowRight") {
        setIndex((i) => (i + 1) % games.length);
      } else if (event.key === "ArrowLeft") {
        setIndex((i) => (i - 1 + games.length) % games.length);
      } else if (event.key === " ") {
        event.preventDefault();
        setHeld((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [games.length]);

  if (!games.length) return null;
  const game = games[Math.min(index, games.length - 1)];
  /** The score is out of ten, the row of stars is out of five. */
  const filledStars = Math.round(game.rating / 2);
  const step = (delta: number) => setIndex((i) => (i + delta + games.length) % games.length);

  return (
    <section
      className="hero-carousel relative isolate touch-pan-y overflow-hidden border-b border-line bg-bg-deep"
      aria-label="Featured games"
      /* touch-pan-y keeps vertical page scrolling alive over the hero while
         horizontal drags are claimed for slide-to-change navigation */
      data-paused={paused}
      aria-roledescription="carousel"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
      onTouchStart={(event) => {
        touchX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchX.current;
        touchX.current = null;
        if (start == null || games.length < 2) return;
        const dx = (event.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(dx) < 44) return; // ignore taps and micro-jitters
        step(dx < 0 ? 1 : -1);
      }}
    >
      {/*
        Every slide stays mounted and is cross-faded with opacity. Mounting only
        the active slide meant each rotation started a cold image fetch, so the
        reel advanced into an empty frame before the art arrived — the hero
        looked like it had no photography at all. Keeping them all in the DOM
        lets the browser decode ahead.
        Only the first slide is `eager`: blocking the initial paint on ten
        ultra-wide frames would cost more than the preload is worth, and the
        lazy ones are already in the viewport so they resolve within a beat.
        Ken Burns is applied to the active slide only, so one animation runs
        instead of ten.
      */}
      {games.map((item, i) => {
        const active = i === index;
        return (
          <div
            key={item.slug}
            aria-hidden={!active}
            className={clsx(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              active ? "opacity-100" : "opacity-0",
            )}
          >
            <div className={clsx("h-full w-full", active && "animate-hero-zoom")}>
              <ArtImage
                game={item}
                variant="hero"
                showTitle={false}
                eager={i === 0}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        );
      })}
      {/*
        Legibility scrim. Tuned so the photograph stays clearly visible: the
        copy side is dark enough for AA text, the top and right of the frame
        only get a light wash, and the bottom carries the dot rail and the
        progress line.
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-bg-deep/80 to-bg-deep/10 lg:via-bg-deep/55 lg:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/70 via-transparent to-transparent" />
      {/* keeps the copy readable without flattening the whole frame */}
      <div className="absolute inset-y-0 left-0 w-full max-w-[88%] bg-gradient-to-r from-bg-deep/90 via-bg-deep/50 to-transparent lg:max-w-[58%]" />
      <div className="aura-accent absolute inset-0 opacity-60" />

      {/* edge arrows - hidden on phones, where the dot rail below does the work */}
      {games.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous featured game"
            className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center border border-line bg-bg-deep/70 text-white backdrop-blur transition hover:border-accent hover:text-accent sm:grid lg:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next featured game"
            className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center border border-line bg-bg-deep/70 text-white backdrop-blur transition hover:border-accent hover:text-accent sm:grid lg:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {/* 440px keeps the first screen below the header cinematic but phone-sized
          (§15: hero ~400–500px); it grows to the desktop stage from sm up. */}
      <div className="shell relative flex min-h-[440px] flex-col justify-end pb-14 pt-24 xs:min-h-[500px] sm:min-h-[600px] lg:min-h-[680px] lg:pb-16 lg:pt-28">
        <div key={`${game.slug}-copy`} className="max-w-3xl animate-fade-up">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 border border-accent/60 bg-accent/15 px-2.5 py-1 font-display text-2xs font-bold uppercase tracking-[0.18em] text-white">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-accent" />
              Featured game
            </span>
            {game.isNew ? <Badge tone="new">New release</Badge> : null}
            {game.isTrending ? <Badge tone="live">Trending</Badge> : null}
            {game.isComingSoon ? <Badge tone="soon">Coming soon</Badge> : null}
          </div>

          <h1 className="h-display mt-4 text-4xl sm:text-5xl xl:text-6xl">
            <Link href={`/games/${game.slug}`} className="transition-colors hover:text-accent">
              {game.title}
            </Link>
          </h1>

          {game.tagline ? (
            <p className="mt-3.5 font-display text-sm uppercase tracking-[0.18em] text-accent">{game.tagline}</p>
          ) : null}

          <p className="mt-3.5 line-clamp-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:line-clamp-none sm:text-base">
            {game.shortDescription}
          </p>

          {/* taxonomy row - genres are pipe separated in the reference layout */}
          <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-display text-2xs font-bold uppercase tracking-[0.16em]">
            {game.genre.slice(0, 3).map((genre, i) => (
              <span key={genre} className="flex items-center gap-2.5">
                {i > 0 ? (
                  <span aria-hidden="true" className="text-ink-muted">
                    |
                  </span>
                ) : null}
                <Link href={`/categories/${genre}`} className="text-white transition hover:text-accent">
                  {genreName(genre)}
                </Link>
              </span>
            ))}
          </div>

          {/* score, review volume and provenance */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-secondary">
            <span className="flex items-center gap-1.5" title={`INFINITY score ${game.rating.toFixed(1)} / 10`}>
              <span className="flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={clsx("h-3.5 w-3.5", i < filledStars ? "fill-accent text-accent" : "text-ink-muted/50")}
                  />
                ))}
              </span>
              <span className="font-display font-bold text-white">{game.rating.toFixed(1)}</span>
              <span className="text-ink-muted">/ 10</span>
            </span>
            <span>{compactNumber(game.reviewCount)} reviews</span>
            <span className="hidden sm:inline">{game.developer}</span>
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
              View game
              <ArrowRight className="h-4 w-4" />
            </Link>
            {game.videos.length ? (
              <TrailerButton
                game={game}
                videos={game.videos}
                className="inline-flex items-center gap-2 border border-line bg-bg-deep/40 px-6 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur transition hover:border-accent hover:text-accent"
              />
            ) : null}
            <div className="min-w-[190px] flex-1 sm:flex-none">
              <WishlistButton game={game} variant="wide" />
            </div>
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
        </div>

        {/* dot rail + slide counter + manual pause toggle, centred under the copy */}
        {games.length > 1 ? (
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
            <span
              aria-hidden="true"
              className="hidden font-display text-2xs font-bold tabular-nums tracking-[0.2em] text-ink-muted sm:block"
            >
              {String(index + 1).padStart(2, "0")} / {String(games.length).padStart(2, "0")}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {games.map((item, i) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${item.title}`}
                  aria-current={i === index}
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-7 bg-accent" : "w-1.5 bg-white/30 hover:bg-white/60",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setHeld((value) => !value)}
              aria-label={paused ? "Resume the featured reel" : "Pause the featured reel"}
              aria-pressed={held}
              className="grid h-7 w-7 place-items-center border border-line text-ink-secondary transition hover:border-accent hover:text-accent"
            >
              {paused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
            </button>
          </div>
        ) : null}
      </div>

      {/* autoplay progress - keyed by slug so every slide restarts the line */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-[2px] overflow-hidden bg-line/50">
        <div key={`${game.slug}-progress`} className="hero-progress" />
      </div>
    </section>
  );
}

