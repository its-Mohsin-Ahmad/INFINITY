"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

/* ===========================================================================
 * Route loading bar
 * ---------------------------------------------------------------------------
 * A thin accent rule that sweeps across the top of the viewport whenever the
 * pathname changes, plus a first-paint splash that fades out once the shell is
 * interactive. Uses only transitions so it never fights the router.
 * ======================================================================== */

export function RouteProgressBar() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(true);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setActive(true);
    setDone(false);
    const finish = window.setTimeout(() => {
      setActive(false);
      setDone(true);
    }, 650);
    return () => window.clearTimeout(finish);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={clsx(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      <div className={clsx("h-full w-full", active ? "rule-sweep" : "bg-transparent")} />
      {done ? null : (
        <div className="absolute inset-x-0 top-0 h-0.5 w-full origin-left animate-[bar-rise_0.65s_ease-out_both] bg-accent/60" />
      )}
    </div>
  );
}

/**
 * First-paint splash. Rendered on the client only, it covers the viewport for
 * the first few hundred milliseconds and then unmounts itself completely.
 */
export function BootScreen() {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fade = window.setTimeout(() => setFading(true), 620);
    const off = window.setTimeout(() => setGone(true), 1120);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(off);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[110] grid place-items-center bg-bg-deep transition-opacity duration-500",
        fading ? "opacity-0" : "opacity-100",
      )}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <span className="absolute inset-0 -m-6 animate-pulse-glow rounded-full bg-accent/20 blur-2xl" />
          <svg viewBox="0 0 24 24" className="relative h-9 w-9 text-accent" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 12h4l2-5 4 10 2-5h4" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" />
          </svg>
        </div>
        <p className="font-display text-lg font-extrabold uppercase tracking-[0.4em] text-white">INFINITY</p>
        <p className="font-display text-2xs uppercase tracking-[0.3em] text-ink-muted">One universe · Infinite games</p>
        <span className="mt-2 h-px w-48 overflow-hidden bg-line">
          <span className="block h-full w-full rule-sweep" />
        </span>
      </div>
    </div>
  );
}
