"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

type PlatformFeature = {
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  chipOne: string;
  chipTwo: string;
  previewSite: string;
  previewCaption: string;
  sparkBars: number[];
  overallScore: number;
  overallHint: string;
  engineLabel: string;
  engineScores: { name: string; score: number; logo: string }[];
  technicalChecks: {
    label: string;
    detail: string;
    status: "pass" | "warning" | "fail";
  }[];
};

const platformFeatures: PlatformFeature[] = [
  {
    title: "Instant AI Diagnostics",
    description:
      "Drop in a URL and get clear, prioritized fixes for technical setup, content structure, and trust signals.",
    metricLabel: "Avg scan time",
    metricValue: "30s",
    chipOne: "Robots + Schema Checks",
    chipTwo: "Engine Visibility Snapshot",
    previewSite: "xyz.com",
    previewCaption: "One-time scan preview (mock data)",
    sparkBars: [5, 10, 8, 12, 14, 11],
    overallScore: 74,
    overallHint: "Initial baseline before fixes",
    engineLabel: "Current visibility by engine",
    engineScores: [
      { name: "ChatGPT", score: 78, logo: "/logos/chatgpt-logo.png" },
      { name: "Claude", score: 72, logo: "/logos/claude-logo.png" },
      { name: "Gemini", score: 70, logo: "/logos/gemini-logo.png" },
      { name: "Perplexity", score: 69, logo: "/logos/perplexity-logo.png" },
      { name: "Meta AI", score: 73, logo: "/logos/meta-logo.webp" },
      { name: "Grok", score: 67, logo: "/logos/grok-logo.svg" },
      { name: "Mistral", score: 71, logo: "/logos/mistral-logo.png" },
      { name: "You.com", score: 75, logo: "/logos/you-logo.png" },
    ],
    technicalChecks: [
      { label: "Robots.txt", detail: "AI crawlers are allowed", status: "pass" },
      { label: "Schema.org", detail: "Missing FAQ schema", status: "warning" },
      { label: "LLMs.txt", detail: "Not found - recommended", status: "warning" },
      { label: "Sitemap.xml", detail: "Indexed and accessible", status: "pass" },
    ],
  },
  {
    title: "AEO Readiness Workflows",
    description:
      "Turn scattered recommendations into a practical sequence your team can ship quickly.",
    metricLabel: "Priority actions",
    metricValue: "12+",
    chipOne: "Content + Technical Plan",
    chipTwo: "Team-friendly Task Order",
    previewSite: "xyzgrowth.com",
    previewCaption: "Readiness workflow view (mock data)",
    sparkBars: [7, 9, 11, 13, 12, 15],
    overallScore: 81,
    overallHint: "Fix plan mapped by impact",
    engineLabel: "Projected score after workflow fixes",
    engineScores: [
      { name: "ChatGPT", score: 88, logo: "/logos/chatgpt-logo.png" },
      { name: "Claude", score: 83, logo: "/logos/claude-logo.png" },
      { name: "Gemini", score: 80, logo: "/logos/gemini-logo.png" },
      { name: "Perplexity", score: 79, logo: "/logos/perplexity-logo.png" },
      { name: "Meta AI", score: 81, logo: "/logos/meta-logo.webp" },
      { name: "Grok", score: 76, logo: "/logos/grok-logo.svg" },
      { name: "Mistral", score: 80, logo: "/logos/mistral-logo.png" },
      { name: "You.com", score: 82, logo: "/logos/you-logo.png" },
    ],
    technicalChecks: [
      { label: "Robots.txt", detail: "Healthy and crawlable", status: "pass" },
      { label: "Schema.org", detail: "Organization + FAQ schema found", status: "pass" },
      { label: "LLMs.txt", detail: "Published and valid", status: "pass" },
      { label: "Sitemap.xml", detail: "Fresh URLs synced", status: "pass" },
    ],
  },
  {
    title: "Always On Monitoring",
    description:
      "Track score changes over time and catch regressions before they hurt answer visibility.",
    metricLabel: "Monitoring cadence",
    metricValue: "Daily",
    chipOne: "Drift Detection Alerts",
    chipTwo: "Trend View by Engine",
    previewSite: "xyzmonitor.com",
    previewCaption: "Monitoring dashboard (mock data)",
    sparkBars: [8, 9, 10, 11, 12, 14],
    overallScore: 84,
    overallHint: "Stable upward trend this week",
    engineLabel: "7-day moving average",
    engineScores: [
      { name: "ChatGPT", score: 90, logo: "/logos/chatgpt-logo.png" },
      { name: "Claude", score: 85, logo: "/logos/claude-logo.png" },
      { name: "Gemini", score: 84, logo: "/logos/gemini-logo.png" },
      { name: "Perplexity", score: 82, logo: "/logos/perplexity-logo.png" },
      { name: "Meta AI", score: 83, logo: "/logos/meta-logo.webp" },
      { name: "Grok", score: 79, logo: "/logos/grok-logo.svg" },
      { name: "Mistral", score: 82, logo: "/logos/mistral-logo.png" },
      { name: "You.com", score: 84, logo: "/logos/you-logo.png" },
    ],
    technicalChecks: [
      { label: "Robots.txt", detail: "No crawl blocks detected", status: "pass" },
      { label: "Schema.org", detail: "Version drift detected on 2 pages", status: "warning" },
      { label: "LLMs.txt", detail: "Published and valid", status: "pass" },
      { label: "Sitemap.xml", detail: "Updated within 24h", status: "pass" },
    ],
  },
  {
    title: "Reporting That Runs Itself",
    description:
      "Get clean, client-ready updates that explain wins, losses, and next actions without manual formatting.",
    metricLabel: "Report clarity",
    metricValue: "A+",
    chipOne: "Executive Summary Output",
    chipTwo: "Auto-ready Action List",
    previewSite: "xyzreports.io",
    previewCaption: "Automated report snapshot (mock data)",
    sparkBars: [6, 8, 9, 10, 12, 13],
    overallScore: 86,
    overallHint: "Weekly report exported successfully",
    engineLabel: "Latest report score by engine",
    engineScores: [
      { name: "ChatGPT", score: 91, logo: "/logos/chatgpt-logo.png" },
      { name: "Claude", score: 87, logo: "/logos/claude-logo.png" },
      { name: "Gemini", score: 85, logo: "/logos/gemini-logo.png" },
      { name: "Perplexity", score: 84, logo: "/logos/perplexity-logo.png" },
      { name: "Meta AI", score: 86, logo: "/logos/meta-logo.webp" },
      { name: "Grok", score: 81, logo: "/logos/grok-logo.svg" },
      { name: "Mistral", score: 85, logo: "/logos/mistral-logo.png" },
      { name: "You.com", score: 86, logo: "/logos/you-logo.png" },
    ],
    technicalChecks: [
      { label: "Robots.txt", detail: "Healthy and crawlable", status: "pass" },
      { label: "Schema.org", detail: "All critical types present", status: "pass" },
      { label: "LLMs.txt", detail: "Published and valid", status: "pass" },
      { label: "Sitemap.xml", detail: "No missing URLs in last run", status: "pass" },
    ],
  },
];

export function HomeResourceLinksSection() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const activeFeature = platformFeatures[activeFeatureIndex];
  const avgEngineScore = Math.round(
    activeFeature.engineScores.reduce((sum, engine) => sum + engine.score, 0) / activeFeature.engineScores.length
  );

  return (
    <section id="aeo-resources" className="min-h-screen py-20 md:py-24 bg-white flex items-center">
      <div className="w-full px-10 md:px-16 lg:px-28 xl:px-36 2xl:px-44">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#9b7a44] mb-4">
              Built for AEO teams and in-house marketers
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#213f33] leading-tight mb-5">
              The AI Visibility Platform
            </h2>
            <p className="text-lg text-[#4a6558] leading-relaxed">
              Scale your answer engine optimization workflow with faster audits, cleaner priorities, and monitoring that protects your visibility over time.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="space-y-0 lg:col-span-4">
              {platformFeatures.map((feature, index) => {
                const isActive = activeFeatureIndex === index;
                return (
                  <button
                    key={feature.title}
                    type="button"
                    onClick={() => setActiveFeatureIndex(index)}
                    className={`w-full border-t border-[#d8c4a1] py-4 text-left transition-colors ${isActive ? "text-[#213f33]" : "text-slate-400 hover:text-[#325848]"
                      }`}
                  >
                    <p className="font-urbanist text-[1.2rem] md:text-[1.4rem] font-semibold leading-tight tracking-tight">
                      {feature.title}
                    </p>
                    {isActive && (
                      <p className="mt-2 text-[14px] leading-relaxed text-[#5d7569] max-w-xl">
                        {feature.description}
                      </p>
                    )}
                  </button>
                );
              })}
              <div className="border-t border-[#d8c4a1]" />
            </div>

            <div className="lg:col-span-8 rounded-2xl bg-[#eef4f0] border border-[#dce8e1] p-5 md:p-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Live Scan Snapshot</p>
                    <p className="text-xl font-semibold text-[#213f33] mb-1">{activeFeature.previewSite}</p>
                    <p className="text-sm text-slate-500">{activeFeature.previewCaption}</p>
                    <div className="mt-4 h-20 rounded-lg bg-[linear-gradient(180deg,#f6f9fd_0%,#f1f6fb_100%)] border border-slate-200 px-4 py-3 flex items-end gap-2">
                      {activeFeature.sparkBars.map((height, index) => (
                        <div
                          key={`${activeFeature.title}-bar-${index}`}
                          className={`w-3 rounded-sm ${index % 2 === 0 ? "bg-[#84c9aa]" : "bg-[#4fa67e]"}`}
                          style={{ height: `${height * 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#224034] text-white border border-[#1b342a] p-4">
                    <p className="text-xs uppercase tracking-widest text-emerald-200/90 mb-2">Overall AEO & GEO Readiness</p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-semibold tracking-tight">{avgEngineScore}</span>
                      <span className="text-base text-emerald-100/80 mb-1">/100</span>
                    </div>
                    <p className="text-sm text-emerald-100/80 mt-1">{activeFeature.overallHint}</p>
                    <div className="mt-4 space-y-2">
                      <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-emerald-50">{activeFeature.chipOne}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-emerald-50">{activeFeature.chipTwo}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-widest text-slate-500">AI Engine Visibility Estimate</p>
                    <p className="text-xs text-slate-400">{activeFeature.engineLabel}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {activeFeature.engineScores.map((engine) => (
                      <div key={engine.name} className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Image src={engine.logo} alt={`${engine.name} logo`} width={16} height={16} className="w-4 h-4 object-contain" />
                          <span className="text-xs font-medium text-slate-700">{engine.name}</span>
                        </div>
                        <p className="mt-2 text-lg font-semibold text-[#224034]">{engine.score}<span className="text-xs text-slate-400">/100</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Technical Readiness</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeFeature.technicalChecks.map((check) => (
                      <div key={check.label} className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-800">{check.label}</span>
                          {check.status === "pass" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : check.status === "fail" ? (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{check.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 text-center">
            <p className="text-xl font-serif text-[#2d4f3f] mb-6">
              Ready to see where your AI visibility is leaking?
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-full bg-[#e7f0dc] border border-[#d5e3ca] p-1.5">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#2a4c3c] hover:bg-white/70 transition-colors"
              >
                Run Free Audit
              </Link>
              <Link
                href="/contact"
                className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#224034] text-white hover:bg-[#1a3329] transition-colors inline-flex items-center gap-1.5"
              >
                Talk to an Expert
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#6a8074]">
              Want a done-for-you plan? Visit our{" "}
              <Link href="/aeo-guide" className="text-[#2a5a47] font-medium hover:underline underline-offset-4">
                AEO guide
              </Link>{" "}
              for implementation frameworks.
            </p>
          </div>
      </div>
    </section>
  );
}
