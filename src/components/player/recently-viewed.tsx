"use client";

import { useEffect } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { usePlayer } from "@/lib/store/player-store";
import { hashString } from "@/lib/generate";

/* ===========================================================================
 * Recently viewed
 * ---------------------------------------------------------------------------
 * The history itself lives in the player store (client state), so only a small
 * `titles` lookup is serialised from the server — never the whole catalogue.
 * The tile art is a deterministic gradient derived from the slug, which keeps
 * the rail visually consistent with the generated key-art engine.
 * ======================================================================== */

/** Fire-and-forget history ping. Render once at the top of a game page. */
export function ViewedTracker({ slug }: { slug: string }) {
  const markViewed = usePlayer((s) => s.markViewed);
  const ready = usePlayer((s) => s.ready);

  useEffect(() => {
    if (!ready) return;
    markViewed(slug);
    // `markViewed` is a stable store action; re-running on slug change is the point.
  }, [ready, slug, markViewed]);

  return null;
}

function hueOf(slug: string): number {
  return hashString(`recent::${slug}`) % 360;
}

export function RecentlyViewedRail({
  titles,
  exclude,
  limit = 6,
}: {
  /** slug -> title lookup built on the server. */
  titles: Record<string, string>;
  /** Slug to hide (usually the game currently being viewed). */
  exclude?: string;
  limit?: number;
}) {
  const recentlyViewed = usePlayer((s) => s.recentlyViewed);
  const ready = usePlayer((s) => s.ready);

  const items = (ready ? recentlyViewed : [])
    .filter((slug) => slug !== exclude && titles[slug])
    .slice(0, limit);

  if (!items.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2 border-b border-line pb-3">
        <History className="h-4 w-4 text-accent" />
        <h2 className="font-display text-base font-extrabold uppercase tracking-tight text-white">
          Recently viewed
        </h2>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((slug) => {
          const hue = hueOf(slug);
          return (
            <li key={slug}>
              <Link
                href={`/games/${slug}`}
                className="group flex items-center gap-3 border border-line bg-bg-card/40 p-2 transition hover:border-accent"
              >
                <span
                  aria-hidden
                  className="h-11 w-11 shrink-0 border border-line-soft"
                  style={{
                    background: `linear-gradient(135deg, hsl(${hue} 72% 42%), hsl(${(hue + 42) % 360} 64% 16%))`,
                  }}
                />
                <span className="min-w-0">
                  <span className="block truncate font-display text-xs font-bold uppercase tracking-wide text-white group-hover:text-accent">
                    {titles[slug]}
                  </span>
                  <span className="block text-2xs uppercase tracking-wider text-ink-muted">View again</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
