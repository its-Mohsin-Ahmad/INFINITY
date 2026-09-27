import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NEWS_ARTICLES, NEWS_BY_SLUG, NEWS_CATEGORY_MAP, relatedArticles } from "@/data/news";
import { getGames } from "@/lib/catalogue";
import { GameArt } from "@/components/art/GameArt";
import { GameMiniTile } from "@/components/game/GameCard";
import { PageHero } from "@/components/ui/page-hero";
import { Breadcrumbs, MetaRow, Panel, SectionHeading } from "@/components/ui/primitives";
import { compactNumber, formatDate } from "@/lib/generate";
import type { NewsArticle } from "@/lib/types";

/* ===========================================================================
 * /news/[slug] — one article.
 * Bodies are authored arrays, so the whole newsroom prerenders statically.
 * ======================================================================== */

export function generateStaticParams() {
  return NEWS_ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = NEWS_BY_SLUG.get(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: "article" },
  };
}

function neighbours(article: NewsArticle) {
  const index = NEWS_ARTICLES.findIndex((a) => a.slug === article.slug);
  return {
    prev: index > 0 ? NEWS_ARTICLES[index - 1] : null,
    next: index < NEWS_ARTICLES.length - 1 ? NEWS_ARTICLES[index + 1] : null,
  };
}
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = NEWS_BY_SLUG.get(slug);
  if (!article) notFound();

  const category = NEWS_CATEGORY_MAP[article.category];
  const relatedGames = getGames(article.relatedGames);
  const more = relatedArticles(article, 3);
  const { prev, next } = neighbours(article);

  return (
    <>
      <PageHero
        eyebrow={category?.name ?? "News"}
        title={article.title}
        description={article.excerpt}
        tone="accent"
      >
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            ...(category ? [{ label: category.name, href: `/news?category=${category.slug}` }] : []),
            { label: `${article.readingTime} min read` },
          ]}
        />
        <p className="mt-5 text-2xs uppercase tracking-wider text-ink-muted">
          By {article.author} · {article.authorRole} · {formatDate(article.publishedAt)} ·{" "}
          {compactNumber(article.views)} views
        </p>
      </PageHero>

      <div className="shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          <div className="relative overflow-hidden border border-line">
            <GameArt
              key={article.slug}
              game={{
                slug: `news-${article.slug}`,
                title: article.title,
                genre: [],
                accentHue: article.heroSeed % 360,
                rating: 0,
              }}
              variant="wide"
              className="aspect-[21/9] w-full"
              ariaLabel={`${article.title} artwork`}
            />
          </div>

          <div className="mt-7 space-y-5">
            {article.body.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-ink-secondary sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="border border-line bg-bg-muted/60 px-2 py-1 text-2xs uppercase tracking-[0.1em] text-ink-secondary"
              >
                {tag}
              </span>
            ))}
          </div>

          {relatedGames.length ? (
            <section className="mt-10">
              <SectionHeading
                eyebrow="Referenced"
                title="Games mentioned in this story"
                href="/games"
                linkLabel="All games"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedGames.map((game) => (
                  <GameMiniTile key={game.slug} game={game} />
                ))}
              </div>
            </section>
          ) : null}

          {(prev || next) && (
            <nav className="mt-10 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
              {prev ? (
                <Link href={`/news/${prev.slug}`} className="group border border-line bg-bg-card/40 p-4 transition hover:border-accent">
                  <p className="text-2xs uppercase tracking-wider text-ink-muted">← Previous story</p>
                  <p className="mt-1 line-clamp-2 font-display text-xs font-bold uppercase tracking-wide text-white group-hover:text-accent">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/news/${next.slug}`} className="group border border-line bg-bg-card/40 p-4 text-right transition hover:border-accent">
                  <p className="text-2xs uppercase tracking-wider text-ink-muted">Next story →</p>
                  <p className="mt-1 line-clamp-2 font-display text-xs font-bold uppercase tracking-wide text-white group-hover:text-accent">
                    {next.title}
                  </p>
                </Link>
              ) : null}
            </nav>
          )}
        </article>

        <aside className="space-y-5">
          <Panel title="Story details">
            <MetaRow label="Section" value={category?.name ?? article.category} />
            <MetaRow label="Published" value={formatDate(article.publishedAt)} />
            <MetaRow label="Reading time" value={`${article.readingTime} minutes`} />
            <MetaRow label="Author" value={`${article.author}`} />
            <MetaRow label="Views" value={compactNumber(article.views)} />
          </Panel>

          {more.length ? (
            <div className="border border-line bg-bg-card/50 p-4">
              <p className="mb-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
                More from the desk
              </p>
              <ul className="space-y-3">
                {more.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/news/${a.slug}`} className="group block">
                      <p className="line-clamp-2 text-xs font-semibold text-white transition group-hover:text-accent">
                        {a.title}
                      </p>
                      <p className="mt-0.5 text-2xs text-ink-muted">
                        {formatDate(a.publishedAt)} · {a.readingTime} min
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link
            href="/news"
            className="block border border-line px-4 py-2.5 text-center font-display text-2xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
          >
            All news
          </Link>
        </aside>
      </div>
    </>
  );
}

