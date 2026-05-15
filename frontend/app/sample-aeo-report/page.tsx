import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Sample AEO Report: What an AI Visibility Audit Includes",
  description:
    "Review a sample AEO report to see what a strong answer engine optimization audit includes, from technical findings to content and trust recommendations.",
  path: "/sample-aeo-report",
  keywords: [
    "sample AEO report",
    "AEO report example",
    "answer engine optimization report",
    "AI visibility audit report",
  ],
});

export default function SampleAeoReportPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sample AEO Report",
    "url": absoluteUrl("/sample-aeo-report"),
    "description":
      "A sample answer engine optimization report showing technical, content, and authority findings.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Sample AEO Report</h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
            See what a useful AEO report should include before you run your own audit: score breakdowns, issue explanations, and a clear action plan.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-[#224034] mb-4">1. Executive summary</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              The report should explain your overall AEO score, what that score means, and where the biggest visibility risks sit across technical setup, content, and trust.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-[#224034] mb-4">2. Technical findings</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Expect checks for crawl access, sitemap coverage, structured data, canonical signals, and rendering issues that can stop AI systems from reading your pages correctly.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-[#224034] mb-4">3. Content findings</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              A useful sample report should show whether your page answers real questions directly, uses clear headings, and includes passages AI systems can quote without heavy rewriting.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-[#224034] mb-4">4. Trust findings</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Strong reports surface missing evidence, weak author or company signals, and unsupported claims that reduce citation confidence for answer engines.
            </p>
          </article>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="font-serif text-3xl text-[#224034] mb-5">What to look for in a sample AEO report</h2>
          <ul className="space-y-3 list-disc pl-6 text-slate-700 leading-relaxed mb-8">
            <li>Clear scoring methodology instead of vague grades</li>
            <li>Issue-by-issue explanation tied to AI search visibility</li>
            <li>Prioritized next steps rather than an unranked checklist</li>
            <li>Examples of how better formatting or proof improves citation readiness</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/aeo-checker-tool">View the Main AEO Checker</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Run Your Own Report</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
