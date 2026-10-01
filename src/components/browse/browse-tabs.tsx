"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import clsx from "clsx";

/* ===========================================================================
 * BrowseTabs — tab strip for browse surfaces, with static-export deep links.
 * ---------------------------------------------------------------------------
 * Every tab is genuinely reachable and visibly active:
 *
 *  - click / tap switches panels and writes ?tab=<id> into the URL, so the tab
 *    you are on is shareable and survives back/forward (popstate);
 *  - the panel is keyed by tab id, so each tab mounts its own content instead
 *    of React patching one subtree into another;
 *  - arrow keys / Home / End move between tabs (roving tabindex), matching the
 *    WAI-ARIA tabs pattern;
 *  - legacy links (`/games?sort=rating`, `/news?category=hardware`) still land on
 *    the right panel, which keeps the route fully prerendered: no searchParams
 *    at build time, no client-side filtering of the catalogue.
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

function indexFromLocation(tabs: BrowseTab[]): number {
  if (typeof window === "undefined") return -1;
  const params = new URLSearchParams(window.location.search);
  const wanted =
    params.get("tab") ??
    params.get("category") ??
    params.get("board") ??
    params.get("kind") ??
    (params.get("sort") ? SORT_TO_TAB[params.get("sort") as string] : null);
  if (!wanted) return -1;
  return tabs.findIndex((t) => t.id === wanted);
}

/** Mirrors the active tab into the URL without adding a history entry. */
function syncUrl(id: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("tab", id);
  window.history.replaceState(window.history.state, "", url);
}

export function BrowseTabs({
  tabs,
  className,
  panelClassName,
  initial = 0,
}: {
  tabs: BrowseTab[];
  className?: string;
  panelClassName?: string;
  /** Panel shown when the URL carries no tab hint. */
  initial?: number;
}) {
  const [active, setActive] = useState(initial);
  const listRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  /* Deep link on first paint; falls back to `initial`. */
  useEffect(() => {
    const fromUrl = indexFromLocation(tabs);
    setActive(fromUrl >= 0 ? fromUrl : initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Back / forward between tabs. */
  useEffect(() => {
    const onPopState = () => {
      const fromUrl = indexFromLocation(tabs);
      if (fromUrl >= 0) setActive(fromUrl);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [tabs]);

  const select = useCallback(
    (index: number) => {
      setActive(index);
      const tab = tabs[index];
      if (tab) syncUrl(tab.id);
    },
    [tabs],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = tabs.length - 1;
    if (last < 0) return;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (event.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    select(next);
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  if (!tabs.length) return null;
  const current = tabs[active];

  return (
    <div className={className}>
      {/* No negative margin here on purpose: this component is used both inside and
          outside `.shell`, and a full-bleed `-mx-4` inside an unpadded parent
          pushed 16px past the viewport on phones and scrolled the whole page. */}
      <div
        ref={listRef}
        role="tablist"
        aria-label="Browse sections"
        onKeyDown={onKeyDown}
        className="no-scrollbar flex w-full min-w-0 snap-x snap-mandatory gap-1 overflow-x-auto"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`${baseId}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            className={clsx(
              "relative shrink-0 snap-start border px-4 py-3 font-display text-xs font-bold uppercase tracking-[0.14em] transition",
              i === active
                ? "border-line bg-bg-card text-white"
                : "border-transparent text-ink-muted hover:border-line hover:text-ink-secondary",
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
      {current ? (
        <div
          key={current.id}
          id={`${baseId}-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${current.id}`}
          tabIndex={0}
          className={clsx("pt-5 focus:outline-none", panelClassName)}
        >
          {current.content}
        </div>
      ) : null}
    </div>
  );
}
