"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  Bell,
  ChevronDown,
  Download,
  Globe,
  Heart,
  Menu,
  Search,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { PRIMARY_NAV, UTILITY_LINKS, type NavItem } from "@/lib/nav";
import { POPULAR_SEARCHES, loadSearchIndex, scoreHits, type SearchHit } from "@/lib/search-index";
import { genreName } from "@/data/taxonomy";
import { useCartTotals, usePlayer } from "@/lib/store/player-store";

/* ===========================================================================
 * Header
 * ---------------------------------------------------------------------------
 * Utility bar + primary navigation with mega menu + global search + account
 * surfaces. Social icons are intentionally absent (footer only).
 * ======================================================================== */

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="INFINITY home" className={clsx("group flex items-center gap-2", className)}>
      <span className="relative grid h-8 w-8 place-items-center border border-accent/60 bg-accent/10">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M4 12h4l2-5 4 10 2-5h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {/* wordmark folds away below 400px so the row can never overflow (§9) */}
      <span className="hidden font-display text-xl font-extrabold uppercase leading-none tracking-tight text-white min-[400px]:inline">
        INFIN<span className="text-accent">I</span>TY
      </span>
    </Link>
  );
}

function Counter({ value, className }: { value: number; className?: string }) {
  if (!value) return null;
  return (
    <span
      className={clsx(
        "absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 font-display text-[9px] font-bold tabular-nums text-white",
        className,
      )}
    >
      {value > 99 ? "99+" : value}
    </span>
  );
}

function SearchField({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      className={clsx("relative flex items-center", className)}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
      }}
      role="search"
    >
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search 540+ games, studios, genresâ€¦"
        aria-label="Search games"
        className="h-10 w-full border border-line bg-bg-deep/80 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-ink-muted focus:border-accent"
      />
    </form>
  );
}

function UtilityBar({ mounted }: { mounted: boolean }) {
  const wishlist = usePlayer((s) => s.wishlist);
  const { count } = useCartTotals();
  const user = usePlayer((s) => s.user);

  return (
    <div className="hidden border-b border-line-soft bg-bg-deep lg:block">
      <div className="shell flex h-9 items-center justify-between text-2xs uppercase tracking-[0.12em]">
        <div className="flex items-center gap-4 text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-emerald-400" />
            All services operational
          </span>
          <span className="text-line">|</span>
          <span>Global gaming ecosystem</span>
        </div>

        <div className="flex items-center gap-4">
          {UTILITY_LINKS.map((l) => (
            <Link key={l.href + l.label} href={l.href} className="text-ink-secondary transition hover:text-accent">
              {l.label}
            </Link>
          ))}
          <span className="text-line">|</span>
          <button type="button" className="flex items-center gap-1.5 text-ink-secondary transition hover:text-accent">
            <Globe className="h-3 w-3" />
            English Â· USD
          </button>
          <span className="text-line">|</span>
          <Link
            href="/dashboard/notifications"
            className="text-ink-secondary transition hover:text-accent"
            aria-label="Notifications"
          >
            Notifications
          </Link>
          <Link
            href="/dashboard/wishlist"
            className="relative text-ink-secondary transition hover:text-accent"
            aria-label="Wishlist"
          >
            Wishlist{mounted && wishlist.length ? ` (${wishlist.length})` : ""}
          </Link>
          <Link href="/cart" className="relative text-ink-secondary transition hover:text-accent" aria-label="Cart">
            Cart{mounted && count ? ` (${count})` : ""}
          </Link>
          <Link
            href={user ? "/dashboard" : "/signin"}
            className="flex items-center gap-1.5 text-white transition hover:text-accent"
          >
            <UserRound className="h-3 w-3" />
            {user ? user.username : "Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function DesktopNav({ items }: { items: NavItem[] }) {
  return (
    <nav aria-label="Primary" className="hidden items-stretch lg:flex">
      {items.map((item, i) => (
        <div key={item.label} className="group relative flex items-center">
          <Link
            href={item.href}
            className={clsx(
              "flex h-full items-center gap-1 border-b-2 border-transparent px-3 py-3 font-display text-xs font-bold uppercase tracking-[0.12em] transition group-hover:border-accent",
              item.highlight ? "text-accent" : "text-ink-secondary group-hover:text-white",
            )}
          >
            {item.label}
            {item.sections ? <ChevronDown className="h-3 w-3 opacity-60 transition group-hover:rotate-180" /> : null}
          </Link>

          {item.sections ? (
            /* Anchored to its own trigger instead of centred on it: a centred
               720px panel under "Games" started ~100px off the left edge of the
               screen and ran the dropdown outside the site. Items in the right
               half anchor right so neither end can escape the viewport, and the
               width is capped so it always fits. */
            <div
              className={clsx(
                "invisible absolute top-full z-50 w-[720px] max-w-[calc(100vw-2rem)] -translate-y-1 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
                i >= items.length / 2 ? "right-0" : "left-0",
              )}
            >
              <div className="grid grid-cols-3 gap-6 border border-line bg-bg-nav p-6 shadow-panel">
                {item.sections.map((section) => (
                  <div key={section.title}>
                    <p className="mb-3 border-b border-line pb-2 font-display text-2xs font-bold uppercase tracking-[0.18em] text-accent">
                      {section.title}
                    </p>
                    <ul className="space-y-2">
                      {section.children.map((child) => (
                        <li key={section.title + child.href}>
                          <Link href={child.href} className="block px-1 py-0.5 transition hover:bg-bg-card/70">
                            <span className="block text-sm font-semibold text-white">{child.label}</span>
                            {child.hint ? <span className="block text-2xs text-ink-muted">{child.hint}</span> : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </nav>
  );
}

function MobileDrawer({ open, onClose, mounted }: { open: boolean; onClose: () => void; mounted: boolean }) {
  const pathname = usePathname();
  const wishlist = usePlayer((s) => s.wishlist);
  const { count } = useCartTotals();
  // Every group starts OPEN: a phone visitor should see the whole navigation
  // without tapping to discover it. Tapping a header still collapses it.
  const [expanded, setExpanded] = useState<string[]>(
    PRIMARY_NAV.filter((item) => item.sections).map((item) => item.label),
  );
  const isOpen = (label: string) => expanded.includes(label);
  const toggle = (label: string) =>
    setExpanded((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={clsx("fixed inset-0 z-[80] lg:hidden", open ? "" : "pointer-events-none")}>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={clsx("absolute inset-0 bg-black/60 backdrop-blur-sm transition duration-300", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        aria-label="Mobile navigation"
        aria-hidden={!open}
        className={clsx(
          /* Glassy black sheet: translucent and blurred so the page behind stays
             visible, outlined with a faint white edge and the system 20px
             radius on the open side. */
          "absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col rounded-r-[20px] border-r border-white/10 bg-[#03060C]/85 shadow-[0_0_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid h-10 w-10 shrink-0 place-items-center border border-white/15 text-white sm:h-9 sm:w-9"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/10 p-4">
          <SearchField />
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto p-4">
          <ul className="space-y-1">
            {PRIMARY_NAV.map((item) => (
              <li key={item.label} className="border-b border-white/[0.07]">
                {item.sections ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggle(item.label)}
                      aria-expanded={isOpen(item.label)}
                      className="flex w-full items-center justify-between py-3 font-display text-sm font-bold uppercase tracking-[0.1em] text-white"
                    >
                      {item.label}
                      <ChevronDown
                        className={clsx("h-4 w-4 transition", isOpen(item.label) ? "rotate-180 text-accent" : "")}
                      />
                    </button>
                    {isOpen(item.label) ? (
                      <div className="pb-3 pl-3">
                        {item.sections.map((section) => (
                          <div key={section.title} className="mb-3">
                            <p className="mb-1 font-display text-2xs font-bold uppercase tracking-[0.18em] text-accent">
                              {section.title}
                            </p>
                            <ul className="space-y-1">
                              {section.children.map((child) => (
                                <li key={section.title + child.href}>
                                  <Link href={child.href} className="block py-1 text-sm text-ink-secondary">
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={clsx(
                      "block py-3 font-display text-sm font-bold uppercase tracking-[0.1em]",
                      item.highlight ? "text-accent" : "text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 border-t border-white/10 p-4">
          <Link
            href="/launcher"
            className="rounded-control flex items-center justify-center gap-2 bg-accent px-4 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            <Download className="h-4 w-4" />
            Install launcher
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/wishlist"
              className="flex items-center justify-center gap-2 border border-line px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-white"
            >
              <Heart className="h-4 w-4" />
              Wishlist{mounted && wishlist.length ? ` ${wishlist.length}` : ""}
            </Link>
            <Link
              href="/cart"
              className="flex items-center justify-center gap-2 border border-line px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-white"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart{mounted && count ? ` ${count}` : ""}
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 border border-line px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-ink-secondary"
          >
            <ShieldCheck className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </aside>
    </div>
  );
}

/**
 * Global search overlay (Â§8) â€” opens over the page, matches against the same
 * trimmed index the /search route uses, and never leaves the homepage.
 */
function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);

  /** Fetch the index once, on first open â€” the homepage never pays for it. */
  useEffect(() => {
    if (!open || hits !== null) return;
    let alive = true;
    loadSearchIndex()
      .then((rows) => alive && setHits(rows))
      .catch(() => alive && setHits([]));
    return () => {
      alive = false;
    };
  }, [open, hits]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const suggestions = useMemo(
    () => (q.trim().length >= 2 && hits ? scoreHits(q, hits, 6) : []),
    [q, hits],
  );

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className={clsx("fixed inset-0 z-[90]", open ? "" : "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={clsx("absolute inset-0 bg-black/80 backdrop-blur-sm transition duration-300", open ? "opacity-100" : "opacity-0")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search INFINITY"
        className={clsx(
          "absolute inset-x-0 top-0 border-b border-accent/40 bg-bg-nav/98 shadow-panel transition duration-300",
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        )}
      >
        <div className="shell py-6">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <Search className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  go(`/search?q=${encodeURIComponent(q.trim())}`);
                }
              }}
              placeholder="Search 450+ games, genres, developersâ€¦"
              aria-label="Search games"
              className="h-10 min-w-0 flex-1 bg-transparent font-display text-lg text-white outline-none placeholder:text-ink-muted sm:text-2xl"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="grid h-9 w-9 shrink-0 place-items-center border border-line text-ink-secondary transition hover:border-accent hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {suggestions.length ? (
            <ul className="mt-4 divide-y divide-line border border-line bg-bg-deep/60">
              {suggestions.map((hit) => (
                <li key={hit.slug}>
                  <button
                    type="button"
                    onClick={() => go(`/games/${hit.slug}`)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-bg-card"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">{hit.title}</span>
                      <span className="block truncate text-2xs text-ink-muted">
                        {genreName(hit.genre[0])} Â· {hit.developer}
                      </span>
                    </span>
                    <span className="font-display text-2xs tabular-nums text-accent">{hit.rating.toFixed(1)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <p className="text-2xs uppercase tracking-[0.16em] text-ink-muted">Popular searches</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => go(`/search?q=${encodeURIComponent(term)}`)}
                    className="border border-line px-3 py-1.5 text-xs text-ink-secondary transition hover:border-accent hover:text-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q.trim().length >= 2 && suggestions.length === 0 && hits ? (
            <p className="mt-4 text-sm text-ink-secondary">
              No matches for â€œ{q.trim()}â€ â€” press Enter to open full results.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { count } = useCartTotals();
  const wishlist = usePlayer((s) => s.wishlist);
  const user = usePlayer((s) => s.user);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-[70] w-full border-b bg-bg-nav/95 backdrop-blur transition",
        scrolled ? "border-accent/30 shadow-panel" : "border-line",
      )}
      // keeps the bar clear of the notch / Dynamic Island with viewport-fit=cover
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <UtilityBar mounted={mounted} />

      <div className={clsx("shell flex items-center gap-2 xs:gap-4 transition-all", scrolled ? "h-14" : "h-16 lg:h-[70px]")}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="grid h-10 w-10 shrink-0 place-items-center border border-line text-white lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Logo className="shrink-0" />
        <DesktopNav items={PRIMARY_NAV} />

        <div className="ml-auto flex items-center gap-1.5 xs:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="grid h-10 w-10 shrink-0 place-items-center border border-line text-white transition hover:border-accent hover:text-accent sm:h-9 sm:w-9"
          >
            <Search className="h-4 w-4" />
          </button>
          {/* wishlist + cart fold into the drawer below sm to protect the
              icon priority order (hamburger â†’ logo â†’ search â†’ bell â†’ profile) */}
          <Link
            href="/dashboard/wishlist"
            aria-label="Open wishlist"
            className="relative hidden h-9 w-9 place-items-center border border-line text-white transition hover:border-accent hover:text-accent sm:grid"
          >
            <Heart className="h-4 w-4" />
            {mounted ? <Counter value={wishlist.length} /> : null}
          </Link>
          <Link
            href="/cart"
            aria-label="Open cart"
            className="relative hidden h-9 w-9 place-items-center border border-line text-white transition hover:border-accent hover:text-accent sm:grid"
          >
            <ShoppingCart className="h-4 w-4" />
            {mounted ? <Counter value={count} /> : null}
          </Link>
          <Link
            href="/dashboard/notifications"
            aria-label="Open notifications"
            className="grid h-10 w-10 shrink-0 place-items-center border border-line text-white transition hover:border-accent hover:text-accent sm:h-9 sm:w-9"
          >
            <Bell className="h-4 w-4" />
          </Link>
          <Link
            href={user ? "/dashboard" : "/signin"}
            aria-label={user ? "Open profile" : "Sign in"}
            className="grid h-10 w-10 shrink-0 place-items-center border border-line text-white transition hover:border-accent hover:text-accent sm:h-9 sm:w-9"
          >
            <UserRound className="h-4 w-4" />
          </Link>
          <Link
            href="/launcher"
            className="rounded-control hidden items-center gap-2 bg-accent px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-accent-bright lg:flex"
          >
            <Download className="h-4 w-4" />
            Launcher
          </Link>
        </div>
      </div>

      <MobileDrawer open={open} onClose={() => setOpen(false)} mounted={mounted} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}



