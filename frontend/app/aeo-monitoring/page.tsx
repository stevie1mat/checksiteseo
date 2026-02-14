import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Monitoring for AI Search Performance",
  description:
    "Track AEO monitoring metrics over time and detect drops in answer visibility, technical health, and trust signals across AI search.",
  path: "/aeo-monitoring",
  keywords: [
    "AEO monitoring",
    "AEO monitor",
    "answer engine monitoring",
    "AI search monitoring",
    "answer engine optimization monitoring",
    "AI citation monitoring",
  ],
});

export default function AeoMonitoringPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AEO Monitoring",
    "url": absoluteUrl("/aeo-monitoring"),
    "description":
      "Continuous AEO monitoring for answer engine visibility, content quality, and technical reliability.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Monitoring</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Monitor your AEO performance and catch regressions before they reduce AI search visibility.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg leading-relaxed">
            AEO monitoring helps you track score movement, identify what changed, and prevent technical or content regressions from reducing AI search visibility.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-serif text-2xl text-[#224034] mb-3">What AEO monitoring tracks</h2>
              <ul className="space-y-2 list-disc pl-5 text-sm leading-relaxed">
                <li>Technical drift in crawlability, schema, and indexing signals</li>
                <li>Content quality movement across your top answer pages</li>
                <li>Authority and trust changes that affect citation likelihood</li>
              </ul>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-serif text-2xl text-[#224034] mb-3">Why consistent monitoring matters</h2>
              <p className="text-sm leading-relaxed mb-3">
                Answer engine optimization is not one-and-done. New content, template edits, and technical changes can silently impact visibility in AI-generated answers.
              </p>
              <p className="text-sm leading-relaxed">
                Continuous AEO monitoring gives your team early warning signals and a reliable feedback loop for improvement.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[#224034] mb-8 text-center">Recommended AEO monitoring workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">1. Baseline</p>
              <p className="text-sm leading-relaxed">
                Run an initial AEO checker tool scan on key pages and document current performance by category.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">2. Track</p>
              <p className="text-sm leading-relaxed">
                Monitor weekly changes in technical, content, and authority signals to catch regressions early.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">3. Improve</p>
              <p className="text-sm leading-relaxed">
                Prioritize high-impact fixes and re-scan to confirm improvements in answer engine monitoring metrics.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="font-serif text-3xl text-[#224034] mb-5">Set alerts for these AEO monitoring signals</h2>
          <ul className="space-y-3 list-disc pl-6 text-slate-700 leading-relaxed mb-8">
            <li>Large drops in technical readiness across critical templates</li>
            <li>Declining answer quality on high-intent pages</li>
            <li>Authority score movement after major content or branding updates</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/aeo-checker-tool">Start Monitoring with a Baseline Scan</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/aeo-readiness">Improve AEO Readiness</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
