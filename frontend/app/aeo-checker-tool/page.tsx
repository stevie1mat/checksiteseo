import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free AEO Checker Tool, Sample Report & Audit Checklist",
  description:
    "Use our free AEO checker tool to analyze your website for AI search visibility. Review a sample report, scoring methodology, and checklist for ChatGPT, Gemini, Claude, and Perplexity.",
  path: "/aeo-checker-tool",
  keywords: [
    "AEO checker",
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
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What does this AEO checker tool analyze?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It analyzes technical crawlability, structured data, content clarity, and trust signals that affect whether AI systems can understand and cite your site.",
        },
      },
      {
        "@type": "Question",
        "name": "How is an AEO checker different from a traditional SEO audit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A traditional SEO audit focuses on rankings and indexation. An AEO checker also evaluates citation readiness, answer formatting, structured data quality, and signals that help LLMs quote or recommend your content.",
        },
      },
      {
        "@type": "Question",
        "name": "Which AI platforms does the audit help with?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The audit is designed to improve visibility in major answer engines such as ChatGPT, Gemini, Claude, and Perplexity by surfacing technical, content, and authority gaps.",
        },
      },
    ],
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />

      <section className="bg-[#224034] text-white pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Free AEO Checker Tool & Sample Report</h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
            Audit what AI systems can actually crawl, understand, and cite. This free AEO checker shows the technical, content, and trust gaps holding back your visibility in answer engines.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-white/80">
            <span className="rounded-full border border-white/20 px-4 py-2">Technical crawlability</span>
            <span className="rounded-full border border-white/20 px-4 py-2">Content clarity</span>
            <span className="rounded-full border border-white/20 px-4 py-2">Citation trust signals</span>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg leading-relaxed">
            Most AEO checker pages talk in vague terms about AI visibility. This page shows what a real answer engine optimization audit should include: a concrete score, a clear breakdown, and a prioritized action plan your team can actually ship.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-serif text-2xl text-[#224034] mb-4">What the sample report shows</h2>
              <ul className="space-y-3 list-disc pl-5 text-sm text-slate-600 leading-relaxed">
                <li><strong>Technical Health:</strong> Crawlability, sitemap, HTTPS, structured data, and other machine-readable signals AI systems rely on.</li>
                <li><strong>Content Readiness:</strong> Whether your pages answer questions directly, use clear headings, and provide extractable passages.</li>
                <li><strong>Authority Scoring:</strong> Trust signals, evidence, and citation readiness that influence whether answer engines feel safe using your content.</li>
                <li><strong>Priority Fixes:</strong> A sequence of the highest-impact actions instead of a generic checklist with no ordering.</li>
              </ul>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-serif text-2xl text-[#224034] mb-4">Why this AEO checker tool matters</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Traditional SEO reporting tells you how pages rank. An AEO checker tells you whether AI systems can quote you at all. That means looking beyond keywords into answer formatting, structured data quality, trust signals, and consistency across your site.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Instead of generic SEO advice, you need a focused diagnosis of what is stopping ChatGPT, Gemini, Claude, and Perplexity from selecting your pages as sources.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[#224034] mb-8 text-center">How scoring works in this AEO checker tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">Technical Readiness</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We review robots directives, sitemap quality, canonical consistency, HTTPS, and structured data so answer engines can access and interpret your pages reliably.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">Content Readability</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We look for direct answers, clear headings, topic coverage, and short extractable passages that AI systems can confidently summarize or cite.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">Authority Signals</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We evaluate proof, transparency, expertise cues, and supporting evidence so the result is not just indexable content, but citable content.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="font-serif text-3xl text-[#224034] mb-6">What strong AEO checker pages do differently</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
            <article className="rounded-xl bg-slate-50 border border-slate-200 p-6">
              <h3 className="font-serif text-2xl text-[#224034] mb-3">Useful outputs, not keyword repetition</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                The best tools show a real score, a sample report, a breakdown of what is measured, and a clear next step. They do not rely on multiple thin pages targeting slight keyword variations.
              </p>
            </article>
            <article className="rounded-xl bg-slate-50 border border-slate-200 p-6">
              <h3 className="font-serif text-2xl text-[#224034] mb-3">Proof and methodology</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                High-performing competitors explain how they measure citations, prompts, or readiness. They also use screenshots, product states, customer logos, or examples to make the offer feel credible.
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
            <li>Founders who need to understand why competitors are appearing in AI answers first</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/">Start Free Audit</Link>
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

      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[#224034] mb-8 text-center">Frequently asked questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-xl text-[#224034] mb-3">What does this AEO checker analyze?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                It analyzes crawlability, structured data, page clarity, and trust cues that affect how answer engines discover and cite your content.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-xl text-[#224034] mb-3">How is this different from SEO?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                SEO focuses on ranking in search results. AEO focuses on being selected as part of the answer itself, which requires stronger formatting, trust, and machine-readable structure.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-xl text-[#224034] mb-3">Which answer engines does it support?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The scoring framework is built to help with the major AI answer surfaces, including ChatGPT, Gemini, Claude, and Perplexity.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="font-serif text-3xl text-[#224034] mb-5">Related AEO resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
            <Link href="/aeo-grader" className="rounded-xl border border-slate-200 bg-slate-50 p-5 hover:border-[#8cd9b8] transition-colors">
              <h3 className="font-serif text-2xl text-[#224034] mb-2">AEO Grader</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Get a quick score benchmark before running a deeper audit.</p>
            </Link>
            <Link href="/sample-aeo-report" className="rounded-xl border border-slate-200 bg-slate-50 p-5 hover:border-[#8cd9b8] transition-colors">
              <h3 className="font-serif text-2xl text-[#224034] mb-2">Sample AEO Report</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Review what a useful AI visibility report should contain.</p>
            </Link>
            <Link href="/aeo-checker-vs-aeo-grader" className="rounded-xl border border-slate-200 bg-slate-50 p-5 hover:border-[#8cd9b8] transition-colors">
              <h3 className="font-serif text-2xl text-[#224034] mb-2">AEO Checker vs Grader</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Choose the right tool for benchmarking, diagnosis, or monitoring.</p>
            </Link>
            <Link href="/how-to-improve-aeo-score" className="rounded-xl border border-slate-200 bg-slate-50 p-5 hover:border-[#8cd9b8] transition-colors">
              <h3 className="font-serif text-2xl text-[#224034] mb-2">How to Improve AEO Score</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Learn the highest-impact fixes for technical setup, content, and trust.</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
