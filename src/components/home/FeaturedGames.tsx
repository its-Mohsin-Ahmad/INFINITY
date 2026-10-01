import { GameCard } from "@/components/game/GameCard";
import { SectionHeading } from "@/components/ui/primitives";
import { mostWishlisted } from "@/lib/catalogue/query";
import type { Game } from "@/lib/types";

/* ===========================================================================
 * Featured games — the asymmetric homepage composition (§5, §6, §44, §72)
 * ---------------------------------------------------------------------------
 * ONE dominant card plus a 2×2 supporting cluster on a deliberate CSS grid,
 * never an equal flex row:
 *
 *   lg:  [ 1.9fr  ] [ 1fr ] [ 1fr ]
 *        ANCHOR    M-1    M-2        row 1
 *        (spans)   M-3    M-4        row 2
 *
 * At 1440px the anchor lands near 570×616 — several times the visual area of
 * a ~310×300 supporting card — so the composition immediately reads as
 * art-directed hierarchy. Heights derive from the sizing tokens
 * (2 × --card-medium-height + the 1rem grid gap), so the system stays on its
 * defined scale rather than generating arbitrary pixels.
 *
 * Responsive: a 320px phone gets one column (readable, no 130px slivers), a
 * 360px+ phone gets 2-up with the anchor spanning both columns, and every tier
 * drops one size step below `sm` (--card-*-mobile). lg unlocks the real
 * asymmetric grid. Hover lift lives on the card shell (transform only), so
 * neighbours never reflow.
 * ======================================================================== */

interface FeaturedSlot {
  game: Game;
  variant: "featured" | "medium";
  /** Deliberate grid placement (§60), applied from sm / lg upward. */
  className: string;
  eager?: boolean;
}

export function FeaturedGames() {
  const pool = mostWishlisted(5);
  if (pool.length < 5) return null;
  const [anchor, ...rest] = pool;

  const slots: FeaturedSlot[] = [
    {
      game: anchor,
      variant: "featured",
      className: "col-span-1 min-[360px]:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:row-span-2",
      eager: true,
    },
    { game: rest[0], variant: "medium", className: "lg:col-start-2 lg:row-start-1" },
    { game: rest[1], variant: "medium", className: "lg:col-start-3 lg:row-start-1" },
    { game: rest[2], variant: "medium", className: "lg:col-start-2 lg:row-start-2" },
    { game: rest[3], variant: "medium", className: "lg:col-start-3 lg:row-start-2" },
  ];

  return (
    <section aria-label="Featured games">
      <SectionHeading
        eyebrow="Featured games"
        title="The stage right now"
        description="One headline title, four supporting picks — sized by editorial importance, not by grid habit."
        href="/games?sort=rating"
        linkLabel="View all"
      />
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-4 lg:h-[calc(var(--card-medium-height)*2+1rem)] lg:grid-cols-[1.9fr_1fr_1fr] lg:grid-rows-2">
        {slots.map((slot) => (
          <GameCard
            key={slot.game.slug}
            game={slot.game}
            variant={slot.variant}
            eager={slot.eager ?? false}
            className={slot.className}
          />
        ))}
      </div>
    </section>
  );
}