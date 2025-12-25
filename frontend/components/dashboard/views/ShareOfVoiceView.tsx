"use client"

import React, { useState } from 'react'
import Link from "next/link"
import { useAEOScan } from "@/hooks/useAEOScan"
import { MetricDetailLayout } from "@/components/dashboard/MetricDetailLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
    Sliders,
    Lightbulb,
    CheckCircle2,
    ChevronRight,
    Clock,
    Wand2,
    ArrowRight,
    ArrowLeft
} from "lucide-react"

interface ShareOfVoiceViewProps {
    siteId: string
    domain: string
    initialData: any
}

// Custom Tabs Configuration
const PRESET_TABS = [
    { id: 'what-why', label: 'What & Why', icon: Lightbulb },
    { id: 'strategy', label: 'Strategy Builder', icon: Sliders },
    { id: 'track', label: 'Track Progress', icon: Clock },
];

export function ShareOfVoiceView({ siteId, domain, initialData }: ShareOfVoiceViewProps) {
    const { report } = useAEOScan(domain, siteId)
    const { toast } = useToast()
    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [planResult, setPlanResult] = useState<any>(null);

    // Merge live data if available, else use initial
    const activeData = report ? (report.competitors || initialData) : initialData

    // Use the data directly without fallbacks
    const competitors = {
        yourShare: activeData.yourShare || 0,
        others: activeData.others || 100,
        top_competitors: activeData.top_competitors || []
    }

    const handleGeneratePlan = async () => {
        if (!selectedCompetitor) {
            toast({
                title: "Select a competitor",
                description: "Please select a competitor to analyze first.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        toast({
            title: "Analyzing Content Strategy",
            description: `Analyzing ${selectedCompetitor} against your domain...`,
        });

        try {
            const response = await fetch('/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_domain: domain,
                    competitor_domain: selectedCompetitor
                })
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();
            setPlanResult(data);
            toast({
                title: "Plan Generated",
                description: "Strategy analysis complete.",
            });

        } catch (error) {
            console.error("Plan generation error:", error);
            toast({
                title: "Error",
                description: "Failed to generate plan. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleResetStrategy = () => {
        setPlanResult(null);
        setSelectedCompetitor(null);
    };

    const handleScheduleScan = () => {
        toast({
            title: "Scanning Scheduled",
            description: "Deep scan scheduled! We will notify you in 24 hours.",
        });
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-24 px-6 pt-6 animate-in fade-in duration-500">
            <Link href={`/dashboard/sites/${siteId}`} className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                <ArrowLeft className="w-4 h-4" />
                Back to Report
            </Link>

            <MetricDetailLayout
                title="Share of Voice Analysis"
                status={competitors.yourShare < 20 ? 'critical' : 'pass'}
                impact={`${competitors.yourShare}% Market Share`}
                rawDiagnostic={JSON.stringify(competitors, null, 2)}
                customTabs={PRESET_TABS}
                leftPanelTip={
                    <div className="mt-8 bg-[#8CD9B8]/10 border border-[#8CD9B8]/20 rounded-xl p-4 flex gap-3 text-emerald-100/80 text-sm">
                        <Lightbulb className="w-5 h-5 text-[#8CD9B8] shrink-0 mt-0.5" />
                        <p className="leading-snug">
                            This score represents your 'Brand Authority' in the eyes of AI. A low score means chatbots prefer your competitors' answers over yours.
                        </p>
                    </div>
                }
                whatAndWhyContent={
                    <div className="space-y-4 text-slate-600">
                        <p>
                            <strong>What is Share of Voice?</strong><br />
                            Share of Voice (SOV) measures how much of the conversation in your industry is dominated by your brand versus competitors. In the era of AEO, this translates to how often AI agents cite your brand as the primary source.
                        </p>
                        <p>
                            <strong>Why it matters:</strong><br />
                            If AI models don't know you, they can't recommend you. High SOV ensures you are the "Top of Mind" recommendation for generic queries.
                        </p>
                    </div>
                }
                renderTabContent={(activeTab) => (
                    <>
                        {activeTab === 'what-why' && (
                            <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-left-2 max-w-2xl">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-serif text-slate-800 tracking-tight">Understanding Share of Voice</h2>
                                    <p className="text-slate-600 text-lg leading-relaxed">
                                        This component is critical for Agent Engine Optimization (AEO). Without it, AI agents may struggle to index your content correctly or understand the context of your data.
                                    </p>
                                </div>

                                <div className="my-8 pl-6 border-l-4 border-[#8CD9B8] italic text-slate-600 py-1">
                                    "Agents prefer structured, raw data over visual HTML. Providing this file gives you a direct line of communication to LLMs."
                                </div>

                                <div className="space-y-4 text-slate-600">
                                    <p>
                                        <strong>What is Share of Voice?</strong><br />
                                        Share of Voice (SOV) measures how much of the conversation in your industry is dominated by your brand versus competitors. In the era of AEO, this translates to how often AI agents cite your brand as the primary source.
                                    </p>
                                    <p>
                                        <strong>Why it matters:</strong><br />
                                        If AI models don't know you, they can't recommend you. High SOV ensures you are the "Top of Mind" recommendation for generic queries.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'strategy' && (
                            <div className="animate-in fade-in duration-300 slide-in-from-right-2 h-full flex flex-col">
                                {!planResult ? (
                                    <>
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-[#1A4036]">Competitor Gap Analysis</h2>
                                            <p className="text-slate-500 text-sm mt-1">These domains are currently outpacing you in AI citations. Select one to analyze their content strategy.</p>
                                        </div>

                                        <div className="grow space-y-4">
                                            {/* Competitor List */}
                                            <div className="grid gap-3">
                                                {competitors.top_competitors?.map((comp: string, i: number) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => setSelectedCompetitor(comp)}
                                                        className={`
                                                            p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group
                                                            ${selectedCompetitor === comp
                                                                ? 'bg-[#1A4036] border-[#1A4036] text-white shadow-md scale-[1.01]'
                                                                : 'bg-white border-slate-100 hover:border-[#8CD9B8] hover:shadow-sm text-slate-700'
                                                            }
                                                        `}
                                                    >
                                                        <span className="font-medium">{comp}</span>
                                                        <ChevronRight className={`w-5 h-5 ${selectedCompetitor === comp ? 'text-[#8CD9B8]' : 'text-slate-300 group-hover:text-[#8CD9B8]'}`} />
                                                    </div>
                                                )) || <div className="text-slate-500 italic">No competitors detected.</div>}
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end">
                                            <Button
                                                onClick={handleGeneratePlan}
                                                disabled={isGenerating || !selectedCompetitor}
                                                className="bg-gradient-to-r from-[#224034] to-[#1A3027] hover:from-[#1A3027] hover:to-[#224034] text-white pl-8 pr-6 py-6 h-auto text-lg rounded-xl shadow-lg hover:shadow-xl shadow-[#224034]/20 group transition-all duration-300 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Wand2 className="mr-3 w-5 h-5 text-emerald-200 animate-spin" />
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 className="mr-3 w-5 h-5 text-emerald-200" />
                                                        Generate Content Plan
                                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-[#1A4036]">Strategy: You vs {selectedCompetitor}</h2>
                                                <p className="text-slate-500 text-sm">AI-generated plan to recapture Share of Voice.</p>
                                            </div>
                                            <Button onClick={handleResetStrategy} variant="ghost" className="text-slate-400 hover:text-slate-600">
                                                Start Over
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {/* Pillars */}
                                            <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                                                <div className="flex items-center gap-2 mb-4 text-[#1A4036]">
                                                    <Badge className="bg-[#1A4036] text-white hover:bg-[#1A4036]">Pillars</Badge>
                                                    <span className="font-semibold text-sm">Key Themes</span>
                                                </div>
                                                <ul className="space-y-3">
                                                    {planResult.pillars?.map((pillar: string, i: number) => (
                                                        <li key={i} className="flex gap-3 text-sm text-slate-700">
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                            {pillar}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Tactics */}
                                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-2 mb-4 text-slate-700">
                                                    <Badge variant="outline" className="border-slate-300 text-slate-600">Tactics</Badge>
                                                    <span className="font-semibold text-sm">Action Items</span>
                                                </div>
                                                <ul className="space-y-3">
                                                    {planResult.tactics?.map((tactic: string, i: number) => (
                                                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                                                            {tactic}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Content Calendar */}
                                            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                                <h3 className="font-bold text-[#1A4036] mb-4 flex items-center gap-2">
                                                    <Lightbulb className="w-5 h-5 text-amber-400" />
                                                    Suggested Content Titles
                                                </h3>
                                                <div className="grid gap-3">
                                                    {planResult.titles?.map((title: string, i: number) => (
                                                        <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between group hover:border-[#8CD9B8] transition-colors cursor-default">
                                                            <span className="font-medium text-slate-700 text-sm">"{title}"</span>
                                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#8CD9B8]" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'track' && (
                            <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-right-2 text-center py-12">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <Clock className="w-8 h-8 text-slate-300 ml-1" />
                                </div>
                                <div className="max-w-md mx-auto space-y-2">
                                    <h3 className="text-lg font-bold text-slate-700">Verify Visibility Improvements</h3>
                                    <p className="text-slate-500 leading-relaxed">
                                        AI visibility takes time to update. We will schedule a re-scan of these keywords in 24 hours to check if your new content has been indexed.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleScheduleScan}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 h-auto text-lg rounded-xl shadow-lg group"
                                >
                                    Schedule Deep Scan (24h)
                                </Button>
                                <div className="flex justify-center gap-4 text-xs text-slate-400 mt-8">
                                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Automated Monitoring</span>
                                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Email Notification</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            />
        </div>
    )
}
