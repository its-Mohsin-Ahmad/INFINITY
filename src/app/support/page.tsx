/* ===========================================================================
 * /support — the help centre index.
 * ---------------------------------------------------------------------------
 * The nav and footer both point at /support, so it lists every document in
 * SUPPORT_DOCS grouped into help-centre topics and legal pages. Fully static:
 * the list is derived from the same data the [slug] route renders.
 * ======================================================================== */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SUPPORT_GROUPS, SUPPORT_DOCS } from "@/data/support";
import { Breadcrumbs, Panel, Stat } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Help centre and legal documents for INFINITY — how this build handles your account, payments, the launcher, and the data it stores.",
};

export default function SupportIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Help centre"
        title={
          <>
            Support &
            <br />
            documentation
          </>
        }
        description="Everything INFINITY can honestly tell you about itself. Each page describes what this deployment actually does, including the parts that are deliberately switched off."
        tone="accent"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(SUPPORT_DOCS.length)} label="Documents" />
          <Stat value={String(SUPPORT_GROUPS.length)} label="Sections" />
          <Stat value="0" label="Trackers" tone="accent" />
          <Stat value="Local" label="Data storage" />
        </div>
      </PageHero>

      <div className="shell space-y-10 py-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Support" }]} />

        {SUPPORT_GROUPS.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <div className="mb-5">
              <p className="eyebrow mb-2">{group.docs.length} documents</p>
              <h2 className="h-display text-2xl sm:text-3xl">{group.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-ink-secondary">{group.blurb}</p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.docs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/support/${doc.slug}`}
                    className="group flex h-full flex-col justify-between gap-3 border border-line bg-bg-card/60 p-5 transition hover:-translate-y-0.5 hover:border-accent/60"
                  >
                    <div>
                      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
                        {doc.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-secondary">
                        {doc.intro}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 font-display text-2xs font-bold uppercase tracking-[0.14em] text-accent">
                      Read
                      <ArrowRight
                        className="h-3 w-3 transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <Panel title="Still stuck?">
          <p className="text-sm leading-relaxed text-ink-secondary">
            This is a demonstration build with no support inbox, so there is no address to write to. If
            something here is wrong, the honest fix is a pull request against the repository — every page
            on this site is generated from source you can read.
          </p>
        </Panel>
      </div>
    </>
  );
}