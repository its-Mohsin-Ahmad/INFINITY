import type { Game } from "@/lib/types";
import type { ArtVariant } from "@/components/art/art-scene";
import { hashString } from "@/lib/generate";

/* ===========================================================================
 * Game card design tokens
 * ---------------------------------------------------------------------------
 * One table drives every card presentation. Adding a variant means adding a
 * row here, not another bespoke component: the composition in GameCard.tsx
 * reads these values and nothing else.
 *
 * Two rules the table exists to enforce:
 *
 *   1. Geometry is fixed per variant (aspect + stretch), so a grid can place
 *      cards at deliberate spans without any card reflowing on hover.
 *   2. Every variant keeps its own action cluster, so wishlist / CTA never
 *      depend on a parent link and are always independently tabbable.
 * ======================================================================== */

/* -------------------------------------------------------------- variants */

export type CardVariant =
  | "compact"
  | "small"
  | "standard"
  | "medium"
  | "large"
  | "featured"
  | "cinematic"
  | "wide"
  | "horizontal"
  | "promotional";

/** Rail width ladder. Only meaningful inside a horizontally scrolling shelf. */
export type CardSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Composition family. `tile`/`poster` are art-over-title; `panel`/`band` are
 * art-over-caption with a body; `row` puts art beside the copy; `promo` is the
 * commercial variant.
 */
export type CardLayout = "tile" | "poster" | "panel" | "band" | "row" | "promo";

/** Mirrors the `tone` union accepted by the Badge primitive. */
export type BadgeTone = "accent" | "live" | "neutral" | "new" | "soon" | "gold" | "outline";

/* ---------------------------------------------------------------- aspect */

export type CardAspect = "thumb" | "square" | "tall" | "portrait" | "landscape" | "cinematic";

/** Fixed art geometry. Never derived from content, so grids stay aligned. */
export const CARD_ASPECT_CLASS: Record<CardAspect, string> = {
  thumb: "aspect-[16/10]",
  square: "aspect-square",
  tall: "aspect-[3/4]",
  portrait: "aspect-[2/3]",
  landscape: "aspect-video",
  cinematic: "aspect-[21/9]",
};

/** Rail widths: fixed pixels rather than fractions, so carousels snap cleanly. */
export const CARD_SIZE_WIDTH: Record<CardSize, string> = {
  xs: "w-[136px]",
  sm: "w-[164px]",
  md: "w-[206px]",
  lg: "w-[252px]",
  xl: "w-[320px]",
};

/** Matching pixel value, for scroll-snap padding maths and tests. */
export const CARD_SIZE_STEP: Record<CardSize, number> = {
  xs: 136,
  sm: 164,
  md: 206,
  lg: 252,
  xl: 320,
};

/* ----------------------------------------------------------------- spec */

export interface CardVariantSpec {
  layout: CardLayout;
  /** Which asset pool the art renderer should read. */
  art: ArtVariant;
  aspect: CardAspect;
  /**
   * Fill the grid cell instead of sitting at its intrinsic aspect. A stretched
   * card swaps its aspect class for a minimum height and grows into whatever
   * height the grid row resolves to, so a card beside a taller neighbour ends
   * flush at the bottom instead of leaving a gap underneath it.
   */
  stretch: boolean;
  /** Baseline height for stretched variants. Null when `stretch` is false. */
  minHeight: string | null;
  /** Title type ramp. Overlay titles get a shadow applied by the card. */
  title: string;
  /** Secondary line under the title. */
  meta: string;
  metaDetail: "short" | "full" | "none";
  /** Whether the card reserves a text body under the art at all. */
  showTextBody: boolean;
  showDescription: boolean;
  descriptionLines: 1 | 2 | 3;
  showPlatforms: boolean;
  platformMax: number;
  showPrice: boolean;
  priceSize: "sm" | "md" | "lg";
  showScore: boolean;
  showWishlistCount: boolean;
  showBadges: boolean;
  /** How many badges fit; the list is priority-ordered, then trimmed to this. */
  maxBadges: number;
  showFeatures: boolean;
  showCta: boolean;
  ctaLabel: string;
  /** Promotional variants get a real cart button instead of a decorative CTA. */
  showCart: boolean;
  /**
   * How the wishlist control is presented:
   *   corner - floating over the art
   *   action - a row button under the body
   *   none   - no wishlist control (editorial slots and dense shelves)
   */
  wishlist: "corner" | "action" | "none";
  /** When false, corner controls stay visible at rest. */
  wishlistReveal: boolean;
  bodyPadding: string;
  /** Title sits on the art rather than in the body. */
  overlayTitle: boolean;
  /** Legibility scrim painted over the art. */
  scrim: string;
}

/**
 * The variant table.
 *
 * `showCta` is false for every variant on purpose: no card renders a floating
 * "View game" pill. Navigation is the whole card surface (one stretched link);
 * the only controls on a card are ones that *do* something - wishlist, and on
 * the promotional variant, add to cart.
 */
export const CARD_VARIANTS: Record<CardVariant, CardVariantSpec> = {

  /* Dense tile: dense shelves, sidebars, "you may also like" blocks. */
  compact: {
    layout: "tile",
    art: "thumb",
    aspect: "thumb",
    stretch: false,
    minHeight: null,
    title: "text-2xs font-bold uppercase leading-tight tracking-wide",
    meta: "text-[10px] uppercase tracking-wider text-ink-muted line-clamp-1",
    metaDetail: "none",
    showTextBody: true,
    showDescription: false,
    descriptionLines: 1,
    showPlatforms: false,
    platformMax: 0,
    showPrice: false,
    priceSize: "sm",
    showScore: false,
    showWishlistCount: false,
    showBadges: false,
    maxBadges: 0,
    showFeatures: false,
    showCta: false,
    ctaLabel: "",
    showCart: false,
    wishlist: "none",
    wishlistReveal: false,
    bodyPadding: "px-2.5 py-2",
    overlayTitle: false,
    scrim: "bg-gradient-to-t from-bg-deep/70 to-transparent",
  },

  /* Small poster: rail cards and narrow grid columns. */
  small: {
    layout: "poster",
    art: "poster",
    aspect: "portrait",
    stretch: false,
    minHeight: null,
    title: "line-clamp-1 text-xs font-extrabold uppercase leading-[1.15] tracking-wide sm:text-[13px]",
    meta: "text-2xs uppercase tracking-wider text-ink-muted line-clamp-1",
    metaDetail: "short",
    showTextBody: true,
    showDescription: false,
    descriptionLines: 1,
    showPlatforms: false,
    platformMax: 0,
    showPrice: false,
    priceSize: "sm",
    showScore: true,
    showWishlistCount: false,
    showBadges: true,
    maxBadges: 1,
    showFeatures: false,
    showCta: false,
    ctaLabel: "",
    showCart: false,
    wishlist: "corner",
    wishlistReveal: false,
    bodyPadding: "px-2.5 py-2 sm:px-3 sm:py-2.5",
    overlayTitle: false,
    scrim: "bg-gradient-to-t from-bg-deep/60 to-transparent",
  },

  /* Standard poster: the browse grid default. */
  standard: {
    layout: "poster",
    art: "poster",
    aspect: "portrait",
    stretch: true,
    minHeight: "min-h-[var(--card-standard-art-mobile)] sm:min-h-[12rem]",
    title: "line-clamp-1 text-[13px] font-extrabold uppercase leading-[1.15] tracking-wide sm:text-[15px]",
    meta: "text-2xs uppercase tracking-wider text-ink-secondary line-clamp-1",
    metaDetail: "short",
    showTextBody: true,
    showDescription: false,
    descriptionLines: 1,
    showPlatforms: false,
    platformMax: 0,
    showPrice: true,
    priceSize: "sm",
    showScore: true,
    showWishlistCount: false,
    showBadges: true,
    maxBadges: 2,
    showFeatures: false,
    showCta: false,
    ctaLabel: "",
    showCart: false,
    wishlist: "corner",
    wishlistReveal: true,
    bodyPadding: "px-3 py-2.5 sm:px-3.5 sm:py-3",
    overlayTitle: false,
    scrim: "bg-gradient-to-t from-bg-deep/70 via-transparent to-transparent",
  },

  /* Medium: a standard card that also carries a blurb (Â§3C, Â§41 3/4 art). */
  medium: {
    layout: "panel",
    art: "poster",
    aspect: "tall",
    stretch: true,
    minHeight: "min-h-[var(--card-medium-art-mobile)] sm:min-h-[9.5rem]",
    title: "line-clamp-1 text-[15px] font-extrabold uppercase leading-[1.15] tracking-tight sm:text-lg",
    meta: "text-2xs uppercase tracking-wider text-ink-secondary line-clamp-1",
    metaDetail: "short",
    showTextBody: true,
    showDescription: true,
    descriptionLines: 2,
    showPlatforms: false,
    platformMax: 0,
    showPrice: true,
    priceSize: "md",
    showScore: true,
    showWishlistCount: false,
    showBadges: true,
    maxBadges: 2,
    showFeatures: false,
    showCta: false,
    ctaLabel: "",
    showCart: false,
    wishlist: "corner",
    wishlistReveal: true,
    bodyPadding: "px-3 py-2.5 sm:px-4 sm:py-3.5",
    overlayTitle: false,
    scrim: "bg-gradient-to-t from-bg-deep/70 via-transparent to-transparent",
  },

  /* Large: landscape artwork with the copy overlaid on it (Â§3D, Â§15).
     Density: title + genre line + description + platforms + rating + CTA. */
  large: {
    layout: "panel",
    art: "hero",
    aspect: "thumb",
    stretch: true,
    minHeight: "min-h-[var(--card-featured-height-mobile)] sm:min-h-[var(--card-large-height)]",
    title: "line-clamp-2 text-lg font-extrabold uppercase leading-[1.08] tracking-tight sm:text-xl",
    meta: "text-2xs uppercase tracking-[0.14em] text-ink-secondary line-clamp-1",
    metaDetail: "full",
    showTextBody: false,
    showDescription: true,
    descriptionLines: 3,
    showPlatforms: true,
    platformMax: 3,
    showPrice: false,
    priceSize: "lg",
    showScore: true,
    showWishlistCount: false,
    showBadges: true,
    maxBadges: 3,
    showFeatures: false,
    showCta: true,
    ctaLabel: "View game",
    showCart: false,
    wishlist: "corner",
    wishlistReveal: true,
    bodyPadding: "px-4 py-3.5 sm:px-5 sm:py-4",
    overlayTitle: true,
    scrim: "bg-gradient-to-t from-bg-deep via-bg-deep/55 to-bg-deep/15",
  },

  /* Featured: the dominant card of the asymmetric homepage composition
     (Â§3E, Â§44). 16:9 full-bleed art under a mini-hero overlay: title,
     description, rating, platforms and the CTA pair. */
  featured: {
    layout: "band",
    art: "banner",
    aspect: "landscape",
    stretch: true,
    minHeight: "min-h-[var(--card-featured-height-mobile)] sm:min-h-[var(--card-featured-height)]",
    title: "h-display line-clamp-2 text-2xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-3xl",
    meta: "text-2xs uppercase tracking-[0.16em] text-ink-secondary",
    metaDetail: "full",
    showTextBody: false,
    showDescription: true,
    descriptionLines: 3,
    showPlatforms: true,
    platformMax: 3,
    showPrice: false,
    priceSize: "md",
    showScore: true,
    showWishlistCount: false,
    showBadges: true,
    maxBadges: 2,
    showFeatures: false,
    showCta: true,
    ctaLabel: "View game",
    showCart: false,
    wishlist: "corner",
    wishlistReveal: true,
    bodyPadding: "px-4 py-3 sm:px-5 sm:py-4",
    overlayTitle: true,
    scrim: "bg-gradient-to-t from-bg-deep via-bg-deep/55 to-bg-deep/10",
  },

  /* Cinematic: the widest band, used at the very top of a section. */
  cinematic: {
    layout: "band",
    art: "hero",
    aspect: "cinematic",
    stretch: false,
    minHeight: null,
    title: "h-display text-3xl font-extrabold uppercase leading-[1.02] tracking-tight",
    meta: "text-2xs uppercase tracking-[0.16em] text-ink-secondary",
    metaDetail: "short",
    showTextBody: false,
    showDescription: false,
    descriptionLines: 1,
    showPlatforms: false,
    platformMax: 0,
    showPrice: false,
    priceSize: "md",
    showScore: true,
    showWishlistCount: false,
    showBadges: true,
    maxBadges: 2,
    showFeatures: false,
    showCta: false,
    ctaLabel: "",
    showCart: false,
    wishlist: "corner",
    wishlistReveal: true,
    bodyPadding: "px-5 py-4",
    overlayTitle: true,
    scrim: "bg-gradient-to-t from-bg-deep via-bg-deep/45 to-bg-deep/20",
  },

  /* Wide: a promotional band with a small caption row (Â§3G, Â§41 21:9 art). */
  wide: {
    layout: "band",
    art: "hero",
    aspect: "cinematic",
    stretch: false,
    minHeight: null,
    title: "text-lg font-extrabold uppercase leading-[1.1] tracking-tight",
    meta: "text-2xs uppercase tracking-[0.14em] text-ink-secondary line-clamp-1",
    metaDetail: "short",
    showTextBody: true,
    showDescription: false,
    descriptionLines: 1,
    showPlatforms: false,
    platformMax: 0,
    showPrice: true,
    priceSize: "md",
    showScore: true,
    showWishlistCount: false,
    showBadges: true,
    maxBadges: 2,
    showFeatures: false,
    showCta: false,
    ctaLabel: "",
    showCart: false,
    wishlist: "corner",
    wishlistReveal: true,
    bodyPadding: "px-4 py-3.5",
    overlayTitle: false,
    scrim: "bg-gradient-to-t from-bg-deep/70 via-transparent to-transparent",
  },

  /* Horizontal: art beside the copy. Fills a half-width grid cell. */
  horizontal: {
    layout: "row",
    art: "thumb",
    aspect: "thumb",
    stretch: false,
    minHeight: null,
    title: "text-base font-extrabold uppercase leading-[1.15] tracking-tight",
    meta: "text-2xs uppercase tracking-wider text-ink-secondary line-clamp-1",
    metaDetail: "short",
    showTextBody: true,
    showDescription: true,
    descriptionLines: 2,
    showPlatforms: false,
    platformMax: 0,
    showPrice: true,
    priceSize: "sm",
    showScore: true,
    showWishlistCount: false,
    showBadges: true,
    maxBadges: 1,
    showFeatures: false,
    showCta: false,
    ctaLabel: "",
    showCart: false,
    wishlist: "action",
    wishlistReveal: false,
    bodyPadding: "px-4 py-3.5",
    overlayTitle: false,
    scrim: "bg-gradient-to-t from-bg-deep/50 to-transparent",
  },

  /* Promotional: the only variant that sells. Carries a real cart button. */
  promotional: {
    layout: "promo",
    art: "hero",
    aspect: "landscape",
    stretch: true,
    minHeight: "min-h-[12rem]",
    title: "text-lg font-extrabold uppercase leading-[1.1] tracking-tight",
    meta: "text-2xs uppercase tracking-[0.14em] text-ink-secondary line-clamp-1",
    metaDetail: "short",
    showTextBody: true,
    showDescription: false,
    descriptionLines: 1,
    showPlatforms: true,
    platformMax: 3,
    showPrice: true,
    priceSize: "lg",
    showScore: true,
    showWishlistCount: false,
    showBadges: true,
    maxBadges: 1,
    showFeatures: false,
    showCta: false,
    ctaLabel: "",
    showCart: true,
    wishlist: "action",
    wishlistReveal: false,
    bodyPadding: "px-4 py-3.5",
    overlayTitle: false,
    scrim: "bg-gradient-to-t from-bg-deep/80 via-bg-deep/30 to-transparent",
  },
};

/* --------------------------------------------------------------- badges */

export interface CardBadge {
  key: string;
  label: string;
  tone: BadgeTone;
}

/**
 * Badges in strict priority order, trimmed to the variant's budget. A record
 * can satisfy several rules at once (coming soon + new + trending + free +
 * discount) and a small poster has no room for all of them, so the order here
 * decides what any given card is allowed to say.
 */
export function badgesFor(game: Game, max: number): CardBadge[] {
  if (max <= 0) return [];
  const all: CardBadge[] = [];
  if (game.isComingSoon) {
    all.push({ key: "soon", label: "Coming soon", tone: "soon" });
  } else if (game.isNew) {
    all.push({ key: "new", label: "New", tone: "new" });
  }
  if (game.discount > 0) {
    all.push({ key: "deal", label: `-${game.discount}%`, tone: "live" });
  }
  if (game.isFree && !game.isComingSoon) {
    all.push({ key: "free", label: "Free to play", tone: "accent" });
  }
  if (game.isTrending) {
    all.push({ key: "trending", label: "Trending", tone: "gold" });
  }

  // Trim to the variant's budget; the array is already in priority order.
  return all.slice(0, max);
}

/* --------------------------------------------------------- focal points */

export interface FocalPoint {
  /** Horizontal origin, 0-100. */
  x: number;
  /** Vertical origin, 0-100. */
  y: number;
}

/**
 * Per-game focal point, derived from the slug so a title crops identically on
 * the server and on the client, and so neighbouring cards rarely focus the
 * same spot.
 *
 * Landscape art leans its origin upward because subjects sit above the
 * horizon; poster art leans further up, since box art loses its lower third
 * first. Fixed values are used where a centred subject is the whole point of
 * the composition.
 */
export function focalPointFor(game: Pick<Game, "slug">, variant: CardVariant): FocalPoint {
  const h = hashString(`${game.slug}::card::${variant}`);

  switch (variant) {
    case "cinematic":
    case "featured":
    case "wide":
    case "promotional":
      return { x: 44 + (h % 13), y: 28 + ((h >> 7) % 18) };
    case "horizontal":
    case "compact":
      return { x: 50, y: 42 };
    default:
      return { x: 46 + ((h >> 5) % 9), y: 32 + ((h >> 12) % 14) };
  }
}

/** Inline style for `object-position`; keeps the computed value out of the class list. */
export function focalStyle(focal: FocalPoint): { objectPosition: string } {
  const x = Math.min(100, Math.max(0, Math.round(focal.x)));
  const y = Math.min(100, Math.max(0, Math.round(focal.y)));
  return { objectPosition: `${x}% ${y}%` };
}

/* ------------------------------------------------ dev-only consistency checks */

if (process.env.NODE_ENV !== "production") {
  (Object.keys(CARD_VARIANTS) as CardVariant[]).forEach((key) => {
    const spec = CARD_VARIANTS[key];
    if (spec.stretch !== Boolean(spec.minHeight)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[card-tokens] "${key}": stretch=${spec.stretch} but minHeight=${spec.minHeight ?? "null"} â€” stretched cards need a baseline height.`,
      );
    }
  });
}

