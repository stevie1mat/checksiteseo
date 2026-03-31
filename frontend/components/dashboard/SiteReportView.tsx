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
    siteId?: string
    tier?: string
}

export function SiteReportView({ domain, initialReport, siteId, tier = 'free' }: SiteReportViewProps) {
    const { report, isLoading } = useAEOScan(domain, siteId)
    const [activeTab, setActiveTabState] = useState<'overview' | 'technical' | 'content' | 'authority'>('overview');

    const setActiveTab = (tab: any) => {
        setActiveTabState(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    // If report is still processing (from polling), show scanning UI or just skeletons
    // For now we assume completed or failed



    // Derived Scores
    const overallScore = Math.round(activeReport.scores.overall);
    const techScore = typeof activeReport.scores.technical === 'number' ? Math.round(activeReport.scores.technical) : 0;
    const contentScore = typeof activeReport.scores.content === 'number' ? Math.round(activeReport.scores.content) : 0;
    const authorityScore = activeReport.scores.authority; // 'Analysis' string usually

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Overview / Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Overall Score (Overview Tab Trigger) */}
                <div
                    onClick={() => setActiveTab('overview')}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden group
                        ${activeTab === 'overview'
                            ? 'bg-[#1A4036] border-[#1A4036] text-white shadow-xl scale-[1.02]'
                            : 'bg-white border-slate-100 hover:border-[#8CD9B8] hover:shadow-md'
                        }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'overview' ? 'text-[#8CD9B8]' : 'text-slate-500'}`}>
                            Overall AEO Score
                        </span>
                        <BarChart3 className={`w-5 h-5 ${activeTab === 'overview' ? 'text-[#8CD9B8]' : 'text-slate-300'}`} />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-serif font-medium">{overallScore}</span>
                        <span className={`text-sm mb-1.5 ${activeTab === 'overview' ? 'text-slate-300' : 'text-slate-400'}`}>/ 100</span>
                    </div>
                    <div className={`mt-2 text-sm ${activeTab === 'overview' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Executive Summary
                    </div>
                </div>

                {/* 2. Technical (Tab Trigger) */}
                <div
                    onClick={() => setActiveTab('technical')}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer group
                        ${activeTab === 'technical'
                            ? 'bg-white border-[#1A4036] ring-1 ring-[#1A4036] shadow-md'
                            : 'bg-white border-slate-100 hover:border-[#8CD9B8] hover:shadow-md'
                        }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Technical</span>
                        <Code className={`w-5 h-5 ${activeTab === 'technical' ? 'text-[#1A4036]' : 'text-slate-300'}`} />
                    </div>
                    <div className="text-3xl font-serif font-medium text-[#224034]">{techScore > 0 ? techScore : '-'}</div>
                    <div className="mt-2 text-sm text-slate-500 truncate">
                        Robots, LLMs.txt, Schema
                    </div>
                </div>

                {/* 3. Content (Tab Trigger) */}
                <div
                    onClick={() => setActiveTab('content')}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer group
                        ${activeTab === 'content'
                            ? 'bg-white border-[#1A4036] ring-1 ring-[#1A4036] shadow-md'
                            : 'bg-white border-slate-100 hover:border-[#8CD9B8] hover:shadow-md'
                        }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Content</span>
                        <AlignLeft className={`w-5 h-5 ${activeTab === 'content' ? 'text-[#1A4036]' : 'text-slate-300'}`} />
                    </div>
                    <div className="text-3xl font-serif font-medium text-[#224034]">{contentScore > 0 ? contentScore : '-'}</div>
                    <div className="mt-2 text-sm text-slate-500 truncate">
                        Structure, Failed Queries
                    </div>
                </div>

                {/* 4. Authority (Tab Trigger) */}
                <div
                    onClick={() => {
                        if (tier !== 'pro') {
                            window.location.href = '/dashboard/billing?upgrade=pro'
                            return
                        }
                        setActiveTab('authority')
                    }}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer group
                        ${activeTab === 'authority'
                            ? 'bg-white border-[#1A4036] ring-1 ring-[#1A4036] shadow-md'
                            : 'bg-white border-slate-100 hover:border-[#8CD9B8] hover:shadow-md'
                        }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Authority</span>
                        <Sparkles className={`w-5 h-5 ${activeTab === 'authority' ? 'text-[#1A4036]' : 'text-slate-300'}`} />
                    </div>
                    <div className="text-3xl font-serif font-medium text-[#224034]">
                        {tier === 'pro' ? (authorityScore > 0 ? authorityScore : '-') : 'Pro'}
                    </div>
                    <div className="mt-2 text-sm text-slate-500 truncate">
                        {tier === 'pro' ? 'Knowledge Graph, E-E-A-T' : 'Upgrade for Authority Insights'}
                    </div>
                </div>
            </div>

            {/* Detailed Views */}
            <div className="mt-8">
                {/* 0. EXECUTIVE SUMMARY (Overview Only) */}
                {(activeTab === 'overview') && (
                    <OverviewTab activeReport={activeReport} setActiveTab={setActiveTab} siteId={siteId} tier={tier} domain={domain} />
                )}

                {/* 1. TECHNICAL VIEW */}
                {(activeTab === 'technical') && (
                    <TechnicalTab activeReport={activeReport} setActiveTab={setActiveTab} siteId={siteId} />
                )}

                {/* 2. CONTENT VIEW */}
                {(activeTab === 'content') && (
                    <ContentTab activeReport={activeReport} siteId={siteId} domain={domain} tier={tier} />
                )}

                {/* 3. AUTHORITY VIEW */}
                {(activeTab === 'authority') && (
                    <AuthorityTab activeReport={activeReport} siteId={siteId} tier={tier} />
                )}
            </div>
        </div>
    )
}
