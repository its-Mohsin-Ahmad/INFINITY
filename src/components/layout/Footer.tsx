import Link from "next/link";
import { FOOTER_COLUMNS, SOCIAL_LINKS } from "@/lib/nav";
import { NewsletterForm } from "@/components/player/player-actions";
import { PLATFORMS, TOTAL_GENRE_LANES } from "@/data/taxonomy";
import { computeStats } from "@/lib/catalogue";
import { compactNumber } from "@/lib/generate";

/* ===========================================================================
 * Footer — the only surface in INFINITY that carries social icons.
 * ======================================================================== */

const SOCIAL_PATHS: Record<string, string> = {
  discord:
    "M20.3 4.6a16.6 16.6 0 0 0-4.1-1.3l-.3.6a12.4 12.4 0 0 0-3.8 0l-.3-.6a16.6 16.6 0 0 0-4.1 1.3C4.9 8.2 4.2 11.7 4.5 15.1a16.7 16.7 0 0 0 5 2.5l.6-1a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.2 0l.4.3c-.5.3-1.1.6-1.7.8l.6 1a16.7 16.7 0 0 0 5-2.5c.4-4-.7-7.4-3-10.5ZM9.8 13.2c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm4.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z",
  youtube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z",
  x: "M17.5 3h3.2l-7 8 7.3 10h-5.7l-4.5-6.2L5.6 21H2.4l7.4-8.4L2.8 3h5.8l4.2 5.8L17.5 3Zm-1.1 16h1.8L7.5 4.8H5.6L16.4 19Z",
  twitch:
    "M4.3 3h15.4v11.4l-4.3 4.3h-3.5L9.6 21H7v-2.3H3V6.4L4.3 3Zm1.7 1.7v11.4h2.6V19l2-2h3.9l2.9-2.9V4.7H6Zm5.1 2.6h1.7v5.1h-1.7V7.3Zm4.6 0h1.7v5.1h-1.7V7.3Z",
  instagram:
    "M12 2.2c2.7 0 3 0 4 .1 1.1 0 1.7.2 2.1.4.5.2.9.5 1.3.9.4.4.7.8.9 1.3.2.4.4 1 .4 2.1.1 1 .1 1.3.1 4s0 3-.1 4c0 1.1-.2 1.7-.4 2.1a3.7 3.7 0 0 1-2.2 2.2c-.4.2-1 .4-2.1.4-1 .1-1.3.1-4 .1s-3 0-4-.1c-1.1 0-1.7-.2-2.1-.4a3.7 3.7 0 0 1-1.3-.9 3.7 3.7 0 0 1-.9-1.3c-.2-.4-.4-1-.4-2.1-.1-1-.1-1.3-.1-4s0-3 .1-4c0-1.1.2-1.7.4-2.1.2-.5.5-.9.9-1.3.4-.4.8-.7 1.3-.9.4-.2 1-.4 2.1-.4 1-.1 1.3-.1 4-.1Zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Zm6.5-8.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z",
  tiktok:
    "M16.6 2h-3v13.1a2.7 2.7 0 1 1-2.2-2.7V9.3a5.8 5.8 0 1 0 5.2 5.8V8.4a7.3 7.3 0 0 0 4.3 1.4V6.7a4.2 4.2 0 0 1-4.3-4.7Z",
  reddit:
    "M22 12a2 2 0 0 0-3.4-1.4 9.9 9.9 0 0 0-5.3-1.7l1-4.5 3.1.7a1.7 1.7 0 1 0 .2-1.5l-3.8-.8a.6.6 0 0 0-.7.5l-1.1 5.2A9.8 9.8 0 0 0 6.4 10 2 2 0 1 0 4.2 14c0 .2-.1.4-.1.6 0 2.7 3.5 4.9 7.9 4.9s7.9-2.2 7.9-4.9c0-.2 0-.4-.1-.6A2 2 0 0 0 22 12ZM7.4 13.2a1.4 1.4 0 1 1 2.8 0 1.4 1.4 0 0 1-2.8 0Zm7.6 3.4c-.9.9-2.5 1-3 1s-2.1-.1-3-1a.4.4 0 0 1 .5-.6c.5.5 1.6.7 2.5.7s2-.2 2.5-.7a.4.4 0 0 1 .5.6Zm-.4-2a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z",
  linkedin:
    "M6.9 8.6H3.7V21h3.2V8.6ZM5.3 3a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.3 13.9c0-3.3-1.8-4.9-4.1-4.9-1.5 0-2.4.8-2.8 1.4V8.6h-3.2V21h3.2v-6.6c0-1.4.6-2.4 1.8-2.4s1.8.9 1.8 2.4V21h3.3v-7.1Z",
};

function SocialIcon({ icon }: { icon: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d={SOCIAL_PATHS[icon] ?? SOCIAL_PATHS.discord} />
    </svg>
  );
}

function StatBand() {
  const stats = computeStats();
  const cells = [
    { label: "Games tracked", value: stats.games.toLocaleString() },
    { label: "Genre lanes", value: String(stats.genreLanes) },
    { label: "Platforms", value: String(stats.platforms) },
    { label: "Studios", value: stats.developers.toLocaleString() },
    { label: "Media items", value: compactNumber(stats.mediaItems) },
    { label: "Languages", value: String(stats.languages) },
  ];
  return (
    <div className="border-b border-line bg-bg-nav/60">
      <div className="shell grid grid-cols-2 gap-4 py-6 md:grid-cols-3 lg:grid-cols-6">
        {cells.map((s) => (
          <div key={s.label}>
            <p className="font-display text-2xl font-extrabold tabular-nums text-white">{s.value}</p>
            <p className="text-2xs uppercase tracking-[0.16em] text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-bg-deep">
      <StatBand />

      <div className="shell grid gap-10 py-12 lg:grid-cols-[1.1fr_2.9fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">INFINITY</span>
            <span className="mt-1 h-[3px] w-8 bg-accent" />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-ink-secondary">
            One universe. Infinite games. Discover, compare, buy and play across every platform from a single
            ecosystem — powered by a catalogue that is verified record by record.
          </p>

          <div className="mt-6">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white">
              Weekly drop newsletter
            </p>
            <p className="mb-3 mt-1 text-xs text-ink-muted">
              New releases, verified deals and esports results. No spam, unsubscribe at any time.
            </p>
            <NewsletterForm />
          </div>

          {/* Social icons live here and nowhere else in the product. */}
          <div className="mt-6 flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="grid h-9 w-9 place-items-center border border-line text-ink-secondary transition hover:border-accent hover:bg-accent hover:text-white"
              >
                <SocialIcon icon={s.icon} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={`${col.title}:${l.label}`}>
                    <Link href={l.href} className="text-xs text-ink-secondary transition hover:text-accent">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-4 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
              Available on
            </span>
            {PLATFORMS.map((p) => (
              <Link
                key={p.slug}
                href={`/platforms/${p.slug}`}
                className="border border-line px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-ink-secondary transition hover:border-accent hover:text-white"
              >
                {p.shortName}
              </Link>
            ))}
            <span className="ml-2 font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
              {TOTAL_GENRE_LANES} genre lanes
            </span>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-line-soft pt-4 text-2xs text-ink-muted md:flex-row md:items-center">
            <p className="max-w-4xl">
              © {new Date().getFullYear()} INFINITY Interactive. INFINITY is a discovery and commerce platform. Game
              titles, studio names and trademarks belong to their respective owners. We link to official storefronts
              and never host third-party game files.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/support/terms" className="transition hover:text-accent">
                Terms
              </Link>
              <Link href="/support/privacy" className="transition hover:text-accent">
                Privacy
              </Link>
              <Link href="/support/cookies" className="transition hover:text-accent">
                Cookies
              </Link>
              <Link href="/support/accessibility" className="transition hover:text-accent">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

