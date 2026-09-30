"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Gamepad2, House, Newspaper, ShoppingBag, Users } from "lucide-react";

/* ===========================================================================
 * Mobile bottom navigation (§83–86) — the mandatory core component
 * ---------------------------------------------------------------------------
 * Five app-style tabs fixed to the bottom edge on phones and tablets. Hidden
 * at lg (1024px) where the full desktop navigation takes over. The bar sits
 * inside the safe-area inset and the body reserves its height through
 * `--bottomnav-h`, so it can never cover the footer or a page's last row.
 *
 * Social icons are intentionally absent here — footer only, by brand rule.
 * ======================================================================== */

type Tab = {
  label: string;
  href: string;
  icon: typeof House;
  /** Prefix match against the pathname, except Home which must be exact. */
  match: (path: string) => boolean;
};

const TABS: Tab[] = [
  { label: "Home", href: "/", icon: House, match: (p) => p === "/" },
  {
    label: "Games",
    href: "/games",
    icon: Gamepad2,
    match: (p) =>
      ["/games", "/categories", "/platforms", "/studios", "/search", "/deals", "/compare"].some((x) => p.startsWith(x)),
  },
  {
    label: "Store",
    href: "/store",
    icon: ShoppingBag,
    match: (p) => ["/store", "/cart", "/deals", "/game-pass"].some((x) => p.startsWith(x)),
  },
  { label: "News", href: "/news", icon: Newspaper, match: (p) => p.startsWith("/news") },
  {
    label: "Community",
    href: "/community",
    icon: Users,
    match: (p) => p.startsWith("/community") || p.startsWith("/esports"),
  },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[75] border-t border-line bg-[#050D16] backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex h-16 w-full max-w-lg items-stretch">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="min-w-0 flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group relative flex h-full flex-col items-center justify-center gap-1 transition-colors duration-200",
                  active ? "text-accent" : "text-ink-secondary hover:text-white",
                )}
              >
                {/* thin active indicator along the top edge */}
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute inset-x-5 top-0 h-0.5 bg-accent transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon
                  aria-hidden="true"
                  strokeWidth={active ? 2.4 : 1.8}
                  className={clsx("h-5 w-5 transition-transform duration-200", active ? "scale-110" : "group-active:scale-90")}
                />
                <span
                  className={clsx(
                    "font-display text-[10px] font-bold uppercase leading-none tracking-[0.08em]",
                    active && "text-white",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}