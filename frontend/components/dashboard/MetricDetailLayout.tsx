"use client"

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Terminal, CheckCircle2, Sliders, ExternalLink, Lightbulb, Play, ArrowRight, Copy, Wand2 } from "lucide-react";

interface MetricDetailLayoutProps {
    title: string;
    description?: string;
    status: 'critical' | 'warning' | 'pass';
    impact: string;
    rawDiagnostic: string;
    children?: React.ReactNode;
    whatAndWhyContent?: React.ReactNode; // Optional override
    customTabs?: { id: string; label: string; icon: any }[];
    renderTabContent?: (activeTab: string) => React.ReactNode;
    leftPanelTip?: React.ReactNode; // Optional override for the bottom tip box
    pullQuote?: string;
    actionLabel?: string;
}

export function MetricDetailLayout({
    title,
    description = "Diagnostic detail page",
    status,
    impact,
    rawDiagnostic,
    children,
    whatAndWhyContent,
    customTabs,
    renderTabContent,
    leftPanelTip,
    pullQuote,
    actionLabel
}: MetricDetailLayoutProps) {
    const defaultTabs = [
        { id: 'what-why', label: 'What & Why', icon: Lightbulb },
        { id: 'fix-it', label: 'Fix It Generator', icon: Sliders },
        { id: 'validate', label: 'Validate', icon: CheckCircle2 },
    ];

    const tabsToRender = customTabs || defaultTabs;
    const [activeTab, setActiveTab] = useState(tabsToRender[0].id);

    const statusColors = {
        critical: { badge: 'bg-red-500 text-white', icon: 'text-red-400' },
        warning: { badge: 'bg-amber-500 text-white', icon: 'text-amber-400' },
        pass: { badge: 'bg-emerald-500 text-white', icon: 'text-emerald-400' }
    };

    const currentStatusColor = statusColors[status] || statusColors.warning;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            {/* Page Container */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[35%_65%] gap-8">

                {/* LEFT COLUMN: Diagnostic Panel */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-b from-[#1A4036] to-[#0D2620] border-[#2A5245] shadow-2xl text-white overflow-hidden rounded-3xl relative ring-1 ring-white/10">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        <CardContent className="p-8 relative z-10 flex flex-col h-full">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`
                                        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm
                                        ${status === 'critical' ? 'bg-red-500/20 border-red-500/50 text-red-200' :
                                            status === 'warning' ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' :
                                                'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'}
                                    `}>
                                        {status === 'critical' && <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
                                        {status === 'warning' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                                        {status === 'pass' && <div className="w-2 h-2 rounded-full bg-emerald-400" />}

                                        {status === 'critical' ? 'Crucial Issue' : status === 'warning' ? 'Needs Attention' : 'Optimized'}
                                    </div>

                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-help">
                                        <Sliders className="w-4 h-4 text-[#8CD9B8]" />
                                    </div>
                                </div>

                                <h1 className="text-3xl font-bold font-serif tracking-tight text-white mb-1 leading-tight">{title}</h1>
                                <p className="text-emerald-100/60 text-sm font-medium">{description}</p>
                            </div>

                            {/* Impact Analysis */}
                            <div className="mb-8 p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                <p className="text-[#8CD9B8] text-[10px] font-bold uppercase tracking-widest mb-3 opacity-80">System Impact</p>
                                <div className="flex items-start gap-4">
                                    <div className={`
                                        mt-1 p-2 rounded-lg shrink-0
                                        ${status === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}
                                    `}>
                                        {status === 'critical' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <span className="font-medium text-lg text-white block leading-snug">{impact}</span>
                                        {status === 'critical' && (
                                            <span className="text-xs text-red-300/80 block mt-1">Requiring immediate attention</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Raw Diagnostic Terminal */}
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center justify-between text-white/40 px-1">
                                    <p className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                        <Terminal className="w-3 h-3" />
                                        Diagnostic Output
                                    </p>
                                </div>
                                <div className="group relative bg-[#0D1815] rounded-xl border border-white/10 p-4 font-mono text-[11px] text-emerald-100/70 leading-relaxed shadow-inner overflow-hidden">
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Copy className="w-3 h-3 text-white/40 hover:text-white cursor-pointer" />
                                    </div>
                                    <div className="flex gap-1.5 mb-3 opacity-30">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    </div>
                                    <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                        <pre className="whitespace-pre-wrap font-medium">{rawDiagnostic}</pre>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Tip (Outside Card for this layout) */}
                    {leftPanelTip && (
                        <div className="px-2">
                            {leftPanelTip}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Action Workbench */}
                <div className="flex flex-col h-full">
                    <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col min-h-[600px]">

                        {/* Tabs Navigation */}
                        <div className="flex items-center border-b border-slate-100 px-2 pt-2 bg-slate-50/50 overflow-x-auto">
                            {tabsToRender.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        flex items-center gap-2 px-6 py-4 text-sm font-bold border-t-2 transition-all rounded-t-lg whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'bg-white text-[#1A4036] border-[#8CD9B8] translate-y-[1px]'
                                            : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                                        }
                                    `}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#1A4036]' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="p-8 grow relative">
                            {/* Custom Content Rendering */}
                            {renderTabContent ? (
                                renderTabContent(activeTab)
                            ) : (
                                <>
                                    {/* TAB 1: What & Why */}
                                    {activeTab === 'what-why' && (
                                        <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-left-2 max-w-2xl">
                                            <div className="space-y-4">
                                                <h2 className="text-3xl font-serif text-slate-800 tracking-tight">Understanding {title}</h2>
                                                <p className="text-slate-600 text-lg leading-relaxed">
                                                    {description || "This component is critical for Agent Engine Optimization (AEO). Without it, AI agents may struggle to index your content correctly or understand the context of your data."}
                                                </p>
                                            </div>

                                            <div className="my-8 pl-6 border-l-4 border-[#8CD9B8] italic text-slate-600 py-1">
                                                "{pullQuote || "Agents prefer structured, raw data over visual HTML. Providing this file gives you a direct line of communication to LLMs."}"
                                            </div>

                                            {/* Default Content if none provided */}
                                            {whatAndWhyContent || (
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-bold text-[#1A4036] flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1A4036]" />
                                                        Why it matters
                                                    </h3>
                                                    <ul className="space-y-3">
                                                        <li className="flex items-start gap-3 text-slate-600">
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                            <span>Increases crawl budget efficiency for AI bots.</span>
                                                        </li>
                                                        <li className="flex items-start gap-3 text-slate-600">
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                            <span>Ensures accurate entity extraction (Product, Pricing, FAQ).</span>
                                                        </li>
                                                        <li className="flex items-start gap-3 text-slate-600">
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                            <span>Reduces hallucination risk by providing a ground truth source.</span>
                                                        </li>
                                                    </ul>

                                                    <div className="mt-8 p-6 bg-emerald-50/50 rounded-xl border border-emerald-100/50 relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            <Terminal className="w-32 h-32 text-[#1A4036]" />
                                                        </div>
                                                        <div className="flex items-start gap-3 relative z-10">
                                                            <div className="p-2 bg-white rounded-lg shadow-sm border border-emerald-100">
                                                                <Lightbulb className="w-5 h-5 text-[#1A4036]" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-[#1A4036] text-sm uppercase tracking-wide mb-1">Pro Tip</h4>
                                                                <p className="text-slate-600 text-sm">
                                                                    Keep this file under 50KB. LLMs have context limits, and concise, high-density information performs best.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-8">
                                                <Button
                                                    onClick={() => setActiveTab('fix-it')}
                                                    className="bg-gradient-to-r from-[#224034] to-[#1A3027] hover:from-[#1A3027] hover:to-[#224034] text-white pl-16 pr-12 py-3 h-auto text-lg rounded-xl shadow-lg hover:shadow-xl shadow-[#224034]/20 group transition-all duration-300 border border-white/10"
                                                >
                                                    <Wand2 className="mr-3 w-5 h-5 text-emerald-200" />
                                                    {actionLabel || "Open Generator"}
                                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 2: Fix It Generator */}
                                    {activeTab === 'fix-it' && (
                                        <div className="animate-in fade-in duration-300 slide-in-from-right-2 h-full flex flex-col">
                                            <div className="mb-6 flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-xl font-bold text-[#1A4036]">Generator Workbench</h2>
                                                    <p className="text-slate-500 text-sm">Configure your file settings below.</p>
                                                </div>
                                                <Badge variant="outline" className="border-[#8CD9B8] text-[#1A4036] bg-[#8CD9B8]/10">
                                                    Auto-Save Active
                                                </Badge>
                                            </div>

                                            {/* Children (Custom Form) or Default Sample Form */}
                                            <div className="grow">
                                                {children || (
                                                    /* Sample Form Implementation */
                                                    <>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                                            <div className="space-y-6">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="site-name" className="text-slate-700 font-medium">Site Name <span className="text-red-400">*</span></Label>
                                                                    <Input id="site-name" placeholder="e.g. My SaaS Platform" className="focus-visible:ring-[#8CD9B8]" />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="version" className="text-slate-700 font-medium">Version</Label>
                                                                        <Input id="version" defaultValue="1.0" className="focus-visible:ring-[#8CD9B8]" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="lang" className="text-slate-700 font-medium">Language</Label>
                                                                        <Input id="lang" defaultValue="en-US" className="focus-visible:ring-[#8CD9B8]" />
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="desc" className="text-slate-700 font-medium">Description</Label>
                                                                    <Textarea
                                                                        id="desc"
                                                                        placeholder="Describe what your site does for AI agents..."
                                                                        className="min-h-[120px] focus-visible:ring-[#8CD9B8]"
                                                                    />
                                                                    <p className="text-xs text-slate-400 text-right">0/150 characters</p>
                                                                </div>
                                                            </div>

                                                            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col">
                                                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                                                                    <span className="text-xs font-mono text-slate-400">preview.txt</span>
                                                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700">Read-Only</Badge>
                                                                </div>
                                                                <div className="font-mono text-xs text-emerald-300/90 leading-relaxed grow">
                                                                    # {title} Generator<br />
                                                                    # Created by CheckSiteAEO.com<br /><br />
                                                                    Title: [Waiting for input...]<br />
                                                                    Version: 1.0<br />
                                                                    Lang: en-US<br /><br />
                                                                    Description:<br />
                                                                    ...
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Footer */}
                                                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                                                            <Button variant="ghost" className="text-slate-500 hover:text-slate-700">Reset</Button>
                                                            <Button className="bg-[#8CD9B8] hover:bg-[#7BC0A2] text-[#1A4036] font-bold px-8 shadow-sm scale-100 active:scale-95 transition-all">
                                                                Generate File
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 3: Validate */}
                                    {activeTab === 'validate' && (
                                        <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-right-2 text-center py-12">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                <Play className="w-8 h-8 text-slate-300 ml-1" />
                                            </div>
                                            <div className="max-w-md mx-auto space-y-2">
                                                <h3 className="text-lg font-bold text-slate-700">Deploy to Validate</h3>
                                                <p className="text-slate-500">
                                                    Once you've uploaded the generated file to your root directory, run a validation scan.
                                                </p>
                                            </div>
                                            <Button disabled className="bg-slate-100 text-slate-400">
                                                Verify Installation (Coming Soon)
                                            </Button>
                                            <div className="flex justify-center gap-4 text-xs text-slate-400 mt-8">
                                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Real-time Check</span>
                                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Syntax Validation</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Default export for cleaner dynamic imports if needed
export default MetricDetailLayout;
