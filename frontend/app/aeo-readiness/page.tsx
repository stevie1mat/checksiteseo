import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Readiness Check Guide",
  description:
    "Learn how to measure AEO readiness and improve your site for AI answer engines with technical, content, and trust optimization.",
  path: "/aeo-readiness",
  keywords: [
    "AEO readiness",
    "AEO readiness check",
    "answer engine readiness",
    "AI search readiness",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Readiness</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            AEO readiness is how prepared your site is to be selected and cited by answer engines.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg">
            A complete AEO readiness check should evaluate crawlability, structured data, question-answer formatting, and trust signals.
          </p>
          <ul className="space-y-3 list-disc pl-6">
            <li>Is your site crawlable for AI bots?</li>
            <li>Does content answer intent clearly and directly?</li>
            <li>Do you show strong expertise and credibility signals?</li>
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
