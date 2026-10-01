import type { Metadata } from "next";
import Link from "next/link";

/* ===========================================================================
 * not-found — the global 404.
 * Served as /404.html by the static export, so every unknown route on the
 * published site lands here with a way back into the catalogue.
 * ======================================================================== */

export const metadata: Metadata = {
  title: "Page not found",
  description: "That route does not exist on INFINITY — find your way back to the catalogue.",
};

const SUGGESTIONS = [
  { label: "All games", href: "/games" },
  { label: "Deals", href: "/deals" },
  { label: "Categories", href: "/categories" },
  { label: "Platforms", href: "/platforms" },
  { label: "Studios", href: "/studios" },
  { label: "News", href: "/news" },
  { label: "Esports", href: "/esports" },
  { label: "Community", href: "/community" },
  { label: "Store", href: "/store" },
];

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col justify-center py-16">
      <p className="eyebrow mb-3">Error 404 — signal lost</p>
      <h1 className="h-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
        This route
        <br />
        doesn&apos;t exist
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-secondary">
        The page you asked for was never part of the universe — or it moved. The catalogue, lanes and community are
        all one click away.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-control bg-accent px-6 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
        >
          Back to home
        </Link>
        <Link
          href="/games"
          className="border border-line px-6 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
        >
          Browse the catalogue
        </Link>
      </div>

      <div className="mt-12 border-t border-line pt-6">
        <p className="eyebrow mb-3">Or jump to</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-line bg-bg-card/50 px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.12em] text-ink-secondary transition hover:border-accent hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
