"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ExternalLink, Play, X } from "lucide-react";
import type { Game, VideoAsset } from "@/lib/types";
import { ArtImage } from "@/components/art/ArtImage";

/* ===========================================================================
 * Trailer modal
 * ---------------------------------------------------------------------------
 * The hero never navigates away to play a trailer: this opens a cinematic
 * 16:9 stage over the page instead.
 *
 * The catalogue only links to official publisher channels, so a stream plays
 * in-modal when the CMS supplied an authorised `embedId`; otherwise the stage
 * shows the game's cinematic art and hands the viewer to the publisher's own
 * channel. INFINITY never hosts third-party video.
 * ======================================================================== */

type TrailerGame = Pick<
  Game,
  "slug" | "title" | "genre" | "accentHue" | "rating" | "coverImage" | "heroImage" | "headerImage" | "publisher"
>;

export function TrailerModal({
  game,
  videos,
  initialVideoId,
  onClose,
}: {
  game: TrailerGame;
  videos: VideoAsset[];
  initialVideoId?: string;
  onClose: () => void;
}) {
  const [activeId, setActiveId] = useState(initialVideoId ?? videos[0]?.id ?? "");
  const active = videos.find((v) => v.id === activeId) ?? videos[0];
  const closeRef = useRef<HTMLButtonElement>(null);

  // Stable handle on the latest close callback so the mount effect runs once.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
      onClick={() => close.current()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${game.title} trailer`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl border border-line bg-bg-deep shadow-panel"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="eyebrow">Trailer</p>
            <p className="mt-1 truncate font-display text-sm font-bold uppercase tracking-wide text-white">
              {active.title}
            </p>
            <p className="mt-0.5 text-2xs uppercase tracking-wider text-ink-muted">
              {active.channel} · {active.category.replace("-", " ")} · {active.duration}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => close.current()}
            aria-label="Close trailer"
            className="grid h-9 w-9 shrink-0 place-items-center border border-line text-white transition hover:border-accent hover:text-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* 16:9 cinematic stage */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {active.embedId ? (
            <iframe
              key={active.embedId}
              src={`https://www.youtube-nocookie.com/embed/${active.embedId}?rel=0&modestbranding=1&autoplay=1`}
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <>
              <ArtImage
                game={game}
                variant="wide"
                showTitle={false}
                eager
                className="h-full w-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/55 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-white/25 bg-bg-deep/70 backdrop-blur">
                  <Play className="h-5 w-5 fill-white text-white" />
                </span>
                <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
                  Official trailer
                </p>
                <a
                  href={active.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent px-6 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent-bright"
                >
                  Watch on {active.channel.replace(" (official)", "")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <p className="max-w-md text-2xs leading-relaxed text-ink-muted">
                  Streams play from the publisher's own channel — INFINITY links to official sources only.
                </p>
              </div>
            </>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setActiveId(video.id)}
              aria-pressed={video.id === active.id}
              className={clsx(
                "border px-3 py-1.5 font-display text-2xs font-bold uppercase tracking-[0.12em] transition",
                video.id === active.id
                  ? "border-accent bg-accent/15 text-white"
                  : "border-line text-ink-secondary hover:border-accent hover:text-white",
              )}
            >
              {video.category.replace("-", " ")}
            </button>
          ))}
          <a
            href={active.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 text-2xs uppercase tracking-[0.14em] text-ink-muted transition hover:text-accent"
          >
            {active.channel}
            <ExternalLink className="h-3 w-3" />
          </a>
        </footer>
      </div>
    </div>
  );
}

/** Trailer CTA that owns its own modal — usable from any homepage section. */
export function TrailerButton({
  game,
  videos,
  className,
  label = "Watch trailer",
  iconClassName,
}: {
  game: TrailerGame;
  videos: VideoAsset[];
  className?: string;
  label?: string;
  iconClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const trailer = videos.find((v) => v.category === "official-trailer") ?? videos[0];
  if (!trailer) return null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Play className={clsx("fill-current", iconClassName ?? "h-3.5 w-3.5")} />
        {label}
      </button>
      {open ? (
        <TrailerModal game={game} videos={videos} initialVideoId={trailer.id} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

