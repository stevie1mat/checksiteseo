"use client"

import React from 'react'
import {
    Lightbulb,
    Code,
    Cpu,
    DollarSign,
    AlertTriangle,
    FileText,
    CheckCircle2,
    Zap
} from "lucide-react"
import { MetricDetailLayout } from "@/components/dashboard/MetricDetailLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { AEOReport } from "@/types/aeo"

interface PayloadEfficiencyViewProps {
    siteId: string
    domain: string
    initialData: any
}

const PE_TABS = [
    { id: 'what-why', label: 'What & Why', icon: Lightbulb },
    { id: 'analyzer', label: 'Payload Analyzer', icon: Cpu },
    { id: 'tips', label: 'Optimization Tips', icon: Zap },
];

export function PayloadEfficiencyView({ siteId, domain, initialData }: PayloadEfficiencyViewProps) {

    const transformReport = (report: AEOReport) => {
        // Handle both camelCase (frontend type) and snake_case (potential backend raw)
        const eco = report.agentEconomics || {};

        const totalTokens = eco.totalTokens || eco.total_tokens || 0;
        const ratio = eco.codeToTextRatio || (eco.html_ratio ? parseFloat(eco.html_ratio) : 0) || 0;
        // ratio is 0.0 to 1.0. e.g. 0.15 for 15% text.

        // Inverse: Code Ratio
        const codeRatio = 1 - ratio;

        // Cost (if string with $, strip it)
        let costStr = eco.estimated_cost || eco.indexCost || "0";
        if (typeof costStr === 'number') costStr = `$${costStr.toFixed(4)}`;

        const bloatStatus = eco.bloatStatus || eco.code_bloat_score || 'Unknown';
        const isCritical = bloatStatus.includes('Critical') || ratio < 0.10;

        return {
            totalTokens,
            textRatio: ratio,
            codeRatio,
            cost: costStr,
            bloatStatus,
            isCritical,
            boilerplate: eco.boilerplate_ratio || 0
        };
    }

    return (
        <MetricDetailLayout
            title="Payload Efficiency Score"
            status={initialData.agentEconomics?.codeToTextRatio < 0.15 ? 'critical' : 'pass'}
            impact="Token & Cost Efficiency"
            rawDiagnostic={JSON.stringify(initialData.agentEconomics || {}, null, 2)}
            pullQuote="LLMs have limited 'context windows'. If your page is 90% code and 10% text, you are paying to feed the AI junk."
            actionLabel="Generate llms.txt"
            customTabs={PE_TABS}
            leftPanelTip={
                <div className="mt-4 bg-white border border-emerald-100 shadow-sm rounded-xl p-4 flex gap-3 text-slate-600 text-sm">
                    <Cpu className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="leading-snug">
                        Search Agents operate on a budget. High-efficiency pages get indexed deeper and more frequently.
                    </p>
                </div>
            }
            whatAndWhyContent={
                <div className="space-y-4 text-slate-600">
                    <p>
                        <strong>What is Payload Efficiency?</strong><br />
                        It measures the ratio of "meaningful content" (Code) to "structural overhead" (HTML/JS/CSS).
                    </p>
                    <p>
                        <strong>Why it matters:</strong><br />
                        When an AI bot crawls your site, it consumes tokens. Excessive code bloat dilutes your semantic signal and increases the chance of truncation.
                    </p>
                </div>
            }
            renderTabContent={(activeTab: string) => {
                // We access the transformed data inside the render prop if we used RealtimeMetricView
                // But here we're using MetricDetailLayout directly with initialData mapping for simplicity first, 
                // or we can just calculate it here since we aren't using the wrapper yet.
                // Let's manually calculcate for this view since we aren't using the wrapper for data fetching yet.

                const data = transformReport(initialData);

                return (
                    <div className="min-h-[400px]">
                        {activeTab === 'what-why' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-3xl font-serif text-slate-900 tracking-tight mb-3">Understanding Token Economics</h2>
                                    <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                                        For an LLM, reading your website is like reading a book where <span className="font-semibold text-slate-800">90% of the pages</span> are filled with random scaffolding instructions.
                                        This "Noise" distracts from your "Signal".
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Risks Card */}
                                    <div className="group relative overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/50 to-white p-6 transition-all hover:shadow-md hover:border-red-200">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <AlertTriangle className="w-24 h-24 text-red-500 rotate-12" />
                                        </div>
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4 text-red-600">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-3">The Risks of Bloat</h3>
                                            <ul className="space-y-3">
                                                {[
                                                    "Context Window Overflow (Truncation)",
                                                    "Increased crawling costs",
                                                    "Diluted semantic meaning"
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Solution Card */}
                                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-6 transition-all hover:shadow-md hover:border-emerald-200">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <FileText className="w-24 h-24 text-emerald-500 -rotate-12" />
                                        </div>
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-3">The Solution: llms.txt</h3>
                                            <ul className="space-y-3">
                                                {[
                                                    "A designated file for AI bots",
                                                    "Strip away all HTML/CSS/JS",
                                                    "Pure Markdown content"
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analyzer' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-slate-400" />
                                        Payload Analyzer
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">Visualizing the signal-to-noise ratio of your main document.</p>
                                </div>

                                {/* Stacked Bar Visualizer */}
                                <Card className="p-8 border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                        <Code className="w-64 h-64" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-end mb-6">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-1">Composition</div>
                                                <div className="text-xs text-slate-500">Raw HTML breakdown</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${data.isCritical ? 'text-red-500' : 'text-emerald-600'}`}>
                                                    {(data.textRatio * 100).toFixed(1)}%
                                                </div>
                                                <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">Signal Quality</div>
                                            </div>
                                        </div>

                                        {/* The Bar */}
                                        <div className="h-14 w-full rounded-2xl flex overflow-hidden ring-4 ring-slate-50">
                                            {/* Code Part */}
                                            <div
                                                className="bg-slate-800 relative group flex items-center justify-center transition-all duration-1000 ease-out"
                                                style={{ width: `${data.codeRatio * 100}%` }}
                                            >
                                                {data.codeRatio > 0.1 && (
                                                    <span className="text-slate-400/80 font-bold text-[10px] tracking-widest z-10">CODE ({(data.codeRatio * 100).toFixed(0)}%)</span>
                                                )}
                                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 6px)' }} />
                                            </div>

                                            {/* Content Part */}
                                            <div
                                                className="bg-emerald-500 relative group flex items-center justify-center transition-all duration-1000 ease-out"
                                                style={{ width: `${data.textRatio * 100}%` }}
                                            >
                                                {data.textRatio > 0.1 && (
                                                    <span className="text-white font-bold text-[10px] tracking-widest z-10">TEXT</span>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div className="flex gap-8 mt-6 justify-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-slate-800 rounded-sm shadow-sm" />
                                                <span className="text-sm font-medium text-slate-600">HTML/JS Overhead</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-emerald-500 rounded-sm shadow-sm" />
                                                <span className="text-sm font-medium text-slate-600">Semantic Content</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Metric Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { label: "Total Tokens", value: data.totalTokens.toLocaleString(), icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
                                        { label: "Bloat Status", value: data.bloatStatus, icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                                        { label: "Est. Index Cost", value: data.cost, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
                                    ].map((metric, i) => (
                                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 transition-transform hover:-translate-y-1">
                                            <div className={`w-12 h-12 ${metric.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                                <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-slate-800 tracking-tight">{metric.value}</div>
                                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{metric.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tips' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-1">Optimization Tips</h2>
                                    <p className="text-slate-500 text-sm">Actionable steps to improve your payload efficiency.</p>
                                </div>

                                <div className="grid gap-4">
                                    <div className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all cursor-default">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-slate-900 text-lg">Implement /llms.txt</h3>
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">High Impact</Badge>
                                                </div>
                                                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                                                    Create a markdown-only version of your site specifically for AI robots. This bypasses all HTML bloat and guarantees 100% signal.
                                                </p>
                                                <div className="mt-4 flex gap-3">
                                                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4">
                                                        Generate Blueprint
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-amber-300 hover:shadow-md transition-all cursor-default">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <Code className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-slate-900 text-lg">Defer Non-Critical Scripts</h3>
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">Medium Impact</Badge>
                                                </div>
                                                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                                                    Move heavy JavaScript to the footer or use the `defer` attribute. This allows the AI crawler to parse the `body` content immediately without waiting for hydration.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }}
        />
    )
}
