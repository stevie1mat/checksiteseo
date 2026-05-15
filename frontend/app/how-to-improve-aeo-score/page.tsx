import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "How to Improve AEO Score: Practical Fixes for AI Search",
  description:
    "Learn how to improve your AEO score with practical technical, content, and trust fixes that help your site perform better in AI search results.",
  path: "/how-to-improve-aeo-score",
  keywords: [
    "how to improve AEO score",
    "improve AEO score",
    "answer engine optimization tips",
    "AI search optimization score",
  ],
});

export default function ImproveAeoScorePage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Improve AEO Score",
    "url": absoluteUrl("/how-to-improve-aeo-score"),
    "description":
      "Practical steps to improve a website's AEO score for technical setup, content structure, and trust signals.",
    "step": [
      { "@type": "HowToStep", "name": "Fix crawlability and technical blockers" },
      { "@type": "HowToStep", "name": "Rewrite key pages into direct-answer formats" },
      { "@type": "HowToStep", "name": "Add proof and trust signals to high-value pages" },
    ],
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">How to Improve AEO Score</h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
            The fastest way to improve AEO score is to fix crawlability first, then make your content easier to quote, and finally strengthen the proof that makes AI systems trust your pages.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">1. Technical</p>
            <h2 className="font-serif text-2xl text-[#224034] mb-3">Remove blockers</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fix robots rules, broken sitemaps, weak canonical signals, schema issues, and rendering problems so answer engines can access your important pages cleanly.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">2. Content</p>
            <h2 className="font-serif text-2xl text-[#224034] mb-3">Answer directly</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Rewrite top pages so headings match real questions, paragraphs deliver direct answers, and your page contains short passages AI systems can reuse.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">3. Trust</p>
            <h2 className="font-serif text-2xl text-[#224034] mb-3">Add proof</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Improve trust with examples, author or company transparency, evidence-backed claims, and stronger page-level proof on your most valuable URLs.
            </p>
          </article>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="font-serif text-3xl text-[#224034] mb-5">The highest-impact AEO score improvements</h2>
          <ul className="space-y-3 list-disc pl-6 text-slate-700 leading-relaxed mb-8">
            <li>Make one primary money page the clearest answer for a keyword cluster</li>
            <li>Add FAQ or explanatory content that mirrors real user questions</li>
            <li>Use examples, report outputs, and product proof on landing pages</li>
            <li>Rescan after each major template or content update</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#224034] hover:bg-[#1a3329] text-white">
              <Link href="/">Run a New Scan</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/aeo-checker-tool">See What the Checker Measures</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
