/* ===========================================================================
 * /dashboard — the account hub.
 * ---------------------------------------------------------------------------
 * A landing page for the on-device player state: wishlist, cart, compare set,
 * recently viewed and the demo session. Every tile links to a surface that
 * already exists, so nothing here is a dead end.
 * ======================================================================== */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  Heart,
  LogOut,
  Scale,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { usePlayer } from "@/lib/store/player-store";
import { getGames } from "@/lib/catalogue";
import { GameGrid } from "@/components/game/GameGrid";
import { PageHero } from "@/components/ui/page-hero";

const TILES = [
  { href: "/dashboard/wishlist", label: "Wishlist", hint: "Titles you have saved", icon: Heart, key: "wishlist" as const },
  { href: "/cart", label: "Cart", hint: "Your basket and totals", icon: ShoppingCart, key: "cart" as const },
  { href: "/dashboard/notifications", label: "Notifications", hint: "Price drops and headlines", icon: Bell, key: "notifications" as const },
  { href: "/compare", label: "Compare", hint: "Side-by-side spec sheets", icon: Scale, key: "compare" as const },
];

export default function DashboardPage() {
  const wishlist = usePlayer((s) => s.wishlist);
  const cart = usePlayer((s) => s.cart);
  const compare = usePlayer((s) => s.compare);
  const recentlyViewed = usePlayer((s) => s.recentlyViewed);
  const user = usePlayer((s) => s.user);
  const signIn = usePlayer((s) => s.signIn);
  const signOut = usePlayer((s) => s.signOut);
  const notificationsRead = usePlayer((s) => s.notificationsRead);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const counts: Record<(typeof TILES)[number]["key"], number> = {
    wishlist: wishlist.length,
    cart: cart.reduce((n, l) => n + l.quantity, 0),
    notifications: Math.max(0, 8 - notificationsRead.length),
    compare: compare.length,
  };

  const recent = mounted ? getGames(recentlyViewed).slice(0, 10) : [];

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title={
          user ? (
            <>
              Welcome back,
              <br />
              {user.fullName.split(" ")[0]}
            </>
          ) : (
            <>
              Your INFINITY
              <br />
              dashboard
            </>
          )
        }
        description="This build has no server-side accounts. Everything below lives in this browser's local storage, which is why it survives a refresh and disappears when you clear site data."
        tone="accent"
      >
        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <span className="flex min-h-[44px] items-center gap-2 border border-line px-4 font-display text-2xs font-bold uppercase tracking-[0.14em] text-white">
                <UserRound className="h-4 w-4 text-accent" />
                {user.username} · {user.role}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="flex min-h-[44px] items-center gap-2 border border-line px-4 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-accent"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() =>
                signIn({
                  id: "demo-player",
                  fullName: "Alex Mercer",
                  username: "demo",
                  email: "demo@infinity.gg",
                  role: "player",
                  avatarHue: 190,
                })
              }
              className="flex min-h-[44px] items-center gap-2 bg-accent px-5 font-display text-2xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
            >
              <UserRound className="h-4 w-4" />
              Start a demo session
            </button>
          )}
        </div>
      </PageHero>

      <div className="shell space-y-12 py-10">
        <section aria-label="Your surfaces">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TILES.map((tile) => {
              const Icon = tile.icon;
              const value = mounted ? counts[tile.key] : 0;
              return (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className="group flex min-h-[128px] flex-col justify-between border border-line bg-bg-card/60 p-5 transition hover:-translate-y-0.5 hover:border-accent/60"
                >
                  <div className="flex items-start justify-between">
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span className="font-display text-3xl font-bold text-white">{value}</span>
                  </div>
                  <div>
                    <p className="font-display text-xs font-bold uppercase tracking-[0.12em] text-white">
                      {tile.label}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-secondary">
                      {tile.hint}
                      <ArrowRight
                        className="h-3 w-3 opacity-0 transition group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {recent.length ? (
          <section aria-label="Recently viewed">
            <div className="mb-5">
              <p className="eyebrow mb-2">Pick up where you left off</p>
              <h2 className="h-display text-2xl sm:text-3xl">Recently viewed</h2>
            </div>
            <GameGrid games={recent} columns={5} />
          </section>
        ) : null}

        <section className="flex flex-wrap items-center gap-4 border border-line bg-bg-nav p-6">
          <ShieldCheck className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink-secondary">
            INFINITY never sends your wishlist or cart anywhere. There is no analytics beacon on this
            build, no account server, and no third-party script — the only network request the site
            makes is fetching art for the catalogue.
          </p>
        </section>
      </div>
    </>
  );
}