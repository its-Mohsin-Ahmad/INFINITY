import Link from "next/link";
import clsx from "clsx";
import type { Game } from "@/lib/types";
import { GameArt } from "@/components/art/GameArt";
import { Badge, PlatformPills, PriceTag, ScoreBadge } from "@/components/ui/primitives";
import { WishlistButton } from "@/components/player/player-actions";
import { genreName } from "@/data/taxonomy";
import { compactNumber } from "@/lib/generate";

/* ===========================================================================
 * Game cards
 * ---------------------------------------------------------------------------
 * Three presentations of the same record. Art comes from the key-art engine
 * unless an authorised cover has been attached through the CMS.
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
        "group relative flex flex-col overflow-hidden border border-line bg-bg-card/60 transition duration-300 hover:border-accent/70 hover:shadow-glow",
        className,
      )}
    >
      <Link href={`/games/${game.slug}`} className="relative block aspect-[2/3] overflow-hidden" aria-label={game.title}>
        {game.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.coverImage}
            alt={`${game.title} cover art`}
            loading={eager ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <GameArt
            game={game}
            variant="poster"
            showTitle={false}
            className="h-full w-full transition duration-500 group-hover:scale-[1.06]"
          />
        )}

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

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg-deep via-bg-deep/40 to-transparent p-3">
          <h3 className="font-display text-[15px] font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow">
            {game.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-2xs uppercase tracking-[0.12em] text-ink-secondary">
            {genreName(primaryGenre)} · {game.developer}
          </p>
        </div>
      </Link>

      {showWishlist ? (
        <div className="absolute bottom-[74px] right-2.5 opacity-0 transition duration-300 group-hover:opacity-100 focus-within:opacity-100">
          <WishlistButton game={game} />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col justify-between gap-2.5 border-t border-line px-3 py-2.5">
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
        <GameArt game={game} variant="thumb" showTitle={false} className="h-full w-full" />
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
        <GameArt game={game} variant="thumb" showTitle={false} className="h-full w-full" />
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

