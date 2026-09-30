/* ===========================================================================
 * /signin — starts the on-device demo session.
 * ---------------------------------------------------------------------------
 * This build ships no credential form because there is no account server to
 * authenticate against; a fake login would be worse than none. Instead this
 * page offers the same single-tap session the dashboard uses, and hands the
 * player straight to their library.
 * ======================================================================== */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck, UserRound } from "lucide-react";
import { usePlayer } from "@/lib/store/player-store";
import { PageHero } from "@/components/ui/page-hero";

export default function SignInPage() {
  const user = usePlayer((s) => s.user);
  const signIn = usePlayer((s) => s.signIn);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="Sign in"
        description="INFINITY's web catalogue runs as a static export with no account server, so there is nothing to submit a password to. Your session lives in this browser."
      />

      <div className="shell py-10">
        <div className="mx-auto max-w-xl border border-line bg-bg-card/60 p-6 sm:p-8">
          {mounted && user ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-[0.1em] text-white">
                    {user.username}
                  </p>
                  <p className="text-xs text-ink-secondary">
                    {user.email} · {user.role}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-ink-secondary">
                You are already signed in on this device. Head to the dashboard to reach your
                wishlist, cart, compare set and recently viewed titles.
              </p>
              <Link
                href="/dashboard"
                className="flex min-h-[48px] w-full items-center justify-center bg-accent px-5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
              >
                Go to dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.1em] text-white">
                Start a demo session
              </h2>
              <p className="text-sm leading-relaxed text-ink-secondary">
                One tap creates a local player profile so the header icon, the dashboard and your
                saved titles agree with each other. Nothing is sent anywhere.
              </p>
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
                className="flex min-h-[48px] w-full items-center justify-center gap-2 bg-accent px-5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
              >
                <UserRound className="h-4 w-4" />
                Continue as demo player
              </button>
              <p className="flex items-start gap-2 text-2xs leading-relaxed text-ink-muted">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                The only INFINITY product that genuinely requires an account is the desktop
                launcher, which is not part of this static deployment.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}