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
 * Boot splash set dressing.
 *
 * Positions are fixed rather than random so the scene is identical on every
 * load: a random field would re-roll on each mount and read as a glitch, and
 * it would also make the splash impossible to eyeball for regressions.
 */
const STARS = [
  { x: 8, y: 14, r: 1.6, o: 0.7 },
  { x: 19, y: 32, r: 1, o: 0.45 },
  { x: 27, y: 8, r: 1.8, o: 0.8 },
  { x: 34, y: 21, r: 1.1, o: 0.5 },
  { x: 43, y: 11, r: 1.4, o: 0.62 },
  { x: 52, y: 27, r: 1, o: 0.4 },
  { x: 61, y: 6, r: 1.7, o: 0.75 },
  { x: 69, y: 19, r: 1.2, o: 0.5 },
  { x: 77, y: 34, r: 1.5, o: 0.66 },
  { x: 86, y: 12, r: 1, o: 0.42 },
  { x: 93, y: 26, r: 1.9, o: 0.82 },
  { x: 14, y: 58, r: 1.3, o: 0.5 },
  { x: 24, y: 71, r: 1.6, o: 0.68 },
  { x: 38, y: 62, r: 1, o: 0.44 },
  { x: 47, y: 79, r: 1.4, o: 0.6 },
  { x: 58, y: 66, r: 1.1, o: 0.48 },
  { x: 66, y: 84, r: 1.7, o: 0.72 },
  { x: 74, y: 61, r: 1.2, o: 0.5 },
  { x: 82, y: 77, r: 1.5, o: 0.64 },
  { x: 90, y: 68, r: 1, o: 0.4 },
  { x: 5, y: 88, r: 1.2, o: 0.5 },
  { x: 31, y: 93, r: 1.5, o: 0.62 },
  { x: 55, y: 90, r: 1.1, o: 0.46 },
  { x: 79, y: 95, r: 1.6, o: 0.66 },
  { x: 96, y: 84, r: 1.3, o: 0.52 },
];

/** Slow-falling debris, sized and staggered to read as depth. */
const DEBRIS = [
  { x: 12, s: 3, d: 0, t: 13 },
  { x: 23, s: 5, d: 3.5, t: 17 },
  { x: 37, s: 2.5, d: 7, t: 15 },
  { x: 46, s: 4, d: 1.5, t: 19 },
  { x: 58, s: 3, d: 9, t: 14 },
  { x: 67, s: 5.5, d: 5, t: 18 },
  { x: 76, s: 2.5, d: 11, t: 16 },
  { x: 88, s: 4, d: 2.5, t: 20 },
  { x: 94, s: 3, d: 13, t: 15 },
];

/**
 * First-paint splash: a cinematic "entering INFINITY" sequence.
 *
 * Composition follows the brand film rather than a bare spinner - deep space
/** Layered backdrop: deep space, a lit planet limb, dust and the ground plane. */
function BootScene() {
  return (
    <>
      {/* drifting nebula wash */}
      <div
        aria-hidden="true"
        className="boot-drift absolute -inset-[12%] opacity-70"
        style={{
          background:
            "radial-gradient(46% 38% at 22% 28%, rgba(229,9,47,0.20) 0%, rgba(2,11,20,0) 68%)," +
            "radial-gradient(38% 34% at 78% 66%, rgba(255,23,68,0.14) 0%, rgba(2,11,20,0) 70%)," +
            "radial-gradient(70% 60% at 50% 120%, rgba(23,52,84,0.42) 0%, rgba(2,11,20,0) 72%)",
        }}
      />

      {/* starfield */}
      <div aria-hidden="true" className="absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="boot-rise absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r,
              height: s.r,
              opacity: s.o,
              animationDelay: `${(i % 8) * 130}ms`,
            }}
          />
        ))}
      </div>

      {/* planet limb, lit from behind on the right edge */}
      <div aria-hidden="true" className="absolute -right-[26%] top-[6%] h-[128%] w-[78%]">
        <div className="boot-orbit absolute inset-0" style={{ animationDuration: "64s" }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 30%, rgba(30,64,102,0.55) 0%, rgba(8,20,33,0.9) 46%, rgba(2,11,20,1) 72%)",
              boxShadow: "inset 0 0 160px rgba(0,0,0,0.85)",
            }}
          />
          {/* atmospheric rim */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 30%, rgba(0,0,0,0) 58%, rgba(229,9,47,0.30) 68%, rgba(2,11,20,0) 74%)",
            }}
          />
          {/* surface banding */}
          <div
            className="absolute inset-[12%] rounded-full opacity-25"
            style={{
              background:
                "repeating-linear-gradient(168deg, rgba(255,255,255,0.05) 0 6%, rgba(2,11,20,0) 6% 15%)",
            }}
          />
        </div>
      </div>

      {/* horizon grid — the INFINITY "ground plane" */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[42%] opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(229,9,47,0.5) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(229,9,47,0.5) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
          transform: "perspective(340px) rotateX(66deg)",
          transformOrigin: "bottom center",
          maskImage: "linear-gradient(to top, #000 0%, transparent 78%)",
          WebkitMaskImage: "linear-gradient(to top, #000 0%, transparent 78%)",
        }}
      />

      {/* falling debris */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {DEBRIS.map((d, i) => (
          <span
            key={i}
            className="boot-fall absolute rounded-sm bg-white/25"
            style={{
              left: `${d.x}%`,
              width: d.s,
              height: d.s,
              animationDuration: `${d.t}s`,
              animationDelay: `${d.d}s`,
            }}
          />
        ))}
      </div>

      {/* vignette + falloff so the lockup always reads */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(78%_64%_at_50%_46%,rgba(2,11,20,0)_0%,rgba(2,11,20,0.72)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg-deep to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg-deep to-transparent" />
    </>
  );
}

/** The infinity mark, the wordmark and the boot progress readout. */
function BootLockup({ pct }: { pct: number }) {
  const MARK_PATH =
    "M42 28c0-9.4-5.6-16-13.4-16C19.4 12 13 19.4 13 28s6.4 16 15.6 16C36.4 44 42 37.4 42 28Zm36 0c0-8.6-6.4-16-15.6-16C53 12 47 19.4 47 28s6 16 15.4 16C71.6 44 78 36.6 78 28Z";

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center text-center">
      {/* infinity mark */}
      <svg
        viewBox="0 0 92 56"
        className="boot-mark h-12 w-[100px] sm:h-14 sm:w-[120px]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="boot-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#A8B0BA" />
          </linearGradient>
        </defs>
        <path
          d={MARK_PATH}
          fill="none"
          stroke="url(#boot-mark)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* energy loop travelling the stroke */}
        <path
          className="boot-energy"
          d={MARK_PATH}
          fill="none"
          stroke="#E5092F"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="48 150"
        />
      </svg>

      {/* wordmark */}
      <p
        className="boot-rise mt-5 font-display text-3xl font-extrabold uppercase leading-none tracking-[0.34em] text-white sm:text-4xl"
        style={{ animationDelay: "140ms", textShadow: "0 0 34px rgba(229,9,47,0.4)" }}
      >
        Infinity
      </p>
      <p
        className="boot-rise mt-3 font-display text-[10px] font-bold uppercase tracking-[0.42em] text-accent sm:text-[11px]"
        style={{ animationDelay: "300ms" }}
      >
        Entering the universe
      </p>

      {/* progress */}
      <div className="boot-rise mt-9 w-full" style={{ animationDelay: "460ms" }}>
        <div className="relative h-[3px] w-full overflow-hidden rounded-control bg-white/10">
          <div
            className="relative h-full bg-gradient-to-r from-accent to-accent-bright transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          >
            <span className="boot-sheen absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between font-display text-[10px] uppercase tracking-[0.24em] text-ink-muted">
          <span>Loading</span>
          <span className="tabular-nums text-white">{String(pct).padStart(3, "0")}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * with a lit planet limb on the right, drifting debris, the red infinity mark
 * burning above the wordmark, and a real progress readout.
 *
 * The bar tracks genuine boot signals (stylesheet + first paint) and then eases
 * to 100%, so the number on screen means something instead of being a timer
 * that always reads the same value. It never blocks longer than `MAX_MS`,
 * because a splash that outlasts the content is worse than no splash at all.
 */
const MIN_MS = 1500;
const MAX_MS = 4200;

export function BootScreen() {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  const [pct, setPct] = useState(0);
  // The animation reads the current value from a ref on every frame; going
  // through state would capture a stale value inside the rAF closure and make
  // the easing restart from the wrong number.
  const pctRef = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    const started = Date.now();
    const timers: number[] = [];

    // Ease the readout toward `to`. Each boot stage moves a different amount,
    // which is what makes the number feel tied to real work rather than a
    // fixed-duration fake.
    const climb = (to: number, ms: number) => {
      const from = pctRef.current;
      const delta = Math.max(0, to - from);
      if (delta === 0) return;
      const begin = performance.now();
      const tick = () => {
        const t = Math.min(1, (performance.now() - begin) / ms);
        const next = Math.round(from + delta * (1 - (1 - t) ** 3));
        pctRef.current = next;
        setPct(next);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    timers.push(window.setTimeout(() => climb(18, 260), 40));
    timers.push(window.setTimeout(() => climb(46, 320), 120));
    timers.push(window.setTimeout(() => climb(74, 380), 300));

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      const wait = Math.max(0, MIN_MS - (Date.now() - started));
      timers.push(
        window.setTimeout(() => {
          climb(100, 420);
          timers.push(window.setTimeout(() => setFading(true), 480));
          timers.push(window.setTimeout(() => setGone(true), 1000));
        }, wait),
      );
    };

    // `readyState === complete` means the document and its subresources finished.
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      // Never let one stalled asset hold the splash on screen.
      timers.push(window.setTimeout(finish, MAX_MS));
    }

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("load", finish);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={clsx(
        "boot fixed inset-0 z-[110] overflow-hidden bg-bg-deep transition-opacity duration-500",
        fading ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      role="status"
      aria-live="polite"
      aria-label={`Loading INFINITY, ${pct} percent`}
    >
      <BootScene />

      {/* centred lockup */}
      <div className="relative grid h-full place-items-center px-6">
        <BootLockup pct={pct} />
      </div>

      {/* corner brand furniture, mirroring the shell header and footer */}
      <p className="boot-rise pointer-events-none absolute bottom-5 left-5 hidden border-l-2 border-accent pl-3 font-display text-[10px] uppercase leading-[1.6] tracking-[0.28em] text-ink-muted sm:block">
        More games.
        <br />
        More worlds.
        <br />
        One platform.
      </p>
      <p
        className="boot-rise pointer-events-none absolute bottom-5 right-5 hidden font-display text-[10px] uppercase tracking-[0.28em] text-ink-muted md:block"
        style={{ animationDelay: "620ms" }}
      >
        Powered by INFINITY
      </p>
    </div>
  );
}
