import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Grader: Free AEO Score Checker for AI Search",
  description:
    "Use our AEO grader to score your site for AI search visibility. Measure technical readiness, answer quality, and trust signals across major answer engines.",
  path: "/aeo-grader",
  keywords: [
    "AEO grader",
    "AEO score checker",
    "answer engine optimization grader",
    "AI search grader",
    "AEO score",
  ],
});

export default function AeoGraderPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AEO Grader",
    "url": absoluteUrl("/aeo-grader"),
    "description":
      "Grade your website for answer engine optimization with a score across technical, content, and authority dimensions.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Grader for AI Search Visibility</h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
            Get a quick AEO score for your site and see whether answer engines can crawl, understand, and trust your content enough to cite it.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg leading-relaxed">
            An AEO grader is the fastest way to benchmark your site before you dive into a full audit. It gives you a directional score across the signals that matter most for AI search: technical access, answer quality, and citation trust.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#224034] mb-3">Technical Score</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Grade robots directives, sitemap health, HTTPS, canonical consistency, and structured data so you know whether AI systems can access your content reliably.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#224034] mb-3">Content Score</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Measure clarity, direct-answer formatting, heading quality, and extractable passages that help LLMs summarize your content accurately.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#224034] mb-3">Trust Score</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Review the proof, transparency, and authority signals that increase the odds of your pages being used as sources in AI answers.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="font-serif text-3xl text-[#224034] mb-5">AEO grader vs full AEO audit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
            <article className="rounded-xl bg-slate-50 border border-slate-200 p-6">
              <h3 className="font-serif text-2xl text-[#224034] mb-3">Use a grader when you need a benchmark</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A grader is ideal for a quick baseline, weekly checks, or deciding which pages need deeper review first.
              </p>
            </article>
            <article className="rounded-xl bg-slate-50 border border-slate-200 p-6">
              <h3 className="font-serif text-2xl text-[#224034] mb-3">Use a full audit when you need a fix plan</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A full audit gives you deeper issue detail, prioritization, and the exact fixes needed to improve your AEO score over time.
              </p>
            </article>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/">Run AEO Grader</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/aeo-checker-tool">See the Full Audit</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
