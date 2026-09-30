/* ===========================================================================
 * Site navigation model
 * ---------------------------------------------------------------------------
 * One definition drives the desktop nav, the mega menu, the mobile drawer and
 * the footer, so a route can never drift out of sync between them.
 * ======================================================================== */

export interface NavChild {
  label: string;
  href: string;
  hint?: string;
}

export interface NavSection {
  title: string;
  children: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  /** Mega-menu columns. Omitted for plain links. */
  sections?: NavSection[];
  highlight?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  {
    label: "Games",
    href: "/games",
    sections: [
      {
        title: "Browse",
        children: [
          { label: "All games", href: "/games", hint: "The full catalogue" },
          { label: "New releases", href: "/games?tab=new" },
          { label: "Coming soon", href: "/games?tab=soon" },
          { label: "Top rated", href: "/games?tab=top-rated" },
          { label: "Free to play", href: "/games?tab=free" },
          { label: "Deals", href: "/deals" },
        ],
      },
      {
        title: "Genres",
        children: [
          { label: "Action", href: "/categories/action" },
          { label: "Open world", href: "/categories/open-world" },
          { label: "Shooters", href: "/categories/fps" },
          { label: "RPG", href: "/categories/rpg" },
          { label: "Racing", href: "/categories/racing" },
          { label: "Strategy", href: "/categories/strategy" },
          { label: "All categories", href: "/categories" },
        ],
      },
      {
        title: "Platforms",
        children: [
          { label: "PC / Windows", href: "/platforms/pc" },
          { label: "PlayStation 5", href: "/platforms/ps5" },
          { label: "Xbox Series X|S", href: "/platforms/xbox-series" },
          { label: "Nintendo Switch", href: "/platforms/switch" },
          { label: "Android", href: "/platforms/android" },
          { label: "iOS", href: "/platforms/ios" },
          { label: "All platforms", href: "/platforms" },
        ],
      },
    ],
  },
  { label: "Store", href: "/store" },
  { label: "Game Pass", href: "/game-pass", highlight: true },
  { label: "News", href: "/news" },
  { label: "Reviews", href: "/news?category=culture" },
  { label: "Esports", href: "/esports" },
  { label: "Community", href: "/community" },
  {
    label: "More",
    href: "/support",
    sections: [
      {
        title: "Ecosystem",
        children: [
          { label: "Launcher", href: "/launcher" },
          { label: "Studios", href: "/studios" },
          { label: "Compare games", href: "/compare" },
        ],
      },
      {
        title: "Your account",
        children: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Wishlist", href: "/dashboard/wishlist" },
          { label: "Notifications", href: "/dashboard/notifications" },
        ],
      },
      {
        title: "Support",
        children: [
          { label: "Help centre", href: "/support" },
          { label: "Accessibility", href: "/support/accessibility" },
          { label: "Privacy", href: "/support/privacy" },
          { label: "Terms of use", href: "/support/terms" },
        ],
      },
    ],
  },
];

export const UTILITY_LINKS: NavChild[] = [
  { label: "Support", href: "/support" },
  { label: "Account & security", href: "/support/account-and-security" },
  { label: "Payments & refunds", href: "/support/payments-and-refunds" },
  { label: "Launcher", href: "/launcher" },
];

export const FOOTER_COLUMNS: { title: string; links: NavChild[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "All games", href: "/games" },
      { label: "Categories", href: "/categories" },
      { label: "Platforms", href: "/platforms" },
      { label: "New releases", href: "/games?tab=new" },
      { label: "Coming soon", href: "/games?tab=soon" },
      { label: "Top rated", href: "/games?tab=top-rated" },
      { label: "Free to play", href: "/games?tab=free" },
      { label: "Compare games", href: "/compare" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Store", href: "/store" },
      { label: "Deals", href: "/deals" },
      { label: "Game Pass", href: "/game-pass" },
      { label: "Bundles & DLC", href: "/store?kind=bundle" },
      { label: "Cart", href: "/cart" },
      { label: "Wishlist", href: "/dashboard/wishlist" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Launcher", href: "/launcher" },
      { label: "Esports hub", href: "/esports" },
      { label: "Community", href: "/community" },
      { label: "Studios", href: "/studios" },
      { label: "Newsroom", href: "/news" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "/support" },
      { label: "Account & security", href: "/support/account-and-security" },
      { label: "Payments & refunds", href: "/support/payments-and-refunds" },
      { label: "Launcher troubleshooting", href: "/support/launcher-troubleshooting" },
      { label: "Accessibility", href: "/support/accessibility" },
      { label: "Cookies", href: "/support/cookies" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "About this build", href: "/support" },
      { label: "Help centre", href: "/support" },
      { label: "Notifications", href: "/dashboard/notifications" },
      { label: "Privacy", href: "/support/privacy" },
      { label: "Terms of use", href: "/support/terms" },
      { label: "Accessibility", href: "/support/accessibility" },
    ],
  },
];

/**
 * Social destinations. Per the INFINITY brief these appear in the footer only —
 * never in the top bar, navbar, hero, cards or dashboard surfaces.
 */
export const SOCIAL_LINKS: { label: string; href: string; icon: string }[] = [
  { label: "Facebook", href: "https://www.facebook.com", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com", icon: "instagram" },
  { label: "X", href: "https://x.com", icon: "x" },
  { label: "YouTube", href: "https://www.youtube.com", icon: "youtube" },
  { label: "Discord", href: "https://discord.com", icon: "discord" },
  { label: "Twitch", href: "https://www.twitch.tv", icon: "twitch" },
  { label: "TikTok", href: "https://www.tiktok.com", icon: "tiktok" },
  { label: "Reddit", href: "https://www.reddit.com", icon: "reddit" },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: "linkedin" },
];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest first" },
  { value: "released", label: "Oldest first" },
  { value: "rating", label: "Highest rated" },
  { value: "az", label: "A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];
