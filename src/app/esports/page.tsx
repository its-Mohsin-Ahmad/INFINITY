import type { Metadata } from "next";
import Link from "next/link";
import {
  ESPORTS_EVENTS,
  ESPORTS_TEAMS,
  FEATURED_EVENT,
  TEAM_BY_ID,
  standingsFor,
} from "@/data/esports";
import { getGame } from "@/lib/catalogue";
import { GameArt } from "@/components/art/GameArt";
import { BrowseTabs } from "@/components/browse/browse-tabs";
import { PageHero } from "@/components/ui/page-hero";
import { Countdown } from "@/components/ui/interactive";
import { Badge, SectionHeading, Stat } from "@/components/ui/primitives";
import { compactNumber, formatDate } from "@/lib/generate";
import type { EsportsEvent, EsportsMatch, EsportsTeam } from "@/lib/types";

/* ===========================================================================
 * /esports — the competitive hub.
 * Schedule, standings and brackets derive from the event records; everything
 * prerenders as static HTML (no live API required).
 * ======================================================================== */

export const metadata: Metadata = {
  title: "Esports",
  description:
    "The INFINITY Circuit: schedules, live scores, standings, brackets and teams across four events and $1.95M in prizes.",
};

/* ------------------------------------------------------------ team tiles */

function TeamTile({ team }: { team: EsportsTeam }) {
  const hue = team.seed % 360;
  return (
    <div className="border border-line bg-bg-card/50 p-4 transition hover:border-accent">
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center border font-display text-sm font-extrabold tracking-widest"
          style={{ borderColor: `hsl(${hue} 70% 45%)`, color: `hsl(${hue} 85% 65%)`, background: `hsl(${hue} 60% 12%)` }}
        >
          {team.tag}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold uppercase tracking-wide text-white">{team.name}</p>
          <p className="text-2xs uppercase tracking-wider text-ink-muted">
            {team.region} · {team.wins}W–{team.losses}L · {team.titles} titles
          </p>
        </div>
      </div>
      <p className="mt-3 border-t border-line-soft pt-2.5 text-2xs text-ink-muted">{team.roster.join(" · ")}</p>
    </div>
  );
}

/* ------------------------------------------------------------- match row */

function MatchRow({ match }: { match: EsportsMatch }) {
  const a = TEAM_BY_ID.get(match.teamA);
  const b = TEAM_BY_ID.get(match.teamB);
  return (
    <div className="flex items-center gap-3 border-b border-line-soft px-3 py-2.5 last:border-b-0">
      <span
        className={`w-[70px] shrink-0 font-display text-2xs font-bold uppercase tracking-wider ${
          match.status === "live" ? "text-accent" : "text-ink-muted"
        }`}
      >
        {match.status === "live" ? "● Live" : formatDate(match.startsAt)}
      </span>
      <span className="w-24 shrink-0 truncate text-2xs uppercase tracking-wider text-ink-muted">{match.stage}</span>
      <span className="min-w-0 flex-1 truncate text-right text-xs text-white">{a?.name ?? match.teamA}</span>
      <span className="shrink-0 border border-line bg-bg-deep/70 px-2 py-0.5 font-display text-2xs font-extrabold tabular-nums text-white">
        {match.scoreA ?? "–"} : {match.scoreB ?? "–"}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-white">{b?.name ?? match.teamB}</span>
      <span className="hidden w-14 shrink-0 text-right text-2xs uppercase tracking-wider text-ink-muted sm:block">
        {match.format}
      </span>
    </div>
  );
}
/* ----------------------------------------------------------- event panel */

function EventPanel({ event }: { event: EsportsEvent }) {
  const standings = standingsFor(event);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.45fr_1fr]">
      <div className="min-w-0 space-y-7">
        <section>
          <h3 className="mb-3 border-b border-line pb-2 font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
            Schedule &amp; results
          </h3>
          <div className="border border-line">
            {event.matches.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 border-b border-line pb-2 font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
            Bracket
          </h3>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {event.bracket.map((round) => (
              <div key={round.name} className="min-w-[212px] shrink-0 border border-line bg-bg-card/50 p-3">
                <p className="mb-2 font-display text-2xs font-bold uppercase tracking-wider text-accent">
                  {round.name}
                </p>
                <ul className="space-y-2">
                  {round.matches.map((m, i) => (
                    <li key={i} className="border border-line-soft bg-bg-deep/50 px-2.5 py-1.5 text-2xs">
                      <div
                        className={`flex items-center justify-between gap-2 ${
                          m.winner === m.a ? "text-white" : "text-ink-muted"
                        }`}
                      >
                        <span className="truncate font-semibold">{TEAM_BY_ID.get(m.a)?.tag ?? m.a}</span>
                        <span className="tabular-nums">{m.scoreA}</span>
                      </div>
                      <div
                        className={`flex items-center justify-between gap-2 ${
                          m.winner === m.b ? "text-white" : "text-ink-muted"
                        }`}
                      >
                        <span className="truncate font-semibold">{TEAM_BY_ID.get(m.b)?.tag ?? m.b}</span>
                        <span className="tabular-nums">{m.scoreB}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="min-w-0">
        <h3 className="mb-3 border-b border-line pb-2 font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
          Standings
        </h3>
        <div className="border border-line">
          <div className="flex items-center gap-2 border-b border-line bg-bg-muted/60 px-3 py-2 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
            <span className="w-6">#</span>
            <span className="flex-1">Team</span>
            <span className="w-8 text-right">W</span>
            <span className="w-8 text-right">L</span>
            <span className="w-10 text-right">Pts</span>
            <span className="w-10 text-right">Form</span>
          </div>
          {standings.map((row) => {
            const team = TEAM_BY_ID.get(row.teamId);
            return (
              <div
                key={row.teamId}
                className="flex items-center gap-2 border-b border-line-soft px-3 py-2 text-xs transition last:border-b-0 hover:bg-bg-card/50"
              >
                <span className="w-6 font-display text-2xs font-extrabold tabular-nums text-accent">{row.rank}</span>
                <span className="min-w-0 flex-1 truncate text-white">
                  <span className="font-display font-bold">{team?.tag ?? row.teamId}</span>{" "}
                  <span className="text-ink-secondary">{team?.name}</span>
                </span>
                <span className="w-8 text-right tabular-nums text-white">{row.wins}</span>
                <span className="w-8 text-right tabular-nums text-ink-muted">{row.losses}</span>
                <span className="w-10 text-right font-display font-bold tabular-nums text-white">{row.points}</span>
                <span
                  className={`w-10 text-right font-display text-2xs font-bold ${
                    row.streak.startsWith("W") ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {row.streak}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-2xs leading-relaxed text-ink-muted">
          Season record across the Circuit — three points per series win. Standings are derived from the team
          records in the catalogue and update as results are confirmed.
        </p>
      </section>
    </div>
  );
}
export default function EsportsPage() {
  const event = FEATURED_EVENT;
  const game = getGame(event.gameSlug);
  const isLive = event.startsAt <= "2026-09-27T23:59:59Z" && event.endsAt >= "2026-09-27";
  const totalPrize = ESPORTS_EVENTS.reduce((sum, e) => sum + e.prizePool, 0);
  const matchCount = ESPORTS_EVENTS.reduce((sum, e) => sum + e.matches.length, 0);

  const tabs = ESPORTS_EVENTS.map((e) => ({
    id: e.slug,
    label: e.name,
    badge: `Tier ${e.tier}`,
    content: <EventPanel event={e} />,
  }));

  return (
    <>
      <PageHero
        eyebrow="INFINITY Circuit"
        title={
          <>
            The competitive
            <br />
            circuit
          </>
        }
        description="Four events, sixteen organisations and $1.95M in prize money — schedules, live scores, brackets and standings, all prerendered from the circuit records."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(ESPORTS_EVENTS.length)} label="Events" />
          <Stat value={`$${(totalPrize / 1_000_000).toFixed(2)}M`} label="Prize money" tone="accent" />
          <Stat value={String(ESPORTS_TEAMS.length)} label="Teams" />
          <Stat value={String(matchCount)} label="Matches tracked" />
        </div>
      </PageHero>

      <div className="shell space-y-12 py-10">
        {/* ---------------------------------------------- featured event */}
        <section className="grid overflow-hidden border border-line bg-bg-card/50 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative min-h-[260px]">
            {game ? (
              <GameArt game={game} variant="wide" className="absolute inset-0 h-full w-full" />
            ) : (
              <div className="absolute inset-0 divider-grid" />
            )}
            <div className="absolute left-4 top-4 flex gap-2">
              <Badge tone={isLive ? "live" : "accent"}>{isLive ? "Live now" : "Upcoming"}</Badge>
              <Badge tone="outline">Tier {event.tier}</Badge>
            </div>
          </div>
          <div className="space-y-4 border-t border-line p-6 lg:border-l lg:border-t-0">
            <p className="eyebrow">
              {event.region} · {formatDate(event.startsAt)} – {formatDate(event.endsAt)}
            </p>
            <h2 className="h-display text-2xl sm:text-3xl">{event.name}</h2>
            <p className="text-sm leading-relaxed text-ink-secondary">{event.headline}</p>
            <div>
              <p className="text-2xs uppercase tracking-wider text-ink-muted">
                {event.venue} · {event.location}
              </p>
              <p className="mt-1 font-display text-xl font-extrabold text-white">
                ${event.prizePool.toLocaleString()} <span className="text-2xs uppercase tracking-wider text-ink-muted">prize pool</span>
              </p>
            </div>
            <Countdown to={isLive ? event.endsAt : event.startsAt} label={isLive ? "Event closes in" : "Starts in"} />
          </div>
        </section>

        {/* ------------------------------------------------ circuit tabs */}
        <section>
          <SectionHeading
            eyebrow="Schedule"
            title="Circuit events"
            description="Switch between events for the full schedule, bracket and standings. Live matches are marked as they run."
          />
          <BrowseTabs tabs={tabs} />
        </section>

        {/* ------------------------------------------------------- teams */}
        <section>
          <SectionHeading
            eyebrow="Organisations"
            title="Teams on the Circuit"
            description="Sixteen organisations across seven regions, with season records and rosters."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ESPORTS_TEAMS.map((t) => (
              <TeamTile key={t.id} team={t} />
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-3 border-t border-line pt-8">
          <Link
            href="/news"
            className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
          >
            Circuit coverage
          </Link>
          <Link
            href="/community"
            className="border border-line px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-accent"
          >
            Watch-party group
          </Link>
          <Link
            href="/games"
            className="bg-accent px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
          >
            Play the line-up
          </Link>
        </section>
      </div>
    </>
  );
}


