import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Monitoring for AI Search Performance",
  description:
    "Track AEO monitoring metrics over time and detect drops in answer visibility, technical health, and trust signals.",
  path: "/aeo-monitoring",
  keywords: [
    "AEO monitoring",
    "AEO monitor",
    "answer engine monitoring",
    "AI search monitoring",
  ],
});

export default function AeoMonitoringPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AEO Monitoring",
    "url": absoluteUrl("/aeo-monitoring"),
    "description":
      "Continuous AEO monitoring for answer engine visibility, content quality, and technical reliability.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Monitoring</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Monitor your AEO performance and catch regressions before they reduce AI search visibility.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg">
            AEO monitoring helps you track score movement and identify what changed in technical setup, content answers, and authority perception.
          </p>
          <ul className="space-y-3 list-disc pl-6">
            <li>Track technical drift across crawls</li>
            <li>Watch content answer quality over time</li>
            <li>Spot authority and trust signal changes</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/aeo-checker-tool">Start Monitoring with a Baseline Scan</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/aeo-readiness">Improve AEO Readiness</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
