import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { TrailerButton } from "@/components/home/TrailerModal";
import type { Game } from "@/lib/types";
import { ArtImage } from "@/components/art/ArtImage";
import { Badge, PlatformPills, PriceTag, ScoreBadge } from "@/components/ui/primitives";
import { AddToCartButton, WishlistButton } from "@/components/player/player-actions";
import { genreName } from "@/data/taxonomy";
import { compactNumber } from "@/lib/generate";
import { cartGame, trailerGame, wishlistGame } from "@/lib/catalogue/client-props";
import {
  CARD_ASPECT_CLASS,
  CARD_VARIANTS,
  badgesFor,
  focalPointFor,
  focalStyle,
  type CardVariant,
  type CardVariantSpec,
  type FocalPoint,
} from "./card-tokens";

/* ===========================================================================
 * Game cards
 * ---------------------------------------------------------------------------
 * One component, ten compositions. Every variant is described by a row in
 * card-tokens.ts, so a new card size is a token, not a new file.
 *
 * Interaction rules that hold for all of them:
 *
 *   . A single stretched link owns the whole card. Its accessible name is the
 *     title, so assistive tech never meets duplicate links.
 *   . Wishlist and cart render as real buttons *above* that link (z-30), never
 *     nested inside it, so they stay independently focusable and clickable.
 *   . Hover never changes geometry. No translate, no border-width change, no
 *     height change - only the accent hairline and an art zoom inside an
 *     already-clipped frame. The corner wishlist is the one exception, and it
 *     is opacity-only.
 * ======================================================================== */

export interface GameCardProps {
  game: Game;
  /** Composition + sizing token. Defaults to the classic browse poster. */
  variant?: CardVariant;
  className?: string;
  /** Set false to drop every interactive affordance (static/editorial use). */
  showActions?: boolean;
  /** Override the deterministic focal point for a one-off placement. */
  focalPoint?: FocalPoint;
  eager?: boolean;
  /** Secondary seed so two generated fallbacks of the same title differ. */
  index?: number;
  /** Trending rank (§12): a red tab at the artwork's bottom-left, 01-based. */
  rank?: number;
}

const clamp: Record<CardVariantSpec["descriptionLines"], string> = {
  1: "line-clamp-1",
  2: "line-clamp-1 sm:line-clamp-2",
  3: "line-clamp-2 sm:line-clamp-3",
};

/** The secondary line under a title, or null when the variant has no meta. */
function metaLine(game: Game, spec: CardVariantSpec): string | null {
  if (spec.metaDetail === "none") return null;
  const primary = genreName(game.genre[0]);
  if (spec.metaDetail === "full") {
    return `${primary} · ${game.developer} · ${game.releaseDate.slice(0, 4)}`;
  }
  return `${primary} · ${game.developer}`;
}


/** Status badges, top-left of the art, trimmed to the variant's budget. */
function CardBadges({ game, spec }: { game: Game; spec: CardVariantSpec }) {
  const badges = spec.showBadges ? badgesFor(game, spec.maxBadges) : [];
  if (!badges.length) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-start gap-1 p-2.5">
      {badges.map((b) => (
        <Badge key={b.key} tone={b.tone}>
          {b.label}
        </Badge>
      ))}
    </div>
  );
}

/**
 * Rank badge + INFINITY score at the artwork's bottom-left (§12, §20).
 * The rank is a red rectangular tab painted *inside* the frame — never
 * outside the card — and the score chip sits beside it so both stay legible
 * over bright artwork. Overlay variants carry their score in the overlay
 * instead, so this cluster only shows the score when there is no overlay.
 */
function CardArtFooter({
  game,
  rank,
  showScore,
}: {
  game: Game;
  rank?: number;
  showScore: boolean;
}) {
  if (!rank && !showScore) return null;
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 z-20 flex items-center gap-1.5 p-2.5">
      {rank ? (
        <span className="bg-accent px-2 py-1 font-display text-[11px] font-extrabold leading-none tabular-nums text-white shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {String(rank).padStart(2, "0")}
        </span>
      ) : null}
      {showScore ? <ScoreBadge rating={game.rating} /> : null}
    </div>
  );
}

/**
 * Corner wishlist for the poster variants. Fades in on hover and on keyboard
 * focus, but is always in the DOM, so tabbing to it never reflows the grid.
 */
function CardCornerWishlist({ game, reveal }: { game: Game; reveal: boolean }) {
  return (
    <div
      className={clsx(
        /* after:-inset-2 keeps the visible 32px button but gives touch a
           ~48px target, so the heart is comfortable on iOS and Android. */
        "absolute right-2.5 top-2.5 z-30 transition duration-300 ease-premium after:absolute after:-inset-2 after:content-[''] hover:scale-110",
        reveal
          ? /* touch devices have no hover — the heart stays exposed (§101) */
            "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100"
          : "opacity-100",
      )}
    >
      <WishlistButton game={wishlistGame(game)} />
    </div>
  );
}

/** Art frame: art, scrim, badges, score, optional overlay title. */
function CardArt({
  game,
  spec,
  focal,
  eager,
  index,
  fill = false,
  showActions,
  rank,
}: {
  game: Game;
  spec: CardVariantSpec;
  focal: FocalPoint;
  eager: boolean;
  index: number;
  /** Row layout: the art fills its column height instead of using its aspect. */
  fill?: boolean;
  showActions: boolean;
  rank?: number;
}) {
  const meta = metaLine(game, spec);
  return (
    <div className={clsx("relative", fill && "h-full")}>
      <div
        className={clsx(
          "relative overflow-hidden bg-bg-deep",
          spec.stretch
            ? clsx("flex-1", spec.minHeight)
            : fill
              ? "h-full min-h-[7.5rem]"
              : CARD_ASPECT_CLASS[spec.aspect],
        )}
      >
        <ArtImage
          game={game}
          variant={spec.art}
          index={index}
          showTitle={false}
          eager={eager}
          alt=""
          style={focalStyle(focal)}
          className="h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.06]"
        />
      </div>

      {/* legibility scrim - real box art can be bright or very busy */}
      <span aria-hidden="true" className={clsx("pointer-events-none absolute inset-0", spec.scrim)} />

      {/* specular sweep, fully inside the clipped frame */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:left-2/3 group-hover:opacity-100"
      />

      <CardBadges game={game} spec={spec} />
      <CardArtFooter
        game={game}
        rank={rank}
        showScore={spec.showScore && !spec.overlayTitle}
      />

      {spec.overlayTitle ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col p-4">
          <h3
            className={clsx(
              "font-display text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-colors duration-300 group-hover:text-accent",
              spec.title,
            )}
          >
            {game.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {spec.showScore ? <ScoreBadge rating={game.rating} /> : null}
            {meta ? <p className={clsx(spec.meta)}>{meta}</p> : null}
          </div>
          {spec.showDescription ? (
            <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-relaxed text-ink-secondary sm:line-clamp-3">
              {game.shortDescription}
            </p>
          ) : null}
          {spec.showPlatforms ? (
            <div className="mt-2.5">
              <PlatformPills platforms={game.platforms} max={spec.platformMax} />
            </div>
          ) : null}
          {showActions && spec.showCta ? (
            <div className="pointer-events-auto mt-3.5 flex flex-wrap items-center gap-2">
              <Link
                href={`/games/${game.slug}`}
                className="group/cta inline-flex items-center gap-1.5 rounded-control bg-accent px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-accent-bright"
              >
                {spec.ctaLabel || "View game"}
                <ArrowRight className="h-3.5 w-3.5 transition group-hover/cta:translate-x-0.5" />
              </Link>
              <TrailerButton
                game={trailerGame(game)}
                videos={game.videos}
                className="inline-flex items-center gap-1.5 rounded-control border border-white/25 bg-bg-deep/60 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur transition hover:border-accent"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {showActions && spec.wishlist === "corner" ? (
        <CardCornerWishlist game={game} reveal={spec.wishlistReveal} />
      ) : null}
    </div>
  );
}


/** Title block and blurb. The title is skipped when it is burned into the art. */
function CardBody({ game, spec, meta }: { game: Game; spec: CardVariantSpec; meta: string | null }) {
  return (
    <>
      {!spec.overlayTitle ? (
        <div>
          <h3
            className={clsx(
              "font-display text-white transition-colors duration-300 group-hover:text-accent",
              spec.title,
            )}
          >
            {game.title}
          </h3>
          {meta ? <p className={clsx("mt-1", spec.meta)}>{meta}</p> : null}
        </div>
      ) : null}

      {spec.showDescription ? (
        <p className={clsx("text-xs leading-relaxed text-ink-secondary", clamp[spec.descriptionLines])}>
          {game.shortDescription}
        </p>
      ) : null}

      {spec.showFeatures ? (
        <ul className="flex flex-wrap gap-1">
          {game.features.slice(0, 3).map((f) => (
            <li
              key={f}
              className="border border-line bg-bg-deep/50 px-1.5 py-[2px] font-display text-[10px] font-bold uppercase tracking-wider text-ink-muted"
            >
              {f}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

/** Price, wishlist count and platform pills. */
function CardMetaRow({ game, spec }: { game: Game; spec: CardVariantSpec }) {
  return (
    <>
      {spec.showPrice ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PriceTag
            price={game.price}
            discount={game.discount}
            isFree={game.isFree}
            isComingSoon={game.isComingSoon}
            size={spec.priceSize}
          />
          {spec.showWishlistCount ? (
            <span className="text-2xs uppercase tracking-wider text-ink-muted">
              {compactNumber(game.wishlistCount)} wishlisted
            </span>
          ) : null}
        </div>
      ) : null}
      {spec.showPlatforms ? <PlatformPills platforms={game.platforms} max={spec.platformMax} /> : null}
    </>
  );
}

/**
 * The action cluster, rendered at z-30 above the stretched card link so these
 * stay real, independently tabbable controls rather than decoration trapped
 * inside a link. There is deliberately no "view" affordance here: the card
 * surface already navigates.
 */
function CardActions({
  game,
  spec,
  showActions,
}: {
  game: Game;
  spec: CardVariantSpec;
  showActions: boolean;
}) {
  if (!showActions) return null;
  const wantsWishlist = spec.wishlist === "action";
  const wantsCart = spec.showCart;
  if (!wantsWishlist && !wantsCart) return null;
  return (
    <div className="relative z-30 flex flex-col gap-2">
      {wantsCart ? <AddToCartButton game={cartGame(game)} className="w-full" /> : null}
      {wantsWishlist ? <WishlistButton game={wishlistGame(game)} variant="wide" className="w-full" /> : null}
    </div>
  );
}


/* ===========================================================================
 * GameCard — the spec-driven composition
 * --------------------------------------------------------------------------- */

/**
 * The stretched link. It owns the whole card surface, so clicks on art, title,
 * meta and whitespace all navigate, while wishlist / cart buttons stay real
 * controls above it (z-30) rather than decoration trapped inside a link.
 */
function CardLink({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.slug}`} aria-label={game.title} className="absolute inset-0 z-10 focus-visible:outline-none" />
  );
}

/** Accent hairline across the top edge. Scale only — hovering never reflows. */
function CardHairline() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-30 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-accent via-accent-bright to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100"
    />
  );
}

export function GameCard({
  game,
  variant = "standard",
  className,
  showActions = true,
  focalPoint,
  eager = false,
  index = 0,
  rank,
}: GameCardProps) {
  const spec = CARD_VARIANTS[variant];
  const focal = focalPoint ?? focalPointFor(game, variant);
  const meta = metaLine(game, spec);

  /** Controls that render in the body and must sit above the stretched link. */
  const hasBodyActions = showActions && (spec.wishlist === "action" || spec.showCart);
  /** The body exists when there is copy to show, or controls that live in it. */
  const body = spec.showTextBody || hasBodyActions;

  const shell = clsx(
    "group relative flex overflow-hidden rounded-card border border-line bg-bg-card/60 transition duration-300 ease-out hover:-translate-y-[5px] hover:border-accent/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.45)] focus-within:border-accent/60 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-bright motion-reduce:hover:translate-y-0",
    spec.stretch && "h-full",
    className,
  );

  /* --- row layout: art beside the copy ---------------------------------- */
  if (spec.layout === "row") {
    return (
      <article className={clsx(shell, "items-stretch")}>
        <div className="relative w-[42%] shrink-0 overflow-hidden border-r border-line bg-bg-deep">
          <CardArt
            game={game}
            spec={spec}
            focal={focal}
            eager={eager}
            index={index}
            fill
            showActions={showActions}
            rank={rank}
          />
        </div>

        {body ? (
          <div className={clsx("flex min-w-0 flex-1 flex-col gap-2.5", spec.bodyPadding)}>
            <CardBody game={game} spec={spec} meta={meta} />
            <CardMetaRow game={game} spec={spec} />
            {hasBodyActions ? (
              <div className="mt-auto pt-1">
                <CardActions game={game} spec={spec} showActions={showActions} />
              </div>
            ) : null}
          </div>
        ) : null}

        <CardLink game={game} />
        <CardHairline />
      </article>
    );
  }

  /* --- stacked layouts: tile / poster / panel / band / promo ------------ */
  return (
    <article className={clsx(shell, "flex-col")}>
      <CardArt game={game} spec={spec} focal={focal} eager={eager} index={index} showActions={showActions} rank={rank} />

      {body ? (
        <div className={clsx("relative flex flex-col gap-2.5", spec.bodyPadding)}>
          <CardBody game={game} spec={spec} meta={meta} />
          <CardMetaRow game={game} spec={spec} />
          {hasBodyActions ? <CardActions game={game} spec={spec} showActions={showActions} /> : null}
        </div>
      ) : null}

      <CardLink game={game} />
      <CardHairline />
    </article>
  );
}

export function GameListRow({ game, index }: { game: Game; index?: number }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group flex items-center gap-4 border-b border-line px-3 py-3 transition hover:bg-bg-card/60"
    >
      {typeof index === "number" ? (
        <span className="w-7 shrink-0 font-display text-lg font-extrabold tabular-nums text-ink-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-card border border-line">
        <ArtImage game={game} variant="thumb" showTitle={false} className="h-full w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold uppercase tracking-wide text-white group-hover:text-accent">
          {game.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-secondary">
          {genreName(game.genre[0])} · {game.developer} · {game.releaseDate.slice(0, 4)}
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-6 md:flex">
        <span className="text-xs tabular-nums text-ink-secondary">{compactNumber(game.viewCount)} views</span>
        <ScoreBadge rating={game.rating} />
        <div className="w-[130px] text-right">
          <PriceTag
            price={game.price}
            discount={game.discount}
            isFree={game.isFree}
            isComingSoon={game.isComingSoon}
            size="sm"
          />
        </div>
      </div>
    </Link>
  );
}

/** Compact tile used inside dashboards and sidebars. */
export function GameMiniTile({ game }: { game: Game }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group flex items-center gap-3 overflow-hidden rounded-card border border-line bg-bg-card/40 p-2 transition hover:border-accent"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-card border border-line">
        <ArtImage game={game} variant="thumb" showTitle={false} className="h-full w-full" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-xs font-bold uppercase tracking-wide text-white group-hover:text-accent">
          {game.title}
        </p>
        <p className="truncate text-2xs text-ink-muted">{game.developer}</p>
      </div>
    </Link>
  );
}
