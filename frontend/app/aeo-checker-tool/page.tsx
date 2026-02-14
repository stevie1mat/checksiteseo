import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Checker Tool: Free AEO Checking Tool",
  description:
    "Use a free AEO checker tool to analyze your website for AI search visibility. Run an instant AEO checking tool audit for technical, content, and authority signals.",
  path: "/aeo-checker-tool",
  keywords: [
    "AEO checker tool",
    "AEO checking tool",
    "AEO checking tools",
    "free AEO checker",
    "answer engine optimization tool",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Checker Tool</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Run a free AEO checking tool audit and identify what is blocking your visibility in AI-generated answers.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg">
            This AEO checker tool evaluates answer engine optimization performance across technical setup, content quality, and trust signals.
          </p>
          <ul className="space-y-3 list-disc pl-6">
            <li>Technical checks for crawlability and machine readability</li>
            <li>Content structure checks for question-answer clarity</li>
            <li>Authority checks for trust and citation readiness</li>
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
