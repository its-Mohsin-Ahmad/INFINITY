/* ===========================================================================
 * /support/[slug] — the policy and help-centre documents the nav links to.
 * ---------------------------------------------------------------------------
 * One dynamic route over a single data list keeps every document in one place;
 * each is prerendered at build time so the static export emits real files
 * rather than 404s. Copy lives in `src/data/support.ts`.
 * ======================================================================== */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SUPPORT_DOCS, getSupportDoc } from "@/data/support";
import { Breadcrumbs, Panel } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/page-hero";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORT_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getSupportDoc(slug);
  return {
    title: doc?.title ?? "Support",
    description: doc?.intro,
  };
}

export default async function SupportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getSupportDoc(slug);
  if (!doc) notFound();

  return (
    <>
      <PageHero eyebrow={doc.eyebrow} title={doc.title} description={doc.intro} />

      <div className="shell py-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: doc.title }]} />

        <div className="mt-6 max-w-3xl space-y-4">
          {doc.sections.map((section) => (
            <Panel key={section.heading} title={section.heading} className="p-5 sm:p-6">
              <div className="space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink-secondary">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <p className="mt-8 text-sm">
          <Link href="/" className="text-accent transition hover:text-accent-bright">
            ← Back to the homepage
          </Link>
        </p>
      </div>
    </>
  );
}