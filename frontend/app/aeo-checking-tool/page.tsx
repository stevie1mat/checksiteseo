import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Checking Tool: Free Website Audit",
  description:
    "Try our free AEO checking tool to evaluate your website's answer engine optimization performance and improve AI search visibility.",
  path: "/aeo-checking-tool",
  keywords: [
    "AEO checking tool",
    "AEO checker tool",
    "AEO checking tools",
    "answer engine optimization checker",
    "free AEO check",
  ],
});

export default function AeoCheckingToolPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AEO Checking Tool",
    "url": absoluteUrl("/aeo-checking-tool"),
    "description":
      "Free AEO checking tool for technical readiness, content quality, and trust analysis in AI search.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Checking Tool</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Audit your site with our AEO checking tool and get actionable steps to increase visibility in AI-generated answers.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8 text-slate-700">
          <p className="text-lg">
            The best AEO checking tools do more than score pages. They prioritize what to fix first and help teams track progress over time.
          </p>
          <ul className="space-y-3 list-disc pl-6">
            <li>Find crawlability and markup blockers for answer engines</li>
            <li>Improve question-answer structure for AI readability</li>
            <li>Strengthen authority and trust signals for citations</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/signup">Start Free Audit</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/aeo-checker-tool">Compare AEO Checker Tool</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
