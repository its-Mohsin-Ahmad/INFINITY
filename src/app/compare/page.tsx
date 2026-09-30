/* ===========================================================================
 * /compare — side-by-side spec sheets for the comparison set (max 4).
 * ---------------------------------------------------------------------------
 * Reads the same `compare` slice the tray writes to. The tray hides itself while
 * this route is active, so the set is edited here instead. On phones the table
 * scrolls horizontally so the value columns keep their width.
 * ======================================================================== */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Scale, X } from "lucide-react";
import { usePlayer } from "@/lib/store/player-store";
import { getGames } from "@/lib/catalogue";
import { discountedPrice, formatPrice } from "@/lib/generate";
import { genreName } from "@/data/taxonomy";
import { ArtImage } from "@/components/art/ArtImage";
import { EmptyState } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/page-hero";

type CatalogueGame = ReturnType<typeof getGames>[number];
type Row = { label: string; render: (g: CatalogueGame) => React.ReactNode };

const ROWS: Row[] = [
  { label: "Rating", render: (g) => `${g.rating.toFixed(1)} / 10` },
  { label: "Reviews", render: (g) => g.reviewCount.toLocaleString("en-US") },
  { label: "Release", render: (g) => new Date(g.releaseDate).getFullYear() },
  { label: "Developer", render: (g) => g.developer },
  { label: "Publisher", render: (g) => g.publisher },
  { label: "Genre", render: (g) => genreName(g.genre[0]) },
  { label: "Platforms", render: (g) => g.platforms.length },
  { label: "Modes", render: (g) => g.gameModes.join(", ") || "—" },
  {
    label: "Price",
    render: (g) =>
      g.isFree ? (
        <span className="text-accent">Free</span>
      ) : g.isComingSoon ? (
        "—"
      ) : (
        formatPrice(discountedPrice(g.price, g.discount))
      ),
  },
  { label: "Install size", render: (g) => g.fileSize },
  { label: "Age rating", render: (g) => g.ageRating },
  { label: "Languages", render: (g) => g.languages.length },
];

export default function ComparePage() {
  const compare = usePlayer((s) => s.compare);
  const toggle = usePlayer((s) => s.toggleCompare);
  const clear = usePlayer((s) => s.clearCompare);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const games = mounted ? getGames(compare) : [];

  return (
    <>
      <PageHero
        eyebrow="Side by side"
        title="Compare"
        description="Up to four titles, scored on the same fields. Add a game from any card with the scale icon and it appears here."
        tone="accent"
      >
        {mounted && games.length ? (
          <button
            type="button"
            onClick={clear}
            className="flex min-h-[44px] items-center gap-2 border border-line px-4 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-accent"
          >
            <X className="h-4 w-4" />
            Clear set
          </button>
        ) : null}
      </PageHero>

      <div className="shell py-10">
        {!mounted || !games.length ? (
          <EmptyState
            title="Nothing to compare yet"
            body="Add two to four titles with the scale icon and their specs line up here, row for row."
            ctaHref="/games"
            ctaLabel="Pick some games"
          />
        ) : (
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">Comparison of selected games</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-36 border-b border-line p-3 align-bottom">
                    <span className="font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                      Field
                    </span>
                  </th>
                  {games.map((g) => (
                    <th key={g.slug} scope="col" className="border-b border-line p-3 align-bottom">
                      <Link href={`/games/${g.slug}`} className="group block min-w-[10rem] max-w-[14rem]">
                        <span className="relative mb-2 block aspect-video overflow-hidden border border-line">
                          <ArtImage game={g} variant="wide" className="h-full w-full object-cover" />
                        </span>
                        <span className="block font-display text-xs font-bold uppercase leading-snug tracking-[0.06em] text-white group-hover:text-accent">
                          {g.title}
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggle(g.slug, g.title)}
                        aria-label={`Remove ${g.title} from comparison`}
                        className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-1.5 border border-line text-2xs font-bold uppercase tracking-[0.12em] text-ink-secondary transition hover:border-accent hover:text-accent"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-bg-card/40" : undefined}>
                    <th
                      scope="row"
                      className="border-b border-line p-3 align-top font-display text-2xs font-bold uppercase tracking-[0.12em] text-ink-secondary"
                    >
                      {row.label}
                    </th>
                    {games.map((g) => (
                      <td key={g.slug} className="border-b border-line p-3 align-top text-white">
                        {row.render(g)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 flex items-center gap-2 text-2xs text-ink-muted">
              <Scale className="h-3.5 w-3.5" />
              {games.length} of 4 slots used
            </p>
          </div>
        )}
      </div>
    </>
  );
}