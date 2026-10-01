import type { ReactNode } from "react";
import clsx from "clsx";
import { CarouselArrows } from "./interactive";

/* ===========================================================================
 * Carousel — a horizontal snap rail
 * ---------------------------------------------------------------------------
 * Deliberately a SERVER component. It used to be a client island, which meant
 * React had to serialise every fully-rendered card inside it into the RSC
 * payload a second time (~20KB per card), so a page with two rails shipped
 * hundreds of kilobytes of duplicate markup — slow on a phone and large
 * enough to time out the static deploy.
 *
 * The scroller itself needs no JavaScript (native touch + trackpad scrolling,
 * plus CSS scroll-snap), so only the desktop arrow buttons are a client island
 * (`CarouselArrows`), and they are a SIBLING of the children rather than a
 * parent — so no rendered card is ever handed across a client boundary.
 * ======================================================================== */

export function Carousel({
  children,
  className,
  id,
  step = 320,
  ariaLabel = "carousel",
}: {
  children: ReactNode;
  className?: string;
  /** Set an id to enable the desktop arrow buttons. */
  id?: string;
  step?: number;
  ariaLabel?: string;
}) {
  return (
    <div className={clsx("group/carousel relative", className)}>
      <div
        id={id}
        aria-label={ariaLabel}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth py-1.5 sm:gap-4"
      >
        {children}
      </div>
      {id ? <CarouselArrows targetId={id} step={step} /> : null}
    </div>
  );
}

export function CarouselItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("shrink-0 snap-start", className)}>{children}</div>;
}