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
    Wand2,
    ArrowRight,
    ArrowLeft,
    Search,
    Plus,
    X,
    Check,
    Database,
    FileText,
    BarChart3
} from "lucide-react"

import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"

interface ShareOfVoiceViewProps {
    siteId: string
    domain: string
    initialData: any
}

// Custom Tabs Configuration
const PRESET_TABS = [
    { id: 'what-why', label: 'What & Why', icon: Lightbulb },
    { id: 'strategy', label: 'Strategy Builder', icon: Sliders },
];

export function ShareOfVoiceView({ siteId, domain, initialData }: ShareOfVoiceViewProps) {
    const { report } = useAEOScan(domain, siteId)
    const { toast } = useToast()
    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [planResult, setPlanResult] = useState<any>(null);

    // Dialog Control State
    const [scanDialogOpen, setScanDialogOpen] = useState(false);
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
    const [scanMessage, setScanMessage] = useState("");

    // Custom Steps for Content Plan
    const PLAN_STEPS = [
        { label: "Initializing", icon: Search, threshold: 0 },
        { label: "Competitor Analysis", icon: Database, threshold: 30 },
        { label: "Strategy Generation", icon: FileText, threshold: 60 },
        { label: "Finalizing Plan", icon: BarChart3, threshold: 90 },
    ];

    // Merge live data if available, else use initial
    const activeData = report ? (report.competitors || initialData) : initialData

    // Local State for Competitors (initialized from prop/report)
    const [competitorList, setCompetitorList] = useState<string[]>(
        activeData.top_competitors || []
    );
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newCompetitorUrl, setNewCompetitorUrl] = useState("");

    const yourShare = activeData.yourShare || 0;

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
        setPlanResult(null);

        // Open Dialog
        setScanStatus('scanning');
        setScanDialogOpen(true);
        setScanMessage("");

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
            // Kepp dialog open on error so user can see it failed
            setIsGenerating(false);
        }
    };

    const handleResetStrategy = () => {
        setPlanResult(null);
        setSelectedCompetitor(null);
    };



    const handleRemoveCompetitor = (compToRemove: string) => {
        setCompetitorList(prev => prev.filter(c => c !== compToRemove));
        if (selectedCompetitor === compToRemove) {
            setSelectedCompetitor(null);
        }
    };

    const handleAddCompetitor = () => {
        if (!newCompetitorUrl.trim()) return;

        if (competitorList.length >= 5) {
            toast({
                title: "Limit Reached",
                description: "You can only track up to 5 competitors.",
                variant: "destructive"
            });
            return;
        }

        // Simple domain extraction/cleanup
        let cleanDomain = newCompetitorUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

        if (competitorList.includes(cleanDomain)) {
            toast({
                title: "Duplicate",
                description: "This competitor is already in the list.",
                variant: "destructive"
            });
            return;
        }

        setCompetitorList(prev => [...prev, cleanDomain]);
        setNewCompetitorUrl("");
        setIsAdding(false);
        toast({
            title: "Competitor Added",
            description: `${cleanDomain} added to list.`
        });
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-24 px-6 pt-6 animate-in fade-in duration-500">
            <ScanProgressDialog
                open={scanDialogOpen}
                onOpenChange={(open) => {
                    if (!isGenerating) setScanDialogOpen(open);
                }}
                siteUrl={selectedCompetitor || ""}
                status={scanStatus}
                message={scanMessage}
                title="Generating Content Strategy"
                steps={PLAN_STEPS}
            />

            <Link href={`/dashboard/sites/${siteId}`} className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                <ArrowLeft className="w-4 h-4" />
                Back to Report
            </Link>

            <MetricDetailLayout
                title="Share of Voice Analysis"
                status={yourShare < 20 ? 'critical' : 'pass'}
                impact={`${yourShare}% Market Share`}
                rawDiagnostic={JSON.stringify({ yourShare, competitorList }, null, 2)}
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
                                    <h3 className="text-xl text-emerald-800/80 font-medium">AEO Visibility Metric</h3>

                                    <div className="space-y-4 pt-1">
                                        <p className="text-slate-600 text-lg leading-relaxed">
                                            This metric is your ultimate scorecard for Agent Engine Optimization (AEO). It tracks how frequently AI models cite your brand compared to your competitors.
                                        </p>
                                        <p className="text-slate-600 text-lg leading-relaxed">
                                            Unlike traditional SEO rankings, Share of Voice measures 'Brand Authority'—determining if AI agents view you as a trusted expert or ignore you entirely.
                                        </p>
                                    </div>
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
                                        {/* Header & Edit Action */}
                                        <div className="mb-6 flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-[#1A4036]">Competitor Gap Analysis</h2>
                                                <p className="text-slate-500 text-sm mt-1">
                                                    {competitorList.length > 0
                                                        ? `Tracking ${competitorList.length}/5 competitors.`
                                                        : "Add up to 5 competitors to analyze gaps."}
                                                </p>
                                            </div>
                                            {competitorList.length > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsEditing(!isEditing)}
                                                    className="text-slate-400 hover:text-slate-600 h-8 px-2"
                                                >
                                                    {isEditing ? "Done" : "Edit List"}
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grow space-y-4">
                                            {/* Competitor List */}
                                            {competitorList.length > 0 ? (
                                                <div className="grid gap-3">
                                                    {competitorList.map((comp, i) => (
                                                        <div
                                                            key={i}
                                                            onClick={() => !isEditing && setSelectedCompetitor(comp)}
                                                            className={`
                                                                p-4 rounded-xl border flex items-center justify-between transition-all duration-200 group
                                                                ${isEditing
                                                                    ? 'bg-white border-slate-200 cursor-default'
                                                                    : selectedCompetitor === comp
                                                                        ? 'bg-[#1A4036] border-[#1A4036] text-white shadow-md scale-[1.01] cursor-pointer'
                                                                        : 'bg-white border-slate-100 hover:border-[#8CD9B8] hover:shadow-sm text-slate-700 cursor-pointer'
                                                                }
                                                            `}
                                                        >
                                                            <span className="font-medium">{comp}</span>

                                                            {isEditing ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveCompetitor(comp);
                                                                    }}
                                                                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            ) : (
                                                                <ChevronRight className={`w-5 h-5 ${selectedCompetitor === comp ? 'text-[#8CD9B8]' : 'text-slate-300 group-hover:text-[#8CD9B8]'}`} />
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* Inline Add Button if valid list exists but user wants more */}
                                                    {isEditing && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => { setIsEditing(false); setIsAdding(true); }}
                                                            disabled={competitorList.length >= 5}
                                                            className="w-full border-dashed border-slate-300 text-slate-500 hover:border-[#8CD9B8] hover:text-[#1A4036] disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            {competitorList.length >= 5 ? "Limit Reached (5/5)" : "Add Another"}
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Empty State */
                                                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                                        <Search className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No competitors defined</h3>
                                                    <p className="text-slate-500 max-w-xs mb-6 mx-auto">
                                                        Add a competitor URL to generate a content strategy plan.
                                                    </p>
                                                    <Button
                                                        onClick={() => setIsAdding(true)}
                                                        className="bg-white text-slate-700 border border-slate-200 hover:border-[#8CD9B8] hover:text-[#1A4036] shadow-sm"
                                                    >
                                                        Add Competitor URL
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Add Competitor Input UI */}
                                            {isAdding && (
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Competitor Domain</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. competitor.com"
                                                            value={newCompetitorUrl}
                                                            onChange={(e) => setNewCompetitorUrl(e.target.value)}
                                                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8CD9B8]/50 text-sm"
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
                                                        />
                                                        <Button onClick={handleAddCompetitor} className="bg-[#1A4036] text-white hover:bg-[#224034]">
                                                            Add
                                                        </Button>
                                                        <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Footer */}
                                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end">
                                            <Button
                                                onClick={handleGeneratePlan}
                                                disabled={isGenerating || !selectedCompetitor}
                                                className="w-full bg-gradient-to-r from-[#224034] to-[#1A3027] hover:from-[#1A3027] hover:to-[#224034] text-white py-4 h-auto text-lg rounded-xl shadow-lg hover:shadow-xl shadow-[#224034]/20 group transition-all duration-300 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    // Plan Result UI (Same as before)
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


                    </>
                )}
            />
        </div>
    )
}
