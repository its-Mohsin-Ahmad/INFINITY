import type { NewsArticle, NewsCategory } from "@/lib/types";
import { slugs } from "./resolve";

/* ===========================================================================
 * Newsroom editorial content.
 * ---------------------------------------------------------------------------
 * Articles are authored as structured records so the index, category rails
 * and article pages all render from one source. `relatedGames` is resolved
 * deterministically at module load, keeping every slug valid against the
 * live catalogue.
 * ======================================================================== */

export const NEWS_CATEGORIES: NewsCategory[] = [
  { slug: "releases", name: "Releases", blurb: "Launch days, shadow drops and release-date reveals." },
  { slug: "updates", name: "Updates & Patches", blurb: "Patch notes, seasons and live-service roadmaps." },
  { slug: "esports", name: "Esports", blurb: "Tournaments, rosters and results from the competitive circuit." },
  { slug: "industry", name: "Industry", blurb: "Studios, storefronts and the business behind the games." },
  { slug: "hardware", name: "Hardware", blurb: "Consoles, GPUs, handhelds and the silicon in between." },
  { slug: "deals", name: "Deals & Sales", blurb: "Verified discounts, price drops and free weekends." },
  { slug: "culture", name: "Culture & Guides", blurb: "Scene reports, retrospectives and long reads." },
];

export const NEWS_CATEGORY_MAP: Record<string, NewsCategory> = Object.fromEntries(
  NEWS_CATEGORIES.map((c) => [c.slug, c]),
);

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-001",
    slug: "season-sale-verified-discounts",
    title: "The INFINITY season sale is live â€” every discount verified at checkout",
    excerpt:
      "Hundreds of titles are discounted through the new year, with prices checked against the catalogue at the moment you buy.",
    category: "deals",
    author: "Ayesha Rahman",
    authorRole: "Senior Editor",
    publishedAt: "2026-09-26T09:00:00Z",
    readingTime: 6,
    featured: true,
    trending: true,
    heroSeed: 4112,
    heroImage: null,
    tags: ["sale", "store", "deals"],
    body: [
      "The INFINITY season sale opened this morning across every storefront lane, and this year the platform is doing one thing differently: each discount is re-validated against the catalogue the moment you add a title to your cart. If a price changes between the banner you saw and the receipt you get, you are charged the lower of the two.",
      "The sale covers the full breadth of the catalogue â€” from marquee open-world releases to the mobile-first free-to-play lane â€” and runs through 31 December. Every discounted title shows its old price, its new price and the exact percentage saving on the card, so nothing has to be worked out on a checkout screen.",
      "Deal hunters can start from the Deals page, which groups offers by depth of discount and by final price. Titles that dip below $15 after the reduction get their own lane, and the free-to-play section remains permanently free regardless of the sale window.",
      "Members of INFINITY Plus receive the member price stacked on top of the sale price where the publisher allows it. The stack is applied automatically at checkout â€” no codes, no coupon hunting.",
      "The editorial desk is tracking the sale daily and will flag any title that drops further before the window closes. Wishlist a title and the platform will notify you if its price moves while the sale is on.",
    ],
    relatedGames: slugs(4, "news-sale"),
    views: 148203,
  },
  {
    id: "news-002",
    slug: "fall-showcase-five-launch-dates",
    title: "Fall showcase: five launch dates land in a single week",
    excerpt:
      "The autumn calendar just compressed â€” five of the year's most-watched titles now ship inside seven days.",
    category: "releases",
    author: "Marcus Vale",
    authorRole: "Console Editor",
    publishedAt: "2026-09-25T14:30:00Z",
    readingTime: 5,
    featured: false,
    trending: true,
    heroSeed: 8871,
    heroImage: null,
    tags: ["release dates", "showcase"],
    body: [
      "Five release dates moved into the same seven-day window this week, turning the middle of October into the densest shipping period of the year. Two of the titles previously sat in the coming-soon lane with placeholder dates; both now have firm day-and-date launches.",
      "For players, the collision is a scheduling problem as much as a celebration. INFINITY's wishlist notifications now include a calendar view, so a launch you claimed weeks ago sits alongside everything else landing in the same window.",
      "Storefronts across the PC and console lanes have already synced their pages with the new dates, which means pre-order pricing visible on each game page reflects the current schedule.",
      "The crowded window also sharpens the review calendar. Editorial coverage will run as a rolling primer through launch week, with scores published only once servers and day-one patches are in their release configuration.",
      "If you are picking one: wishlist the rest. The platform tracks price history on every title, and autumn launches historically move within their first six weeks.",
    ],
    relatedGames: slugs(4, "news-showcase"),
    views: 96412,
  },
  {
    id: "news-003",
    slug: "launcher-4-2-patch-notes",
    title: "Launcher 4.2 ships: faster downloads, per-game profiles and a repaired queue",
    excerpt:
      "The biggest launcher update of the year rewrites the download pipeline and adds per-game configuration profiles.",
    category: "updates",
    author: "Priya Nandakumar",
    authorRole: "Technology Editor",
    publishedAt: "2026-09-24T11:00:00Z",
    readingTime: 7,
    featured: false,
    trending: false,
    heroSeed: 1337,
    heroImage: null,
    tags: ["launcher", "patch notes"],
    body: [
      "Launcher 4.2 is rolling out to all Windows builds now. The headline change is the rewritten download pipeline: chunked retrieval with adaptive congestion control replaces the old sequential fetcher, and early measurements on typical home connections show large installs completing meaningfully faster.",
      "The queue itself has been repaired end to end. Paused downloads survive network changes, drive selection is remembered per title, and a failed chunk now retries silently instead of restarting the whole job.",
      "Per-game profiles let you pin graphics, controller and cloud-save preferences to a title rather than a global default. Profiles sync across devices for signed-in players and export as a single file for everyone else.",
      "Under the hood the update reduces memory use in the library view, fixes the notification badge that could stick after a completed install, and closes a case where the tray icon kept a game process alive after close.",
      "Rollout is staged: fully-updated installs should see 4.2 within 48 hours. The launcher will prompt automatically, and downloads in progress are not interrupted by the update.",
    ],
    relatedGames: slugs(4, "news-launcher"),
    views: 74108,
  },
  {
    id: "news-004",
    slug: "circuit-grand-final-bracket-set",
    title: "INFINITY Circuit: the grand-final bracket is set after a brutal playoff weekend",
    excerpt:
      "Four regions, sixteen teams, one bracket â€” the playoff weekend ended with two upset reversals and a rematch nobody asked for.",
    category: "esports",
    author: "Tom Okafor",
    authorRole: "Esports Correspondent",
    publishedAt: "2026-09-23T18:45:00Z",
    readingTime: 6,
    featured: false,
    trending: true,
    heroSeed: 6420,
    heroImage: null,
    tags: ["circuit", "bracket", "results"],
    body: [
      "The playoff weekend delivered the two upsets the regular season had been promising. Both came from lower-seed teams closing out series in the final map, and both removed a favourite from the bracket before the broadcast had finished its analysis segment.",
      "The bracket now runs double elimination through to the grand final, with the two playoff survivors on opposite sides. One of them has already beaten its next opponent this season; the other lost the reverse fixture in five maps.",
      "Viewing numbers for the weekend were the circuit's best of the year, driven by the overtime game three that ran to the format's full distance. Full VODs and map-level stats are on the esports hub.",
      "Roster rules for the final are locked: no substitutions after the seeding deadline, and every player must have appeared in at least one regular-season series to be match-eligible.",
      "The Autumn Split finals in Berlin begin Thursday, with the grand final closing the arena show on Sunday evening. Standings, schedules and brackets are updated live on the esports page.",
    ],
    relatedGames: slugs(4, "news-circuit"),
    views: 118544,
  },
  {
    id: "news-005",
    slug: "year-of-the-handheld-silicon",
    title: "The year of the handheld: what the new silicon actually means for players",
    excerpt:
      "Three new handheld PCs in nine months â€” the specs matter less than what they do to load times, battery curves and your library.",
    category: "hardware",
    author: "Elena Petrova",
    authorRole: "Hardware Editor",
    publishedAt: "2026-09-22T10:15:00Z",
    readingTime: 8,
    featured: false,
    trending: false,
    heroSeed: 5150,
    heroImage: null,
    tags: ["handheld", "pc", "hardware"],
    body: [
      "Three major handheld devices have shipped in nine months, and the spec sheets have started to converge: eight-plus compute units, a 1200p-class panel, and a battery in the 60Wh range. The interesting differences are no longer on the box.",
      "The real movement is in frame pacing at handheld-class power draw. VRR panels on the newest devices mask the dips that previous generations rendered as visible stutter, which means a settings profile that looks mediocre on paper plays far better in the hand.",
      "Storage has quietly become the differentiator. Devices pairing a fast drive with a competent thermal path load open-world titles seconds faster than the same silicon with a budget part â€” a gap you feel every session.",
      "For INFINITY libraries, the practical takeaway is the platform lane, not the frame rate: every catalogue title now lists verified handheld profiles where the publisher has shipped them, and cross-save availability is shown alongside.",
      "Expect the next silicon refresh to prioritise efficiency over peak clocks. Battery curves, not teraflops, are what the current class of devices is actually competing on.",
    ],
    relatedGames: slugs(4, "news-handheld"),
    views: 65330,
  },
  {
    id: "news-006",
    slug: "crossplay-now-the-default",
    title: "Cross-play is now the default for new INFINITY titles",
    excerpt:
      "New submissions to the platform ship with cross-play enabled unless a publisher files a documented exception.",
    category: "industry",
    author: "Jonas Weber",
    authorRole: "Industry Analyst",
    publishedAt: "2026-09-21T16:00:00Z",
    readingTime: 5,
    featured: false,
    trending: false,
    heroSeed: 2718,
    heroImage: null,
    tags: ["cross-play", "policy", "multiplayer"],
    body: [
      "Effective this quarter, every new multiplayer title submitted to INFINITY ships with cross-play enabled by default. Publishers who need to opt out must file a documented technical exception, and the reason is published on the game page.",
      "The policy mirrors what players have demanded for years: lobbies that do not split along storefront lines. Titles already live on the platform are being grandfathered in progressively as their matchmaking backends update.",
      "The platform's per-platform availability display already shows which titles support cross-play, cross-progression and cross-save as three separate signals â€” no more inferring one from another.",
      "Expect the exception list to shrink. The technical cases that remain are mostly tied to input-latency parity between controller and touch tiers, which the platform allows publishers to address with input-based matchmaking instead.",
    ],
    relatedGames: slugs(4, "news-crossplay"),
    views: 58220,
  },
  {
    id: "news-007",
    slug: "speedrun-weekend-returns",
    title: "Speedrun weekend returns with 12 community events",
    excerpt:
      "Frame One Lab and the community team are running a full weekend of routed runs, races and category showcases.",
    category: "culture",
    author: "Sam Oyelaran",
    authorRole: "Community Writer",
    publishedAt: "2026-09-20T12:00:00Z",
    readingTime: 4,
    featured: false,
    trending: false,
    heroSeed: 3903,
    heroImage: null,
    tags: ["speedrun", "community", "events"],
    body: [
      "Speedrun weekend is back for its fourth edition: twelve events across three days, run by the Frame One Lab community group with scheduling support from the platform.",
      "Events cover four categories â€” any%, 100%, no-major-glitch and community-voted blind races â€” with a live bracket posted to the community boards on Friday morning.",
      "New this year is the beginner relay: teams of two, one experienced runner and one first-timer, routed specifically to be learnable in a single evening.",
      "All runs are restreamed with commentary, and verified times feed the group's leaderboard. Bring a timer; the weekend has never finished under schedule.",
    ],
    relatedGames: slugs(4, "news-speedrun"),
    views: 41115,
  },
  {
    id: "news-008",
    slug: "unified-patch-notes-rollout",
    title: "Unified patch notes are rolling out across the catalogue",
    excerpt:
      "One reading surface for every game you own: platform-specific changes, balance deltas and known issues in a single feed.",
    category: "updates",
    author: "Priya Nandakumar",
    authorRole: "Technology Editor",
    publishedAt: "2026-09-19T13:30:00Z",
    readingTime: 4,
    featured: false,
    trending: false,
    heroSeed: 6066,
    heroImage: null,
    tags: ["patch notes", "library"],
    body: [
      "Patch notes for every title in your library now surface in one feed, normalised into the same structure: what changed, which platforms it affects, and what is still known-broken.",
      "Publishers keep full control of their own notes â€” the platform reads the official feed and re-renders it. Nothing is rewritten, and every entry links back to the publisher's source.",
      "The feed is filterable by game, by platform and by change type, so a console-only fix no longer buries the PC balance change you actually opened the app for.",
      "Notifications for followed titles respect the same filters, which means you can follow balance passes without following hotfix chatter.",
    ],
    relatedGames: slugs(4, "news-patch"),
    views: 52010,
  },
  {
    id: "news-009",
    slug: "regional-pricing-18-new-markets",
    title: "INFINITY expands regional pricing to 18 new markets",
    excerpt:
      "Local-currency pricing lands in eighteen more countries, with the same verified-discount guarantee as the core storefront.",
    category: "deals",
    author: "Jonas Weber",
    authorRole: "Industry Analyst",
    publishedAt: "2026-09-18T09:45:00Z",
    readingTime: 5,
    featured: false,
    trending: false,
    heroSeed: 1919,
    heroImage: null,
    tags: ["pricing", "store", "regions"],
    body: [
      "Eighteen additional markets now see local-currency pricing across the storefront, with regional price points set per title rather than converted automatically at checkout.",
      "The rollout also brings the verified-discount guarantee to those regions: the price shown on the card is the price charged, including during the season sale.",
      "Currency switching follows your account rather than your IP, so travelling players are not charged in the wrong market. Tax handling remains per-region at checkout.",
      "Regional pricing does not change catalogue access â€” every market sees the same 540-title library, with availability restrictions still listed per platform on each game page.",
    ],
    relatedGames: slugs(4, "news-pricing"),
    views: 47380,
  },
  {
    id: "news-010",
    slug: "gpu-tiers-for-2026",
    title: "GPU tiers for 2026: what you actually need for every lane of the catalogue",
    excerpt:
      "Four tiers, four honest recommendations â€” plus the one setting that buys back more performance than any upgrade.",
    category: "hardware",
    author: "Elena Petrova",
    authorRole: "Hardware Editor",
    publishedAt: "2026-09-17T11:00:00Z",
    readingTime: 7,
    featured: false,
    trending: false,
    heroSeed: 7077,
    heroImage: null,
    tags: ["gpu", "pc", "buying guide"],
    body: [
      "The sensible question is not which card is fastest, it is which tier matches the lanes you actually play. Competitive shooters reward frame pacing at 1080p; the open-world lane asks for VRAM headroom; the strategy lane barely notices either.",
      "At the entry tier, upscaling does the heavy lifting: every current card holds 60fps in the catalogue's biggest releases with quality upscaling on, and the visual gap to native keeps shrinking each driver generation.",
      "The mid tier is where high-refresh panels finally make sense, and it is the tier most players should stop at. Above that you are paying double for the last 30% of frames â€” unless you are driving a 4K panel, in which case the math changes.",
      "Whatever the tier: cap your frame rate to your panel's refresh. It is the single biggest thermal and stability win available for zero dollars, and it costs nothing in input latency at sensible caps.",
    ],
    relatedGames: slugs(4, "news-gpu"),
    views: 83940,
  },
  {
    id: "news-011",
    slug: "roster-move-window-roundup",
    title: "Roster move window: the Circuit's biggest transfers so far",
    excerpt:
      "Three teams rebuilt before the deadline, one franchise kept its core, and one signing deadline passed with a surprise no-trade clause.",
    category: "esports",
    author: "Tom Okafor",
    authorRole: "Esports Correspondent",
    publishedAt: "2026-09-16T15:30:00Z",
    readingTime: 6,
    featured: false,
    trending: false,
    heroSeed: 4044,
    heroImage: null,
    tags: ["transfers", "rosters", "circuit"],
    body: [
      "The transfer window closed with three franchises rebuilding around a new in-game leader. Two of those moves were telegraphed for weeks; the third landed two hours before the deadline and immediately reshuffled the playoff seeding math.",
      "Money was not the story this window â€” eligibility was. The league's residency rule meant several high-profile moves could only complete after the season's midpoint, pushing integrations into the playoff run.",
      "One franchise held its five-man core for a fourth consecutive season, the longest streak in the circuit's history. Their coaching staff called it the cheapest upgrade available.",
      "Full transaction log, contract lengths and eligibility dates are on the esports hub, updated as the league confirms each registration.",
    ],
    relatedGames: slugs(4, "news-transfers"),
    views: 69870,
  },
  {
    id: "news-012",
    slug: "cloud-saves-explained",
    title: "Cloud saves, explained: moving libraries between platforms",
    excerpt:
      "What syncs, what does not, and how to keep a decade of progress intact when you switch from console to PC.",
    category: "culture",
    author: "Sam Oyelaran",
    authorRole: "Community Writer",
    publishedAt: "2026-09-15T10:00:00Z",
    readingTime: 6,
    featured: false,
    trending: false,
    heroSeed: 2468,
    heroImage: null,
    tags: ["cloud saves", "guide", "cross-save"],
    body: [
      "Cloud saves are the quiet infrastructure of a multi-platform library: three separate systems â€” cloud save sync, cross-progression and cross-save â€” that players often mistake for one thing.",
      "Sync covers your save file moving between devices you own. Cross-progression means your profile (unlocks, currency, ranks) travels with your account. Cross-save is the publisher's promise that both work across storefronts.",
      "The game page shows all three as separate signals under availability, so you can check before you buy rather than after you switch.",
      "If you are migrating: export local saves first, sign into the target platform with the same account, and let the first sync complete before installing anything else. The 4.2 launcher automates most of this, but the manual path still works.",
    ],
    relatedGames: slugs(4, "news-cloud"),
    views: 72650,
  },
];

/* ------------------------------------------------------------------ index */

export const NEWS_BY_SLUG: Map<string, NewsArticle> = new Map(NEWS_ARTICLES.map((a) => [a.slug, a]));

export const FEATURED_ARTICLE: NewsArticle = NEWS_ARTICLES.find((a) => a.featured) ?? NEWS_ARTICLES[0];

export function articlesInCategory(slug: string): NewsArticle[] {
  return NEWS_ARTICLES.filter((a) => a.category === slug);
}

export function trendingArticles(limit = 4): NewsArticle[] {
  return NEWS_ARTICLES.filter((a) => a.trending && a.slug !== FEATURED_ARTICLE.slug).slice(0, limit);
}

export function relatedArticles(article: NewsArticle, limit = 3): NewsArticle[] {
  return NEWS_ARTICLES.filter(
    (a) => a.slug !== article.slug && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))),
  ).slice(0, limit);
}
