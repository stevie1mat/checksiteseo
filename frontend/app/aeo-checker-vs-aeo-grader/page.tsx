import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Checker vs AEO Grader: Which One Do You Need?",
  description:
    "Compare an AEO checker vs an AEO grader and learn when to use a quick score, a full audit, or ongoing monitoring for AI search visibility.",
  path: "/aeo-checker-vs-aeo-grader",
  keywords: [
    "AEO checker vs AEO grader",
    "AEO checker comparison",
    "AEO grader vs audit",
    "answer engine optimization checker",
  ],
});

export default function AeoCheckerVsGraderPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is an AEO grader enough on its own?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A grader is useful for a benchmark or recurring score check, but it is not enough if you need issue-level explanations and a prioritized fix plan.",
        },
      },
      {
        "@type": "Question",
        "name": "When should I use a full AEO checker?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use a full AEO checker when you want to diagnose why your site is not appearing in AI answers and what to fix first across technical, content, and trust signals.",
        },
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AEO Checker vs AEO Grader",
    "url": absoluteUrl("/aeo-checker-vs-aeo-grader"),
    "description":
      "A practical comparison of an AEO checker and an AEO grader for AI search optimization.",
    "inLanguage": "en-US",
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />

      <section className="bg-[#224034] text-white pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Checker vs AEO Grader</h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
            Both help with AI search visibility, but they solve different jobs. Use this comparison to choose the right tool for benchmarking, diagnosis, or ongoing monitoring.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-[#224034] mb-4">AEO grader</h2>
            <ul className="space-y-3 list-disc pl-5 text-sm text-slate-600 leading-relaxed">
              <li>Best for quick scoring and simple benchmarks</li>
              <li>Useful for weekly checks and page triage</li>
              <li>Good when you need a headline score fast</li>
              <li>Less useful when you need issue-level detail</li>
            </ul>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-[#224034] mb-4">AEO checker</h2>
            <ul className="space-y-3 list-disc pl-5 text-sm text-slate-600 leading-relaxed">
              <li>Best for identifying what is blocking citations</li>
              <li>Useful for technical, content, and trust breakdowns</li>
              <li>Gives a more complete view of AI visibility readiness</li>
              <li>Better when you need a prioritized fix plan</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10 text-slate-700">
          <h2 className="font-serif text-3xl text-[#224034] mb-5">Which one should you use?</h2>
          <p className="leading-relaxed mb-4">
            Start with an AEO grader if you want a fast baseline across a lot of pages. Move to a full AEO checker when you need to understand exactly why your site is not being selected in ChatGPT, Gemini, Claude, or Perplexity answers.
          </p>
          <p className="leading-relaxed mb-8">
            The strongest workflow is usually both: grade first to prioritize pages, then run a full audit on the pages that matter most for revenue or lead generation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/aeo-grader">Try the AEO Grader</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/aeo-checker-tool">Use the Full AEO Checker</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
