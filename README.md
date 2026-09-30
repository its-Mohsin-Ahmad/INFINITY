# INFINITY

**ONE UNIVERSE. INFINITE GAMES.**

A production-grade gaming ecosystem — discovery, commerce, community, esports and
launching — built on a verified catalogue of **540 games**, **8,189 media items**,
**89 genre lanes**, **8 platforms** and **334 studios**.

[![Deploy to GitHub Pages](https://github.com/its-Mohsin-Ahmad/INFINITY/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/its-Mohsin-Ahmad/INFINITY/actions/workflows/deploy-pages.yml)
![Next.js](https://img.shields.io/badge/Next.js-15-000?logo=next.js)
![React](https://img.shields.io/badge/React-19-087ea4?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

**Live site:** <https://its-mohsin-ahmad.github.io/INFINITY/>

---

## Table of contents

- [Highlights](#highlights)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Two build targets](#two-build-targets)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Project structure](#project-structure)
- [Data integrity](#data-integrity)
- [Design notes & limitations](#design-notes--limitations)

---

## Highlights

| Area | What ships |
| --- | --- |
| **Discovery** | Hero carousel, trending / new / free / coming-soon rows, genre lanes, platform lanes, tag and facet search |
| **Detail pages** | `/games/[slug]` with generated key art, screenshots, official videos, per-platform controls, beginner guides, advanced tips, system requirements, store links, similar games and a recently-viewed rail |
| **Commerce** | Wishlist, compare tray, cart with **server-authoritative pricing**, discounts, toasts, membership/promo surfaces |
| **Ecosystem** | INFINITY Launcher, Game Pass, Esports hub, Community pillars surfaced across the shell |
| **Player state** | Zustand store persisted to `localStorage` — wishlist, cart, compare, history, toasts, newsletter opt-in |
| **Data** | 540 deterministic games with guides, controls, requirements, media, analytics counters and official store links |
| **Art** | 100% original deterministic SVG key-art engine (posters, wide, hero, thumb, banner) — nothing scraped or hotlinked |

---

## Stack

- **Next.js 15** (App Router, RSC, route handlers)
- **React 19**
- **TypeScript 5.7** (strict)
- **Tailwind CSS 3** — dark navy/red identity (`#020B14`, `#E5092F`)
- **Zustand 5** — persisted player store
- **lucide-react** — iconography
- No database: the catalogue is a deterministic, build-time dataset.

---

## Getting started

```bash
git clone https://github.com/its-Mohsin-Ahmad/INFINITY.git
cd INFINITY
npm install
npm run dev          # http://localhost:3000
```

Requirements: **Node.js >= 20.9**.

---

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (restores the `/api` routes first) |
| `npm run build` | Production **server** build → `npm start` |
| `npm run build:static` | **Static export** for GitHub Pages → `./out` |
| `npm run deploy:pages` | Static export **and** publish it to the `gh-pages` branch |
| `npm start` | Serve the server build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify` | Deterministic catalogue verification (fails on any data regression) |

---

## Two build targets

INFINITY compiles in two modes, selected by `NEXT_OUTPUT`:

### 1. Server build (default) — `npm run build`

- Route handlers are compiled: `POST /api/cart/validate`, `POST /api/newsletter`.
- Cart prices are resolved **on the server** from the verified catalogue, so a
  tampered client cannot invent its own price.
- Security headers, image optimisation and ISR-style on-demand rendering are available.
- Best for Vercel, a VPS, or any Node host.

### 2. Static export — `npm run build:static`

- Sets `output: "export"`, `trailingSlash: true`, `basePath: "/INFINITY"` and
  `images.unoptimized`.
- `scripts/prepare-api.mjs` **parks** `src/app/api` (it moves the folder to
  `.api-parked/`, it never edits it) because GitHub Pages has no server runtime.
- `NEXT_PUBLIC_STATIC=1` is inlined into the client bundle, so `AddToCartButton`
  and `NewsletterForm` skip the network and use the identical pricing rule from
  `src/lib/commerce/cart-line.ts` against the catalogue values already rendered
  into the page.
- Output lands in `./out` and can be published to any static host.

> Running `npm run dev` or `npm run build` after `npm run build:static` restores
> `src/app/api` automatically.

---

## Deploying to GitHub Pages

The site is live at **<https://its-mohsin-ahmad.github.io/INFINITY/>**.

There are two deployment paths. Both build the same `./out` bundle.

### A. Branch deploy (no extra permissions) — current setup

```bash
npm run deploy:pages     # static export + publish ./out to the gh-pages branch
```

`scripts/deploy-pages.mjs` creates a fresh orphan history in `./out` and
force-pushes it to `gh-pages`, so the branch never accumulates old builds. The
repository's Pages source is set to that branch (Settings → Pages → Source:
*Deploy from a branch* → `gh-pages` / `/ (root)`).

> Rebuilds are needed for catalogue or design changes — the branch deploy has no
> runtime, so a rebuild is the only way to publish.

### B. GitHub Actions (recommended once the token allows it)

`.github/workflows/deploy-pages.yml` builds and deploys on every push to `main`:

1. `npm ci`
2. `npm run typecheck`
3. `npm run verify` (catalogue must report 540 games / 8,189 media items)
4. `npm run build:static`
5. `touch out/.nojekyll`
6. Upload `./out` as the Pages artifact and deploy to the `github-pages` environment

**Why it is not active yet:** pushing a workflow file requires an OAuth token
with the `workflow` scope. Grant it once and the pipeline takes over:

```bash
gh auth refresh -h github.com -s workflow
```

Then commit the workflow and flip the Pages source back to *GitHub Actions*:

```bash
git add .github/workflows/deploy-pages.yml
git commit -m "ci: deploy to GitHub Pages on every push"
git push
gh api -X PUT repos/its-Mohsin-Ahmad/INFINITY/pages -f build_type=workflow
```

Watch a deployment:

```bash
gh run list --repo its-Mohsin-Ahmad/INFINITY
gh run watch --repo its-Mohsin-Ahmad/INFINITY
```

**Base path:** the export defaults to `basePath: "/INFINITY"`. To serve from a
user site or a custom domain instead, set `NEXT_PUBLIC_BASE_PATH=""` (user site)
in the deploy environment.

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx                 # shell, metadata, fonts, boot screen
│   ├── page.tsx                   # homepage composition
│   ├── globals.css                # Tailwind layers + component classes
│   ├── games/[slug]/page.tsx      # game detail (540 prerendered pages)
│   └── api/
│       ├── cart/validate/route.ts # server-authoritative pricing
│       └── newsletter/route.ts    # drop-report signup
├── components/
│   ├── art/GameArt.tsx            # deterministic SVG key-art engine
│   ├── game/                      # GameCard, GameListRow, GameMiniTile, grids/rows
│   ├── home/                      # HeroCarousel + homepage sections
│   ├── layout/                    # Header, MegaMenu, Drawer, Footer, CompareTray…
│   ├── player/                    # store actions, toasts, recently-viewed
│   └── ui/                        # primitives + interactive (carousel, tabs, …)
├── data/                          # authored game records + taxonomy
└── lib/
    ├── catalogue/                 # build, queries, guides, requirements, pools
    ├── commerce/cart-line.ts      # the one pricing rule (server + browser)
    ├── generate.ts                # seeded RNG / hashing helpers
    ├── nav.ts                     # PRIMARY_NAV + FOOTER_COLUMNS
    └── store/player-store.ts      # persisted player state
```

---

## Data integrity

`npm run verify` rebuilds the catalogue from the authored records and asserts the
invariants that every surface depends on:

- exactly 540 unique games (no duplicate slugs or titles)
- 8,189 media items (6,032 screenshots + 2,157 videos)
- 89 genre lanes, 8 platforms, 334 studios
- every game has guides, controls, requirements, availability and store links

The script exits non-zero on any regression, so it runs as a CI gate.

---

## Artwork

Visuals are served by `src/components/art/ArtImage.tsx`, which prefers real
photography and always has a generated fallback:

1. `npm run fetch:art` (`scripts/fetch-steam-art.mjs`) maps every catalogue
   title to a storefront app id, verifies which image assets actually resolve,
   and writes `src/data/steam-art.ts`. Matching accepts an exact title, or an
   exact title plus a known edition suffix (`Enhanced`, `The Complete Edition`,
   `Sunset Edition`, ...) peeled off the end - which is what catches
   re-releases like *Grand Theft Auto IV: The Complete Edition* while still
   refusing lookalikes such as *Minecraft* -> *Minecraft Dungeons*. Results are
   cached in `scripts/.steam-art-cache.json`; re-runs only retry the misses, and
   `npm run fetch:art -- --retry-missing` retries those explicitly.
2. `APP_ID_OVERRIDES` in the same script holds a short list of hand-verified app
   ids for titles the search endpoints handle badly. Every id there was looked
   up on the store and kept only when the app's own name and artwork matched;
   unverified guesses were deleted, because a wrong cover is worse than no
   cover. Titles whose only store match is a *different* game (e.g. *The Outer
   Worlds* searches to *The Outer Worlds 2*) are deliberately left out.
3. Titles that publish art on a hashed CDN path - newer releases such as *Call
   of Duty: Black Ops 6* - 404 on the predictable `library_*` URLs, so the
   resolver falls back to `api/appdetails` and stores the real URL.
4. The catalogue build fills `coverImage` (2:3 box art), `heroImage` (ultra-wide
   banner) and `headerImage` (landscape) from that index.
5. `ArtImage` renders the photo and swaps in the `GameArt` SVG engine when a
   title has no storefront release, when the image is blocked or offline, or when
   `STEAM_ART_ENABLED` in `src/data/steam-art.ts` is flipped to `false`.

Box art is hotlinked from the public storefront CDN, so it is never
redistributed, and every page still renders without it.

### Hero carousel

`heroGames()` in `src/lib/catalogue/query.ts` drives the homepage reel. The
order is hand-curated (`HERO_SLUGS`) rather than rating-sorted, so it leads with
the marquee open-world/adventure franchises, and any entry without a hero image
is skipped - a slide that silently falls back to generated art is a worse hero
than the next title on the list.

---

## Design notes & limitations

- **Artwork is real where it can be, generated where it cannot.** See
  [Artwork](#artwork) above for the resolver, the fallback and the kill switch.
  Titles with no PC storefront release - Nintendo and Sony exclusives, most
  mobile and free-to-play service games - keep the generated art by design;
  covering those with real photography needs a licensed provider (IGDB, RAWG)
  rather than a better search.
- **Static hosts cannot run route handlers.** On the Pages build, cart pricing
  falls back to the shared rule in the browser (see
  `src/lib/commerce/cart-line.ts`) and the newsletter opt-in is stored locally.
  Deploy the server build if you need genuine server-side validation.
- **No authentication or payments.** The sign-in flow writes a demo session to
  local storage and nothing else; the cart's Checkout button is disabled because
  no payment provider is wired up. See
  [`src/data/support.ts`](src/data/support.ts) for the user-facing wording.
- **Browse lanes are tabs, not routes.** `/games` carries the new / coming-soon /
  top-rated / free-to-play lanes as `?tab=` deep links rather than as separate
  pages, so every navigation entry resolves to a real prerendered file.
  `scripts/check-links.mjs` audits the exported `out/` tree to keep it that way.
- **Documented surfaces.** `/support` plus the `[slug]` documents cover terms,
  privacy, cookies, accessibility, account, payments and launcher behaviour.
- **Page weight.** Inline SVG key art makes the HTML larger than average; it
  compresses well, and the art variant per surface is deliberately capped.

---

## License

MIT — see the repository for details.
