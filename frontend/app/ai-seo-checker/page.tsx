import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI SEO Checker for ChatGPT, Gemini, Claude, and Perplexity",
  description:
    "Use an AI SEO checker to audit your website for ChatGPT, Gemini, Claude, and Perplexity visibility. Measure answer quality, crawlability, and trust signals.",
  path: "/ai-seo-checker",
  keywords: [
    "AI SEO checker",
    "LLM SEO checker",
    "ChatGPT SEO checker",
    "AI search SEO tool",
    "seo checker for AI search",
  ],
});

export default function AiSeoCheckerPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI SEO Checker",
    "url": absoluteUrl("/ai-seo-checker"),
    "description":
      "An AI SEO checker for measuring website visibility across major answer engines and AI search surfaces.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AI SEO Checker for Modern Search</h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
            Traditional SEO checkers were built for links and rankings. An AI SEO checker measures whether your site is ready to be understood, summarized, and cited by modern answer engines.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-[#224034] mb-4">What an AI SEO checker should cover</h2>
            <ul className="space-y-3 list-disc pl-5 text-sm text-slate-600 leading-relaxed">
              <li>Technical access for crawlers and answer engines</li>
              <li>Direct-answer formatting and content clarity</li>
              <li>Structured data and entity context</li>
              <li>Trust signals that support citation confidence</li>
            </ul>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-[#224034] mb-4">Why it differs from classic SEO software</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Classic SEO tools help you rank in search results. An AI SEO checker helps you become part of the answer itself by focusing on readability, evidence, and machine-usable page structure.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              That is why AI SEO and AEO overlap so heavily: both require pages that are easy to trust, easy to parse, and easy to quote.
            </p>
          </article>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="font-serif text-3xl text-[#224034] mb-5">Use this page as your bridge keyword</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            If people search for an SEO checker but actually need help with ChatGPT, Gemini, Claude, and Perplexity visibility, this is the right entry point. It captures the broader AI SEO phrase while still pointing users toward your core AEO checker and audit pages.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/aeo-checker-tool">Use the Main AEO Checker</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/how-to-improve-aeo-score">Improve Your Score</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
