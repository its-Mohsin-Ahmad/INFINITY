import type { Metadata } from "next";
import Link from "next/link";
import { GAME_PASS_PLANS, STORE_KINDS, STORE_PRODUCTS, STORE_PROMOS } from "@/data/store";
import { GAMES, computeStats } from "@/lib/catalogue";
import { queryGames } from "@/lib/catalogue/query";
import { GameArt } from "@/components/art/GameArt";
import { BrowseTabs } from "@/components/browse/browse-tabs";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading, Stat } from "@/components/ui/primitives";
import { AddToCartButton } from "@/components/player/player-actions";
import { GameCard } from "@/components/game/GameCard";
import { discountedPrice } from "@/lib/generate";
import type { GamePassPlan, PlatformSlug, PromoBanner, StoreProduct } from "@/lib/types";

/* ===========================================================================
 * /store — the storefront.
 * ---------------------------------------------------------------------------
 * Games render from the catalogue itself; add-ons, bundles, memberships and
 * merch come from STORE_PRODUCTS. Pricing reuses `discountedPrice` (the same
 * rule the cart quotes with), and purchase actions go through the shared
 * AddToCartButton, which falls back to local pricing on static hosts.
 * ======================================================================== */

export const metadata: Metadata = {
  title: "Store",
  description:
    "Games, DLC, expansions, bundles, INFINITY Plus membership and merch — with verified discounts and cart pricing that matches the shelf.",
};

function ProductCard({
  artSlug,
  artTitle,
  artHue,
  name,
  blurb,
  price,
  discount,
  platforms,
  includes,
  href,
}: {
  artSlug: string;
  artTitle: string;
  artHue: number;
  name: string;
  blurb: string;
  price: number;
  discount: number;
  platforms: PlatformSlug[];
  includes: string[];
  href: string | null;
}) {
  const art = { slug: artSlug, title: artTitle, genre: [] as never[], accentHue: artHue % 360, rating: 0 };
  const cart = {
    slug: artSlug,
    title: name,
    price,
    discount,
    isFree: price === 0,
    isComingSoon: false,
    platforms,
  };

  return (
    <article className="flex h-full flex-col border border-line bg-bg-card/50 transition hover:border-accent/70">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-line">
        {href ? (
          <Link href={href} aria-label={name} className="block h-full w-full">
            <GameArt
              game={art}
              variant="wide"
              showTitle={false}
              className="h-full w-full transition duration-500 hover:scale-[1.04]"
            />
          </Link>
        ) : (
          <GameArt game={art} variant="wide" showTitle={false} className="h-full w-full" />
        )}
        {discount > 0 ? (
          <span className="absolute right-3 top-3 bg-accent px-2 py-1 font-display text-2xs font-bold text-white">
            -{discount}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            {href ? (
              <Link href={href} className="transition hover:text-accent">
                {name}
              </Link>
            ) : (
              name
            )}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-secondary">{blurb}</p>
        </div>

        <ul className="space-y-1 text-2xs text-ink-muted">
          {includes.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-1.5">
              <span className="text-accent">✓</span>
              <span className="truncate">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-2 border-t border-line-soft pt-3">
          <div className="flex items-baseline gap-2">
            {discount > 0 ? (
              <>
                <span className="bg-accent px-1.5 py-[2px] font-display text-2xs font-bold text-white">
                  -{discount}%
                </span>
                <span className="text-xs text-ink-muted line-through">${price.toFixed(2)}</span>
              </>
            ) : null}
            <span className="font-display text-lg font-extrabold tabular-nums text-white">
              ${discountedPrice(price, discount).toFixed(2)}
            </span>
          </div>
          <AddToCartButton game={cart} />
        </div>
      </div>
    </article>
  );
}
function PlanCard({ plan }: { plan: GamePassPlan }) {
  return (
    <div
      className={`flex h-full flex-col border p-5 ${
        plan.highlight ? "border-accent bg-bg-nav" : "border-line bg-bg-card/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.14em] text-white">{plan.name}</p>
          <p className="mt-1 text-2xs text-ink-muted">{plan.tagline}</p>
        </div>
        {plan.highlight ? (
          <span className="border border-accent bg-accent/15 px-2 py-1 font-display text-2xs font-bold uppercase text-white">
            Popular
          </span>
        ) : null}
      </div>

      <p className="mt-4 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-extrabold tabular-nums text-white">
          {plan.price === 0 ? "Free" : `$${plan.price.toFixed(2)}`}
        </span>
        <span className="text-2xs uppercase tracking-wider text-ink-muted">{plan.cadence}</span>
      </p>

      <ul className="mt-4 flex-1 space-y-2 text-xs">
        {plan.features.map((feature) => (
          <li
            key={feature.label}
            className={`flex gap-2 ${feature.included ? "text-white" : "text-ink-muted line-through"}`}
          >
            <span className={feature.included ? "text-accent" : "text-ink-muted"}>{feature.included ? "✓" : "✕"}</span>
            {feature.label}
          </li>
        ))}
      </ul>

      <Link
        href="/game-pass"
        className={`mt-5 block px-4 py-2.5 text-center font-display text-2xs font-bold uppercase tracking-[0.16em] text-white transition ${
          plan.highlight ? "bg-accent hover:bg-accent-bright" : "border border-line hover:border-accent"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
/* Accent per promo variant — keeps banners on-palette without new art. */
const PROMO_ACCENT: Record<PromoBanner["variant"], string> = {
  "free-weekend": "#34D399",
  "new-worlds": "#B4FF39",
  "game-pass": "#38BDF8",
  launcher: "#A78BFA",
  esports: "#FB7185",
};

function ProductGrid({ items }: { items: StoreProduct[] }) {
  if (!items.length) {
    return <p className="text-sm text-ink-secondary">Nothing on this shelf right now — check back soon.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <ProductCard
          key={p.id}
          artSlug={p.slug}
          artTitle={p.name}
          artHue={p.seed}
          name={p.name}
          blurb={p.blurb}
          price={p.price}
          discount={p.discount}
          platforms={p.platforms}
          includes={p.includes}
          href={p.gameSlug ? `/games/${p.gameSlug}` : null}
        />
      ))}
    </div>
  );
}
export default function StorePage() {
  const stats = computeStats();
  const storePicks = queryGames({ minRating: 8.6 }, "rating").slice(0, 8);
  const byKind = (kind: StoreProduct["kind"]) => STORE_PRODUCTS.filter((p) => p.kind === kind);

  const tabs = [
    {
      id: "games",
      label: "Games",
      badge: String(stats.games),
      content: (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {storePicks.map((g) => (
            <div key={g.slug} className="flex h-full flex-col gap-2">
              <GameCard game={g} className="h-full" showActions={false} />
              <AddToCartButton game={g} />
            </div>
          ))}
        </div>
      ),
    },
    { id: "dlc", label: "DLC", badge: String(byKind("dlc").length), content: <ProductGrid items={byKind("dlc")} /> },
    {
      id: "expansion",
      label: "Expansions",
      badge: String(byKind("expansion").length),
      content: <ProductGrid items={byKind("expansion")} />,
    },
    {
      id: "bundle",
      label: "Bundles",
      badge: String(byKind("bundle").length),
      content: <ProductGrid items={byKind("bundle")} />,
    },
    {
      id: "membership",
      label: "Membership",
      badge: String(GAME_PASS_PLANS.length),
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GAME_PASS_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <ProductGrid items={byKind("membership")} />
        </div>
      ),
    },
    { id: "merch", label: "Merch", badge: String(byKind("merch").length), content: <ProductGrid items={byKind("merch")} /> },
  ];

  return (
    <>
      <PageHero
        eyebrow="Store"
        title={
          <>
            Buy, subscribe,
            <br />
            own it
          </>
        }
        description="Games from the catalogue, DLC and expansions from their publishers, bundles, INFINITY Plus membership and official merch — one cart, one verified price."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={stats.games.toLocaleString()} label="Games" />
          <Stat value={String(STORE_PRODUCTS.length)} label="Add-ons & merch" />
          <Stat value={String(GAME_PASS_PLANS.length)} label="Plans" />
          <Stat value={String(STORE_PROMOS.length)} label="Active promos" tone="accent" />
        </div>
      </PageHero>

      <div className="shell space-y-12 py-10">
        {/* ------------------------------------------------------ promos */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STORE_PROMOS.map((promo) => (
            <div key={promo.id} className="relative overflow-hidden border border-line bg-bg-card/50 p-5">
              <span
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ background: PROMO_ACCENT[promo.variant] }}
                aria-hidden="true"
              />
              <p className="eyebrow">{promo.eyebrow}</p>
              <p className="mt-2 font-display text-sm font-bold uppercase leading-snug text-white">{promo.title}</p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-secondary">{promo.body}</p>
              <Link
                href={promo.ctaHref}
                className="mt-4 inline-flex items-center gap-1 font-display text-2xs font-bold uppercase tracking-[0.14em] text-white transition hover:text-accent"
              >
                {promo.ctaLabel} →
              </Link>
            </div>
          ))}
        </section>

        {/* ------------------------------------------------------ shelves */}
        <section>
          <SectionHeading
            eyebrow="Shelves"
            title="Everything for sale"
            description="Switch shelves with the tabs — every price uses the same rule the cart quotes, and members see their stacked price at checkout."
          />
          <BrowseTabs tabs={tabs} />
        </section>

        {/* ------------------------------------------------------- trust */}
        <section className="relative overflow-hidden border border-line bg-bg-nav p-7 lg:p-10">
          <div className="aura-accent pointer-events-none absolute inset-0" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-2">Pricing you can verify</p>
              <h2 className="h-display text-2xl sm:text-3xl">The shelf and the cart agree</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                Every price here is rendered from the catalogue with <code className="text-accent">discountedPrice</code>,
                the exact function the cart re-runs before an order completes — and on Node deployments the server
                validates it once more. Static builds fall back to the identical local rule, so the number never drifts.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/deals"
                className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
              >
                All deals
              </Link>
              <Link
                href="/games"
                className="bg-accent px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
              >
                Browse the catalogue
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}



