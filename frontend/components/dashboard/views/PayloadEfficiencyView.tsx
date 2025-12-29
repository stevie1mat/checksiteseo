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
                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
                    <Cpu className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
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
                    <>
                        {activeTab === 'what-why' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-serif text-slate-800 tracking-tight">Understanding Token Economics</h2>
                                    <p className="text-slate-600 text-lg leading-relaxed">
                                        For an LLM, reading your website is like reading a book where 90% of the pages are filled with random scaffolding instructions. This "Noise" distracts from your "Signal".
                                    </p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6 mt-8">
                                    <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                                        <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" /> The Risks of Bloat
                                        </h3>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-red-800/80">
                                            <li>Context Window Overflow (Truncation)</li>
                                            <li>Increased crawling costs for you and them</li>
                                            <li>Diluted semantic meaning</li>
                                        </ul>
                                    </div>
                                    <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> The Solution: llms.txt
                                        </h3>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-emerald-800/80">
                                            <li>A designated file for AI bots</li>
                                            <li>Strip away all HTML/CSS/JS</li>
                                            <li>Pure Markdown content</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analyzer' && (
                            <div className="space-y-8 animate-in fade-in duration-300 h-full flex flex-col">
                                <div>
                                    <h2 className="text-xl font-bold text-[#1A4036]">Payload Analyzer</h2>
                                    <p className="text-slate-500 text-sm">Visualizing the signal-to-noise ratio of your page.</p>
                                </div>

                                {/* Stacked Bar Visualizer */}
                                <Card className="p-8 border-slate-200 shadow-sm bg-white">
                                    <div className="mb-4 flex justify-between items-end">
                                        <span className="text-sm font-medium text-slate-500">Document Composition</span>
                                        <span className={`text-sm font-bold ${data.isCritical ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {(data.textRatio * 100).toFixed(1)}% Semantic Signal
                                        </span>
                                    </div>

                                    <div className="h-12 w-full rounded-xl flex overflow-hidden border border-slate-200 shadow-inner">
                                        {/* Code Part (HTML/JS) */}
                                        <div
                                            className="bg-red-400 relative group flex items-center justify-center"
                                            style={{ width: `${data.codeRatio * 100}%` }}
                                        >
                                            <span className="text-white/90 font-bold text-xs z-10 font-mono">CODE ({(data.codeRatio * 100).toFixed(0)}%)</span>
                                            <div className="absolute inset-0 bg-[url('/stripes.png')] opacity-10" />
                                        </div>

                                        {/* Content Part */}
                                        <div
                                            className="bg-emerald-500 relative group flex items-center justify-center"
                                            style={{ width: `${data.textRatio * 100}%` }}
                                        >
                                            <span className="text-white font-bold text-xs z-10 font-mono">TEXT</span>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex gap-6 mt-4 justify-center">
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <div className="w-3 h-3 bg-red-400 rounded-sm" /> HTML/JS Overhead
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Semantic Content
                                        </div>
                                    </div>
                                </Card>

                                {/* Metric Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="p-5 border-slate-200 bg-slate-50 flex flex-col items-center text-center justify-center gap-2">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-1">
                                            <FileText className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-slate-700">{data.totalTokens.toLocaleString()}</div>
                                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Tokens</div>
                                        </div>
                                    </Card>

                                    <Card className="p-5 border-slate-200 bg-slate-50 flex flex-col items-center text-center justify-center gap-2">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-1">
                                            <Zap className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-slate-700">{data.bloatStatus}</div>
                                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Bloat Status</div>
                                        </div>
                                    </Card>

                                    <Card className="p-5 border-slate-200 bg-slate-50 flex flex-col items-center text-center justify-center gap-2">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-1">
                                            <DollarSign className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-slate-700">{data.cost}</div>
                                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Est. Cost per Run</div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Warning Panel */}
                                {data.isCritical && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-4 items-start">
                                        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-red-900">High Risk of Truncation</h4>
                                            <p className="text-sm text-red-800/80 mt-1">
                                                Your signal-to-noise ratio is critical ({(data.textRatio * 100).toFixed(1)}%).
                                                AI agents might stop reading your page before they reach the important content.
                                            </p>
                                            <Button size="sm" variant="destructive" className="mt-3">
                                                Generate llms.txt Fix
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tips' && (
                            <div className="space-y-6 animate-in fade-in duration-300 h-full">
                                <div>
                                    <h2 className="text-xl font-bold text-[#1A4036]">Optimization Tips</h2>
                                    <p className="text-slate-500 text-sm">Reduce payload size and increase efficiency.</p>
                                </div>

                                <Card className="p-6 border-slate-200 flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">Implement /llms.txt</h3>
                                        <p className="text-sm text-slate-600 mt-1 mb-4">
                                            Create a text-only version of your site specifically for AI robots. This bypasses all HTML bloat.
                                        </p>
                                        <Button className="bg-blue-600 hover:bg-blue-700">Generate Standard llms.txt</Button>
                                    </div>
                                </Card>

                                <Card className="p-6 border-slate-200 flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                        <Code className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">Minify & Defer Scripts</h3>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Move non-essential JavaScript to the footer or use `defer`. This helps the AI parser reach the `body` content content faster.
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </>
                )
            }}
        />
    )
}
