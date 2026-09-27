/* ===========================================================================
 * INFINITY — canonical domain model
 * ---------------------------------------------------------------------------
 * One file, one source of truth. Every UI surface in the platform is typed
 * against these contracts, which is what allows the catalogue to grow from
 * 450 records to 10,000+ without any change to presentation code.
 * ======================================================================== */

/* ---------------------------------------------------------------- taxonomy */

export type GenreSlug =
  | "action"
  | "adventure"
  | "rpg"
  | "open-world"
  | "fps"
  | "tps"
  | "racing"
  | "sports"
  | "strategy"
  | "simulation"
  | "horror"
  | "survival"
  | "fighting"
  | "battle-royale"
  | "mmorpg"
  | "sandbox"
  | "puzzle"
  | "co-op"
  | "multiplayer"
  | "story"
  | "indie"
  | "family";

export type PlatformSlug =
  | "pc"
  | "android"
  | "ios"
  | "ps4"
  | "ps5"
  | "xbox-one"
  | "xbox-series"
  | "switch";

export type PlatformFamily = "pc" | "mobile" | "playstation" | "xbox" | "nintendo";

export type GameMode =
  | "single-player"
  | "multiplayer"
  | "co-op"
  | "online-pvp"
  | "online-coop"
  | "local-coop"
  | "campaign"
  | "sandbox"
  | "ranked"
  | "cross-platform";

export type MediaKind =
  | "gameplay"
  | "characters"
  | "vehicles"
  | "environments"
  | "maps"
  | "cinematics";

export type VideoCategory =
  | "official-trailer"
  | "gameplay"
  | "cinematic"
  | "update"
  | "developer"
  | "behind-the-scenes";

export type AgeRating =
  | "E"
  | "E10+"
  | "T"
  | "M"
  | "A"
  | "PEGI 3"
  | "PEGI 7"
  | "PEGI 12"
  | "PEGI 16"
  | "PEGI 18";

export interface Genre {
  slug: GenreSlug;
  name: string;
  blurb: string;
  /** Deterministic key-art hue used by the generated poster engine. */
  hue: number;
  icon: string;
}

export interface Platform {
  slug: PlatformSlug;
  name: string;
  shortName: string;
  family: PlatformFamily;
  manufacturer: string;
  generation: string;
  launched: string;
  blurb: string;
  accent: string;
}

/* ------------------------------------------------------------------- media */

export interface ScreenshotAsset {
  id: string;
  kind: MediaKind;
  caption: string;
  /** Stable seed for the deterministic key-art renderer. */
  seed: number;
  /** Optional authorised/uploaded image. Falls back to generated key art. */
  image?: string;
}

export interface VideoAsset {
  id: string;
  title: string;
  category: VideoCategory;
  duration: string;
  publishedAt: string;
  /** Only official publisher channels / licensed sources are linked. */
  officialUrl: string;
  /** Populated by the CMS when an authorised embed id is available. */
  embedId?: string;
  channel: string;
}

/* --------------------------------------------------------- technical specs */

export interface RequirementRow {
  label: string;
  value: string;
}

export interface SystemRequirements {
  minimum: RequirementRow[];
  recommended: RequirementRow[];
}

export interface ControlBinding {
  action: string;
  key: string;
}

export interface PlatformHowToPlay {
  platform: PlatformSlug;
  label: string;
  input: "keyboard" | "gamepad" | "touch";
  objective: string;
  controls: ControlBinding[];
  modes: string[];
  beginnerGuide: string[];
  tips: string[];
  advanced: string[];
}

export interface OfficialStoreLink {
  platform: PlatformSlug;
  retailer: string;
  label: string;
  url: string;
}

export interface PlatformAvailability {
  platform: PlatformSlug;
  edition: string;
  fileSize: string;
  requirements: SystemRequirements;
  storeUrl: string;
  /** Local INFINITY build — only used for first-party / self-published titles. */
  infinityBuild: boolean;
}

/* -------------------------------------------------------------------- game */

export interface Game {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  /** Optional licensed artwork. When null the key-art engine renders a poster. */
  coverImage: string | null;
  heroImage: string | null;
  screenshots: ScreenshotAsset[];
  videos: VideoAsset[];
  genre: GenreSlug[];
  platforms: PlatformSlug[];
  developer: string;
  publisher: string;
  releaseDate: string;
  rating: number;
  reviewCount: number;
  price: number;
  discount: number;
  currency: "USD";
  isFree: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
  isComingSoon: boolean;
  gameModes: GameMode[];
  features: string[];
  tags: string[];
  languages: string[];
  fileSize: string;
  systemRequirements: SystemRequirements;
  controls: PlatformHowToPlay[];
  howToPlay: string[];
  ageRating: AgeRating;
  relatedGames: string[];
  officialStoreLinks: OfficialStoreLink[];
  availability: PlatformAvailability[];
  /** Derived analytics counters (deterministic, used by admin + rankings). */
  popularity: number;
  wishlistCount: number;
  viewCount: number;
  downloadCount: number;
  mediaCount: number;
  accentHue: number;
  /** Short cinematic line authored for marquee titles. */
  tagline: string | null;
  createdAt: string;
}

export type GameSortKey =
  | "popular"
  | "newest"
  | "rating"
  | "az"
  | "price-asc"
  | "price-desc"
  | "released";

export interface GameFilters {
  q?: string;
  genre?: string[];
  platform?: string[];
  developer?: string[];
  publisher?: string[];
  mode?: string[];
  minRating?: number;
  maxPrice?: number;
  yearFrom?: number;
  yearTo?: number;
  freeOnly?: boolean;
  discountedOnly?: boolean;
  comingSoon?: boolean;
  tag?: string[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/* ------------------------------------------------------------------- users */

export type UserRole = "player" | "editor" | "admin";

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  avatarHue: number;
  country: string;
  joinedAt: string;
  lastActiveAt: string;
  status: "active" | "suspended" | "invited";
  level: number;
  xp: number;
  hoursPlayed: number;
  ownedGames: string[];
  wishlist: string[];
  achievements: UserAchievement[];
  friends: FriendLink[];
  reviewsWritten: number;
}

export interface FriendLink {
  userId: string;
  status: "friend" | "request-in" | "request-out" | "blocked" | "suggested";
  since: string;
  lastSeen: string;
  online: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  xp: number;
  gameSlug: string | null;
  /** Percentage of the player base that has unlocked it. */
  rarity: number;
}

export interface UserAchievement {
  achievementId: string;
  unlocked: boolean;
  progress: number;
  unlockedAt: string | null;
}

export interface Notification {
  id: string;
  category:
    | "game-update"
    | "friend-request"
    | "achievement"
    | "wishlist-price"
    | "new-game"
    | "tournament"
    | "news"
    | "system";
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
  gameSlug?: string;
}

/* ------------------------------------------------------------------ reviews */

export interface ReviewScoreBreakdown {
  graphics: number;
  gameplay: number;
  story: number;
  sound: number;
  performance: number;
  replayability: number;
  features: number;
}

export interface EditorialReview {
  id: string;
  slug: string;
  gameSlug: string;
  headline: string;
  verdict: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  overall: number | null;
  scores: ReviewScoreBreakdown | null;
  pros: string[];
  cons: string[];
  body: string[];
  editorNotes: string;
  /** true until an authorised editor signs the review off in the CMS. */
  pendingSignature: boolean;
}

export interface CommunityReview {
  id: string;
  gameSlug: string;
  username: string;
  avatarHue: number;
  rating: number;
  createdAt: string;
  comment: string;
  helpful: number;
  hoursPlayed: number;
  platform: PlatformSlug;
  verified: boolean;
}

/* --------------------------------------------------------------------- news */

export interface NewsCategory {
  slug: string;
  name: string;
  blurb: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readingTime: number;
  featured: boolean;
  trending: boolean;
  heroSeed: number;
  heroImage: string | null;
  tags: string[];
  body: string[];
  relatedGames: string[];
  views: number;
}

/* ------------------------------------------------------------------ esports */

export interface EsportsTeam {
  id: string;
  name: string;
  tag: string;
  region: string;
  gameSlug: string;
  seed: number;
  wins: number;
  losses: number;
  titles: number;
  roster: string[];
}

export interface EsportsPlayer {
  id: string;
  handle: string;
  realName: string;
  teamId: string;
  role: string;
  country: string;
  rating: number;
  earnings: number;
}

export interface EsportsMatch {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  status: "live" | "upcoming" | "completed";
  startsAt: string;
  stage: string;
  format: string;
}

export interface BracketRound {
  name: string;
  matches: { a: string; b: string; scoreA: number; scoreB: number; winner: string }[];
}

export interface EsportsEvent {
  id: string;
  slug: string;
  name: string;
  gameSlug: string;
  headline: string;
  description: string;
  venue: string;
  location: string;
  region: string;
  startsAt: string;
  endsAt: string;
  prizePool: number;
  currency: string;
  tier: "S" | "A" | "B";
  teamIds: string[];
  matches: EsportsMatch[];
  bracket: BracketRound[];
  format: string;
  heroSeed: number;
}

export interface StandingsRow {
  rank: number;
  teamId: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  streak: string;
}

/* ---------------------------------------------------------------- community */

export interface CommunityGroup {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  gameSlug: string | null;
  members: number;
  posts: number;
  seed: number;
  kind: "club" | "group" | "guild" | "study";
}

export interface CommunityPost {
  id: string;
  slug: string;
  title: string;
  body: string;
  author: string;
  authorHue: number;
  groupSlug: string | null;
  gameSlug: string | null;
  board: "discussion" | "guides" | "clips" | "screenshots" | "news" | "players";
  createdAt: string;
  replies: number;
  upvotes: number;
  pinned: boolean;
  tags: string[];
}

export interface CommunityComment {
  id: string;
  postSlug: string;
  author: string;
  authorHue: number;
  createdAt: string;
  body: string;
  upvotes: number;
}

/* ------------------------------------------------------------ commerce side */

export type ProductKind = "game" | "dlc" | "expansion" | "bundle" | "membership" | "merch";

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  kind: ProductKind;
  gameSlug: string | null;
  blurb: string;
  price: number;
  discount: number;
  platforms: PlatformSlug[];
  seed: number;
  includes: string[];
}

export interface CartLine {
  productId: string;
  name: string;
  kind: ProductKind;
  platform: PlatformSlug | null;
  unitPrice: number;
  discount: number;
  quantity: number;
  seed: number;
}

export interface Order {
  id: string;
  userId: string;
  username: string;
  createdAt: string;
  items: number;
  subtotal: number;
  discount: number;
  total: number;
  status: "completed" | "pending" | "refunded" | "failed";
  method: string;
}

export interface PromoBanner {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  variant: "free-weekend" | "new-worlds" | "game-pass" | "launcher" | "esports";
  seed: number;
}

export interface GamePassPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  cadence: string;
  highlight: boolean;
  features: { label: string; included: boolean }[];
  cta: string;
}

export interface DownloadItem {
  id: string;
  name: string;
  category: "windows" | "android" | "ios" | "launcher" | "companion";
  version: string;
  size: string;
  releasedAt: string;
  minOs: string;
  blurb: string;
  notes: string[];
  url: string;
  signature: string;
}

/* --------------------------------------------------------------- corporate */

export interface JobRole {
  id: string;
  title: string;
  department: string;
  discipline:
    | "engineering"
    | "game-development"
    | "art"
    | "animation"
    | "design"
    | "audio"
    | "production"
    | "marketing"
    | "community"
    | "esports";
  location: string;
  type: "full-time" | "contract" | "internship";
  remote: boolean;
  postedAt: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
}

export interface Studio {
  id: string;
  name: string;
  city: string;
  country: string;
  founded: string;
  specialization: string;
  headcount: number;
  projects: string[];
  technology: string[];
  blurb: string;
}

export interface SupportArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
  updatedAt: string;
  views: number;
}

export interface SupportCategory {
  slug: string;
  name: string;
  blurb: string;
  icon: string;
  articles: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  hue: number;
}

export interface PlatformStat {
  label: string;
  value: number;
  display: string;
  hint: string;
}

export interface Genre {
  slug: GenreSlug;
  name: string;
  blurb: string;
  /** Deterministic key-art hue used by the generated poster engine. */
  hue: number;
  icon: string;
}

export interface Platform {
  slug: PlatformSlug;
  name: string;
  shortName: string;
  family: PlatformFamily;
  manufacturer: string;
  generation: string;
  launched: string;
  blurb: string;
  accent: string;
}
