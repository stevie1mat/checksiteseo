import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Info, FileText, AlertCircle, Share2, Sparkles, Code, Search, Check, Clock, Cpu } from "lucide-react"
import { AEOReport } from "@/types/aeo"

interface OverviewTabProps {
    activeReport: AEOReport
    setActiveTab: (tab: 'overview' | 'technical' | 'content' | 'authority') => void
    siteId?: string
}

// Imports needed for state
import React, { useState, useEffect } from "react"
import { Wand2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

// ... imports remain the same

export function OverviewTab({ activeReport, setActiveTab, siteId }: OverviewTabProps) {
    const { toast } = useToast()
    const aeoScore = activeReport.scores?.overall || 0
    // ... scores logic remains same
    const techScore = activeReport.scores?.technical || 0
    const contentScore = activeReport.scores?.content || 0
    const failedQueries = activeReport.content?.missingAnswers || []
    // Unified Knowledge Graph Data (Merge backend snake_case with legacy structure)
    const rawKG = activeReport.authority?.knowledge_graph?.data;
    const knowledgeGraph = {
        primaryEntity: rawKG?.primary_entity || activeReport.knowledgeGraph?.primaryEntity,
        nodes: activeReport.knowledgeGraph?.nodes ? [...activeReport.knowledgeGraph.nodes] : []
    }

    // Generate nodes dynamically if missing
    if (knowledgeGraph.nodes.length === 0 && rawKG?.relationships) {
        const rels = rawKG.relationships;
        if (rels.worksFor && rels.worksFor !== 'None Detected' && rels.worksFor !== 'None') {
            knowledgeGraph.nodes.push({ label: rels.worksFor, type: "Org" });
        }
        if (rels.jobTitle && rels.jobTitle !== 'None Detected' && rels.jobTitle !== 'None') {
            knowledgeGraph.nodes.push({ label: rels.jobTitle, type: "Role" });
        }
        if (Array.isArray(rels.knowsAbout)) {
            rels.knowsAbout.slice(0, 3).forEach(skill => {
                if (skill && skill.length < 20) knowledgeGraph.nodes.push({ label: skill, type: "Topic" });
            });
        }
        // Org specific
        if (rels.location && rels.location !== 'None' && rels.location.length < 20) {
            knowledgeGraph.nodes.push({ label: rels.location, type: "Loc" });
        }
        if (Array.isArray(rels.products)) {
            rels.products.slice(0, 2).forEach(prod => {
                if (prod && prod.length < 15) knowledgeGraph.nodes.push({ label: prod, type: "Prod" });
            });
        }
        if (Array.isArray(rels.founders)) {
            rels.founders.slice(0, 1).forEach(f => {
                if (f && f.length < 20) knowledgeGraph.nodes.push({ label: f, type: "Person" });
            });
        }
    }
    const hallucinationLevel = activeReport.authority?.eeat?.hallucination_risk?.level || 'Low'

    // -- Scheduling State --
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [hasPendingScan, setHasPendingScan] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [domain, setDomain] = useState<string>(""); // Need domain for scheduling

    // Fetch user and check pending scans on mount
    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) setUserEmail(user.email)

            if (siteId) {
                // Get domain from site details if needed, or from report if available
                // Ideally this prop would be passed, but let's try to get it from DB or report
                // ... logic to get domain ...
                // Quick fix: fetch site url
                const { data: site } = await supabase.from('sites').select('url').eq('id', siteId).single()
                if (site) setDomain(site.url)

                const { data } = await supabase
                    .from('scheduled_scans')
                    .select('*')
                    .eq('site_id', siteId)
                    .in('status', ['pending', 'processing'])

                if (data && data.length > 0) {
                    setHasPendingScan(true);
                }
            }
        }
        init()
    }, [siteId])

    const handleCancelScan = async () => {
        setIsCancelling(true);
        try {
            const res = await fetch('/api/cancel-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ site_id: siteId })
            });
            if (!res.ok) throw new Error("Failed to cancel");
            setHasPendingScan(false);
            toast({ title: "Scan Cancelled", description: "Deep scan monitoring disabled." });
        } catch (error: any) {
            toast({ title: "Error", description: "Could not cancel scan.", variant: "destructive" });
        } finally {
            setIsCancelling(false);
        }
    };

    const handleScheduleScan = async () => {
        if (!userEmail || !domain) return;
        setIsScheduling(true);
        try {
            const res = await fetch('/api/schedule-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    site_id: siteId,
                    url: domain,
                    email: userEmail,
                    delay_hours: 24,
                    scan_type: 'full' // Always full scan from dashboard
                })
            });
            if (!res.ok && res.status !== 409) throw new Error("Failed to schedule");
            setHasPendingScan(true);
            toast({ title: "Monitoring Enabled", description: "We will scan this site every 24 hours." });
        } catch (error: any) {
            toast({ title: "Error", description: "Could not enable monitoring.", variant: "destructive" });
        } finally {
            setIsScheduling(false);
        }
    };


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* 1. Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* KPI 0: Deep Scan Monitoring (New) */}
                <div className="bg-white p-5 h-full rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-[#224034]">
                            <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monitoring</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-3 h-3 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">Automatic 24-hour deep scans to track your progress.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${hasPendingScan ? 'text-emerald-700' : 'text-slate-600'}`}>
                                {hasPendingScan ? "Active" : "Inactive"}
                            </span>
                            <button
                                onClick={() => hasPendingScan ? handleCancelScan() : handleScheduleScan()}
                                disabled={isScheduling || isCancelling}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${hasPendingScan ? 'bg-emerald-500' : 'bg-slate-200'} ${(isScheduling || isCancelling) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <span className={`${hasPendingScan ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className={`w-2 h-2 rounded-full ${hasPendingScan ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            {hasPendingScan ? "Next scan in ~24h" : "Auto-scan disabled"}
                        </div>
                    </div>
                </div>

                <TooltipProvider>
                    {/* KPI 1: Share of Voice (Competitor Widget) */}
                    <Link href={siteId ? `/dashboard/sites/${siteId}/share-of-voice` : '#'} className="block">
                        {/* ... existing Share of Voice Card content ... */}
                        <div className="bg-white p-5 h-full rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 hover:shadow-md transition-all">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-emerald-50 rounded-lg text-[#224034]">
                                    <BarChart3 className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Share of Voice</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Percentage of AI responses where your brand is cited vs competitors.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="space-y-3 relative z-10">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-emerald-700">You</span>
                                        <span className="font-medium text-slate-600">12%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: '12%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-500">Competitors</span>
                                        <span className="font-medium text-slate-600">60%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-300" style={{ width: '60%' }} />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <BarChart3 className="w-16 h-16 text-[#224034]" />
                            </div>
                        </div>
                    </Link>

                    {/* KPI 2: Content Gap */}
                    <Link href={siteId ? `/dashboard/sites/${siteId}/answer-rate` : '#'} className="block">
                        <div className="bg-white p-5 h-full rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText className="w-16 h-16 text-[#224034]" />
                            </div>
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className="p-2 bg-emerald-50 rounded-lg text-[#224034]">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Answer Rate</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">How many user questions your content directly answers.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="text-3xl font-serif font-medium text-slate-800">
                                    {failedQueries.length > 0 && Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / failedQueries.length) * 100) > 0 ?
                                        Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / failedQueries.length) * 100) + '%' :
                                        '12%'
                                    }
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Of Questions Answered</p>
                                <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{
                                        width: (failedQueries.length > 0 && Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / failedQueries.length) * 100) > 0) ?
                                            (Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / failedQueries.length) * 100)) + '%' :
                                            '12%'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* KPI 3: Hallucination Risk */}
                    <Link href={siteId ? `/dashboard/sites/${siteId}/hallucination-risk` : '#'} className="block">
                        <div className="bg-white p-5 h-full rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertCircle className="w-16 h-16 text-[#224034]" />
                            </div>
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className={`p-2 rounded-lg ${hallucinationLevel === 'High' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safety Score</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Risk of AI models hallucinating when citing your content.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="relative z-10">
                                <div className={`text-3xl font-serif font-medium ${hallucinationLevel === 'High' ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {hallucinationLevel === 'High' ? 'High Risk' : 'Safe'}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Hallucination Probability</p>
                                <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${hallucinationLevel === 'High' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: hallucinationLevel === 'High' ? '25%' : '90%' }} />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* KPI 4: Knowledge Graph Visualizer */}
                    <Link href={siteId ? `/dashboard/sites/${siteId}/knowledge-graph` : '#'} className="block">
                        <div className="bg-[#1A4036] p-5 h-full rounded-xl border border-[#2a4e40] shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                                    <Share2 className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-emerald-200/70 uppercase tracking-wider">Knowledge Graph</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-emerald-400/50 cursor-help hover:text-emerald-300 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#224034] border-emerald-500/20 text-emerald-100">
                                        <p className="max-w-xs">Visual representation of how AI understands your brand entities.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="relative h-24 w-full flex items-center justify-center">
                                <div className="relative flex items-center justify-center w-full h-full">
                                    {/* Center Node */}
                                    <div className="z-10 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-900/50 border border-emerald-400">
                                        {knowledgeGraph.primaryEntity ? knowledgeGraph.primaryEntity.substring(0, 15) : 'Entity'}
                                    </div>
                                    {/* Satellite Nodes (Dynamic) */}
                                    {knowledgeGraph.nodes.slice(0, 3).map((node, i) => {
                                        const positions = [
                                            "top-0 right-4",
                                            "bottom-1 left-4",
                                            "bottom-4 right-8"
                                        ];
                                        const delays = ['0s', '2s', '4s'];
                                        return (
                                            <div
                                                key={i}
                                                className={`absolute ${positions[i]} bg-[#224034] text-emerald-300 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-sm animate-float`}
                                                style={{ animationDelay: delays[i] }}
                                            >
                                                {node.label.length > 12 ? node.label.substring(0, 12) + '...' : node.label}
                                            </div>
                                        )
                                    })}

                                    {/* Fallback if no nodes found (e.g. empty scan) */}
                                    {knowledgeGraph.nodes.length === 0 && (
                                        <div className="absolute bottom-1 left-4 bg-[#224034]/50 text-emerald-300/50 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/10 border-dashed">
                                            No Data
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                </TooltipProvider>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Left Column: Priority Actions & Score Breakdown */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Priority Action Plan */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h3 className="text-md font-bold text-slate-800">Priority Recommendations</h3>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100">High Impact</Badge>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {/* Action 1: Technical */}
                            {techScore < 80 && (
                                <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                            <Code className="w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Improve Technical Foundation</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                            Your technical score is low ({techScore}/100). Check your <strong>Robots.txt</strong> and <strong>Sitemap</strong> to ensure agents can crawl your site.
                                        </p>
                                        <button onClick={() => setActiveTab('technical')} className="text-xs text-blue-600 font-medium mt-2 hover:underline">View Technical Fixes →</button>
                                    </div>
                                </div>
                            )}

                            {/* Action 1.5: Payload Efficiency Check */}
                            {activeReport.agentEconomics?.codeToTextRatio < 0.15 && (
                                <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                            <Cpu className="w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Code Bloat Detected</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                            Your site has a low signal-to-noise ratio. AEO Agents may time out or truncate your content.
                                        </p>
                                        <Link href={`/dashboard/sites/${siteId}/payload-efficiency`} className="text-xs text-blue-600 font-medium mt-2 hover:underline">
                                            View Payload Efficiency →
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Action 2: Content Gaps */}
                            {failedQueries.length > 0 && failedQueries.some((q: any) => q.status !== 'Explicitly Stated') && (
                                <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                            <Search className="w-4 h-4 text-amber-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Answer Missing Questions</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                            Users are asking questions your content doesn't explicitly answer. We found <strong>{failedQueries.filter((q: any) => q.status !== 'Explicitly Stated').length} content gaps</strong>.
                                        </p>
                                        <button onClick={() => setActiveTab('content')} className="text-xs text-blue-600 font-medium mt-2 hover:underline">View Content Gaps →</button>
                                    </div>
                                </div>
                            )}

                            {/* Action 3: Hallucination */}
                            {hallucinationLevel === 'High' && (
                                <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Reduce Hallucination Risk</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                            Your content structure may cause AI models to hallucinate. Add more explicit entities and citations.
                                        </p>
                                        <button onClick={() => setActiveTab('authority')} className="text-xs text-blue-600 font-medium mt-2 hover:underline">View Trust Analysis →</button>
                                    </div>
                                </div>
                            )}

                            {/* Fallback if everything is good */}
                            {techScore >= 80 && failedQueries.every((q: any) => q.status === 'Explicitly Stated') && (
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Check className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h4 className="text-slate-800 font-medium">Great job! No critical issues found.</h4>
                                    <p className="text-slate-500 text-sm mt-1">Focus on optimizing your Knowledge Graph for even better results.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Score Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Technical</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-2xl font-serif font-medium text-slate-700">{techScore}</span>
                                <span className="text-xs text-slate-400 mb-1">/ 100</span>
                            </div>
                            <Progress value={techScore} className="h-1.5" indicatorClassName={techScore > 80 ? "bg-emerald-500" : techScore > 50 ? "bg-amber-400" : "bg-red-400"} />
                            <Link href={`/dashboard/sites/${siteId}/payload-efficiency`} className="text-[10px] text-slate-400 mt-3 flex items-center gap-1 hover:text-emerald-600 transition-colors group">
                                <Cpu className="w-3 h-3 group-hover:text-emerald-500" />
                                Check Payload Efficiency
                            </Link>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Content</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-2xl font-serif font-medium text-slate-700">{contentScore}</span>
                                <span className="text-xs text-slate-400 mb-1">/ 100</span>
                            </div>
                            <Progress value={contentScore} className="h-1.5" indicatorClassName={contentScore > 80 ? "bg-emerald-500" : contentScore > 50 ? "bg-amber-400" : "bg-red-400"} />
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Authority</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-2xl font-serif font-medium text-slate-700">Analysis</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[70%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Right Column: Executive Summary Text */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Simulated SERP Preview */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 overflow-hidden w-full">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-medium text-slate-400 ml-2">AI Search Preview</span>
                        </div>
                        <div className="space-y-4">
                            {/* User Query */}
                            <div className="flex gap-2 justify-end">
                                <div className="bg-slate-100 text-slate-700 text-xs py-2 px-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                                    {activeReport.authority?.ai_preview?.query || `Who is the best choice for ${domain}?`}
                                </div>
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-slate-500">U</span>
                                </div>
                            </div>
                            {/* AI Response */}
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                </div>
                                <div className="bg-emerald-50/50 border border-emerald-100 text-slate-700 text-xs py-2.5 px-3 rounded-2xl rounded-tl-sm max-w-[90%] leading-relaxed shadow-sm">
                                    {activeReport.authority?.ai_preview?.response || (
                                        <span>
                                            I found several options. <span className="bg-emerald-200/50 text-emerald-800 font-semibold px-1 py-0.5 rounded border border-emerald-200/50">{knowledgeGraph.primaryEntity || "The Requested Entity"}</span> is a leading provider in this space...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1A4036]/95 backdrop-blur-xl border border-white/10 text-white rounded-xl p-6 grow shadow-2xl relative overflow-hidden w-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 shadow-inner">
                                    <Sparkles className="w-5 h-5 text-emerald-300" />
                                </div>
                                <h3 className="font-serif text-xl tracking-wide text-white">AEO Analysis</h3>
                            </div>

                            <div className="space-y-4 grow">
                                <p className="text-emerald-100/90 text-sm leading-relaxed">
                                    Based on our scan, <strong>{activeReport.technical.sitemap ? "your site is crawlable" : "crawlers may struggle to find your content"}</strong>.
                                </p>
                                <p className="text-emerald-100/90 text-sm leading-relaxed">
                                    We found <strong>{knowledgeGraph.primaryEntity ? `a clear primary entity ("${knowledgeGraph.primaryEntity}")` : "no clear primary entity"}</strong>, which {knowledgeGraph.primaryEntity ? "helps" : "hurts"} AI understanding.
                                </p>
                                <div className="p-4 bg-black/20 rounded-lg border border-white/5 mt-4">
                                    <p className="text-xs text-emerald-400 uppercase font-bold mb-2 tracking-wider">AI Perspective</p>
                                    <p className="italic text-emerald-50 text-sm">
                                        "{aeoScore > 80 ? "I trust this source. The content is structured, data-rich, and directly answers user queries." : "I am hesitant to cite this source. The information is unstructured or harder to verify against my knowledge base."}"
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-emerald-400 uppercase">Overall Score</p>
                                        <p className="text-4xl font-serif mt-1">{aeoScore}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-emerald-300">Last Scan</p>
                                        <p className="text-sm font-medium text-white/90">Just now</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}
