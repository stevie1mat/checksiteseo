import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Readiness Check Guide",
  description:
    "Learn how to run an AEO readiness check and improve answer engine optimization with technical, content, and trust updates for AI search.",
  path: "/aeo-readiness",
  keywords: [
    "AEO readiness",
    "AEO readiness check",
    "answer engine readiness",
    "AI search readiness",
    "answer engine optimization readiness",
    "AI citation readiness",
  ],
});

export default function AeoReadinessPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AEO Readiness Guide",
    "url": absoluteUrl("/aeo-readiness"),
    "description":
      "A practical guide to improving AEO readiness for AI search and answer engines.",
    "inLanguage": "en-US",
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Navbar />

      <section className="bg-[#224034] text-white pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Readiness</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            AEO readiness is how prepared your site is to be selected and cited by answer engines.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg leading-relaxed">
            A strong AEO readiness score means your pages are technically accessible, semantically clear, and trustworthy enough for AI systems to reference in answers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-serif text-2xl text-[#224034] mb-3">What is an AEO readiness check?</h2>
              <p className="text-sm leading-relaxed">
                An AEO readiness check evaluates how well your site supports answer engine optimization through crawlability, schema, direct-answer formatting, and trust cues.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-serif text-2xl text-[#224034] mb-3">Why AEO readiness matters</h2>
              <p className="text-sm leading-relaxed">
                AI search platforms do not rank pages exactly like traditional search engines. AEO readiness helps ensure your content can be selected, summarized, and cited accurately.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[#224034] mb-8 text-center">AEO readiness checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">Technical</p>
              <ul className="space-y-2 list-disc pl-5 text-sm leading-relaxed">
                <li>Clean robots and sitemap configuration</li>
                <li>Reliable page rendering and fast response time</li>
                <li>Valid structured data for key page types</li>
              </ul>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">Content</p>
              <ul className="space-y-2 list-disc pl-5 text-sm leading-relaxed">
                <li>Clear question and answer structure</li>
                <li>Intent-focused headings and concise summaries</li>
                <li>Up-to-date facts with strong internal linking</li>
              </ul>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">Authority</p>
              <ul className="space-y-2 list-disc pl-5 text-sm leading-relaxed">
                <li>Visible expertise and source credibility</li>
                <li>Trust pages and editorial transparency</li>
                <li>Consistent brand and entity signals</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="font-serif text-3xl text-[#224034] mb-5">How to improve AEO readiness quickly</h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            Start with high-impact pages, run a baseline audit, and use AEO monitoring to validate that each update improves answer visibility over time.
          </p>
          <ul className="space-y-3 list-disc pl-6 text-slate-700 leading-relaxed mb-8">
            <li>Fix technical blockers first so answer engines can access and interpret content</li>
            <li>Rewrite weak sections into direct, source-backed answers</li>
            <li>Track weekly score movement to confirm sustained answer engine readiness</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/aeo-checker-tool">Run AEO Readiness Audit</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/aeo-monitoring">Track AEO Monitoring</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
