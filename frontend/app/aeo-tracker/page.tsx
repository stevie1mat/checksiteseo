import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AEO Tracker & Monitoring Software",
  description:
    "Monitor your AI search visibility with an advanced AEO tracker. Use our AEO tracking software and tools to see where you rank in ChatGPT, Claude, and Perplexity.",
  path: "/aeo-tracker",
  keywords: [
    "aeo tracker",
    "aeo trackers",
    "aeo tracking",
    "aeo tracking software",
    "aeo monitoring tool",
    "ai visibility monitoring",
  ],
});

export default function AeoTrackerPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AEO Tracker & Monitoring Software",
    "url": absoluteUrl("/aeo-tracker"),
    "description":
      "Daily AEO tracker and monitoring tool for maintaining AI search visibility across all answer engines.",
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">AEO Tracker & Monitoring Software</h1>
          <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-3xl mx-auto">
            Stop guessing your AI search rank. Use our dedicated AEO tracking tools to monitor positions, catch regressions, and dominate the generative engine landscape.
          </p>
          <Button asChild size="lg" className="bg-[#8cd9b8] hover:bg-[#7bcfa7] text-[#16211d] h-14 px-8 rounded-full font-bold text-lg shadow-lg">
            <Link href="/dashboard">Access the AEO Tracker Dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-16 text-slate-700">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl text-[#224034] mb-6">How an AEO tracking tool works</h2>
            <p className="text-lg leading-relaxed text-slate-600">
              Unlike keyword-based Rank Trackers, an <strong>AEO tracker</strong> measures your <em>citation probability</em>. Our AEO monitoring tool scans LLMs daily to verify that your brand is being recommended in AI-generated answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">Continuous AEO Tracking</p>
              <h3 className="font-serif text-xl text-[#224034] mb-3">Daily Scans</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Verify fluctuations in ChatGPT Search and Gemini. If your score drops, our AEO tracking software alerts you immediately.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">AEO Trackers</p>
              <h3 className="font-serif text-xl text-[#224034] mb-3">Algorithm History</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Maintain a log of your overall AI Engine Visibility Estimate to prove ROI to clients or team members over time.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-3">AEO Monitoring Tool</p>
              <h3 className="font-serif text-xl text-[#224034] mb-3">Proactive Sync</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                The ultimate AEO software doesn't just watch—it acts. Monitor your progress and sync fixes directly back to your CMS.
              </p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
