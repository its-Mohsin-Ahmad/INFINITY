import type { ReactNode } from "react";
import type { Game } from "@/lib/types";
import { GameCard } from "./GameCard";
import type { CardVariant } from "./card-tokens";
import { Carousel, CarouselItem } from "@/components/ui/interactive";
import { SectionHeading } from "@/components/ui/primitives";

/* ===========================================================================
 * Rows and grids
 * ======================================================================== */

export function GameGrid({
  games,
  columns = 6,
  className,
  eager = false,
  variant,
  ranked = false,
}: {
  games: Game[];
  columns?: 3 | 4 | 5 | 6;
  className?: string;
  eager?: boolean;
  /** Composition token for every card in the grid (§58). Defaults to standard. */
  variant?: CardVariant;
  /** Number the cards 01, 02, 03… at the artwork's bottom-left (§12). */
  ranked?: boolean;
}) {
  const cols =
    columns === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : columns === 4
        ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      : columns === 5
        ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";

  return (
    <div className={`grid gap-3 sm:gap-4 ${cols} ${className ?? ""}`}>
      {games.map((game, i) => (
        <GameCard
          key={game.slug}
          game={game}
          variant={variant}
          rank={ranked ? i + 1 : undefined}
          eager={eager && i < 6}
        />
      ))}
    </div>
  );
}

/** Horizontally scrollable shelf with a section header. */
export function GameRow({
  title,
  eyebrow,
  description,
  games,
  href,
  linkLabel,
  size = "md",
  action,
  variant,
  ranked = false,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  games: Game[];
  href?: string;
  linkLabel?: string;
  size?: "sm" | "md";
  action?: ReactNode;
  /** Composition token for every card on the shelf (§58). Defaults to standard. */
  variant?: CardVariant;
  /** Number the cards 01, 02, 03… at the artwork's bottom-left (§12). */
  ranked?: boolean;
}) {
  if (!games.length) return null;
  return (
    <section>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        href={href}
        linkLabel={linkLabel}
        action={action}
      />
      <Carousel step={size === "sm" ? 200 : 260}>
        {games.map((game, i) => (
          <CarouselItem key={game.slug} className={size === "sm" ? "w-[140px] sm:w-[168px]" : "w-[162px] sm:w-[212px]"}>
            <GameCard
              game={game}
              variant={variant}
              rank={ranked ? i + 1 : undefined}
            />
          </CarouselItem>
        ))}
      </Carousel>
    </section>
  );
}

/** Ranked table — used for charts, "top 10" sections and admin views. */
export function RankedGamesTable({
  games,
  valueLabel = "Score",
  renderValue,
}: {
  games: Game[];
  valueLabel?: string;
  renderValue?: (game: Game) => string;
}) {
  return (
    <div className="border border-line">
      <div className="flex items-center justify-between border-b border-line bg-bg-muted/60 px-4 py-2.5 font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
        <span># / Title</span>
        <span>{valueLabel}</span>
      </div>
      <ol>
        {games.map((game, i) => (
          <li key={game.slug}>
            <div className="flex items-center gap-4 border-b border-line-soft px-4 py-3 transition hover:bg-bg-card/50 last:border-b-0">
              <span className="w-6 font-display text-sm font-extrabold tabular-nums text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <a href={`/games/${game.slug}`} className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold uppercase tracking-wide text-white hover:text-accent">
                  {game.title}
                </p>
                <p className="truncate text-2xs text-ink-muted">
                  {game.developer} · {game.releaseDate.slice(0, 4)}
                </p>
              </a>
              <span className="shrink-0 font-display text-sm font-bold tabular-nums text-white">
                {renderValue ? renderValue(game) : game.rating.toFixed(1)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
