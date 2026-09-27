"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, X } from "lucide-react";
import { usePlayer } from "@/lib/store/player-store";

/* ===========================================================================
 * Compare tray
 * ---------------------------------------------------------------------------
 * A persistent bottom dock for the comparison set (max 4). Hidden while the
 * user is already on the compare page so it never stacks on top of itself.
 * ======================================================================== */

function prettify(slug: string) {
  return slug
    .split("-")
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(" ");
}

export function CompareTray() {
  const compare = usePlayer((s) => s.compare);
  const toggle = usePlayer((s) => s.toggleCompare);
  const clear = usePlayer((s) => s.clearCompare);
  const pathname = usePathname();

  if (!compare.length || pathname?.startsWith("/compare")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-bg-nav/95 backdrop-blur">
      <div className="shell flex flex-wrap items-center gap-3 py-3">
        <span className="flex items-center gap-2 font-display text-2xs font-bold uppercase tracking-[0.16em] text-white">
          <Scale className="h-4 w-4 text-accent" />
          Compare ({compare.length}/4)
        </span>

        <ul className="flex flex-1 flex-wrap items-center gap-2">
          {compare.map((slug) => (
            <li key={slug}>
              <button
                type="button"
                onClick={() => toggle(slug)}
                className="group flex items-center gap-2 border border-line bg-bg-card/70 px-3 py-1.5 text-xs text-ink-secondary transition hover:border-accent hover:text-white"
              >
                {prettify(slug)}
                <X className="h-3 w-3 text-ink-muted transition group-hover:text-accent" />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="border border-line px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted transition hover:border-accent hover:text-white"
          >
            Clear
          </button>
          <Link
            href="/compare"
            className="bg-accent px-4 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-accent-bright"
          >
            Compare now
          </Link>
        </div>
      </div>
    </div>
  );
}
