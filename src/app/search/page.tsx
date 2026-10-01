"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { LayoutGrid, List, Search as SearchIcon, X } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { GameCard, GameListRow } from "@/components/game/GameCard";
import { EmptyState } from "@/components/ui/primitives";
import { genreName, platformName } from "@/data/taxonomy";
import {
  POPULAR_SEARCHES,
  hydrate,
  loadSearchIndex,
  scoreHits,
  sortHits,
  type SearchHit,
  type SearchSortKey,
} from "@/lib/search-index";
import type { Game } from "@/lib/types";

/* ===========================================================================
 * /search — SEARCH RESULTS (§43)
 * ---------------------------------------------------------------------------
 * Fully client-side so it works in the static export: the trimmed catalogue
 * index is fetched once, then typing, sorting, filtering and the grid/list
 * switch all run in memory. No API runtime required.
 * ======================================================================== */

const PAGE_STEP = 48;

const SORTS: { value: SearchSortKey; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest rated" },
  { value: "az", label: "A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

type Status = "loading" | "ready" | "error";

function SkeletonCard() {
  return (
    <div className="border border-line bg-bg-card/40">
      <div className="aspect-[2/3] rounded-card animate-pulse bg-bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded-card animate-pulse bg-bg-muted" />
        <div className="h-3 w-1/2 rounded-card animate-pulse bg-bg-muted" />
      </div>
    </div>
  );
}

function SearchWorkspace() {
  const params = useSearchParams();
  const initial = params?.get("q") ?? "";

  const [status, setStatus] = useState<Status>("loading");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [query, setQuery] = useState(initial);
  const [sort, setSort] = useState<SearchSortKey>("popular");
  const [platform, setPlatform] = useState<string | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visible, setVisible] = useState(PAGE_STEP);

  useEffect(() => {
    let alive = true;
    loadSearchIndex()
      .then((rows) => {
        if (!alive) return;
        setHits(rows);
        setStatus("ready");
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, []);

  /** Scored set for the current term (all games when the term is empty). */
  const scored = useMemo(() => (query.trim() ? scoreHits(query, hits, hits.length) : hits), [query, hits]);

  /** Facets are computed before dimension filters so chips show real counts. */
  const platformFacets = useMemo(() => {
    const map = new Map<string, number>();
    for (const hit of scored) {
      for (const p of hit.platforms) map.set(p, (map.get(p) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [scored]);

  const genreFacets = useMemo(() => {
    const map = new Map<string, number>();
    for (const hit of scored) {
      for (const g of hit.genre) map.set(g, (map.get(g) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [scored]);

  const results = useMemo(() => {
    let list = scored;
    if (platform) list = list.filter((h) => h.platforms.includes(platform as Game["platforms"][number]));
    if (genre) list = list.filter((h) => h.genre.includes(genre as Game["genre"][number]));
    return sortHits(list, sort);
  }, [scored, platform, genre, sort]);

  const shown = results.slice(0, visible);

  return (
    <>
      <PageHero
        eyebrow="Search results"
        title={query.trim() ? <>Results for “{query.trim()}”</> : <>Search the universe</>}
        description="Every result comes from the verified INFINITY catalogue — title, studio, genre and platform all match live."
      >
        <div className="flex max-w-2xl items-center border border-line bg-bg-deep/80 focus-within:border-accent">
          <SearchIcon className="ml-4 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_STEP);
            }}
            placeholder="Search 450+ games, genres, developers…"
            aria-label="Search games"
            className="h-12 w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-ink-muted"
            autoFocus
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="mr-3 grid h-7 w-7 place-items-center border border-line text-ink-muted transition hover:border-accent hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-2xs uppercase tracking-[0.16em] text-ink-muted">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                setVisible(PAGE_STEP);
              }}
              className="border border-line px-2.5 py-1 text-2xs text-ink-secondary transition hover:border-accent hover:text-white"
            >
              {term}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="shell py-10">
        {status === "loading" ? (
          <>
            <div className="mb-6 h-4 w-56 rounded-card animate-pulse bg-bg-muted" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        ) : status === "error" ? (
          <EmptyState
            title="Search is unavailable"
            body="The catalogue index could not be loaded. Browse the full library instead — every game is one click away."
            ctaHref="/games"
            ctaLabel="Browse all games"
          />
        ) : (
          <>
            {/* toolbar: count · sort · grid/list */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                <span className="text-accent tabular-nums">{results.length}</span>{" "}
                <span className="text-ink-secondary">{results.length === 1 ? "game" : "games"}</span>
                {query.trim() ? <span className="text-ink-muted"> matching “{query.trim()}”</span> : null}
              </p>

              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="search-sort">
                  Sort results
                </label>
                <select
                  id="search-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SearchSortKey)}
                  className="h-9 border border-line bg-bg-deep px-3 font-display text-2xs uppercase tracking-[0.12em] text-white outline-none transition focus:border-accent"
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex" role="group" aria-label="Result layout">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    aria-pressed={view === "grid"}
                    aria-label="Grid view"
                    className={clsx(
                      "grid h-9 w-9 place-items-center border transition",
                      view === "grid" ? "border-accent bg-accent text-white" : "border-line text-ink-secondary hover:text-white",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-pressed={view === "list"}
                    aria-label="List view"
                    className={clsx(
                      "grid h-9 w-9 place-items-center border transition",
                      view === "list" ? "border-accent bg-accent text-white" : "border-line text-ink-secondary hover:text-white",
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {(platformFacets.length > 1 || genreFacets.length > 1) && (
              <div className="mb-6 space-y-3">
                {platformFacets.length > 1 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-2xs uppercase tracking-[0.16em] text-ink-muted">Platform</span>
                    <button
                      type="button"
                      onClick={() => setPlatform(null)}
                      className={clsx(
                        "border px-2.5 py-1 text-2xs transition",
                        !platform ? "border-accent bg-accent/15 text-white" : "border-line text-ink-secondary hover:text-white",
                      )}
                    >
                      All
                    </button>
                    {platformFacets.map(([slug, count]) => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => setPlatform(platform === slug ? null : slug)}
                        className={clsx(
                          "border px-2.5 py-1 text-2xs transition",
                          platform === slug ? "border-accent bg-accent/15 text-white" : "border-line text-ink-secondary hover:text-white",
                        )}
                      >
                        {platformName(slug)} <span className="text-ink-muted">{count}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {genreFacets.length > 1 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-2xs uppercase tracking-[0.16em] text-ink-muted">Genre</span>
                    <button
                      type="button"
                      onClick={() => setGenre(null)}
                      className={clsx(
                        "border px-2.5 py-1 text-2xs transition",
                        !genre ? "border-accent bg-accent/15 text-white" : "border-line text-ink-secondary hover:text-white",
                      )}
                    >
                      All
                    </button>
                    {genreFacets.map(([slug, count]) => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => setGenre(genre === slug ? null : slug)}
                        className={clsx(
                          "border px-2.5 py-1 text-2xs transition",
                          genre === slug ? "border-accent bg-accent/15 text-white" : "border-line text-ink-secondary hover:text-white",
                        )}
                      >
                        {genreName(slug)} <span className="text-ink-muted">{count}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {results.length === 0 ? (
              <EmptyState
                title="No games found"
                body={
                  query.trim()
                    ? `Nothing in the universe matches “${query.trim()}”. Try a studio name, a genre, or one of the popular searches above.`
                    : "No games match the selected filters."
                }
                ctaHref="/games"
                ctaLabel="Browse all games"
              />
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {shown.map((hit, i) => (
                  <GameCard key={hit.slug} game={hydrate(hit)} eager={i < 6} />
                ))}
              </div>
            ) : (
              <div className="border border-line bg-bg-card/40">
                {shown.map((hit) => (
                  <GameListRow key={hit.slug} game={hydrate(hit)} />
                ))}
              </div>
            )}

            {visible < results.length ? (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((n) => n + PAGE_STEP)}
                  className="border border-line bg-bg-card/60 px-8 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent hover:bg-accent"
                >
                  Load more · {results.length - visible} remaining
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="shell py-16">
          <div className="h-10 w-72 rounded-card animate-pulse bg-bg-muted" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SearchWorkspace />
    </Suspense>
  );
}
