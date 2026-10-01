"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BrowseTabs } from "@/components/browse/browse-tabs";

/* ===========================================================================
 * Interactive building blocks (client components)
 * ======================================================================== */

export function Carousel({
  children,
  className,
  step = 320,
  ariaLabel = "carousel",
}: {
  children: ReactNode;
  className?: string;
  step?: number;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
  }, []);

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className={clsx("group/carousel relative", className)}>
      <div
        ref={ref}
        onScroll={update}
        aria-label={ariaLabel}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth py-1.5 sm:gap-4"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        disabled={atStart}
        className="absolute -left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-line bg-bg-deep/90 text-white backdrop-blur transition hover:border-accent hover:bg-accent disabled:opacity-0 lg:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        disabled={atEnd}
        className="absolute -right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-line bg-bg-deep/90 text-white backdrop-blur transition hover:border-accent hover:bg-accent disabled:opacity-0 lg:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export function CarouselItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("shrink-0 snap-start", className)}>{children}</div>;
}

/**
 * Detail-page tabs. Delegates to BrowseTabs so every tab surface in the app
 * shares one implementation (URL sync, per-tab panel keys, roving tabindex)
 * instead of two copies that can drift apart.
 */
export function Tabs({
  tabs,
  initial = 0,
  className,
  panelClassName,
}: {
  tabs: { id: string; label: string; content: ReactNode; badge?: string }[];
  initial?: number;
  className?: string;
  panelClassName?: string;
}) {
  return <BrowseTabs tabs={tabs} initial={initial} className={className} panelClassName={panelClassName} />;
}

export function Accordion({
  items,
  className,
}: {
  items: { id: string; title: string; content: ReactNode; meta?: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <div className={clsx("divide-y divide-line overflow-hidden border border-line", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-bg-card/50"
            >
              <span className="font-display text-sm font-bold uppercase tracking-[0.1em] text-white">
                {item.title}
              </span>
              <span className="flex items-center gap-3">
                {item.meta ? (
                  <span className="text-2xs uppercase tracking-wider text-ink-muted">{item.meta}</span>
                ) : null}
                <span className={clsx("text-accent transition-transform", isOpen && "rotate-45")}>+</span>
              </span>
            </button>
            {isOpen ? (
              <div className="animate-slide-down px-5 pb-5 text-sm text-ink-secondary">{item.content}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function Countdown({ to, label = "Launching in" }: { to: string; label?: string }) {
  const target = new Date(to).getTime();
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const cells = [
    { value: Math.floor(remaining / 86_400_000), unit: "Days" },
    { value: Math.floor((remaining % 86_400_000) / 3_600_000), unit: "Hrs" },
    { value: Math.floor((remaining % 3_600_000) / 60_000), unit: "Min" },
    { value: Math.floor((remaining % 60_000) / 1000), unit: "Sec" },
  ];

  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="flex gap-2">
        {cells.map((c) => (
          <div key={c.unit} className="min-w-[58px] border border-line bg-bg-deep/80 px-3 py-2 text-center">
            <p className="font-display text-xl font-extrabold tabular-nums text-white">
              {String(c.value).padStart(2, "0")}
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">{c.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = "accent",
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: "accent" | "muted";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label ? (
        <div className="mb-1 flex items-center justify-between text-2xs uppercase tracking-wider text-ink-muted">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div className="h-1.5 w-full overflow-hidden rounded-control bg-bg-muted">
        <div
          className={clsx("h-full transition-all duration-700", tone === "accent" ? "bg-accent" : "bg-line-strong")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 9,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center overflow-hidden border border-line">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-2.5 py-2 text-ink-secondary transition hover:bg-bg-muted hover:text-white"
      >
        −
      </button>
      <span className="min-w-[38px] px-2 py-2 text-center font-display text-sm font-bold tabular-nums text-white">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-2.5 py-2 text-ink-secondary transition hover:bg-bg-muted hover:text-white"
      >
        +
      </button>
    </div>
  );
}

