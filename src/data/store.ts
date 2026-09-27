import type { PlatformSlug, ProductKind, PromoBanner, GamePassPlan, StoreProduct } from "@/lib/types";
import { slugForTitle } from "./resolve";
import { hashString } from "@/lib/generate";

/* ===========================================================================
 * Store â€” add-on products, bundles, memberships and merch.
 * ---------------------------------------------------------------------------
 * Catalogue games are rendered from the game records themselves (see the
 * /store page); this file covers everything a storefront sells *around* the
 * games. Every `gameSlug` is resolved against the live catalogue.
 * ======================================================================== */

const PC_PS: PlatformSlug[] = ["pc", "ps5", "xbox-series"];
const ALL_CONSOLE: PlatformSlug[] = ["pc", "ps5", "ps4", "xbox-series", "xbox-one", "switch"];

function product(
  partial: Omit<StoreProduct, "slug" | "seed"> & { slug?: string },
): StoreProduct {
  return {
    ...partial,
    slug: partial.slug ?? partial.id,
    seed: hashString(partial.id),
  };
}

export const STORE_PRODUCTS: StoreProduct[] = [
  product({
    id: "sku-phantom-liberty",
    name: "Phantom Liberty",
    kind: "dlc",
    gameSlug: slugForTitle("Cyberpunk 2077", "dlc-01"),
    blurb: "A spy-thriller expansion: new district, new endings and a full endgame campaign.",
    price: 29.99,
    discount: 20,
    platforms: ["pc", "ps5", "xbox-series"],
    includes: ["Full story expansion", "New district and gig chain", "Expanded endgame builds", "Exclusive cyberware tier"],
  }),
  product({
    id: "sku-shadow-erdtree",
    name: "Shadow of the Erdtree",
    kind: "expansion",
    gameSlug: slugForTitle("Elden Ring", "dlc-02"),
    blurb: "The land between the roots â€” a full-size expansion with new regions, bosses and lore.",
    price: 39.99,
    discount: 0,
    platforms: PC_PS,
    includes: ["New open-world region", "10+ boss encounters", "New weapons and ashes", "Character carry-over"],
  }),
  product({
    id: "sku-blood-and-wine",
    name: "Blood and Wine",
    kind: "expansion",
    gameSlug: slugForTitle("The Witcher 3: Wild Hunt", "dlc-03"),
    blurb: "A knightly fairy-tale region with its own vineyards, curses and a hundred hours of side work.",
    price: 19.99,
    discount: 25,
    platforms: ALL_CONSOLE,
    includes: ["Full story expansion", "New region: Toussaint", "New gear sets", "New game plus support"],
  }),
  product({
    id: "sku-shattered-space",
    name: "Shattered Space",
    kind: "dlc",
    gameSlug: slugForTitle("Starfield", "dlc-04"),
    blurb: "A story-driven faction expansion set on a world torn apart by its own grav-drive accident.",
    price: 34.99,
    discount: 15,
    platforms: ["pc", "xbox-series"],
    includes: ["New storyline", "New region to explore", "Exclusive quests and gear", "Level-scaled content"],
  }),
  product({
    id: "sku-open-world-legends",
    name: "Open-World Legends Bundle",
    kind: "bundle",
    gameSlug: null,
    blurb: "Four generation-defining open worlds in one purchase â€” the deepest discount of the sale.",
    price: 199.96,
    discount: 55,
    platforms: PC_PS,
    includes: ["4 full base games", "All publisher-ready day-one patches", "Cross-platform cloud saves", "Bundle price locked at checkout"],
  }),
  product({
    id: "sku-coop-essentials",
    name: "Co-op Essentials Bundle",
    kind: "bundle",
    gameSlug: null,
    blurb: "The games our community groups play most, packaged for a squad of four.",
    price: 89.97,
    discount: 40,
    platforms: ALL_CONSOLE,
    includes: ["3 multiplayer titles", "4-player online co-op", "Cross-save between platforms", "New-player starter guides"],
  }),
  product({
    id: "sku-plus-monthly",
    name: "INFINITY Plus â€” Monthly",
    kind: "membership",
    gameSlug: null,
    blurb: "Member pricing on every purchase, cloud saves and a monthly vault drop.",
    price: 9.99,
    discount: 0,
    platforms: [],
    includes: ["Member price on all purchases", "100 GB cloud save vault", "Monthly vault giveaway", "Early access to sales"],
  }),
  product({
    id: "sku-plus-annual",
    name: "INFINITY Plus â€” Annual",
    kind: "membership",
    gameSlug: null,
    blurb: "A full year of Plus at two months free, plus the annual anniversary vault.",
    price: 99.99,
    discount: 17,
    platforms: [],
    includes: ["Everything in Plus Monthly", "Two months free vs monthly", "Anniversary vault drop", "Priority support queue"],
  }),
  product({
    id: "sku-season-pass-shadows",
    name: "Assassin's Creed Shadows â€” Season Pass",
    kind: "dlc",
    gameSlug: slugForTitle("Assassin's Creed Shadows", "dlc-05"),
    blurb: "Two story expansions, the launch bonus quest line and an early-unlock gear set.",
    price: 39.99,
    discount: 10,
    platforms: ["pc", "ps5", "xbox-series"],
    includes: ["Two story expansions", "Bonus quest line", "Exclusive gear set", "Expansion art book (digital)"],
  }),
  product({
    id: "sku-marketplace-credit",
    name: "Creator Marketplace Credit â€” 1,700",
    kind: "bundle",
    gameSlug: slugForTitle("Minecraft", "dlc-06"),
    blurb: "Credit pack for community-made maps, skins and texture packs, with 10% bonus credit.",
    price: 19.99,
    discount: 0,
    platforms: [],
    includes: ["1,700 credit (1,500 + 200 bonus)", "Spend on any marketplace item", "Never expires", "Instant delivery to your library"],
  }),
  product({
    id: "sku-signal-hoodie",
    name: "INFINITY Signal Hoodie",
    kind: "merch",
    gameSlug: null,
    blurb: "Heavyweight cotton with the reflective INFINITY signal mark across the back.",
    price: 59.99,
    discount: 0,
    platforms: [],
    includes: ["400gsm brushed cotton", "Reflective signal mark", "Sizes XSâ€“3XL", "Ships worldwide"],
  }),
  product({
    id: "sku-wave-cap",
    name: "INFINITY Wave Cap",
    kind: "merch",
    gameSlug: null,
    blurb: "Six-panel cap with the embroidered waveform mark and an adjustable strap.",
    price: 24.99,
    discount: 15,
    platforms: [],
    includes: ["Embroidered waveform mark", "Adjustable strap", "One size", "Ships worldwide"],
  }),
];

export const STORE_PROMOS: PromoBanner[] = [
  {
    id: "promo-free-weekend",
    eyebrow: "Free weekend",
    title: "Play the co-op lane free until Monday",
    body: "Every free-to-play title in the co-op lane is unlocked for the weekend â€” progress carries over if you buy.",
    ctaLabel: "Browse free games",
    ctaHref: "/games",
    variant: "free-weekend",
    seed: 3001,
  },
  {
    id: "promo-season-sale",
    eyebrow: "Season sale",
    title: "Verified discounts through 31 December",
    body: "Hundreds of titles reduced, with prices re-checked against the catalogue at checkout.",
    ctaLabel: "See all deals",
    ctaHref: "/deals",
    variant: "new-worlds",
    seed: 3002,
  },
  {
    id: "promo-plus",
    eyebrow: "INFINITY Plus",
    title: "Member pricing stacks on top of sale prices",
    body: "Join Plus and every discount you see gets a member price at checkout â€” automatically.",
    ctaLabel: "View membership",
    ctaHref: "/store",
    variant: "game-pass",
    seed: 3003,
  },
  {
    id: "promo-circuit",
    eyebrow: "Esports",
    title: "The Autumn Split finals are live from Berlin",
    body: "Eight teams, three days, half a million dollars. Watch from the esports hub.",
    ctaLabel: "Open esports hub",
    ctaHref: "/esports",
    variant: "esports",
    seed: 3004,
  },
];

export const GAME_PASS_PLANS: GamePassPlan[] = [
  {
    id: "plan-basic",
    name: "INFINITY Basic",
    tagline: "Cloud saves and wishlists for everyone.",
    price: 0,
    cadence: "free forever",
    highlight: false,
    features: [
      { label: "Full catalogue browsing and wishlists", included: true },
      { label: "5 GB cloud save vault", included: true },
      { label: "Member pricing on purchases", included: false },
      { label: "Monthly vault giveaway", included: false },
      { label: "Early access to sales", included: false },
    ],
    cta: "Current plan",
  },
  {
    id: "plan-plus",
    name: "INFINITY Plus",
    tagline: "Member pricing on everything, all year.",
    price: 9.99,
    cadence: "per month",
    highlight: true,
    features: [
      { label: "Member pricing on all purchases", included: true },
      { label: "100 GB cloud save vault", included: true },
      { label: "Monthly vault giveaway", included: true },
      { label: "Early access to sales", included: true },
      { label: "Priority support queue", included: false },
    ],
    cta: "Choose Plus",
  },
  {
    id: "plan-ultimate",
    name: "INFINITY Ultimate",
    tagline: "Everything in Plus, plus launcher extras.",
    price: 16.99,
    cadence: "per month",
    highlight: false,
    features: [
      { label: "Everything in INFINITY Plus", included: true },
      { label: "500 GB cloud save vault", included: true },
      { label: "Priority support queue", included: true },
      { label: "Companion app beta access", included: true },
      { label: "Two guest passes per quarter", included: true },
    ],
    cta: "Choose Ultimate",
  },
];

export const STORE_KINDS: { id: ProductKind | "games"; label: string }[] = [
  { id: "games", label: "Games" },
  { id: "dlc", label: "DLC" },
  { id: "expansion", label: "Expansions" },
  { id: "bundle", label: "Bundles" },
  { id: "membership", label: "Membership" },
  { id: "merch", label: "Merch" },
];
