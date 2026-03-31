import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Best AEO Checking Software & AI Search Tools for 2026",
  description:
    "Looking for the best AEO checking software? Our AEO software automates answer engine optimization for ChatGPT and Perplexity. See why teams trust CheckSite's AEO tools.",
  path: "/aeo-software",
  keywords: [
    "aeo software",
    "aeo checking software",
    "best aeo checking software",
    "best aeo checking tools",
    "answer engine optimization software"
  ],
});

export default function AeoSoftwarePage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Best AEO Checking Software",
    "url": absoluteUrl("/aeo-software"),
    "description":
      "The premier AEO software offering automated technical fixes and tracking tools for ChatGPT and Gemini.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Best AEO Checking Software for AI Search</h1>
          <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-3xl mx-auto">
            Scale your AI visibility with the industry-leading AEO checking software. Automatically scan, detect gaps, and sync fixes directly via CheckSite's advanced AEO tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-[#8cd9b8] hover:bg-[#7bcfa7] text-[#16211d] h-14 px-8 rounded-full font-bold text-lg shadow-lg">
              <Link href="/#pricing">Start 14-Day Free Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 h-14 px-8 rounded-full font-bold text-lg">
              <Link href="/aeo-checker-tool">Run Free Scan</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12 text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <h2 className="font-serif text-4xl text-[#224034]">Why choose dedicated AEO software?</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                Traditional SEO software fails to benchmark how an LLM inherently parses entity vectors. You need native <strong>AEO checking software</strong> designed from the ground up to simulate AI tokens and prompt processing.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium">Direct WordPress & Shopify Sync Automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium">Proprietary ChatGPT & Claude scoring algorithms</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium">Identify the absolute best AEO checking tools</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 bg-gradient-to-tr from-[#1a3329] to-[#2a4d3e] p-8 rounded-2xl shadow-xl flex items-center justify-center aspect-video border border-emerald-900">
              <p className="text-emerald-300 font-mono text-xl">{"{"}</p>
              <p className="text-center text-sm font-mono text-white/50 px-4">
                "software_type": "aeo_checking",
                "features": ["automation", "sync", "llm_simulator"]
              </p>
              <p className="text-emerald-300 font-mono text-xl">{"}"}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
