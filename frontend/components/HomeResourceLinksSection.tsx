import Link from "next/link";
import { ArrowRight } from "lucide-react";

const resources = [
  {
    title: "View Sample Report",
    href: "/aeo-checker-tool",
    keywordLine: "AEO checker tool sample report",
    description:
      "See how our AEO checking tool breaks down technical readiness, content quality, and trust signals that impact AI search visibility.",
    bullets: [
      "Technical blockers for answer engine optimization",
      "Content gaps that reduce AI citation potential",
      "Priority actions to improve AEO readiness score",
    ],
    cta: "Open Sample AEO Report",
  },
  {
    title: "Learn AEO Readiness",
    href: "/aeo-readiness",
    keywordLine: "AEO readiness check framework",
    description:
      "Learn how to run an AEO readiness check so your pages are easier for ChatGPT, Perplexity, Claude, and Gemini to understand and cite.",
    bullets: [
      "Core answer engine optimization signals",
      "Readiness checklist for content and schema",
      "Practical fixes for stronger AI search performance",
    ],
    cta: "Explore AEO Readiness",
  },
  {
    title: "Learn AEO Monitoring",
    href: "/aeo-monitoring",
    keywordLine: "AEO monitoring workflow",
    description:
      "Build a reliable AEO monitoring process to track score movement, detect regressions, and protect long-term answer visibility.",
    bullets: [
      "Weekly AEO monitoring metrics to track",
      "Alert thresholds for technical and content drift",
      "Reporting cadence for ongoing AI search optimization",
    ],
    cta: "Explore AEO Monitoring",
  },
];

export function HomeResourceLinksSection() {
  return (
    <section id="aeo-resources" className="py-24 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">
            Learn and Compare
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#224034] leading-tight mb-6">
            Detailed AEO resources for teams improving AI search visibility.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Use these guides to understand exactly how this AEO checker tool supports answer engine optimization, AEO readiness, and ongoing AEO monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <article
              key={resource.title}
              className="rounded-2xl bg-white border border-slate-200 p-7 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-3">
                {resource.keywordLine}
              </p>
              <h3 className="font-serif text-2xl text-[#224034] mb-4">{resource.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">{resource.description}</p>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5 mb-6">
                {resource.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <Link
                href={resource.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#224034] hover:text-emerald-700 transition-colors"
              >
                {resource.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
