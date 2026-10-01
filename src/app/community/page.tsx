import type { Metadata } from "next";
import Link from "next/link";
import {
  COMMUNITY_BOARDS,
  COMMUNITY_GROUPS,
  COMMUNITY_POSTS,
  GROUP_BY_SLUG,
} from "@/data/community";
import { BrowseTabs } from "@/components/browse/browse-tabs";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading, Stat } from "@/components/ui/primitives";
import { compactNumber, timeAgo } from "@/lib/generate";
import type { CommunityGroup, CommunityPost } from "@/lib/types";

/* ===========================================================================
 * /community — boards, groups and the platform pulse.
 * Board tabs are prerendered (deep-link aware via ?board=); post cards carry
 * no dead links — only real routes (games) are clickable.
 * ======================================================================== */

export const metadata: Metadata = {
  title: "Community",
  description:
    "Discussion, guides, clips, screenshots and looking-for-player boards, plus every club, guild and study group on INFINITY.",
};

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

const BOARD_LABEL: Record<string, string> = Object.fromEntries(COMMUNITY_BOARDS.map((b) => [b.id, b.label]));

function PostCard({ post }: { post: CommunityPost }) {
  const group = post.groupSlug ? GROUP_BY_SLUG.get(post.groupSlug) : null;
  return (
    <article className="flex gap-4 border border-line bg-bg-card/50 p-4 transition hover:border-accent/70">
      <Avatar name={post.author} hue={post.authorHue} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-2xs uppercase tracking-wider text-ink-muted">
          <span className="font-display font-bold text-white">{post.author}</span>
          <span className="border border-line px-1.5 py-[1px]">{BOARD_LABEL[post.board] ?? post.board}</span>
          {post.pinned ? <span className="border border-accent/60 bg-accent/15 px-1.5 py-[1px] text-white">Pinned</span> : null}
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        <h3 className="mt-2 font-display text-sm font-bold uppercase leading-snug tracking-wide text-white">
          {post.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-secondary">{post.body}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {post.gameSlug ? (
            <Link
              href={`/games/${post.gameSlug}`}
              className="border border-line bg-bg-deep/60 px-2 py-1 text-2xs uppercase tracking-wider text-ink-secondary transition hover:border-accent hover:text-white"
            >
              {post.gameSlug.replace(/-/g, " ")}
            </Link>
          ) : null}
          {group ? (
            <span className="border border-line bg-bg-muted/60 px-2 py-1 text-2xs uppercase tracking-wider text-ink-muted">
              {group.name}
            </span>
          ) : null}
          {post.tags.map((tag) => (
            <span key={tag} className="text-2xs lowercase tracking-wide text-ink-muted">
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-4 border-t border-line-soft pt-2.5 text-2xs text-ink-muted">
          <span className="font-display font-bold text-white">▲ {compactNumber(post.upvotes)}</span>
          <span>{compactNumber(post.replies)} replies</span>
        </div>
      </div>
    </article>
  );
}
function GroupCard({ group }: { group: CommunityGroup }) {
  const hue = group.seed % 360;
  const kindLabel = { club: "Club", group: "Group", guild: "Guild", study: "Study" }[group.kind];
  return (
    <div className="flex h-full flex-col border border-line bg-bg-card/50 p-4 transition hover:border-accent">
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center border font-display text-xs font-extrabold uppercase"
          style={{
            borderColor: `hsl(${hue} 70% 45%)`,
            color: `hsl(${hue} 85% 70%)`,
            background: `hsl(${hue} 55% 14%)`,
          }}
          aria-hidden="true"
        >
          {group.name.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-xs font-bold uppercase tracking-wide text-white">{group.name}</p>
          <p className="text-2xs uppercase tracking-wider text-ink-muted">
            {kindLabel} · {compactNumber(group.members)} members
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-secondary">{group.blurb}</p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-soft pt-3 text-2xs">
        <span className="text-ink-muted">{compactNumber(group.posts)} posts</span>
        {group.gameSlug ? (
          <Link
            href={`/games/${group.gameSlug}`}
            className="border border-line px-2 py-1 uppercase tracking-wider text-ink-secondary transition hover:border-accent hover:text-white"
          >
            Game page →
          </Link>
        ) : (
          <span className="uppercase tracking-wider text-ink-muted">Open group</span>
        )}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const memberTotal = COMMUNITY_GROUPS.reduce((sum, g) => sum + g.members, 0);
  const groupPostTotal = COMMUNITY_GROUPS.reduce((sum, g) => sum + g.posts, 0);

  const tabs = COMMUNITY_BOARDS.map((board) => {
    const items = COMMUNITY_POSTS.filter((p) => p.board === board.id);
    return {
      id: board.id,
      label: board.label,
      badge: String(items.length),
      content: items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-secondary">Nothing on this board yet — start the first thread.</p>
      ),
    };
  });

  return (
    <>
      <PageHero
        eyebrow="Community"
        title={
          <>
            Find your
            <br />
            people
          </>
        }
        description="Boards for every play style and clubs for every game — discussion, guides, clips, screenshots and squads looking for players."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(COMMUNITY_GROUPS.length)} label="Groups" />
          <Stat value={compactNumber(memberTotal)} label="Members" />
          <Stat value={compactNumber(groupPostTotal)} label="Posts" />
          <Stat value={String(COMMUNITY_BOARDS.length)} label="Boards" tone="accent" />
        </div>
      </PageHero>

      <div className="shell space-y-12 py-10">
        <section>
          <SectionHeading
            eyebrow="Boards"
            title="What the community is saying"
            description="Pinned notices first, then the newest threads on each board."
          />
          <BrowseTabs tabs={tabs} />
        </section>

        <section>
          <SectionHeading
            eyebrow="Clubs & guilds"
            title="Groups to join"
            description="Ten of the most active clubs, guilds and study groups — every one links through to the game it plays."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {COMMUNITY_GROUPS.map((g) => (
              <GroupCard key={g.slug} group={g} />
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-3 border-t border-line pt-8">
          <Link
            href="/games"
            className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
          >
            Find a game to follow
          </Link>
          <Link
            href="/esports"
            className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
          >
            Esports hub
          </Link>
          <Link
            href="/news"
            className="rounded-control bg-accent px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
          >
            Read the news
          </Link>
        </section>
      </div>
    </>
  );
}

