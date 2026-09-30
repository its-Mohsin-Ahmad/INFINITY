/* ===========================================================================
 * /cart — the persisted cart surface.
 * ---------------------------------------------------------------------------
 * Reads the same Zustand store the header counter and the buy buttons write to,
 * so the badge on the tab bar and this page can never disagree. Quantities and
 * removals are 44px touch targets; the summary rail stacks under the lines on
 * phones and sticks to the top of the viewport on desktop.
 * ======================================================================== */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartTotals, usePlayer } from "@/lib/store/player-store";
import { getGames } from "@/lib/catalogue";
import { formatPrice } from "@/lib/generate";
import { ArtImage } from "@/components/art/ArtImage";
import { EmptyState, Panel } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/page-hero";

export default function CartPage() {
  const cart = usePlayer((s) => s.cart);
  const setQuantity = usePlayer((s) => s.setQuantity);
  const removeFromCart = usePlayer((s) => s.removeFromCart);
  const clearCart = usePlayer((s) => s.clearCart);
  const { subtotal, discount, total, count } = useCartTotals();

  // The store rehydrates from localStorage on the client; rendering real lines
  // on the server would produce a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = mounted ? getGames(cart.map((l) => l.slug)) : [];
  const bySlug = new Map(lines.map((g) => [g.slug, g]));

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Your cart"
        description="Everything here is stored on this device — INFINITY has no account server on this build, so the basket survives a refresh but never leaves your browser."
        tone="accent"
      />

      <div className="shell py-10">
        {!mounted || !cart.length ? (
          <EmptyState
            title="Your cart is empty"
            body="Add a title from the store or any game page and it will hold here until you clear it."
            ctaHref="/store"
            ctaLabel="Browse the store"
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-secondary">
                  {count} {count === 1 ? "item" : "items"}
                </p>
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex min-h-[44px] items-center gap-2 px-3 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:text-accent"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear cart
                </button>
              </div>

              <ul className="space-y-3">
                {cart.map((line) => {
                  const game = bySlug.get(line.slug);
                  if (!game) return null;
                  const lineTotal = line.unitPrice * line.quantity * (1 - line.discount / 100);
                  return (
                    <li
                      key={`${line.slug}-${line.platform ?? "any"}`}
                      className="flex gap-4 border border-line bg-bg-card/60 p-3 sm:p-4"
                    >
                      <Link
                        href={`/games/${game.slug}`}
                        className="relative block w-20 shrink-0 overflow-hidden border border-line sm:w-28"
                        aria-label={game.title}
                      >
                        <ArtImage game={game} variant="wide" className="h-full w-full object-cover" />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-white sm:text-base">
                          <Link href={`/games/${game.slug}`} className="hover:text-accent">
                            {line.title}
                          </Link>
                        </h2>
                        <p className="mt-1 text-xs text-ink-secondary">
                          {line.platform ?? "Any platform"}
                          {line.discount > 0 ? ` · ${line.discount}% off` : ""}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <div className="flex items-center border border-line">
                            <button
                              type="button"
                              aria-label={`Reduce quantity of ${line.title}`}
                              onClick={() => setQuantity(line.slug, line.quantity - 1)}
                              className="grid h-11 w-11 place-items-center text-white transition hover:bg-accent"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-display text-sm font-bold text-white">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${line.title}`}
                              onClick={() => setQuantity(line.slug, line.quantity + 1)}
                              className="grid h-11 w-11 place-items-center text-white transition hover:bg-accent"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(line.slug)}
                            className="flex min-h-[44px] items-center gap-1.5 px-2 text-xs text-ink-secondary transition hover:text-accent"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>

                      <p className="shrink-0 self-start font-display text-sm font-bold text-white sm:text-base">
                        {line.discount > 0 ? (
                          <>
                            <span className="mr-2 text-xs font-normal text-ink-muted line-through">
                              {formatPrice(line.unitPrice * line.quantity)}
                            </span>
                            {formatPrice(lineTotal)}
                          </>
                        ) : (
                          formatPrice(lineTotal)
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Panel title="Summary" className="h-fit p-5 lg:sticky lg:top-24">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-secondary">Subtotal</dt>
                  <dd className="text-white">{formatPrice(subtotal)}</dd>
                </div>
                {discount > 0 ? (
                  <div className="flex items-center justify-between text-accent">
                    <dt>Discounts</dt>
                    <dd>−{formatPrice(discount)}</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-line pt-3 font-display text-base font-bold uppercase tracking-[0.08em] text-white">
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 bg-accent px-5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
              >
                <ShoppingCart className="h-4 w-4" />
                Checkout
              </button>
              <p className="mt-3 text-2xs leading-relaxed text-ink-muted">
                This is a demonstration storefront — no payment is taken and no order is placed. The
                launcher download is the only real product flow on this build.
              </p>
              <Link
                href="/store"
                className="mt-4 flex min-h-[44px] items-center justify-center border border-line px-5 font-display text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-accent"
              >
                Keep shopping
              </Link>
            </Panel>
          </div>
        )}
      </div>
    </>
  );
}