import type { Metadata } from "next";
import Link from "next/link";
import { STUDIOS, type Studio } from "@/lib/catalogue/studios";
import { computeStats } from "@/lib/catalogue";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading, ScoreBadge, Stat } from "@/components/ui/primitives";

/* ===========================================================================
 * /studios — every developer in the catalogue, grouped and slugged exactly
 * like the links on the homepage, game pages and footer.
 * ======================================================================== */

export const metadata: Metadata = {
  title: "Studios",
  description: `Every developer behind the INFINITY catalogue — ${STUDIOS.length} studios with live title counts, average scores and top games.`,
};

function letterOf(name: string): string {
  const raw = name[0]?.toUpperCase() ?? "#";
  return /[A-Z]/.test(raw) ? raw : "#";
}

export default function StudiosPage() {
  const stats = computeStats();
  const top = STUDIOS.slice(0, 12);

  const az = new Map<string, Studio[]>();
  for (const studio of [...STUDIOS].sort((a, b) => a.name.localeCompare(b.name))) {
    const letter = letterOf(studio.name);
    const list = az.get(letter) ?? [];
    list.push(studio);
    az.set(letter, list);
  }
  const letters = [...az.keys()].sort();

  return (
    <>
      <PageHero
        eyebrow="The makers"
        title={
          <>
            {STUDIOS.length} studios,
            <br />
            one catalogue
          </>
        }
        description="Every developer with a title on INFINITY, indexed by name and ranked by catalogue size. Counts and scores are derived from the live library."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(STUDIOS.length)} label="Studios" />
          <Stat value={String(stats.publishers)} label="Publishers" />
          <Stat value={stats.games.toLocaleString()} label="Games" />
          <Stat value={stats.averageRating.toFixed(1)} label="Avg. score" tone="accent" />
        </div>
      </PageHero>

      <div className="shell space-y-14 py-10">
        {/* --------------------------------------------------- top studios */}
        <section>
          <SectionHeading
            eyebrow="By catalogue size"
            title="Most represented studios"
            description="The twelve developers with the most titles on the platform, ranked by count then score."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((studio, i) => (
              <Link
                key={studio.slug}
                href={`/studios/${studio.slug}`}
                className="group relative overflow-hidden border border-line bg-bg-card/40 p-4 transition hover:border-accent"
              >
                <span className="absolute right-3 top-3 font-display text-2xl font-extrabold tabular-nums text-line-strong group-hover:text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="pr-10 font-display text-sm font-bold uppercase tracking-[0.1em] text-white group-hover:text-accent">
                  {studio.name}
                </p>
                <p className="mt-1 line-clamp-1 text-2xs text-ink-muted">Top title: {studio.topGame.title}</p>
                <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-2.5">
                  <span className="font-display text-2xs font-bold uppercase tracking-wider text-ink-secondary">
                    {studio.count} {studio.count === 1 ? "game" : "games"}
                  </span>
                  <ScoreBadge rating={studio.avgRating} />
                </div>
              </Link>
            ))}
          </div>
        </section>
        {/* --------------------------------------------------- A–Z index */}
        <section>
          <SectionHeading
            eyebrow="Directory"
            title="All studios, A to Z"
            description={`${STUDIOS.length} developers indexed alphabetically with their catalogue size.`}
          />

          <nav className="no-scrollbar mb-5 flex flex-wrap gap-1.5 overflow-x-auto" aria-label="Jump to letter">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#studio-${letter.toLowerCase()}`}
                className="min-w-[34px] border border-line bg-bg-card/60 px-2 py-1.5 text-center font-display text-2xs font-bold uppercase tracking-widest text-ink-secondary transition hover:border-accent hover:text-white"
              >
                {letter}
              </a>
            ))}
          </nav>

          <div className="space-y-6">
            {letters.map((letter) => (
              <div key={letter} id={`studio-${letter.toLowerCase()}`} className="scroll-mt-24">
                <h3 className="mb-3 border-b border-line pb-2 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
                  {letter}
                </h3>
                <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                  {(az.get(letter) ?? []).map((studio) => (
                    <li key={studio.slug}>
                      <Link
                        href={`/studios/${studio.slug}`}
                        className="flex items-center justify-between gap-2 border border-transparent px-2 py-1.5 text-xs text-ink-secondary transition hover:border-line hover:bg-bg-card/60 hover:text-white"
                      >
                        <span className="truncate">{studio.name}</span>
                        <span className="shrink-0 tabular-nums text-ink-muted">{studio.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-3 border-t border-line pt-8">
          <Link
            href="/categories"
            className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
          >
            Browse categories
          </Link>
          <Link
            href="/platforms"
            className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
          >
            Browse platforms
          </Link>
          <Link
            href="/games"
            className="rounded-control bg-accent px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
          >
            Full catalogue
          </Link>
        </section>

      </div>
    </>
  );
}
