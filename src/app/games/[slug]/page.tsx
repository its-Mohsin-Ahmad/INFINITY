import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { GAMES, ALL_GAME_SLUGS, getGame } from "@/lib/catalogue";
import { similarTo } from "@/lib/catalogue/query";
import { GENRE_MAP, PLATFORM_MAP } from "@/data/taxonomy";
import { GameArt } from "@/components/art/GameArt";
import { ArtImage } from "@/components/art/ArtImage";
import { GameRow } from "@/components/game/GameGrid";
import {
  Badge,
  Breadcrumbs,
  MetaRow,
  Panel,
  PlatformPills,
  PriceTag,
  ScoreBadge,
  TagList,
} from "@/components/ui/primitives";
import { Countdown, Tabs } from "@/components/ui/interactive";
import { AddToCartButton, CompareButton, WishlistButton } from "@/components/player/player-actions";
import { RecentlyViewedRail, ViewedTracker } from "@/components/player/recently-viewed";
import { discountedPrice, slugify } from "@/lib/generate";
import type { RequirementRow } from "@/lib/types";
import { cartGame, wishlistGame } from "@/lib/catalogue/client-props";

/* ===========================================================================
 * /games/[slug] — the game detail page
 * ---------------------------------------------------------------------------
 * The catalogue is deterministic and in-memory, so every game is prerendered
 * at build time (540 pages). That also makes the route exportable to a static
 * host such as GitHub Pages. No third-party media is loaded: every image comes
 * from the generated key-art engine.
 * ======================================================================== */

/** Prerender the whole catalogue (540 pages). */
export function generateStaticParams() {
  return ALL_GAME_SLUGS.map((slug) => ({ slug }));
}

/**
 * The catalogue is closed: `generateStaticParams` emits every slug, so unknown
 * slugs 404 instead of being rendered on demand. A literal is required here —
 * Next only accepts static values, and `false` is also what `output: "export"`
 * expects.
 */
export const dynamicParams = false;

type GamePageProps = { params: Promise<{ slug: string }> };

/** slug -> title lookup for the client-side recently-viewed rail. */
// The rail only needs titles for games a reader could plausibly have seen
// alongside this one, so the index is built from this page's own related
// games. Shipping all 540 titles put ~24KB of dead JSON in every game page.

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Game not found" };
  return {
    title: `${game.title} — buy, download & review`,
    description: game.shortDescription,
    openGraph: {
      title: `${game.title} on INFINITY`,
      description: game.shortDescription,
      type: "website",
    },
  };
}

function RequirementTable({ rows }: { rows: RequirementRow[] }) {
  return (
    <dl className="divide-y divide-line-soft border border-line">
      {rows.map((r) => (
        <div key={r.label} className="flex items-start justify-between gap-4 px-3.5 py-2.5">
          <dt className="font-display text-2xs font-bold uppercase tracking-[0.12em] text-ink-muted">{r.label}</dt>
          <dd className="text-right text-xs text-white">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = getGame(slug);

  if (!game) notFound();

  const similar = similarTo(game, 12);
  const releaseYear = game.releaseDate.slice(0, 4);
  const price = discountedPrice(game.price, game.discount);
  const genres = game.genre.map((g) => GENRE_MAP[g]?.name ?? g);

  return (
    <>
      <ViewedTracker slug={game.slug} />

      <div className="shell py-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Games", href: "/games" },
            { label: genres[0] ?? "Game", href: `/categories/${game.genre[0]}` },
            { label: game.title },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
          {/* ---------------------------------------------------------- main */}
          <div className="min-w-0">
            <div className="relative overflow-hidden border border-line">
              <ArtImage game={game} variant="banner" showTitle={false} eager className="aspect-[21/9] w-full" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-deep/70 via-transparent to-bg-deep/30" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {game.isComingSoon ? <Badge tone="soon">Coming soon</Badge> : null}
                {game.isNew ? <Badge tone="new">New</Badge> : null}
                {game.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
                {game.isFree ? <Badge tone="new">Free to play</Badge> : null}
                {!game.isComingSoon && game.discount > 0 ? <Badge tone="live">-{game.discount}%</Badge> : null}
              </div>
            </div>

            <div className="mt-6">
              <h1 className="h-display text-3xl sm:text-4xl lg:text-5xl">{game.title}</h1>
              {game.tagline ? <p className="mt-2 text-sm text-ink-secondary">{game.tagline}</p> : null}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-muted">
                <Link href={`/studios/${slugify(game.developer)}`} className="hover:text-accent">
                  {game.developer}
                </Link>
                <span className="text-line-strong">|</span>
                <span>{game.publisher}</span>
                <span className="text-line-strong">|</span>
                <span>{releaseYear}</span>
                <span className="text-line-strong">|</span>
                <span>{genres.join(" · ")}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ScoreBadge rating={game.rating} />
                <span className="text-2xs uppercase tracking-wider text-ink-muted">
                  {game.reviewCount.toLocaleString()} reviews
                </span>
                <PlatformPills platforms={game.platforms} />
              </div>

              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink-secondary">{game.longDescription}</p>

              <Tabs
                className="mt-8"
                tabs={[
                  {
                    id: "overview",
                    label: "Overview",
                    content: (
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                            Highlights
                          </h3>
                          <ul className="space-y-2">
                            {game.features.map((f) => (
                              <li key={f} className="flex gap-2 text-sm text-ink-secondary">
                                <span className="mt-1.5 h-1 w-1 shrink-0 bg-accent" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <h3 className="mb-3 mt-6 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                            Modes
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {game.gameModes.map((m) => (
                              <Badge key={m} tone="outline">
                                {m.replace(/-/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                            How it plays
                          </h3>
                          <ol className="space-y-2.5">
                            {game.howToPlay.map((step, i) => (
                              <li key={i} className="flex gap-3 text-sm text-ink-secondary">
                                <span className="font-display text-2xs font-bold text-accent">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                          <div className="mt-5">
                            <TagList tags={game.tags} />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: "media",
                    label: "Media",
                    badge: String(game.screenshots.length + game.videos.length),
                    content: (
                      <div>
                        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                          Screenshots
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {game.screenshots.map((shot, i) => (
                            <figure key={shot.id} className="overflow-hidden border border-line">
                              <GameArt
                                game={game}
                                variant="wide"
                                index={i}
                                showTitle={false}
                                className="aspect-video w-full"
                              />
                              <figcaption className="px-3 py-2 text-2xs uppercase tracking-wider text-ink-muted">
                                {shot.caption}
                              </figcaption>
                            </figure>
                          ))}
                        </div>

                        <h3 className="mb-3 mt-8 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                          Videos
                        </h3>
                        <ul className="space-y-2">
                          {game.videos.map((video) => (
                            <li key={video.id}>
                              <a
                                href={video.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 border border-line bg-bg-card/40 p-3 transition hover:border-accent"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-display text-xs font-bold uppercase tracking-wide text-white group-hover:text-accent">
                                    {video.title}
                                  </p>
                                  <p className="mt-0.5 text-2xs uppercase tracking-wider text-ink-muted">
                                    {video.channel} · {video.category} · {video.duration}
                                  </p>
                                </div>
                                <ExternalLink className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-accent" />
                              </a>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-2xs text-ink-muted">
                          Videos link only to official publisher channels.
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: "how-to-play",
                    label: "How to play",
                    content: (
                      <div className="space-y-6">
                        {game.controls.map((c) => (
                          <div key={c.platform} className="border border-line p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                                {PLATFORM_MAP[c.platform]?.name ?? c.platform} · {c.label}
                              </h3>
                              <Badge tone="outline">{c.input}</Badge>
                            </div>
                            <p className="text-sm text-ink-secondary">{c.objective}</p>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="mb-2 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                                  Controls
                                </p>
                                <dl className="divide-y divide-line-soft border border-line">
                                  {c.controls.map((b) => (
                                    <div key={b.action} className="flex items-center justify-between gap-3 px-3 py-2">
                                      <dt className="text-xs text-ink-secondary">{b.action}</dt>
                                      <dd className="font-display text-2xs font-bold uppercase text-white">
                                        {b.key}
                                      </dd>
                                    </div>
                                  ))}
                                </dl>
                              </div>
                              <div>
                                <p className="mb-2 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                                  Beginner guide
                                </p>
                                <ol className="space-y-2">
                                  {c.beginnerGuide.map((s, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-ink-secondary">
                                      <span className="font-display font-bold text-accent">{i + 1}.</span>
                                      {s}
                                    </li>
                                  ))}
                                </ol>
                                <p className="mb-2 mt-4 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                                  Advanced
                                </p>
                                <ul className="space-y-1.5">
                                  {c.advanced.map((t) => (
                                    <li key={t} className="flex gap-2 text-xs text-ink-secondary">
                                      <span className="mt-1.5 h-1 w-1 shrink-0 bg-accent" />
                                      {t}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    id: "requirements",
                    label: "Requirements",
                    content: (
                      <div className="space-y-6">
                        {game.availability.map((a) => (
                          <div key={a.platform} className="border border-line p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                                {PLATFORM_MAP[a.platform]?.name ?? a.platform} · {a.edition}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge tone="outline">{a.fileSize}</Badge>
                                {a.infinityBuild ? <Badge tone="accent">INFINITY build</Badge> : null}
                              </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="mb-2 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                                  Minimum
                                </p>
                                <RequirementTable rows={a.requirements.minimum} />
                              </div>
                              <div>
                                <p className="mb-2 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                                  Recommended
                                </p>
                                <RequirementTable rows={a.requirements.recommended} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    id: "store",
                    label: "Where to buy",
                    badge: String(game.officialStoreLinks.length),
                    content: (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {game.officialStoreLinks.map((link) => (
                          <li key={`${link.platform}-${link.retailer}`}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="group flex items-center gap-3 border border-line bg-bg-card/40 p-3.5 transition hover:border-accent"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-display text-xs font-bold uppercase tracking-wide text-white group-hover:text-accent">
                                  {link.retailer}
                                </p>
                                <p className="mt-0.5 text-2xs uppercase tracking-wider text-ink-muted">
                                  {PLATFORM_MAP[link.platform]?.name ?? link.platform} · {link.label}
                                </p>
                              </div>
                              <ExternalLink className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-accent" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                ]}
              />
            </div>
          </div>

          {/* --------------------------------------------------------- aside */}
          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <Panel className="p-5">
              <PriceTag
                price={game.price}
                discount={game.discount}
                isFree={game.isFree}
                isComingSoon={game.isComingSoon}
                size="lg"
              />
              <div className="mt-3 flex flex-wrap gap-3">
                {game.isComingSoon ? (
                  <Countdown to={game.releaseDate} label="Launching in" />
                ) : game.discount > 0 ? (
                  <Countdown to="2026-12-31T23:59:59Z" label="Deal ends in" />
                ) : (
                  <p className="text-2xs uppercase tracking-wider text-ink-muted">
                    {price === 0 ? "Free forever" : `Lifetime price · $${price.toFixed(2)}`}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <AddToCartButton game={cartGame(game)} className="w-full" />
              </div>
              <div className="mt-2 flex gap-2">
                <WishlistButton game={wishlistGame(game)} variant="wide" className="flex-1" />
                <CompareButton game={wishlistGame(game)} />
              </div>

              <p className="mt-4 border-t border-line pt-3 text-2xs leading-relaxed text-ink-muted">
                Price, discount and availability are re-validated on the server when the item is added to the cart.
              </p>
            </Panel>

            <Panel title="Details" className="p-5">
              <MetaRow label="INFINITY score" value={game.rating.toFixed(1)} />
              <MetaRow label="Reviews" value={game.reviewCount.toLocaleString()} />
              <MetaRow label="Released" value={game.releaseDate} />
              <MetaRow label="Install size" value={game.fileSize} />
              <MetaRow label="Age rating" value={game.ageRating} />
              <MetaRow label="Languages" value={`${game.languages.length} supported`} />
              <MetaRow label="Modes" value={game.gameModes.length} />
              <MetaRow label="Wishlisted" value={game.wishlistCount.toLocaleString()} />
            </Panel>

            <Panel title="More from this studio" className="p-5">
              <Link
                href={`/studios/${slugify(game.developer)}`}
                className="font-display text-sm font-bold uppercase tracking-wide text-white hover:text-accent"
              >
                {game.developer}
              </Link>
              <p className="mt-1 text-xs text-ink-muted">Publisher: {game.publisher}</p>
              <Link
                href={`/studios/${slugify(game.developer)}`}
                className="mt-4 inline-flex border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:border-accent hover:text-white"
              >
                Studio catalogue
              </Link>
            </Panel>
          </aside>
        </div>

        <div className="mt-16 space-y-16">
          <GameRow
            eyebrow="Players also exploring"
            title="Similar games"
            games={similar}
            href={`/categories/${game.genre[0]}`}
            linkLabel={genres[0] ? `More ${genres[0]}` : "Browse all"}
          />
          <RecentlyViewedRail
            titles={Object.fromEntries(similar.map((g) => [g.slug, g.title]))}
            exclude={game.slug}
          />
        </div>
      </div>
    </>
  );
}

