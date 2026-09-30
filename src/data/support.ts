/* ===========================================================================
 * Support documents — the four policy pages the footer links to.
 * ---------------------------------------------------------------------------
 * Kept out of the route file so the page component stays small and the copy is
 * editable in one place. Every claim here describes what this deployment
 * actually does rather than what a live service might do.
 * ======================================================================== */

export interface SupportDoc {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

export const SUPPORT_DOCS: SupportDoc[] = [
  {
    slug: "terms",
    title: "Terms of use",
    eyebrow: "Legal",
    intro:
      "INFINITY is a demonstration catalogue. These terms describe what this deployment actually does, which is deliberately less than a live service would.",
    sections: [
      {
        heading: "What this site is",
        body: [
          "INFINITY is a static export of a game discovery and commerce interface. It presents a generated catalogue of titles, studio and platform records, news articles and community listings.",
          "Every price, rating and release date shown is derived deterministically from a catalogue snapshot shipped with the build. Nothing here is a live feed from a publisher or storefront.",
        ],
      },
      {
        heading: "No transactions",
        body: [
          "The cart is a local demonstration. No payment is processed, no order is placed, and no card details are requested at any point. Cart and wishlist contents live in your browser's local storage.",
          "Links to official storefronts take you to third-party sites with their own terms. INFINITY does not host game files and does not participate in any transaction that happens there.",
        ],
      },
      {
        heading: "Trademarks",
        body: [
          "Game titles, studio names, platform names and logos are the property of their respective owners. Their appearance here is nominative — for identification and cataloguing — and implies no endorsement or affiliation.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy",
    eyebrow: "Legal",
    intro:
      "This build collects nothing. That is not a promise about a future service — it is a description of what the code in this repository does.",
    sections: [
      {
        heading: "What is stored",
        body: [
          "Your wishlist, cart, comparison set, recently viewed titles and demo session are written to your browser's local storage under the key infinity-player-v1. They never leave your device.",
          "Clearing site data for INFINITY removes all of it permanently. There is no server-side copy to restore from.",
        ],
      },
      {
        heading: "What is sent",
        body: [
          "No analytics, no tracking pixels, no third-party scripts and no advertising identifiers are present in this build. The only outbound requests are for catalogue artwork.",
        ],
      },
      {
        heading: "Server-side routes",
        body: [
          "This deployment runs as a static export and contains no route handlers. On a Node deployment the repository also includes cart validation and newsletter endpoints; the frontend skips them entirely when NEXT_PUBLIC_STATIC is set, so no request is ever attempted against a handler that does not exist.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookies",
    eyebrow: "Legal",
    intro:
      "INFINITY sets no cookies. It uses local storage instead, which behaves similarly but is never transmitted to a server with a request.",
    sections: [
      {
        heading: "No cookies, no consent banner",
        body: [
          "There is no cookie banner on this site because there is nothing to consent to. No first-party or third-party cookie is written, read or transmitted.",
        ],
      },
      {
        heading: "Local storage instead",
        body: [
          "A single key, infinity-player-v1, holds your saved state. It is readable only by scripts served from this origin, is never attached to an outgoing request, and expires when you clear site data.",
        ],
      },
    ],
  },
  {
    slug: "account-and-security",
    title: "Account & security",
    eyebrow: "Help centre",
    intro:
      "How the demo session works, what it can and cannot do, and why there is no password to reset.",
    sections: [
      {
        heading: "There is no account server",
        body: [
          "Signing in on this build sets a name and role in your browser's local storage. No credentials are checked, no token is issued, and nothing is sent to a server — so there is no password to forget or reset.",
          "Signing out clears the session from this device only. Clearing site data removes it entirely.",
        ],
      },
      {
        heading: "What the session can reach",
        body: [
          "A session is what unlocks the dashboard tiles and the notification feed. It grants no capability the signed-out visitor does not already have, because all of that state is local anyway.",
          "Because the session is a client-side flag, anyone with access to this browser profile can start one. Treat it as a UI preference, not as an authentication boundary.",
        ],
      },
      {
        heading: "Protecting your data",
        body: [
          "Your wishlist and cart are readable by any script served from this origin. On a shared or public device, clear site data for INFINITY before you leave.",
        ],
      },
    ],
  },
  {
    slug: "payments-and-refunds",
    title: "Payments & refunds",
    eyebrow: "Help centre",
    intro:
      "No payment is taken anywhere on this site, so there is nothing to refund. Here is what happens to the numbers you see instead.",
    sections: [
      {
        heading: "No payment is processed",
        body: [
          "Adding a title to your cart, changing a quantity and reaching the totals screen are all local operations. No card form exists on this site, and no payment provider is contacted.",
        ],
      },
      {
        heading: "Where the prices come from",
        body: [
          "Every figure is computed at build time from the catalogue snapshot using discountedPrice, the same function the cart and the deals page both call. The displayed total is therefore internally consistent, but it is not a quotation from any store.",
        ],
      },
      {
        heading: "If you buy elsewhere",
        body: [
          "Purchases made on a third-party storefront are governed entirely by that store's refund policy. INFINITY is not party to those transactions and cannot issue refunds.",
        ],
      },
    ],
  },
  {
    slug: "launcher-troubleshooting",
    title: "Launcher troubleshooting",
    eyebrow: "Help centre",
    intro:
      "The launcher page on this build is a description of a client, not a working installer. There is nothing to download or repair.",
    sections: [
      {
        heading: "No builds are published",
        body: [
          "Download buttons for the desktop launcher are intentionally disabled on this deployment. No binaries exist to serve, so offering a download would be a link to nowhere.",
        ],
      },
      {
        heading: "The app is not connected",
        body: [
          "There is no pairing flow, no local daemon and no progress reporting. Anything on the launcher page describing sync, queueing or library import describes the product's design, not live behaviour.",
        ],
      },
      {
        heading: "State that does persist",
        body: [
          "What does work is the browser state: your wishlist, cart, comparison set and session are stored locally and restored on the next visit. Clearing site data is the only 'reset' available.",
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    eyebrow: "Standards",
    intro:
      "INFINITY targets WCAG 2.1 AA. The mobile shell in particular was designed around touch input rather than adapted from a desktop layout afterwards.",
    sections: [
      {
        heading: "Touch and target size",
        body: [
          "Every interactive control on a phone is at least 44 by 44 pixels, including the header icons, the bottom navigation tabs and the quantity steppers in the cart.",
          "The hero carousel uses a 44px horizontal swipe threshold with touch-pan-y, so a horizontal swipe advances a slide while a vertical one still scrolls the page.",
        ],
      },
      {
        heading: "Keyboard and screen readers",
        body: [
          "Icon-only buttons carry descriptive aria-labels, the bottom navigation marks the active tab with aria-current, and the hero exposes previous/next controls rather than swipe alone.",
          "Focus rings are never removed without a visible replacement, and content order in the DOM matches the visual order at every breakpoint.",
        ],
      },
      {
        heading: "Safe areas and contrast",
        body: [
          "Layout respects env(safe-area-inset-*), so nothing hides behind a notch or a home indicator on notched devices. Text meets AA contrast against its background in both the default and accent themes.",
        ],
      },
      {
        heading: "Reporting a problem",
        body: [
          "This is a demonstration build with no support inbox. Any accessibility defect in the code is a bug in the repository and should be fixed at the source rather than reported to a team.",
        ],
      },
    ],
  },
];

/** Look up a single document by slug. */
export function getSupportDoc(slug: string): SupportDoc | undefined {
  return SUPPORT_DOCS.find((doc) => doc.slug === slug);
}

/**
 * The support index groups documents by their eyebrow, so the help centre and
 * the legal pages stay in one list but read as two distinct sections.
 */
export const SUPPORT_GROUPS: { title: string; blurb: string; docs: SupportDoc[] }[] = [
  {
    title: "Help centre",
    blurb: "How this build actually behaves, and where its limits are.",
    docs: SUPPORT_DOCS.filter((doc) => doc.eyebrow === "Help centre"),
  },
  {
    title: "Legal & standards",
    blurb: "The terms, data handling and accessibility position for this deployment.",
    docs: SUPPORT_DOCS.filter((doc) => doc.eyebrow !== "Help centre"),
  },
];