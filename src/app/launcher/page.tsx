/* ===========================================================================
 * /launcher — the download surface for the one real product flow.
 * ---------------------------------------------------------------------------
 * Header CTA, drawer button and the empty-cart note all point here. Platforms
 * are listed as real cards but the download buttons are disabled on this build,
 * so no one waits on a file that will never arrive.
 * ======================================================================== */

import type { Metadata } from "next";
import { Apple, Gamepad2, HardDrive, Monitor, Smartphone, Terminal, Tv } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Panel, Stat } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Launcher",
  description:
    "The INFINITY launcher — one install, every platform, library sync and launch-from-desktop on Windows, macOS and Linux.",
};

const PLATFORMS = [
  { os: "Windows", icon: Monitor, note: "Windows 10 64-bit or newer", size: "84 MB" },
  { os: "macOS", icon: Apple, note: "Universal build, Apple silicon + Intel", size: "91 MB" },
  { os: "Linux", icon: Terminal, note: "AppImage, no install required", size: "88 MB" },
];

const FEATURES = [
  { icon: HardDrive, title: "One library, every drive", body: "Point the launcher at as many storage locations as you like and it indexes them once, at install time." },
  { icon: Smartphone, title: "Remote play from your phone", body: "Any title in your library streams to a phone or tablet over your own network — no cloud subscription." },
  { icon: Tv, title: "TV and handheld detection", body: "The launcher recognises a connected TV or handheld and switches to a controller-first, ten-foot interface." },
  { icon: Gamepad2, title: "Controller-first everywhere", body: "Every screen in the launcher is operable with a pad, including library search and settings." },
];

const STEPS = [
  "Install the launcher and let it index your existing libraries.",
  "Sign in with the same account you use on the web catalogue.",
  "Pick a storage location per platform — downloads resume across sessions.",
  "Launch anything from the desktop, a TV or a handheld from one window.",
];

export default function LauncherPage() {
  return (
    <>
      <PageHero
        eyebrow="INFINITY app"
        title={
          <>
            The launcher
            <br />
            for every platform
          </>
        }
        description="INFINITY is a single catalogue across 540 titles and 9 platforms. The launcher is the desktop client that keeps your library, downloads and cloud saves in one place."
        tone="accent"
      >
        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value="540" label="Titles indexed" />
          <Stat value="9" label="Platforms" />
          <Stat value="84 MB" label="Installer size" />
          <Stat value="Free" label="No account needed" tone="accent" />
        </div>
      </PageHero>

      <div className="shell space-y-12 py-10">
        <section aria-label="Downloads">
          <p className="eyebrow mb-2">Step one</p>
          <h2 className="h-display text-2xl sm:text-3xl">Download for your system</h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.os} className="flex flex-col border border-line bg-bg-card/60 p-5">
                  <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-base font-bold uppercase tracking-[0.1em] text-white">
                    {p.os}
                  </h3>
                  <p className="mt-1 text-xs text-ink-secondary">{p.note}</p>
                  <p className="mt-3 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                    {p.size}
                  </p>
                  <button
                    type="button"
                    disabled
                    className="mt-4 flex min-h-[48px] w-full cursor-not-allowed items-center justify-center border border-line px-4 font-display text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted"
                  >
                    Unavailable here
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-2xs text-ink-muted">
            This deployment is a static export, so the installer cannot be downloaded from this page.
            The buttons are intentionally disabled rather than pointing at a file that does not exist.
          </p>
        </section>

        <section aria-label="What the launcher does" className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-2">Step two</p>
            <h2 className="h-display text-2xl sm:text-3xl">Sign in and sync</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary">
              The launcher is the only part of INFINITY that needs an account. Sign in once and the
              library, wishlist and installed titles follow you between machines — including the
              static build you are reading now, which reads the same wishlist from this browser.
            </p>
          </div>
          <Panel className="p-6">
            <ol className="space-y-4 text-sm text-ink-secondary">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="font-display text-xs font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Panel>
        </section>

        <section aria-label="Launcher features">
          <h2 className="h-display text-2xl sm:text-3xl">Built for the couch and the desk</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex gap-4 border border-line bg-bg-card/60 p-5">
                  <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-xs font-bold uppercase tracking-[0.12em] text-white">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}