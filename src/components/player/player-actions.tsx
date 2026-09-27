"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Heart, Scale } from "lucide-react";
import { usePlayer } from "@/lib/store/player-store";
import { quoteCartLine, type CartLineQuote } from "@/lib/commerce/cart-line";
import type { Game } from "@/lib/types";

/* ===========================================================================
 * Player actions — every mutation goes through the persisted player store.
 *
 * The `mounted` flag exists because the store rehydrates from localStorage on
 * the client: rendering the active state on the server would produce a
 * hydration mismatch.
 * ======================================================================== */

/**
 * `1` in the static (GitHub Pages) build — inlined by Next at build time, so
 * the browser never attempts a request to a route handler that does not exist.
 */
const STATIC_BUILD = process.env.NEXT_PUBLIC_STATIC === "1";

/**
 * Ask the server for the price. Returns `null` when the endpoint is not
 * available (static host / network failure) so the caller can fall back to the
 * shared pricing rule.
 */
async function requestServerQuote(slug: string, platform: string | null): Promise<CartLineQuote | null> {
  try {
    const res = await fetch("/api/cart/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, platform }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      ok: boolean;
      line?: { unitPrice: number; discount: number };
      message?: string;
    };
    if (!data.ok || !data.line) {
      return { ok: false, status: res.status, message: data.message ?? "Please try again." };
    }
    return { ok: true, unitPrice: data.line.unitPrice, discount: data.line.discount };
  } catch {
    return null;
  }
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function WishlistButton({
  game,
  variant = "icon",
  className,
}: {
  game: Pick<Game, "slug" | "title">;
  variant?: "icon" | "wide";
  className?: string;
}) {
  const wishlist = usePlayer((s) => s.wishlist);
  const toggle = usePlayer((s) => s.toggleWishlist);
  const mounted = useMounted();
  const active = mounted && wishlist.includes(game.slug);

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label={active ? `Remove ${game.title} from wishlist` : `Add ${game.title} to wishlist`}
        aria-pressed={active}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(game.slug, game.title);
        }}
        className={clsx(
          "grid h-9 w-9 place-items-center border backdrop-blur transition",
          active
            ? "border-accent bg-accent text-white"
            : "border-line bg-bg-deep/80 text-white hover:border-accent hover:text-accent",
          className,
        )}
      >
        <Heart className={clsx("h-4 w-4", active && "fill-current")} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => toggle(game.slug, game.title)}
      className={clsx(
        "inline-flex w-full items-center justify-center gap-2 border px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] transition",
        active
          ? "border-accent bg-accent/15 text-white"
          : "border-line text-ink-secondary hover:border-accent hover:text-white",
        className,
      )}
    >
      <Heart className={clsx("h-4 w-4", active && "fill-current text-accent")} />
      {active ? "In your wishlist" : "Add to wishlist"}
    </button>
  );
}

export function CompareButton({ game, className }: { game: Pick<Game, "slug" | "title">; className?: string }) {
  const compare = usePlayer((s) => s.compare);
  const toggle = usePlayer((s) => s.toggleCompare);
  const mounted = useMounted();
  const active = mounted && compare.includes(game.slug);

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => toggle(game.slug, game.title)}
      className={clsx(
        "inline-flex items-center justify-center gap-2 border px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] transition",
        active
          ? "border-accent bg-accent/15 text-white"
          : "border-line text-ink-secondary hover:border-accent hover:text-white",
        className,
      )}
    >
      <Scale className="h-4 w-4" />
      {active ? "In compare tray" : "Compare"}
    </button>
  );
}

export function AddToCartButton({
  game,
  platform,
  className,
}: {
  game: Pick<Game, "slug" | "title" | "price" | "discount" | "isFree" | "isComingSoon" | "platforms">;
  platform?: string | null;
  className?: string;
}) {
  const addToCart = usePlayer((s) => s.addToCart);
  const pushToast = usePlayer((s) => s.pushToast);
  const [busy, setBusy] = useState(false);

  if (game.isComingSoon) {
    return (
      <div className={className}>
        <WishlistButton game={game} variant="wide" />
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          // 1. Ask the server (authoritative on Node deployments).
          // 2. On a static host such as GitHub Pages there is no route handler,
          //    so re-run the identical rule from `@/lib/commerce/cart-line`
          //    against the catalogue values rendered into this page.
          const remote = STATIC_BUILD ? null : await requestServerQuote(game.slug, platform ?? null);
          const quote = remote ?? quoteCartLine(game, platform ?? null);

          if (!quote.ok) {
            pushToast("Could not add to cart", quote.message, "error");
            return;
          }

          addToCart({
            slug: game.slug,
            title: game.title,
            platform: platform ?? null,
            unitPrice: quote.unitPrice,
            discount: quote.discount,
            quantity: 1,
          });
        } finally {
          setBusy(false);
        }
      }}
      className={clsx(
        "inline-flex w-full items-center justify-center gap-2 bg-accent px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright disabled:opacity-60",
        className,
      )}
    >
      {busy ? "Adding…" : game.isFree ? "Get it free" : "Add to cart"}
    </button>
  );
}

export function RemoveFromCartButton({ slug }: { slug: string }) {
  const remove = usePlayer((s) => s.removeFromCart);
  return (
    <button
      type="button"
      aria-label="Remove from cart"
      onClick={() => remove(slug)}
      className="px-2 py-1 text-ink-muted transition hover:text-accent"
    >
      Remove
    </button>
  );
}

export function Toaster() {
  const toasts = usePlayer((s) => s.toasts);
  const dismiss = usePlayer((s) => s.dismissToast);
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 right-4 z-[95] flex w-[300px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            "pointer-events-auto flex items-start gap-3 border bg-bg-secondary/95 px-4 py-3 shadow-panel backdrop-blur animate-fade-up",
            t.tone === "success" ? "border-emerald-500/50" : t.tone === "error" ? "border-accent" : "border-line",
          )}
        >
          <span
            className={clsx(
              "mt-0.5 h-2 w-2 shrink-0 rounded-full",
              t.tone === "success" ? "bg-emerald-400" : t.tone === "error" ? "bg-accent" : "bg-ink-muted",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-bold uppercase tracking-[0.12em] text-white">{t.title}</p>
            {t.body ? <p className="mt-0.5 truncate text-xs text-ink-secondary">{t.body}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="text-ink-muted transition hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const setNewsletter = usePlayer((s) => s.setNewsletter);
  const pushToast = usePlayer((s) => s.pushToast);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  return (
    <form
      className={clsx("flex w-full gap-2", compact ? "flex-row" : "flex-col sm:flex-row")}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          pushToast("Check your email address", "That address does not look valid.", "error");
          return;
        }
        setState("busy");
        try {
          // Static builds have no route handler, so the opt-in is stored in the
          // player store (localStorage) and reported honestly to the visitor.
          if (!STATIC_BUILD) {
            const res = await fetch("/api/newsletter", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error("newsletter-signup-failed");
          }
          setNewsletter(true);
          setState("done");
          pushToast(
            STATIC_BUILD ? "Saved on this device" : "You are on the list",
            STATIC_BUILD
              ? "This static build has no signup server, so the address stays in this browser only."
              : "Weekly drops, deals and esports results.",
            "success",
          );
          setEmail("");
        } catch {
          setState("idle");
          pushToast("Signup failed", "Please try again in a moment.", "error");
        }
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="field flex-1"
      />
      <button
        type="submit"
        disabled={state === "busy"}
        className="bg-accent px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright disabled:opacity-60"
      >
        {state === "busy" ? "Sending" : state === "done" ? "Subscribed" : "Subscribe"}
      </button>
    </form>
  );
}

