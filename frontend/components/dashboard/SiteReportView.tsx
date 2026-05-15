"use client"

import { useAEOScan } from "@/hooks/useAEOScan"
import { AEOReport } from "@/types/aeo"
import { OverviewTab } from "./tabs/OverviewTab"
import { TechnicalTab } from "./tabs/TechnicalTab"
import { ContentTab } from "./tabs/ContentTab"
import { AuthorityTab } from "./tabs/AuthorityTab"
import { useSearchParams, useRouter } from "next/navigation"

interface SiteReportViewProps {
    domain: string
    initialReport?: AEOReport
    siteId?: string
    tier?: string
}

export function SiteReportView({ domain, initialReport, siteId, tier = 'free' }: SiteReportViewProps) {
    const { report, isLoading } = useAEOScan(domain, siteId)
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const activeTab = searchParams.get('tab') || 'overview'

    const setActiveTab = (tab: string) => {
        router.push(`/dashboard/sites/${siteId}?tab=${tab}`)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Keep the UI stable while a background scan is processing.
    // If the live response is "processing", keep showing the last good report.
    const activeReport = report?.status === 'processing'
        ? (initialReport || report)
        : (report || initialReport)

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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Detailed Views */}
            <div className="mt-3 md:mt-4">
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
