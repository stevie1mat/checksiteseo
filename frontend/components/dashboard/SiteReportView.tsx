"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Globe, FileText, ExternalLink, Calendar, Check, X, Heading, Code, Search, Share2, AlignLeft, Sparkles, AlertCircle, XCircle, Lock, Cpu, Database, PlayCircle, ChevronRight, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface SiteReportViewProps {
    breakdown: any
    aeoScore: number
}

export function SiteReportView({ breakdown, aeoScore }: SiteReportViewProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'content' | 'authority'>('overview')

    // Helper to safely access breakdown properties
    const getScore = (path: string[]) => {
        let current: any = breakdown;
        for (const key of path) {
            if (current === undefined || current === null) return 0;
            current = current[key];
        }
        return current?.score || 0;
    }

    const getDetails = (path: string[]) => {
        let current: any = breakdown;
        for (const key of path) {
            if (current === undefined || current === null) return [];
            current = current[key];
        }
        return current?.details || [];
    }

    // Accessors for new advanced data
    // @ts-ignore
    const agentEcon = breakdown?.technical?.agent_economics || {};
    // @ts-ignore
    const knowledgeGraph = breakdown?.authority?.knowledge_graph?.data || {};
    // @ts-ignore
    const failedQueries = breakdown?.content?.gap?.data || [];
    // @ts-ignore
    const contentGapScore = Math.max(0, 100 - (failedQueries.length * 10)); // Approximate score logic from before

    // Calculate Category Scores (Simple Average for display)
    const techScore = Math.round((getScore(['technical', 'robots']) + getScore(['technical', 'llms']) + getScore(['technical', 'schema']) + getScore(['technical', 'sitemap'])) / 4)
    const contentScore = Math.round((getScore(['content', 'questions']) + getScore(['content', 'readability']) + getScore(['content', 'freshness'])) / 3) // Approximate
    // Authority is hard to validly score with just E-E-A-T list, so we'll use a placeholder or derived metric if available

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

                {/* 0. EXECUTIVE SUMMARY (Overview Only) */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        {/* 1. Top Level KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* KPI 1: Share of Voice (Competitor Widget) */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-[#224034]">
                                        <BarChart3 className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Share of Voice</span>
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

                            {/* KPI 2: Content Gap */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <FileText className="w-16 h-16 text-[#224034]" />
                                </div>
                                <div className="flex items-center gap-2 mb-3 relative z-10">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-[#224034]">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Answer Rate</span>
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

                            {/* KPI 3: Hallucination Risk */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <AlertCircle className="w-16 h-16 text-[#224034]" />
                                </div>
                                <div className="flex items-center gap-2 mb-3 relative z-10">
                                    <div className={`p-2 rounded-lg ${breakdown?.authority?.eeat?.hallucination_risk?.level === 'High' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safety Score</span>
                                </div>
                                <div className="relative z-10">
                                    {/* @ts-ignore */}
                                    <div className={`text-3xl font-serif font-medium ${breakdown?.authority?.eeat?.hallucination_risk?.level === 'High' ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {/* @ts-ignore */}
                                        {breakdown?.authority?.eeat?.hallucination_risk?.level === 'High' ? 'High Risk' : 'Safe'}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Hallucination Probability</p>
                                    <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        {/* @ts-ignore */}
                                        <div className={`h-full ${breakdown?.authority?.eeat?.hallucination_risk?.level === 'High' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: breakdown?.authority?.eeat?.hallucination_risk?.level === 'High' ? '25%' : '90%' }} />
                                    </div>
                                </div>
                            </div>

                            {/* KPI 4: Knowledge Graph Visualizer */}
                            <div className="bg-[#1A4036] p-5 rounded-xl border border-[#2a4e40] shadow-sm relative overflow-hidden group">
                                <div className="flex items-center gap-2 mb-3 relative z-10">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                                        <Share2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-200/70 uppercase tracking-wider">Knowledge Graph</span>
                                </div>
                                <div className="relative h-24 w-full flex items-center justify-center">
                                    <div className="relative flex items-center justify-center w-full h-full">
                                        {/* Center Node */}
                                        <div className="z-10 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-900/50 border border-emerald-400">
                                            {knowledgeGraph.primary_entity ? knowledgeGraph.primary_entity.substring(0, 15) : 'Entity'}
                                        </div>
                                        {/* Satellite Nodes */}
                                        <div className="absolute top-0 right-4 bg-[#224034] text-emerald-300 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-sm animate-pulse">CTO</div>
                                        <div className="absolute bottom-1 left-4 bg-[#224034] text-emerald-300 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-sm">Code</div>
                                        <div className="absolute bottom-4 right-8 bg-[#224034] text-emerald-300 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-sm">AI</div>
                                    </div>
                                </div>
                            </div>
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
                                        {/* @ts-ignore */}
                                        {breakdown?.authority?.eeat?.hallucination_risk?.level === 'High' && (
                                            <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                                <div className="mt-1">
                                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-700">Reduce Hallucination Risk</h4>
                                                    <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                                        Your content structure may cause AI agents to hallucinate. Add more explicit entities and citations.
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
                                                Who is the best AI developer in Toronto?
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
                                                I found several options. <span className="bg-emerald-200/50 text-emerald-800 font-semibold px-1 py-0.5 rounded border border-emerald-200/50">Steven Mathew</span> is a CTO at 7Steps...
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
                                                Based on our scan, <strong>{breakdown?.technical?.sitemap?.score > 0 ? "your site is crawlable" : "crawlers may struggle to find your content"}</strong>.
                                            </p>
                                            <p className="text-emerald-100/90 text-sm leading-relaxed">
                                                We found <strong>{knowledgeGraph.primary_entity ? `a clear primary entity ("${knowledgeGraph.primary_entity}")` : "no clear primary entity"}</strong>, which {knowledgeGraph.primary_entity ? "helps" : "hurts"} AI understanding.
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
                )}

                {/* 1. TECHNICAL VIEW */}
                {(activeTab === 'technical') && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-2xl font-serif text-[#224034] mb-4">Technical Readiness</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Standard Checks */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                                {/* Robots */}
                                <div className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-semibold text-slate-700 text-base">Robots.txt</p>
                                        <p className="text-sm text-slate-500 mt-1">{getDetails(['technical', 'robots'])[0] || '-'}</p>
                                    </div>
                                    {getScore(['technical', 'robots']) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                </div>
                                {/* LLMs */}
                                <div className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-semibold text-slate-700 text-base">LLMs.txt</p>
                                        <p className="text-sm text-slate-500 mt-1">{getDetails(['technical', 'llms'])[0] || '-'}</p>
                                    </div>
                                    {getScore(['technical', 'llms']) > 50 ?
                                        <Check className="w-5 h-5 text-emerald-500" /> :
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-5 h-5 text-red-400" />
                                            <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded">Generate</button>
                                        </div>
                                    }
                                </div>
                                {/* Schema */}
                                <div className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-semibold text-slate-700 text-base">Schema.org</p>
                                        <p className="text-sm text-slate-500 mt-1">{getDetails(['technical', 'schema'])[0] || '-'}</p>
                                    </div>
                                    {getScore(['technical', 'schema']) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> :
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-amber-400" />
                                            <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded">Generate</button>
                                        </div>
                                    }
                                </div>
                                {/* Sitemap */}
                                <div className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-semibold text-slate-700 text-base">Sitemap.xml</p>
                                        <p className="text-sm text-slate-500 mt-1">{getDetails(['technical', 'sitemap'])[0] || '-'}</p>
                                    </div>
                                    {getScore(['technical', 'sitemap']) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                </div>
                            </div>

                            {/* Agent Economics */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Cpu className="w-4 h-4 text-slate-500" />
                                    <h4 className="font-semibold text-slate-700 text-base uppercase tracking-wide">Context Window Analysis</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Tokens</p>
                                        <p className="font-mono text-xl font-medium text-[#224034]">{agentEcon.total_tokens?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Est. Index Cost</p>
                                        <p className="font-mono text-xl font-medium text-emerald-600">{agentEcon.estimated_cost || '$0.00'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-0.5">Signal-to-Noise Ratio</p>
                                        <p className="font-mono text-base font-medium text-slate-700">{agentEcon.html_ratio || '0%'} Content</p>
                                        <p className="text-xs text-slate-400">vs Raw HTML</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-0.5">Bloat Status</p>
                                        <Badge variant="outline" className={`text-xs px-2 py-0.5 h-6 border-0 ${agentEcon.code_bloat_score === 'Critical Bloat' ? 'bg-red-100 text-red-700' :
                                            agentEcon.code_bloat_score === 'Moderate Bloat' ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {agentEcon.code_bloat_score || 'Unknown'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-200/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-slate-500">Boilerplate Ratio</p>
                                        <span className={`text-xs font-medium ${agentEcon.boilerplate_ratio > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {agentEcon.boilerplate_ratio || 0}%
                                        </span>
                                    </div>
                                    <Progress value={agentEcon.boilerplate_ratio || 0} className="h-1.5" indicatorClassName={agentEcon.boilerplate_ratio > 30 ? "bg-amber-400" : "bg-emerald-400"} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* 2. CONTENT VIEW */}
                {(activeTab === 'content') && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-2xl font-serif text-[#224034] mb-4">Content Breakdown</h2>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Standard Content Checks */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                                {/* Questions */}
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <div>
                                        <p className="font-semibold text-slate-700 text-base">Question Targeting</p>
                                        <p className="text-sm text-slate-500 mt-0.5">Headers asking questions</p>
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">{(getDetails(['content', 'questions'])[0] || '0/5').split('/')[0]} / 5</Badge>
                                </div>
                                {/* Readability */}
                                <div className="pb-4 border-b border-gray-50">
                                    <div className="flex justify-between items-center mb-1">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-base">Readability</p>
                                            <p className="text-sm text-slate-500 mt-0.5">Flesch-Kincaid Grade</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`
                                            ${(getDetails(['content', 'readability'])[0] || '').includes('Complex') ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                                        `}>
                                                {(getDetails(['content', 'readability'])[0] || 'N/A').split('(')[0]}
                                            </Badge>
                                            {(getDetails(['content', 'readability'])[0] || '').includes('Complex') &&
                                                <button className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded">Simplify</button>
                                            }
                                        </div>
                                    </div>
                                    {/* Rewrite Suggestion */}
                                    {getDetails(['content', 'readability']).find((d: string) => d.startsWith("Suggestion:")) && (
                                        <div className="mt-3 bg-orange-50 rounded-xl p-4 border border-orange-100">
                                            <span className="font-bold text-orange-700 block mb-1 text-sm uppercase tracking-wide">✨ AI Rewrite Suggestion</span>
                                            <span className="text-slate-700 text-base leading-relaxed">"{getDetails(['content', 'readability']).find((d: string) => d.startsWith("Suggestion:"))?.replace("Suggestion:", "").trim()}"</span>
                                        </div>
                                    )}
                                </div>
                                {/* Visual Context */}
                                <div className=" pb-4 border-b border-gray-50">
                                    <div className="flex justify-between mb-2">
                                        <p className="font-semibold text-slate-700 text-base">Visual Context</p>
                                        <p className="text-sm font-medium text-slate-600">{getDetails(['content', 'visual'])[0] || '0%'}</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: (getDetails(['content', 'visual'])[0] || '0%').split('%')[0] + '%' }}></div>
                                    </div>
                                </div>
                                {/* Freshness */}
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <div>
                                        <p className="font-semibold text-slate-700 text-base">Content Freshness</p>
                                        <p className="text-sm text-slate-500 mt-0.5">Dates validated</p>
                                    </div>
                                    {getScore(['content', 'freshness']) > 0 ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                                </div>
                            </div>

                            {/* The Missing Answer (Green Card) */}
                            {failedQueries.length > 0 && (
                                <div className="bg-[#224034] rounded-xl overflow-hidden shadow-lg relative group">
                                    {/* Background Effects */}
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />

                                    <div className="p-8 relative z-10">
                                        {/* Header Section */}
                                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
                                            <div className="text-center md:text-left shrink-0">
                                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                    <FileText className="w-5 h-5 text-emerald-400" />
                                                    <p className="text-emerald-200/80 font-medium uppercase tracking-widest text-sm">The Missing Answer</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-5xl md:text-6xl font-serif text-white tracking-tighter leading-none">
                                                        {Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / Math.max(failedQueries.length, 1)) * 100)}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-lg text-emerald-100/60 font-light">/ 100</div>
                                                        <div className="text-sm font-bold bg-white/10 px-2 py-0.5 rounded text-emerald-100 shadow-sm border border-white/5">
                                                            AI Confidence
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-emerald-100/60 text-base mt-3 max-w-[200px] leading-relaxed">
                                                    We simulated real user questions to see if your site provides the answers.
                                                </p>
                                            </div>

                                            {/* Table Section */}
                                            <div className="grow w-full bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                                                <Table>
                                                    <TableHeader className="bg-black/20 border-b border-white/10">
                                                        <TableRow className="hover:bg-transparent border-white/10">
                                                            <TableHead className="text-emerald-100/80 w-[40%]">Simulated User Query</TableHead>
                                                            <TableHead className="text-emerald-100/80 w-[15%]">Status</TableHead>
                                                            <TableHead className="text-emerald-100/80 w-[15%] text-right">Optimization</TableHead>
                                                            <TableHead className="text-emerald-100/80 text-right">Result</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {failedQueries.map((query: any, i: number) => (
                                                            <TableRow key={i} className="hover:bg-white/5 border-white/5 group/row transition-colors">
                                                                <TableCell className="font-medium text-emerald-50 py-4 align-top">
                                                                    "{query.question}"
                                                                </TableCell>
                                                                <TableCell className="py-4 align-top">
                                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset
                                                                    ${query.status === 'Explicitly Stated' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20' :
                                                                            query.status === 'Implied' ? 'bg-amber-500/10 text-amber-300 ring-amber-400/20' :
                                                                                'bg-red-500/10 text-red-300 ring-red-400/20'}`}>
                                                                        {query.status}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right py-4 align-top">
                                                                    {query.status !== 'Explicitly Stated' && query.draft_answer && (
                                                                        <div className="group/btn relative inline-block">
                                                                            <button className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded transition-colors">
                                                                                View Draft
                                                                            </button>
                                                                            {/* Tooltip implementation for draft answer */}
                                                                            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all z-50">
                                                                                <p className="font-bold text-emerald-400 mb-1">Use this Answer:</p>
                                                                                <p className="italic">"{query.draft_answer}"</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right py-4 align-top">
                                                                    {query.status === 'Explicitly Stated' ?
                                                                        <div className="flex items-center justify-end gap-2 text-emerald-400 text-base font-medium"><Check className="w-4 h-4" /> Found</div> :
                                                                        <div className="flex items-center justify-end gap-2 text-red-300/80 text-base"><XCircle className="w-4 h-4" /> Failed</div>
                                                                    }
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* 3. AUTHORITY VIEW */}
                {(activeTab === 'authority') && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-2xl font-serif text-[#224034] mb-4">Authority Signals</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Knowledge Graph */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-0 overflow-hidden">
                                <div className="bg-slate-50/50 p-3 border-b border-gray-100 flex items-center gap-2">
                                    <Database className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Extracted Knowledge Graph</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    {knowledgeGraph.primary_entity ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                                                    {knowledgeGraph.type || 'Entity'}
                                                </Badge>
                                                <span className="font-serif text-xl text-slate-800">{knowledgeGraph.primary_entity}</span>
                                            </div>

                                            {/* Relationships Map */}
                                            {knowledgeGraph.relationships && Object.entries(knowledgeGraph.relationships).map(([rel, val]: [string, any], i: number) => (
                                                <div key={i} className="grid grid-cols-[100px_1fr] gap-2 text-base border-l-2 border-slate-100 pl-3 py-0.5">
                                                    <span className="text-slate-400 text-sm font-mono">↳ {rel}</span>
                                                    {Array.isArray(val) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {val.map((item, j) => (
                                                                <span key={j} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                                                                    {item}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="font-medium text-slate-700 text-sm">{val}</span>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Missing Critical */}
                                            {knowledgeGraph.missing_critical && knowledgeGraph.missing_critical.length > 0 && (
                                                <div className="mt-3 bg-amber-50 rounded-lg p-2 text-xs border border-amber-100">
                                                    <span className="font-bold text-amber-700 block mb-1">⚠️ Missing Connections:</span>
                                                    <p className="text-amber-600">
                                                        Add {knowledgeGraph.missing_critical.join(", ")} to improve graph depth.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // Fallback for old data format or empty
                                        <div className="text-xs text-slate-400 italic">
                                            {Object.keys(knowledgeGraph).length > 0 ? "Legacy format: Rescan to see Relationship Map." : "No entities extracted."}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* E-E-A-T (Full) */}
                            <div className="space-y-4">
                                <p className="font-semibold text-slate-700 text-base">AI Trust Analysis</p>
                                <div className="space-y-2">
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Strengths</p>
                                        <ul className="space-y-2">
                                            {/* @ts-ignore */}
                                            {getDetails(['authority', 'eeat']).filter((s: string) => s.startsWith("Pro:")).slice(0, 4).map((signal: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 pb-1 last:pb-0">
                                                    <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                                                    <span className="leading-snug">{signal.replace("Pro:", "").trim()}</span>
                                                </li>
                                            ))}
                                            {getDetails(['authority', 'eeat']).length === 0 && <li className="text-xs text-slate-400">No signals detected.</li>}
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Weaknesses</p>
                                        <ul className="space-y-2">
                                            {/* @ts-ignore */}
                                            {getDetails(['authority', 'eeat']).filter((s: string) => s.startsWith("Con:")).slice(0, 4).map((signal: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 pb-1 last:pb-0">
                                                    <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                                                    <span className="leading-snug">{signal.replace("Con:", "").trim()}</span>
                                                </li>
                                            ))}
                                            {getDetails(['authority', 'eeat']).filter((s: string) => s.startsWith("Con:")).length === 0 && <li className="text-xs text-slate-400 italic">No major weaknesses detected.</li>}
                                        </ul>
                                    </div>

                                    {/* Hallucination Risk Card */}
                                    {/* @ts-ignore */}
                                    {breakdown?.authority?.eeat?.hallucination_risk && (
                                        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hallucination Risk</p>
                                                {/* @ts-ignore */}
                                                <Badge variant="outline" className={`
                                                    ${breakdown.authority.eeat.hallucination_risk.level === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        breakdown.authority.eeat.hallucination_risk.level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-200'}
                                                `}>
                                                    {breakdown.authority.eeat.hallucination_risk.level} Risk
                                                </Badge>
                                            </div>

                                            {/* @ts-ignore */}
                                            <p className="text-sm text-slate-700 font-medium mb-1">
                                                "{breakdown.authority.eeat.hallucination_risk.reason}"
                                            </p>

                                            {/* @ts-ignore */}
                                            {breakdown.authority.eeat.hallucination_risk.fix && (
                                                <div className="mt-2 bg-white rounded border border-gray-200 p-3 text-sm">
                                                    <span className="font-bold text-indigo-600 block mb-0.5">Suggested Fix:</span>
                                                    <span className="text-slate-600 italic">{breakdown.authority.eeat.hallucination_risk.fix}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
