import Link from "next/link";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import type { Game } from "@/lib/types";
import { ArtImage } from "@/components/art/ArtImage";
import { Badge, PlatformPills, PriceTag, ScoreBadge } from "@/components/ui/primitives";
import { WishlistButton } from "@/components/player/player-actions";
import { genreName } from "@/data/taxonomy";
import { compactNumber } from "@/lib/generate";

/* ===========================================================================
 * Game cards
 * ---------------------------------------------------------------------------
 * Three presentations of the same record. Art comes from the storefront when
 * the catalogue resolved it, and from the key-art engine otherwise.
 * ======================================================================== */

export function GameCard({
  game,
  className,
  showWishlist = true,
  eager = false,
}: {
  game: Game;
  className?: string;
  showWishlist?: boolean;
  eager?: boolean;
}) {
  const primaryGenre = game.genre[0];

  return (
    <article
      className={clsx(
        "group relative flex flex-col overflow-hidden border border-line bg-bg-card/60 transition-all duration-300",
        "hover:-translate-y-1 hover:border-accent/60 hover:shadow-glow focus-within:-translate-y-1",
        className,
      )}
    >
      {/* accent hairline that lights up on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 z-30 h-0.5 scale-x-0 bg-gradient-to-r from-accent via-accent-bright to-transparent transition-transform duration-500 group-hover:scale-x-100" />

      <Link href={`/games/${game.slug}`} className="relative block aspect-[2/3] overflow-hidden" aria-label={game.title}>
        <ArtImage
          game={game}
          variant="poster"
          showTitle={false}
          eager={eager}
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.07]"
        />

        {/* legibility scrim: real box art can be bright or busy */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/35 to-bg-deep/10" />

        {/* specular sweep */}
        <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:left-2/3 group-hover:opacity-100" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          <div className="flex flex-col items-start gap-1">
            {game.isComingSoon ? <Badge tone="soon">Coming soon</Badge> : null}
            {game.isNew && !game.isComingSoon ? <Badge tone="new">New</Badge> : null}
            {game.isTrending ? <Badge tone="live">Trending</Badge> : null}
            {game.isFree ? <Badge tone="accent">Free to play</Badge> : null}
          </div>
          <div className="flex flex-col items-end gap-1">
            <ScoreBadge rating={game.rating} />
            {game.discount > 0 ? <Badge tone="live">-{game.discount}%</Badge> : null}
          </div>
        </div>

        {/* hover call to action */}
        <span className="pointer-events-none absolute inset-x-2.5 bottom-2.5 hidden translate-y-3 items-center justify-center gap-1.5 bg-accent/95 py-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
          View game
          <ChevronRight className="h-3.5 w-3.5" />
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col p-3">
          <h3 className="font-display text-[15px] font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-colors duration-300 group-hover:text-accent">
            {game.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-2xs uppercase tracking-[0.12em] text-ink-secondary">
            {genreName(primaryGenre)} · {game.developer}
          </p>
        </div>
      </Link>

      {showWishlist ? (
        <div className="absolute bottom-[86px] right-2.5 z-20 translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 focus-within:translate-x-0 focus-within:opacity-100">
          <WishlistButton game={game} />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col justify-between gap-2.5 border-t border-line px-3 py-2.5 transition-colors duration-300 group-hover:bg-bg-card/50">
        <div className="flex items-center justify-between gap-2">
          <PriceTag price={game.price} discount={game.discount} isFree={game.isFree} isComingSoon={game.isComingSoon} />
          <span className="text-2xs uppercase tracking-wider text-ink-muted">
            {compactNumber(game.wishlistCount)} wishlisted
          </span>
        </div>
        <PlatformPills platforms={game.platforms} max={5} />
      </div>
    </article>
  );
}

/** Horizontal list row used on browse, search and admin tables. */
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
      <div className="h-16 w-16 shrink-0 overflow-hidden border border-line">
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
      className="group flex items-center gap-3 border border-line bg-bg-card/40 p-2 transition hover:border-accent"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden border border-line">
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

