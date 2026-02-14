import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Checker Tool: Free AEO Checking Tool",
  description:
    "Use a free AEO checker tool to analyze your website for AI search visibility. View a sample AEO checking tool report with technical, content, and authority scoring.",
  path: "/aeo-checker-tool",
  keywords: [
    "AEO checker tool",
    "AEO checking tool",
    "AEO checking tools",
    "free AEO checker",
    "answer engine optimization tool",
    "AEO sample report",
    "AI search visibility audit",
  ],
});

export default function AeoCheckerToolPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AEO Checker Tool",
    "url": absoluteUrl("/aeo-checker-tool"),
    "description":
      "Free AEO checker tool for technical, content, and authority analysis across AI answer engines.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Checker Tool</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Run a free AEO checking tool audit and identify what is blocking your visibility in AI-generated answers.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg leading-relaxed">
            This free AEO checker tool gives you a practical sample report showing how answer engine optimization is measured across technical setup, content structure, and authority signals.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-serif text-2xl text-[#224034] mb-3">What the sample report shows</h2>
              <ul className="space-y-3 list-disc pl-6 text-sm leading-relaxed">
                <li>Technical checks for crawlability, indexability, and machine-readable structure</li>
                <li>Content checks for clear question-answer formatting and intent match</li>
                <li>Trust checks for citation readiness, expertise signals, and authority depth</li>
              </ul>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-serif text-2xl text-[#224034] mb-3">Why this AEO checking tool matters</h2>
              <p className="text-sm leading-relaxed mb-3">
                AI answer engines choose sources quickly. A detailed AEO checking tool report helps your team identify which improvements can lift AI search visibility the fastest.
              </p>
              <p className="text-sm leading-relaxed">
                Instead of generic SEO advice, you get an answer engine optimization workflow focused on fixes that improve citation potential.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[#224034] mb-8 text-center">How scoring works in this AEO checker tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">Technical Readiness</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Measures robots rules, sitemap quality, schema implementation, and site accessibility for answer engines.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">Content Readability</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Reviews how well pages provide direct answers, semantic context, and structured content that LLMs can parse.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">Authority Signals</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Evaluates credibility markers and trust elements that influence whether your domain is cited in AI-generated answers.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="font-serif text-3xl text-[#224034] mb-5">Who should use this free AEO checker tool</h2>
          <ul className="space-y-3 list-disc pl-6 text-slate-700 leading-relaxed mb-8">
            <li>Marketing teams validating answer engine optimization strategy</li>
            <li>SEO teams building a repeatable AEO readiness program</li>
            <li>Content teams improving citation quality for AI search experiences</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/#pricing">Start Free Audit</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/aeo-readiness">Learn AEO Readiness</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/aeo-monitoring">Learn AEO Monitoring</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
