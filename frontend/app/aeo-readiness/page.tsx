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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Readiness & Answer Engine Optimization</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            AEO readiness is the measure of how prepared your site is to be selected, understood, and cited by AI answer engines like ChatGPT, Claude, and Perplexity.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg leading-relaxed">
            Achieving a high AEO readiness score requires more than just traditional SEO. Your pages must be technically accessible to AI bots, semantically clear for Large Language Models (LLMs), and authoritative enough for answer engine algorithms to trust as a primary source.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-serif text-2xl text-[#224034] mb-4">What is an AEO readiness check?</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                An AEO readiness check is a comprehensive audit that evaluates your website's capability to support answer engine optimization. Unlike standard SEO audits that focus on rankings, an AEO check analyzes crawlability for AI bots, schema validation for entity recognition, direct-answer formatting, and the trust cues that signal "AI citation readiness."
              </p>
              <p className="text-slate-600 leading-relaxed">
                It identifies gaps in your content structure that might prevent LLMs from parsing your answers correctly.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-serif text-2xl text-[#224034] mb-4">Why AEO readiness matters</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                AI search platforms do not rank pages; they synthesize answers. AEO readiness ensures your content is selected as the source of truth. Without answer engine optimization readiness, your brand may be invisible in the generated responses of tools like Google AI Overviews and ChatGPT.
              </p>
              <p className="text-slate-600 leading-relaxed">
                By improving your readiness, you increase the likelihood of being cited, driving high-intent traffic from users seeking specific answers.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[#224034] mb-8 text-center">The comprehensive AEO readiness checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">Technical Foundation</p>
              <ul className="space-y-3 list-disc pl-5 text-sm text-slate-600 leading-relaxed">
                <li><strong>Clean Configuration:</strong> Ensure your robots.txt and sitemap.xml are perfectly configured for AI crawlers.</li>
                <li><strong>Performance:</strong> Guarantee fast response times and reliable rendering for non-browser user agents.</li>
                <li><strong>Structured Data:</strong> Implement valid, deep schema markup to help machines understand your entities.</li>
              </ul>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">Content Structure</p>
              <ul className="space-y-3 list-disc pl-5 text-sm text-slate-600 leading-relaxed">
                <li><strong>Q&A Formatting:</strong> Structure content with clear questions and direct, concise answers.</li>
                <li><strong>Intent Matching:</strong> Use headings that map directly to user intent and search queries.</li>
                <li><strong>Factuality:</strong> Maintain up-to-date facts supported by strong internal linking context.</li>
              </ul>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">Authority & Trust</p>
              <ul className="space-y-3 list-disc pl-5 text-sm text-slate-600 leading-relaxed">
                <li><strong>Credibility:</strong> Demonstrate explicit expertise and cite authoritative sources.</li>
                <li><strong>Transparency:</strong> Maintain clear editorial policies and "About Us" information.</li>
                <li><strong>Entity Signals:</strong> Strengthen your brand's entity graph to become a recognized knowledge source.</li>
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
