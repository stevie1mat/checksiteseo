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
    Wand2,
    ArrowRight,
    ArrowLeft,
    Search,
    Database,
    FileText,
    BarChart3,
    Check,
    MessageSquare,
    HelpCircle,
    X
} from "lucide-react"

import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"

interface AnswerRateViewProps {
    siteId: string
    domain: string
    initialData: any
}

// Custom Tabs Configuration
const PRESET_TABS = [
    { id: 'what-why', label: 'What & Why', icon: Lightbulb },
    { id: 'strategy', label: 'Strategy Builder', icon: Sliders },
];

export function AnswerRateView({ siteId, domain, initialData }: AnswerRateViewProps) {
    const { report } = useAEOScan(domain, siteId)
    const { toast } = useToast()
    const [isGenerating, setIsGenerating] = useState(false);
    const [planResult, setPlanResult] = useState<any>(null);

    // Dialog Control State
    // Dialog Control State
    const [scanDialogOpen, setScanDialogOpen] = useState(false);
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
    const [scanMessage, setScanMessage] = useState("");

    // Custom Steps for Content Plan
    const PLAN_STEPS = [
        { label: "Analyzing Content", icon: Search, threshold: 0 },
        { label: "Identifying Gaps", icon: Database, threshold: 40 },
        { label: "Drafting Answers", icon: FileText, threshold: 70 },
        { label: "Finalizing Strategy", icon: BarChart3, threshold: 90 },
    ];

    // Use initialData for now (real-time updates can be added later)
    const activeData = initialData

    const answerRate = activeData.rate ?? 0;
    const questionsAnswered = activeData.answered ?? 0;
    const totalQuestions = activeData.total ?? 0;
    const questions = activeData.questions || [];

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        setPlanResult(null);

        // Open Dialog
        setScanStatus('scanning');
        setScanDialogOpen(true);
        setScanMessage("");

        try {
            const res = await fetch('/api/generate-answer-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_domain: domain })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to generate plan");
            }

            const data = await res.json();
            setPlanResult(data);

            // Animation delay for "Finalizing" step
            setTimeout(() => {
                setScanStatus('complete');
                setTimeout(() => {
                    setScanDialogOpen(false);
                    setIsGenerating(false);
                    toast({
                        title: "Plan Generated",
                        description: "Strategy analysis complete.",
                    });
                }, 1000);
            }, 1000);

        } catch (error: any) {
            console.error("Plan generation error:", error);
            setScanStatus('error');
            setScanMessage("Failed to generate plan. Please try again.");
            setIsGenerating(false);
        }
    };

    const handleResetStrategy = () => {
        setPlanResult(null);
    };



    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-24 px-6 pt-6 animate-in fade-in duration-500">
            <ScanProgressDialog
                open={scanDialogOpen}
                onOpenChange={(open) => {
                    if (!isGenerating) setScanDialogOpen(open);
                }}
                siteUrl={domain}
                status={scanStatus}
                message={scanMessage}
                title="Generating Answer Strategy"
                steps={PLAN_STEPS}
            />

            <Link href={`/dashboard/sites/${siteId}`} className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                <ArrowLeft className="w-4 h-4" />
                Back to Report
            </Link>

            <MetricDetailLayout
                title="Answer Rate Analysis"
                status={answerRate < 30 ? 'critical' : 'pass'}
                impact={`${answerRate}% Answer Rate`}
                rawDiagnostic={JSON.stringify({ answerRate, questionsAnswered, totalQuestions }, null, 2)}
                customTabs={PRESET_TABS}
                leftPanelTip={
                    <div className="mt-8 bg-[#8CD9B8]/10 border border-[#8CD9B8]/20 rounded-xl p-4 flex gap-3 text-emerald-100/80 text-sm">
                        <Lightbulb className="w-5 h-5 text-[#8CD9B8] shrink-0 mt-0.5" />
                        <p className="leading-snug">
                            A higher answer rate means AI agents can easily find and serve your content as direct answers to user queries.
                        </p>
                    </div>
                }
                whatAndWhyContent={
                    <div className="space-y-4 text-slate-600">
                        <p>
                            <strong>What is Answer Rate?</strong><br />
                            Answer Rate measures the percentage of potential user questions for which your website provides clear, direct, and authoritative answers.
                        </p>
                        <p>
                            <strong>Why it matters:</strong><br />
                            AI search engines prioritize content that directly answers questions. Increasing your answer rate improves your chances of being the featured snippet or voice answer.
                        </p>
                    </div>
                }
                renderTabContent={(activeTab) => (
                    <>
                        {activeTab === 'what-why' && (
                            <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-left-2 max-w-2xl">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-serif text-slate-800 tracking-tight">Understanding Answer Rate</h2>
                                    <h3 className="text-xl text-emerald-800/80 font-medium">Direct Answer Metric</h3>

                                    <div className="space-y-4 pt-1">
                                        <p className="text-slate-600 text-lg leading-relaxed">
                                            This metric indicates how well your content directly addresses the specific queries your audience is asking.
                                        </p>
                                        <p className="text-slate-600 text-lg leading-relaxed">
                                            In the AEO era, 'answering' means providing concise, structured data that an AI can easily ingest and repeat.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mt-4">
                                    <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <MessageSquare className="w-6 h-6 text-emerald-600" />
                                            <h3 className="font-semibold text-emerald-900">Questions Answered</h3>
                                        </div>
                                        <p className="text-4xl font-bold text-emerald-700 mb-2">{questionsAnswered}</p>
                                    </div>

                                    <div className="p-6 bg-rose-50 rounded-xl border border-rose-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <HelpCircle className="w-6 h-6 text-rose-600" />
                                            <h3 className="font-semibold text-rose-900">Questions Unanswered</h3>
                                        </div>
                                        <p className="text-4xl font-bold text-rose-700 mb-2">{totalQuestions - questionsAnswered}</p>
                                    </div>
                                </div>

                                {/* Detailed Question Breakdown */}
                                <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                                    {/* Answered Column */}
                                    <div>
                                        <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            Answered Questions
                                        </h3>
                                        <div className="space-y-3">
                                            {questions.filter((q: any) => q.status === 'Explicitly Stated').length > 0 ? (
                                                questions.filter((q: any) => q.status === 'Explicitly Stated').map((q: any, i: number) => (
                                                    <div key={i} className="p-3 bg-white border border-emerald-100 rounded-lg flex items-start gap-3 shadow-sm">
                                                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                        <span className="text-sm text-slate-700 leading-snug">{q.question || q.topic}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No answered questions detected yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Unanswered Column */}
                                    <div>
                                        <h3 className="text-lg font-bold text-rose-900 mb-4 flex items-center gap-2">
                                            <HelpCircle className="w-5 h-5 text-rose-500" />
                                            Missing Answers
                                        </h3>
                                        <div className="space-y-3">
                                            {questions.filter((q: any) => q.status !== 'Explicitly Stated').length > 0 ? (
                                                questions.filter((q: any) => q.status !== 'Explicitly Stated').map((q: any, i: number) => (
                                                    <div key={i} className="p-3 bg-white border border-rose-100 rounded-lg flex items-start gap-3 shadow-sm group">
                                                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 group-hover:scale-125 transition-transform" />
                                                        <span className="text-sm text-slate-700 leading-snug">{q.question || q.topic}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No missing answers found!</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'strategy' && (
                            <div className="animate-in fade-in duration-300 slide-in-from-right-2 h-full flex flex-col">
                                {!planResult ? (
                                    <>
                                        {/* Header */}
                                        <div className="mb-6 flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-[#1A4036]">Content Gap Analysis</h2>
                                                <p className="text-slate-500 text-sm mt-1">
                                                    Analyze your content against common user questions.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grow space-y-4">
                                            {/* Questions List */}
                                            {questions.length > 0 ? (
                                                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {questions.map((q: any, i: number) => (
                                                        <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {q.status === 'Explicitly Stated' ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                                ) : (
                                                                    <HelpCircle className="w-5 h-5 text-rose-400 shrink-0" />
                                                                )}
                                                                <span className="text-slate-700 font-medium">{q.question || q.topic}</span>
                                                            </div>
                                                            <Badge variant={q.status === 'Explicitly Stated' ? 'default' : 'outline'} className={q.status === 'Explicitly Stated' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none' : 'text-slate-500 border-slate-200'}>
                                                                {q.status || 'Unanswered'}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                                    <Search className="w-8 h-8 text-slate-300 mb-4" />
                                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No questions found</h3>
                                                    <p className="text-slate-500 max-w-xs mb-6 mx-auto">
                                                        Run a fresh scan to identify content gaps.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Footer */}
                                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end">
                                            <Button
                                                onClick={handleGeneratePlan}
                                                disabled={isGenerating}
                                                className="w-full bg-gradient-to-r from-[#224034] to-[#1A3027] hover:from-[#1A3027] hover:to-[#224034] text-white py-4 h-auto text-lg rounded-xl shadow-lg hover:shadow-xl shadow-[#224034]/20 group transition-all duration-300 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Wand2 className="mr-3 w-5 h-5 text-emerald-200 animate-spin" />
                                                        Analyzing Gaps...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 className="mr-3 w-5 h-5 text-emerald-200" />
                                                        Generate Answer Plan
                                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    // Plan Result UI
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-[#1A4036]">Strategic Recommendations</h2>
                                                <p className="text-slate-500 text-sm">Actionable steps to improve your Answer Rate.</p>
                                            </div>
                                            <Button onClick={handleResetStrategy} variant="ghost" className="text-slate-400 hover:text-slate-600">
                                                Start Over
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {/* Pillars */}
                                            <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                                                <div className="flex items-center gap-2 mb-4 text-[#1A4036]">
                                                    <Badge className="bg-[#1A4036] text-white hover:bg-[#1A4036]">Focus Areas</Badge>
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
                                                    <span className="font-semibold text-sm">Implementation</span>
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
                                                    Target Content Titles
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


                    </>
                )}
            />
        </div>
    )
}


