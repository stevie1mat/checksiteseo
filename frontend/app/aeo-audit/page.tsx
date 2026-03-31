import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free AEO Website Audit & Checklist Tool",
  description:
    "Run a free AEO audit to get a comprehensive AEO checklist. Ensure your website is optimized for AI search engines like ChatGPT, Claude, and Perplexity.",
  path: "/aeo-audit",
  keywords: [
    "aeo audit",
    "aeo checklist",
    "aeo website audit",
    "free aeo audit",
    "aeo check",
    "answer engine optimization audit"
  ],
});

export default function AeoAuditPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Free AEO Website Audit",
    "url": absoluteUrl("/aeo-audit"),
    "description":
      "Comprehensive AEO website audit and checklist to measure AI visibility and technical ranking signals.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Free AEO Website Audit & Checklist</h1>
          <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-3xl mx-auto">
            Get a complete, actionable AEO checklist. Run a free AEO check to find out exactly what's blocking your site from ChatGPT and Gemini answers.
          </p>
          <Button asChild size="lg" className="bg-[#8cd9b8] hover:bg-[#7bcfa7] text-[#16211d] h-14 px-8 rounded-full font-bold text-lg shadow-lg">
            <Link href="/">Run Your Free AEO Audit</Link>
          </Button>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12 text-slate-700">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl text-[#224034] mb-6">What a comprehensive AEO check involves</h2>
            <p className="text-lg leading-relaxed text-slate-600">
              Unlike traditional SEO, an AEO website audit requires simulating how large language models (LLMs) parse and tokenize your content. This free AEO audit gives you a precise AEO checklist to ensure perfect machine readability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm hover:border-[#8cd9b8]/50 transition-colors">
              <h3 className="font-serif text-2xl text-[#224034] mb-4">The Complete AEO Checklist</h3>
              <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <span><strong>LLM Accessibility:</strong> Verify your robots.txt isn't blocking CCBot or Google-Extended.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <span><strong>Conversational Headers:</strong> Ensure H2/H3 tags are formatted as direct queries.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <span><strong>Entity Schema:</strong> Validate JSON-LD to feed direct entity knowledge to Perplexity.</span>
                </li>
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm hover:border-[#8cd9b8]/50 transition-colors">
              <h3 className="font-serif text-2xl text-[#224034] mb-4">Why you need an AEO website audit</h3>
              <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                Generative AI relies heavily on structured citations. If your website lacks proper entity clustering or LLM-friendly schemas, you will lose high-intent traffic to competitors who pass an AEO check.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm">
                Our free AEO audit removes the guesswork structure by giving you the same prioritized fixes an enterprise agency would charge thousands for.
              </p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
