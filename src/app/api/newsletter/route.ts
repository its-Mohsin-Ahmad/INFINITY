import { NextResponse } from "next/server";

/* ===========================================================================
 * POST /api/newsletter
 * ---------------------------------------------------------------------------
 * Weekly drop report signup: new releases, verified deals, patch notes and
 * esports results.
 *
 * NOTE: `SUBSCRIBERS` is an in-process registry so the endpoint behaves
 * realistically in this build. Swap the Set for the CRM/database adapter when
 * the persistence layer is wired in — nothing else needs to change.
 * ======================================================================== */

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const SUBSCRIBERS = new Set<string>();

function normalise(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed request body." }, { status: 400 });
  }

  const { email } = (payload ?? {}) as { email?: unknown };

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return NextResponse.json(
      { ok: false, message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const key = normalise(email);

  if (SUBSCRIBERS.has(key)) {
    return NextResponse.json({
      ok: true,
      alreadySubscribed: true,
      message: "You are already on the list.",
    });
  }

  SUBSCRIBERS.add(key);

  return NextResponse.json({
    ok: true,
    alreadySubscribed: false,
    message: "Subscribed. The next drop report lands on Friday.",
  });
}

/** Lightweight status endpoint used by the footer to show current reach. */
export async function GET() {
  return NextResponse.json({ count: SUBSCRIBERS.size });
}
