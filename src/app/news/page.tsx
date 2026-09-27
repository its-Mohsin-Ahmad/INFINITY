import type { Metadata } from "next";
import Link from "next/link";
import {
  FEATURED_ARTICLE,
  NEWS_ARTICLES,
  NEWS_CATEGORIES,
  NEWS_CATEGORY_MAP,
  articlesInCategory,
  trendingArticles,
} from "@/data/news";
import { GameArt } from "@/components/art/GameArt";
import { BrowseTabs } from "@/components/browse/browse-tabs";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading, Stat } from "@/components/ui/primitives";
import { compactNumber, formatDate, timeAgo } from "@/lib/generate";
import type { NewsArticle } from "@/lib/types";

/* ===========================================================================
 * /news — the newsroom index.
 * Featured story, trending rail and per-category tabs (deep-link aware via
 * ?category=). All content is prerendered; no client-side filtering.
 * ======================================================================== */

export const metadata: Metadata = {
  title: "News",
  description:
    "The INFINITY newsroom: releases, patch notes, esports results, industry analysis, hardware and culture — plus verified deal coverage.",
};

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

function ArticleCard({ article }: { article: NewsArticle }) {
  const category = NEWS_CATEGORY_MAP[article.category]?.name ?? article.category;
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-line bg-bg-card/60 transition hover:border-accent/70">
      <Link href={`/news/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden">
        {articleArt(article, "h-full w-full transition duration-500 group-hover:scale-[1.04]")}
        <span className="absolute left-3 top-3 border border-line bg-bg-deep/85 px-2 py-1 font-display text-2xs font-bold uppercase tracking-wider text-white backdrop-blur">
          {category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-sm font-bold uppercase leading-snug tracking-wide text-white">
          <Link href={`/news/${article.slug}`} className="transition hover:text-accent">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-secondary">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-soft pt-3 text-2xs text-ink-muted">
          <span>{formatDate(article.publishedAt)}</span>
          <span>
            {article.readingTime} min · {compactNumber(article.views)} views
          </span>
        </div>
      </div>
    </article>
  );
}
export default function NewsPage() {
  const featured = FEATURED_ARTICLE;
  const trending = trendingArticles(4);
  const totalViews = NEWS_ARTICLES.reduce((sum, a) => sum + a.views, 0);

  const tabs = NEWS_CATEGORIES.map((cat) => {
    const items = articlesInCategory(cat.slug);
    return {
      id: cat.slug,
      label: cat.name,
      badge: String(items.length),
      content: items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-secondary">No stories in this section yet — the desk publishes daily.</p>
      ),
    };
  });

  return (
    <>
      <PageHero
        eyebrow="Newsroom"
        title={
          <>
            Fresh off
            <br />
            the wire
          </>
        }
        description="Releases, patch notes, circuit results, industry moves and hardware — written by the INFINITY desk, indexed by section."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(NEWS_ARTICLES.length)} label="Stories" />
          <Stat value={String(NEWS_CATEGORIES.length)} label="Sections" />
          <Stat value={String(trending.length)} label="Trending now" />
          <Stat value={compactNumber(totalViews)} label="Total views" tone="accent" />
        </div>
      </PageHero>

      <div className="shell space-y-12 py-10">
        {/* ------------------------------------------------------ featured */}
        <article className="overflow-hidden border border-line bg-bg-card/60">
          <Link href={`/news/${featured.slug}`} className="group block">
            <div className="relative aspect-[21/9] overflow-hidden">
              {articleArt(featured, "h-full w-full transition duration-500 group-hover:scale-[1.03]")}
              <span className="absolute left-4 top-4 border border-line bg-bg-deep/85 px-2.5 py-1 font-display text-2xs font-bold uppercase tracking-wider text-white backdrop-blur">
                {NEWS_CATEGORY_MAP[featured.category]?.name ?? featured.category}
              </span>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
              <div>
                <p className="eyebrow mb-2">Featured</p>
                <h2 className="h-display text-2xl leading-tight transition group-hover:text-accent sm:text-3xl">
                  {featured.title}
                </h2>
              </div>
              <div>
                <p className="text-sm leading-relaxed text-ink-secondary">{featured.excerpt}</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-2xs uppercase tracking-wider text-ink-muted">
                  <span>
                    {formatDate(featured.publishedAt)} · {featured.readingTime} min ·{" "}
                    {compactNumber(featured.views)} views
                  </span>
                  <span className="font-display font-bold text-white transition group-hover:text-accent">
                    Read the story →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </article>

        {/* ------------------------------------------------------ trending */}
        <section>
          <SectionHeading eyebrow="Trending" title="Most read right now" />
          <ol className="border border-line">
            {trending.map((a, i) => (
              <li key={a.slug}>
                <Link
                  href={`/news/${a.slug}`}
                  className="flex items-center gap-4 border-b border-line-soft px-4 py-3 transition last:border-b-0 hover:bg-bg-card/60"
                >
                  <span className="font-display text-lg font-extrabold tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-bold uppercase tracking-wide text-white transition group-hover:text-accent">
                      {a.title}
                    </span>
                    <span className="block text-2xs text-ink-muted">
                      {NEWS_CATEGORY_MAP[a.category]?.name ?? a.category} · {timeAgo(a.publishedAt)} ·{" "}
                      {compactNumber(a.views)} views
                    </span>
                  </span>
                  <span className="hidden text-2xs uppercase tracking-wider text-ink-muted sm:block">
                    {a.readingTime} min
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* ----------------------------------------------------- sections */}
        <section>
          <BrowseTabs tabs={tabs} />
        </section>
      </div>
    </>
  );
}

