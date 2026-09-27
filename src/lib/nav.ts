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
          { label: "New releases", href: "/new-releases" },
          { label: "Coming soon", href: "/coming-soon" },
          { label: "Top rated", href: "/top-rated" },
          { label: "Free to play", href: "/free-to-play" },
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
  { label: "Reviews", href: "/reviews" },
  { label: "Esports", href: "/esports" },
  { label: "Community", href: "/community" },
  {
    label: "More",
    href: "/about",
    sections: [
      {
        title: "Ecosystem",
        children: [
          { label: "Launcher", href: "/launcher" },
          { label: "Downloads", href: "/downloads" },
          { label: "Studios", href: "/studios" },
          { label: "Compare games", href: "/compare" },
        ],
      },
      {
        title: "Company",
        children: [
          { label: "About INFINITY", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
          { label: "Support centre", href: "/support" },
        ],
      },
      {
        title: "Your account",
        children: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Wishlist", href: "/dashboard/wishlist" },
          { label: "Library", href: "/dashboard/library" },
          { label: "Notifications", href: "/dashboard/notifications" },
        ],
      },
    ],
  },
];

export const UTILITY_LINKS: NavChild[] = [
  { label: "Support", href: "/support" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/contact" },
  { label: "Status", href: "/support/launcher-troubleshooting" },
];

export const FOOTER_COLUMNS: { title: string; links: NavChild[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "All games", href: "/games" },
      { label: "Categories", href: "/categories" },
      { label: "Platforms", href: "/platforms" },
      { label: "New releases", href: "/new-releases" },
      { label: "Coming soon", href: "/coming-soon" },
      { label: "Top rated", href: "/top-rated" },
      { label: "Free to play", href: "/free-to-play" },
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
      { label: "Checkout", href: "/checkout" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Launcher", href: "/launcher" },
      { label: "Downloads", href: "/downloads" },
      { label: "Esports hub", href: "/esports" },
      { label: "Community", href: "/community" },
      { label: "Studios", href: "/studios" },
      { label: "Newsroom", href: "/news" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "/support" },
      { label: "Account & security", href: "/support/account-and-security" },
      { label: "Payments & refunds", href: "/support/payments-and-refunds" },
      { label: "Launcher troubleshooting", href: "/support/launcher-troubleshooting" },
      { label: "Contact us", href: "/contact" },
      { label: "Accessibility", href: "/support/accessibility" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Partners", href: "/contact" },
      { label: "Media & press", href: "/contact" },
      { label: "Privacy", href: "/support/privacy" },
      { label: "Terms of use", href: "/support/terms" },
    ],
  },
];

/**
 * Social destinations. Per the INFINITY brief these appear in the footer only —
 * never in the top bar, navbar, hero, cards or dashboard surfaces.
 */
export const SOCIAL_LINKS: { label: string; href: string; icon: string }[] = [
  { label: "Discord", href: "https://discord.com", icon: "discord" },
  { label: "YouTube", href: "https://www.youtube.com", icon: "youtube" },
  { label: "X", href: "https://x.com", icon: "x" },
  { label: "Twitch", href: "https://www.twitch.tv", icon: "twitch" },
  { label: "Instagram", href: "https://www.instagram.com", icon: "instagram" },
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
