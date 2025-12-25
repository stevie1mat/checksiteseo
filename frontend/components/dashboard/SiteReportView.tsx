"use client"

import { useState } from "react"
import { BarChart3, Code, AlignLeft, Sparkles, ChevronRight } from "lucide-react"
import { useAEOScan } from "@/hooks/useAEOScan"
import { AEOReport } from "@/types/aeo"
import { OverviewTab } from "./tabs/OverviewTab"
import { TechnicalTab } from "./tabs/TechnicalTab"
import { ContentTab } from "./tabs/ContentTab"
import { AuthorityTab } from "./tabs/AuthorityTab"

interface SiteReportViewProps {
    domain: string
    initialReport?: AEOReport
}

export function SiteReportView({ domain, initialReport }: SiteReportViewProps) {
    const { report, isLoading } = useAEOScan(domain)

    // Use live report if available, otherwise initial
    const activeReport = report || initialReport

    // Skeleton Loading State
    if (isLoading && !activeReport) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-slate-50 border border-slate-100 p-5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 to-transparent animate-shimmer" style={{ transform: 'translateX(-100%)' }} />
                            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-4" />
                            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-64 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="h-64 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (!activeReport) return null; // Should not happen if initialReport is passed

    // If report is still processing (from polling), show scanning UI or just skeletons
    if (activeReport.status === 'processing') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="p-8 text-center bg-blue-50 rounded-xl border border-blue-100">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-blue-900">Analysis in Progress</h3>
                    <p className="text-blue-700 mt-1">Our AI agents are currently auditing {domain}. This usually takes 30-60 seconds.</p>
                </div>
            </div>
        )
    }

    const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'content' | 'authority'>('overview')

    // Helper Accessors (Safeguarded)
    const aeoScore = activeReport.scores?.overall || 0
    const techScore = activeReport.scores?.technical || 0
    const contentScore = activeReport.scores?.content || 0

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Overview / Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Score Card */}
                <div onClick={() => setActiveTab('overview')}
                    className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 group
                    ${activeTab === 'overview' ? 'bg-[#224034] text-white border-[#224034] shadow-md ring-2 ring-[#224034] ring-offset-2' : 'bg-white hover:border-[#224034]/30 border-slate-200 text-slate-700 hover:shadow-md'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'overview' ? 'text-emerald-300' : 'text-slate-400'}`}>Overall AEO Score</span>
                        <BarChart3 className={`w-4 h-4 ${activeTab === 'overview' ? 'text-emerald-300' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-serif font-medium">{aeoScore}</span>
                                <span className={`text-sm ${activeTab === 'overview' ? 'text-emerald-200' : 'text-slate-400'}`}>/ 100</span>
                            </div>
                            <p className={`text-xs mt-1 ${activeTab === 'overview' ? 'text-emerald-200' : 'text-slate-400'}`}>Executive Summary</p>
                        </div>
                    </div>
                </div>

                {/* Technical Card */}
                <div onClick={() => setActiveTab('technical')}
                    className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 group
                    ${activeTab === 'technical' ? 'bg-[#224034] text-white border-[#224034] shadow-md ring-2 ring-[#224034] ring-offset-2' : 'bg-white hover:border-[#224034]/30 border-slate-200 text-slate-700 hover:shadow-md'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'technical' ? 'text-emerald-300' : 'text-slate-400'}`}>Technical</span>
                        <Code className={`w-4 h-4 ${activeTab === 'technical' ? 'text-emerald-300' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-serif font-medium">{techScore > 0 ? techScore : '-'}</div>
                            <p className={`text-xs mt-1 ${activeTab === 'technical' ? 'text-emerald-200' : 'text-slate-400'}`}>Robots, LLMs.txt, Schema</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${activeTab === 'technical' ? 'text-emerald-300' : 'text-slate-400'}`} />
                    </div>
                </div>

                {/* Content Card */}
                <div onClick={() => setActiveTab('content')}
                    className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 group
                    ${activeTab === 'content' ? 'bg-[#224034] text-white border-[#224034] shadow-md ring-2 ring-[#224034] ring-offset-2' : 'bg-white hover:border-[#224034]/30 border-slate-200 text-slate-700 hover:shadow-md'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'content' ? 'text-emerald-300' : 'text-slate-400'}`}>Content</span>
                        <AlignLeft className={`w-4 h-4 ${activeTab === 'content' ? 'text-emerald-300' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-serif font-medium">{contentScore > 0 ? contentScore : '-'}</div>
                            <p className={`text-xs mt-1 ${activeTab === 'content' ? 'text-emerald-200' : 'text-slate-400'}`}>Structure, Failed Queries</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${activeTab === 'content' ? 'text-emerald-300' : 'text-slate-400'}`} />
                    </div>
                </div>

                {/* Authority Card */}
                <div onClick={() => setActiveTab('authority')}
                    className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 group
                    ${activeTab === 'authority' ? 'bg-[#224034] text-white border-[#224034] shadow-md ring-2 ring-[#224034] ring-offset-2' : 'bg-white hover:border-[#224034]/30 border-slate-200 text-slate-700 hover:shadow-md'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'authority' ? 'text-emerald-300' : 'text-slate-400'}`}>Authority</span>
                        <Sparkles className={`w-4 h-4 ${activeTab === 'authority' ? 'text-emerald-300' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-serif font-medium">Analysis</div>
                            <p className={`text-[10px] mt-1 ${activeTab === 'authority' ? 'text-emerald-200' : 'text-slate-400'}`}>Knowledge Graph, E-E-A-T</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${activeTab === 'authority' ? 'text-emerald-300' : 'text-slate-400'}`} />
                    </div>
                </div>
            </div>

            {/* Detailed Views */}
            <div className="mt-8">
                {activeTab === 'overview' && (
                    <OverviewTab activeReport={activeReport} setActiveTab={setActiveTab} />
                )}

                {activeTab === 'technical' && (
                    <TechnicalTab activeReport={activeReport} />
                )}

                {activeTab === 'content' && (
                    <ContentTab activeReport={activeReport} />
                )}

                {activeTab === 'authority' && (
                    <AuthorityTab activeReport={activeReport} />
                )}
            </div>
        </div>
    )
}
