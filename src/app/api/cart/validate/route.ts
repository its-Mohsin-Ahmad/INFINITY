import { NextResponse } from "next/server";
import { PLATFORM_MAP } from "@/data/taxonomy";
import { getGame } from "@/lib/catalogue";
import { quoteCartLine } from "@/lib/commerce/cart-line";

/* ===========================================================================
 * POST /api/cart/validate
 * ---------------------------------------------------------------------------
 * Server-authoritative pricing for Node/server deployments.
 *
 * The browser only ever sends *intent* — a slug and an optional platform. The
 * unit price, discount and availability are resolved here from the verified
 * catalogue, so a tampered client can never invent its own price.
 *
 * NOTE: GitHub Pages cannot host route handlers, so the static build parks
 * `src/app/api` (see `scripts/prepare-api.mjs`) and the browser falls back to
 * the identical rule in `@/lib/commerce/cart-line`.
 * ======================================================================== */

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed request body." }, { status: 400 });
  }

  const { slug, platform } = (payload ?? {}) as { slug?: unknown; platform?: unknown };

  if (typeof slug !== "string" || slug.trim().length === 0) {
    return NextResponse.json({ ok: false, message: "A game slug is required." }, { status: 400 });
  }

  const game = getGame(slug.trim().toLowerCase());
  if (!game) {
    return NextResponse.json(
      { ok: false, message: "That title is not in the INFINITY catalogue." },
      { status: 404 },
    );
  }

  if (game.isComingSoon) {
    return NextResponse.json(
      { ok: false, message: `${game.title} is not on sale yet — wishlist it instead.` },
      { status: 409 },
    );
  }

  let platformSlug: string | null = null;
  if (platform !== null && platform !== undefined && platform !== "") {
    if (typeof platform !== "string" || !PLATFORM_MAP[platform]) {
      return NextResponse.json({ ok: false, message: "Unknown platform." }, { status: 400 });
    }
    if (!(game.platforms as string[]).includes(platform)) {
      return NextResponse.json(
        { ok: false, message: `${game.title} is not released on ${PLATFORM_MAP[platform].name}.` },
        { status: 409 },
      );
    }
    platformSlug = platform;
  }

  const quote = quoteCartLine(game, platformSlug, platformSlug ? PLATFORM_MAP[platformSlug].name : undefined);

  if (!quote.ok) {
    return NextResponse.json({ ok: false, message: quote.message }, { status: quote.status });
  }

  return NextResponse.json({
    ok: true,
    line: { unitPrice: quote.unitPrice, discount: quote.discount },
    slug: game.slug,
    title: game.title,
    platform: platformSlug,
    currency: game.currency,
  });
}
