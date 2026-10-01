import Link from "next/link";
import { ArrowRight, Gamepad2, Images, Languages, Layers, MonitorPlay, Trophy, Users } from "lucide-react";
import { ArtImage } from "@/components/art/ArtImage";
import { GameArt } from "@/components/art/GameArt";
import { TrailerButton } from "@/components/home/TrailerModal";
import { Badge, PlatformPills, PriceTag, SectionHeading } from "@/components/ui/primitives";
import { computeStats } from "@/lib/catalogue";
import { topRated } from "@/lib/catalogue/query";
import { FEATURED_ARTICLE, NEWS_CATEGORY_MAP, trendingArticles } from "@/data/news";
import { TEAM_BY_ID, nextEvent } from "@/data/esports";
import { COMMUNITY_BOARDS, COMMUNITY_GROUPS, COMMUNITY_POSTS } from "@/data/community";
import { compactNumber, formatDate, timeAgo } from "@/lib/generate";
import { genreName } from "@/data/taxonomy";
import type { CommunityPost, NewsArticle } from "@/lib/types";

/* ===========================================================================
 * Homepage bands
 * ---------------------------------------------------------------------------
 * The stats strip, the AAA spotlight and the three editorial bands (news,
 * esports, community). Everything reads from the static catalogue and the
 * authored data modules at render time — no client JS beyond the trailer
 * modal the spotlight borrows from the hero.
 * ======================================================================== */

/** Slim full-width numbers strip: live catalogue counts with icon accents. */
export function StatsBar() {
  const stats = computeStats();
  const cells = [
    { icon: Gamepad2, value: stats.games.toLocaleString(), label: "Games" },
    { icon: Layers, value: stats.genreLanes.toLocaleString(), label: "Genre lanes" },
    { icon: MonitorPlay, value: String(stats.platforms), label: "Platforms" },
    { icon: Images, value: compactNumber(stats.mediaItems), label: "Media items" },
    { icon: Users, value: stats.developers.toLocaleString(), label: "Studios" },
    { icon: Languages, value: String(stats.languages), label: "Languages" },
  ];

  return (
    <section aria-label="Catalogue scale" className="overflow-hidden border border-line bg-line">
      <div className="grid grid-cols-2 gap-px sm:grid-cols-4 lg:grid-cols-6">
        {cells.map((cell) => (
          <div key={cell.label} className="flex items-center gap-3 bg-bg-nav px-4 py-4 lg:px-5">
            <cell.icon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-display text-2xl font-extrabold leading-none tabular-nums text-white lg:text-[1.7rem]">
                {cell.value}
              </p>
              <p className="mt-1.5 truncate text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                {cell.label}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* the decorative accent rule the stats band asks for */}
      <div className="h-px bg-gradient-to-r from-accent via-accent/40 to-transparent" />
    </section>
  );
}

/** AAA spotlight: full-width key-art banner with the view/trailer action pair. */
export function SpotlightBanner() {
  const game = topRated(1)[0];
  if (!game) return null;

  return (
    <section aria-label="AAA spotlight" className="relative isolate overflow-hidden border border-accent/50 bg-bg-deep">
      <div className="absolute inset-0 -z-10">
        <ArtImage game={game} variant="wide" showTitle={false} eager className="h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-bg-deep/90 to-bg-deep/30 lg:via-bg-deep/75 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/85 via-transparent to-transparent" />
      </div>
      <div className="aura-accent pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:p-12">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 border border-accent/60 bg-accent/15 px-2.5 py-1 font-display text-2xs font-bold uppercase tracking-[0.18em] text-white">
            <Trophy className="h-3.5 w-3.5 text-accent" />
            AAA spotlight
          </span>
          <h2 className="h-display mt-4 text-3xl sm:text-4xl xl:text-5xl">{game.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-display text-2xs font-bold uppercase tracking-[0.16em]">
            <span className="text-accent">{game.genre.slice(0, 3).map(genreName).join(" | ")}</span>
            <span className="text-ink-muted">{game.developer}</span>
            <span className="text-ink-muted">{game.releaseDate}</span>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-secondary">{game.shortDescription}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/games/${game.slug}`}
              className="rounded-control inline-flex items-center gap-2 bg-accent px-6 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
            >
              View game
              <ArrowRight className="h-4 w-4" />
            </Link>
            {game.videos.length ? (
              <TrailerButton
                game={game}
                videos={game.videos}
                className="inline-flex items-center gap-2 border border-line bg-bg-deep/50 px-6 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur transition hover:border-accent hover:text-accent"
              />
            ) : null}
            <div className="border-l border-line pl-4">
              <PriceTag
                price={game.price}
                discount={game.discount}
                isFree={game.isFree}
                isComingSoon={game.isComingSoon}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* score panel: what the desk rates and what buyers actually wrote */}
        <div className="hidden border border-line bg-bg-deep/75 p-5 backdrop-blur lg:block">
          <p className="eyebrow mb-2">INFINITY score</p>
          <p className="font-display text-5xl font-extrabold leading-none text-white">
            {game.rating.toFixed(1)}
            <span className="text-xl text-ink-muted"> / 10</span>
          </p>
          <p className="mt-2 text-2xs uppercase tracking-wider text-ink-muted">{compactNumber(game.reviewCount)} reviews</p>
          <dl className="mt-5 space-y-3 border-t border-line pt-4 text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-2xs uppercase tracking-wider text-ink-muted">Publisher</dt>
              <dd className="truncate font-medium text-white">{game.publisher}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-2xs uppercase tracking-wider text-ink-muted">Modes</dt>
              <dd className="truncate font-medium text-white">{game.gameModes.join(", ")}</dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-line pt-4">
            <PlatformPills platforms={game.platforms} max={6} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- news band */

function articleArt(article: NewsArticle, className: string) {
  return (
    <GameArt
      game={{
        slug: `news-${article.slug}`,
        title: article.title,
        genre: [],
        accentHue: article.heroSeed % 360,
        rating: 0,
      }}
      variant="wide"
      showTitle={false}
      className={className}
      ariaLabel={`${article.title} cover art`}
    />
  );
}

/** Lead story + a compact rail of the four next-most-read pieces. */
export function NewsBand() {
  const featured = FEATURED_ARTICLE;
  const rest = trendingArticles(5).filter((a) => a.slug !== featured.slug).slice(0, 4);

  return (
    <section>
      <SectionHeading
        eyebrow="From the newsroom"
        title="News, patches and industry moves"
        description="Releases, patch notes, hardware and culture — filed by the INFINITY desk."
        href="/news"
        linkLabel="All news"
      />
      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <article className="group overflow-hidden border border-line bg-bg-card/60 transition hover:border-accent/70">
          <Link href={`/news/${featured.slug}`} className="relative block aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
            {articleArt(featured, "h-full w-full transition duration-500 group-hover:scale-[1.03]")}
            <span className="absolute left-3 top-3 border border-line bg-bg-deep/85 px-2 py-1 font-display text-2xs font-bold uppercase tracking-wider text-white backdrop-blur">
              {NEWS_CATEGORY_MAP[featured.category]?.name ?? featured.category}
            </span>
          </Link>
          <div className="p-5">
            <h3 className="font-display text-lg font-bold uppercase leading-snug tracking-wide text-white">
              <Link href={`/news/${featured.slug}`} className="transition hover:text-accent">
                {featured.title}
              </Link>
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-secondary">{featured.excerpt}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-3 text-2xs text-ink-muted">
              <span className="font-display font-bold uppercase tracking-wider text-white">{featured.author}</span>
              <span>
                {formatDate(featured.publishedAt)} · {featured.readingTime} min · {compactNumber(featured.views)} views
              </span>
            </div>
          </div>
        </article>

        <div className="grid content-start gap-3">
          {rest.map((article) => (
            <article
              key={article.slug}
              className="group flex gap-3 border border-line bg-bg-card/50 p-3 transition hover:border-accent/70"
            >
              <Link
                href={`/news/${article.slug}`}
                className="relative block h-20 w-28 shrink-0 overflow-hidden sm:h-24 sm:w-36"
              >
                {articleArt(article, "h-full w-full transition duration-500 group-hover:scale-105")}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-2xs uppercase tracking-wider text-accent">
                  {NEWS_CATEGORY_MAP[article.category]?.name ?? article.category}
                </p>
                <h3 className="mt-1 font-display text-sm font-bold uppercase leading-snug tracking-wide text-white">
                  <Link href={`/news/${article.slug}`} className="transition hover:text-accent">
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-1.5 text-2xs text-ink-muted">
                  {formatDate(article.publishedAt)} · {article.readingTime} min read
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- esports band */

/** Event headline card + the live/upcoming match centre beside it. */
export function EsportsBand() {
  const event = nextEvent();
  const rows = event.matches.filter((m) => m.status !== "completed").slice(0, 5);
  const matches = rows.length ? rows : event.matches.slice(0, 5);
  const liveCount = event.matches.filter((m) => m.status === "live").length;

  return (
    <section>
      <SectionHeading
        eyebrow="Esports"
        title="Circuits and match days"
        description="Fixtures, prize pools and stage results across the competitive circuit."
        href="/esports"
        linkLabel="Esports hub"
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        {/* event card */}
        <article className="relative overflow-hidden border border-line bg-bg-nav p-5 lg:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={liveCount ? "live" : "accent"}>
              {liveCount ? `${liveCount} live now` : "Upcoming"}
            </Badge>
            <Badge tone="neutral">{event.region}</Badge>
            <Badge tone="outline">Tier {event.tier}</Badge>
          </div>
          <h3 className="mt-3 font-display text-xl font-extrabold uppercase leading-tight tracking-tight text-white">
            {event.name}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{event.headline}</p>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
            <div>
              <dt className="text-2xs uppercase tracking-wider text-ink-muted">Prize pool</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-display text-lg font-extrabold tabular-nums text-white">
                <Trophy className="h-4 w-4 text-accent" />
                ${(event.prizePool / 1000).toLocaleString()}K
              </dd>
            </div>
            <div>
              <dt className="text-2xs uppercase tracking-wider text-ink-muted">Teams</dt>
              <dd className="mt-1 font-display text-lg font-extrabold tabular-nums text-white">{event.teamIds.length}</dd>
            </div>
            <div>
              <dt className="text-2xs uppercase tracking-wider text-ink-muted">Venue</dt>
              <dd className="mt-1 truncate text-sm font-medium text-white">{event.venue}</dd>
              <dd className="text-2xs text-ink-muted">{event.location}</dd>
            </div>
            <div>
              <dt className="text-2xs uppercase tracking-wider text-ink-muted">Window</dt>
              <dd className="mt-1 text-sm font-medium text-white">{formatDate(event.startsAt)}</dd>
              <dd className="text-2xs text-ink-muted">to {formatDate(event.endsAt)}</dd>
            </div>
          </dl>

          <Link
            href="/esports"
            className="mt-5 inline-flex items-center gap-2 border border-line px-4 py-2.5 font-display text-2xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent hover:text-accent"
          >
            View event
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </article>

        {/* match centre */}
        <div className="border border-line bg-bg-card/50">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Match centre</p>
            <p className="text-2xs uppercase tracking-wider text-ink-muted">{event.format}</p>
          </div>
          <ul className="divide-y divide-line">
            {matches.map((match) => {
              const teamA = TEAM_BY_ID.get(match.teamA);
              const teamB = TEAM_BY_ID.get(match.teamB);
              return (
                <li key={match.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {teamA?.name ?? match.teamA}
                      <span className="px-2 font-display text-2xs uppercase tracking-widest text-ink-muted">vs</span>
                      {teamB?.name ?? match.teamB}
                    </p>
                    <p className="mt-0.5 text-2xs uppercase tracking-wider text-ink-muted">
                      {match.stage} · {match.format}
                    </p>
                  </div>
                  {match.status === "live" ? (
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge tone="live">Live</Badge>
                      <span className="font-display text-sm font-bold tabular-nums text-white">
                        {match.scoreA}–{match.scoreB}
                      </span>
                    </span>
                  ) : match.status === "completed" ? (
                    <span className="shrink-0 font-display text-sm font-bold tabular-nums text-ink-secondary">
                      {match.scoreA}–{match.scoreB}
                    </span>
                  ) : (
                    <span className="shrink-0 text-2xs uppercase tracking-wider text-ink-muted">
                      {formatDate(match.startsAt)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- community band */

function Avatar({ name, hue }: { name: string; hue: number }) {
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center border font-display text-2xs font-extrabold uppercase"
      style={{
        borderColor: `hsl(${hue} 70% 45%)`,
        color: `hsl(${hue} 85% 70%)`,
        background: `hsl(${hue} 55% 14%)`,
      }}
      aria-hidden="true"
    >
      {name.slice(0, 2)}
    </span>
  );
}

const BOARD_LABEL: Record<string, string> = Object.fromEntries(
  COMMUNITY_BOARDS.map((board) => [board.id, board.label]),
);

/** Top-voted threads beside the busiest clubs on the hub. */
export function CommunityBand() {
  const posts = [...COMMUNITY_POSTS]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.upvotes - a.upvotes)
    .slice(0, 4);
  const groups = [...COMMUNITY_GROUPS].sort((a, b) => b.members - a.members).slice(0, 4);

  return (
    <section>
      <SectionHeading
        eyebrow="Community"
        title="Clubs, guides and screenshot threads"
        description="Moderated boards and player-run clubs, ranked by this week's activity."
        href="/community"
        linkLabel="Open the hub"
      />
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="grid content-start gap-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex gap-3 border border-line bg-bg-card/50 p-4 transition hover:border-accent/70"
            >
              <Avatar name={post.author} hue={post.authorHue} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-2xs uppercase tracking-wider text-ink-muted">
                  <span className="font-display font-bold text-white">{post.author}</span>
                  <span className="border border-line px-1.5 py-[1px]">{BOARD_LABEL[post.board] ?? post.board}</span>
                  {post.pinned ? (
                    <span className="border border-accent/60 bg-accent/15 px-1.5 py-[1px] text-white">Pinned</span>
                  ) : null}
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
                <h3 className="mt-2 font-display text-sm font-bold uppercase leading-snug tracking-wide text-white">
                  {post.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-secondary">{post.body}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-2xs text-ink-muted">
                  <span>{post.upvotes} upvotes</span>
                  <span>{post.replies} replies</span>
                  {post.gameSlug ? (
                    <Link
                      href={`/games/${post.gameSlug}`}
                      className="border border-line bg-bg-deep/60 px-2 py-1 uppercase tracking-wider text-ink-secondary transition hover:border-accent hover:text-white"
                    >
                      {post.gameSlug.replace(/-/g, " ")}
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="grid content-start gap-3 sm:grid-cols-2">
          {groups.map((group) => (
            <Link
              key={group.slug}
              href="/community"
              className="group flex flex-col border border-line bg-bg-card/50 p-4 transition hover:border-accent/70"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-sm font-bold uppercase tracking-wide text-white group-hover:text-accent">
                  {group.name}
                </p>
                <Badge tone="neutral">{group.kind}</Badge>
              </div>
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink-secondary">{group.blurb}</p>
              <p className="mt-3 border-t border-line-soft pt-3 text-2xs uppercase tracking-wider text-ink-muted">
                {compactNumber(group.members)} members · {group.posts} posts
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
