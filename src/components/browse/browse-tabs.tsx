"use client";

import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";

/* ===========================================================================
 * BrowseTabs — tab strip for browse surfaces, with static-export deep links.
 * ---------------------------------------------------------------------------
 * Same visuals as `Tabs`, but after hydration it reads the URL query so that
 * legacy links (`/games?sort=rating`, `/news?category=hardware`, `?tab=deals`)
 * land on the right panel. This keeps the route fully prerendered: no
 * searchParams at build time, no client-side filtering of the catalogue.
 * ======================================================================== */

export interface BrowseTab {
  id: string;
  label: string;
  badge?: string;
  content: ReactNode;
}

/** Maps legacy `?sort=` values (SORT_OPTIONS) onto tab ids. */
const SORT_TO_TAB: Record<string, string> = {
  popular: "trending",
  newest: "new",
  released: "new",
  rating: "top-rated",
  az: "trending",
  "price-asc": "deals",
  "price-desc": "deals",
};

function tabFromQuery(tabs: BrowseTab[]): number {
  if (typeof window === "undefined") return 0;
  const params = new URLSearchParams(window.location.search);
  const wanted =
    params.get("tab") ??
    params.get("category") ??
    params.get("board") ??
    params.get("kind") ??
    (params.get("sort") ? SORT_TO_TAB[params.get("sort") as string] : null);
  if (!wanted) return 0;
  const index = tabs.findIndex((t) => t.id === wanted);
  return index >= 0 ? index : 0;
}

export function BrowseTabs({
  tabs,
  className,
  panelClassName,
}: {
  tabs: BrowseTab[];
  className?: string;
  panelClassName?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(tabFromQuery(tabs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      <div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={clsx(
              "relative shrink-0 px-4 py-3 font-display text-xs font-bold uppercase tracking-[0.14em] transition",
              i === active ? "text-white" : "text-ink-muted hover:text-ink-secondary",
            )}
          >
            <span className="inline-flex items-center gap-2">
              {tab.label}
              {tab.badge ? (
                <span className="border border-line px-1.5 py-[1px] text-[10px] text-ink-secondary">{tab.badge}</span>
              ) : null}
            </span>
            {i === active ? <span className="absolute inset-x-2 -bottom-px h-[2px] bg-accent" /> : null}
          </button>
        ))}
      </div>
      <div className={clsx("pt-5", panelClassName)}>{tabs[active]?.content}</div>
    </div>
  );
}
