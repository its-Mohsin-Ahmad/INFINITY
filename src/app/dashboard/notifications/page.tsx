/* ===========================================================================
 * /dashboard/notifications — the bell target.
 * ---------------------------------------------------------------------------
 * The bell in the header points here, so the page has to exist and be worth
 * opening. It builds a feed from the real news index plus the player's own
 * wishlist price moves, and remembers which items have been read on-device.
 * ======================================================================== */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Heart, Tag } from "lucide-react";
import { usePlayer } from "@/lib/store/player-store";
import { NEWS_ARTICLES } from "@/data/news";
import { getGames } from "@/lib/catalogue";
import { discountedPrice, formatPrice } from "@/lib/generate";
import { EmptyState } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/page-hero";

type FeedItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  icon: typeof Bell;
};

export default function NotificationsPage() {
  const notificationsRead = usePlayer((s) => s.notificationsRead);
  const markAllNotificationsRead = usePlayer((s) => s.markAllNotificationsRead);
  const wishlist = usePlayer((s) => s.wishlist);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const feed: FeedItem[] = useMemo(() => {
    // Wishlist price moves first — they are the most actionable thing a player
    // can receive, and they only exist because of their own saved titles.
    const drops = (mounted ? getGames(wishlist) : [])
      .filter((g) => g.discount > 0 && !g.isComingSoon)
      .slice(0, 6)
      .map<FeedItem>((g) => ({
        id: `deal-${g.slug}`,
        title: `${g.title} is ${g.discount}% off`,
        body: `Now ${formatPrice(discountedPrice(g.price, g.discount))} on ${g.platforms[0] ?? "PC"}. It is in your wishlist.`,
        href: `/games/${g.slug}`,
        icon: Tag,
      }));

    const news = NEWS_ARTICLES.slice(0, 8).map<FeedItem>((a) => ({
      id: a.id,
      title: a.title,
      body: a.excerpt,
      href: `/news/${a.slug}`,
      icon: Bell,
    }));

    return [...drops, ...news];
  }, [mounted, wishlist]);

  const unread = mounted ? feed.filter((f) => !notificationsRead.includes(f.id)).length : 0;

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="Notifications"
        description="Price drops on your wishlist first, then the latest from the INFINITY news desk. Read state is remembered on this device."
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-display text-2xs font-bold uppercase tracking-[0.16em] text-ink-secondary">
            {unread ? `${unread} unread` : "All caught up"}
          </p>
          {unread ? (
            <button
              type="button"
              onClick={() => markAllNotificationsRead(feed.map((f) => f.id))}
              className="flex min-h-[44px] items-center gap-2 border border-line px-4 font-display text-2xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-accent hover:text-accent"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          ) : null}
          <Link
            href="/dashboard/wishlist"
            className="flex min-h-[44px] items-center gap-2 px-2 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-secondary transition hover:text-accent"
          >
            <Heart className="h-4 w-4" />
            Wishlist
          </Link>
        </div>
      </PageHero>

      <div className="shell py-10">
        {!mounted || !feed.length ? (
          <EmptyState
            title="Nothing new"
            body="Notifications appear here as stories publish and as titles in your wishlist drop in price."
            ctaHref="/news"
            ctaLabel="Read the news"
          />
        ) : (
          <ul className="divide-y divide-line border border-line">
            {feed.map((item) => {
              const isUnread = !notificationsRead.includes(item.id);
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex min-h-[64px] items-start gap-4 px-4 py-4 transition hover:bg-bg-card/60 sm:px-5"
                  >
                    <span
                      className={
                        "mt-0.5 grid h-10 w-10 shrink-0 place-items-center border " +
                        (isUnread ? "border-accent text-accent" : "border-line text-ink-muted")
                      }
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={
                          "block font-display text-xs font-bold uppercase leading-relaxed tracking-[0.08em] sm:text-sm " +
                          (isUnread ? "text-white" : "text-ink-secondary")
                        }
                      >
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-ink-secondary">
                        {item.body}
                      </span>
                    </span>
                    {isUnread ? (
                      <span aria-label="Unread" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-2xs text-ink-muted">
          Feed built from the catalogue snapshot this build shipped with, plus the latest eight
          stories from the news desk.
        </p>
      </div>
    </>
  );
}