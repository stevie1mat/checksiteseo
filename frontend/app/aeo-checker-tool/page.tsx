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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Free AEO Checker Tool & Sample Report</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Run a comprehensive AEO checker analysis, discover what's blocking your AI search visibility, and learn how to optimize for LLMs.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg leading-relaxed">
            Our free AEO checking tool provides a detailed breakdown of your site's readiness for the era of AI search. By analyzing your technical infrastructure, content structure, and authority signals, generates an actionable answer engine optimization report designed to help you rank in tools like ChatGPT, Gemini, and search AI overviews.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-serif text-2xl text-[#224034] mb-4">What the sample report shows</h2>
              <ul className="space-y-3 list-disc pl-5 text-sm text-slate-600 leading-relaxed">
                <li><strong>Technical Health:</strong> Deep site audit checks for crawlability, indexability, and the machine-readable structure required for LLMs.</li>
                <li><strong>Content Readiness:</strong> Evaluation of your content's Q&A formatting, semantic clarity, and intent matching.</li>
                <li><strong>Authority Scoring:</strong> Analysis of your citation readiness, expertise signals, and digital footprint.</li>
              </ul>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-serif text-2xl text-[#224034] mb-4">Why this AEO checking tool matters</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                AI answer engines operate differently from traditional search. They prioritize direct answers and credible sources. A comprehensive AEO checker report isolates the specific gaps preventing your content from being chosen as a source.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Instead of generic SEO advice, you receive a targeted LLM optimization workflow focused on fixing the issues that matter most for AI visibility.
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
                We measure your robots.txt, sitemap quality, and JSON-LD schema implementation to ensure your site is fully accessible to AI bots.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">Content Readability</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our algorithm reviews how well your pages provide direct answers and semantic context, ensuring your content is structured for LLM parsing.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">Authority Signals</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We evaluate your digital footprint, looking for the credibility markers and trust elements that convince AI models to cite your domain.
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
