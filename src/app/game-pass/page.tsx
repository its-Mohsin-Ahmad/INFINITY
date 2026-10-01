/* ===========================================================================
 * /game-pass — the membership page.
 * ---------------------------------------------------------------------------
 * Linked from the store's plan cards, the primary nav highlight and the footer
 * column. Renders the same `GAME_PASS_PLANS` data the store quotes, so the two
 * can never disagree on price or features. A static export has no billing
 * provider, so the checkout buttons are explicitly unavailable rather than
 * pretending to take payment.
 * ======================================================================== */

import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, Sparkles } from "lucide-react";
import { GAME_PASS_PLANS } from "@/data/store";
import { GAMES, computeStats } from "@/lib/catalogue";
import { freeToPlayGames } from "@/lib/catalogue/query";
import { GameGrid } from "@/components/game/GameGrid";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading, Stat } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Game Pass",
  description:
    "INFINITY membership tiers — member pricing, cloud saves and the monthly vault, quoted from the same plan data the store uses.",
};

export default function GamePassPage() {
  const stats = computeStats();
  const free = freeToPlayGames(8);
  const vault = GAMES.filter((g) => g.discount >= 50 && !g.isComingSoon).slice(0, 8);

  return (
    <>
      <PageHero
        eyebrow="Membership"
        title={
          <>
            INFINITY
            <br />
            Game Pass
          </>
        }
        description="Three tiers over one catalogue. The plan cards below read the same data the store renders, so a price change lands in both places at once."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(GAME_PASS_PLANS.length)} label="Tiers" />
          <Stat value={String(stats.games)} label="Titles included" />
          <Stat value={String(stats.freeGames)} label="Free to play" />
          <Stat value="Cloud" label="Save sync" tone="accent" />
        </div>
      </PageHero>

      <div className="shell space-y-14 py-10">
        <section aria-label="Plans" className="grid gap-4 lg:grid-cols-3">
          {GAME_PASS_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex h-full flex-col border p-5 sm:p-6 ${
                plan.highlight ? "border-accent bg-bg-nav" : "border-line bg-bg-card/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-sm font-extrabold uppercase tracking-[0.14em] text-white">
                    {plan.name}
                  </p>
                  <p className="mt-1 text-2xs text-ink-muted">{plan.tagline}</p>
                </div>
                {plan.highlight ? (
                  <span className="flex shrink-0 items-center gap-1 border border-accent bg-accent/15 px-2 py-1 font-display text-2xs font-bold uppercase text-white">
                    <Sparkles className="h-3 w-3" />
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
                    {feature.included ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                    )}
                    {feature.label}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled
                className={`mt-5 flex min-h-[48px] w-full cursor-not-allowed items-center justify-center px-4 font-display text-2xs font-bold uppercase tracking-[0.16em] ${
                  plan.price === 0 ? "border border-line text-ink-muted" : "bg-accent/40 text-ink-muted"
                }`}
              >
                {plan.price === 0 ? "Current plan" : "Billing unavailable"}
              </button>
            </div>
          ))}
        </section>

        <section>
          <SectionHeading
            eyebrow="The vault"
            title="Half-price and deeper, this season"
            description="The titles the membership discount applies to first. Every price here is quoted with the same rule the cart uses."
          />
          <div className="mt-6">
            <GameGrid games={vault} columns={4} />
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="No tier required"
            title="Free to play, permanently"
            description="These need no membership at all — the catalogue tracks them separately so a pass never hides a genuinely free game."
          />
          <div className="mt-6">
            <GameGrid games={free} columns={4} />
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 border border-line bg-bg-nav p-6">
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink-secondary">
            No payment is taken on this build — it is a static export with no billing provider wired
            up. Basic is genuinely free and needs no checkout, so nothing here is locked behind it.
          </p>
          <Link
            href="/store"
            className="rounded-control flex min-h-[48px] items-center justify-center bg-accent px-6 font-display text-2xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
          >
            Browse the store
          </Link>
        </section>
      </div>
    </>
  );
}