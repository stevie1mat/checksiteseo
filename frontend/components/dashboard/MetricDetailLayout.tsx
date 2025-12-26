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
    leftPanelTip
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
                    <Card className="bg-[#1A4036] border-[#2A5245] shadow-xl text-white overflow-hidden rounded-2xl relative">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <CardContent className="p-8 relative z-10">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold font-serif tracking-wide text-white mb-2">{title}</h1>
                                    <Badge className={`${currentStatusColor.badge} border-none px-3 py-1 text-xs font-bold uppercase tracking-widest`}>
                                        {status === 'critical' ? 'At Risk 🔴' : status === 'warning' ? 'Issue ⚠️' : 'Valid ✅'}
                                    </Badge>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <Sliders className="w-6 h-6 text-[#8CD9B8]" />
                                </div>
                            </div>

                            {/* Impact Analysis */}
                            <div className="mb-8">
                                <p className="text-[#8CD9B8] text-xs font-bold uppercase tracking-wider mb-2">Impact Level</p>
                                <div className="flex items-center gap-2 text-white/90">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <span className="font-medium text-lg">{impact}</span>
                                </div>
                            </div>

                            {/* Raw Diagnostic Terminal */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-white/60">
                                    <p className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                                        <Terminal className="w-3 h-3" />
                                        Raw Diagnostic Data
                                    </p>
                                    <Copy className="w-3 h-3 cursor-pointer hover:text-white transition-colors" />
                                </div>
                                <div className="bg-black/40 rounded-lg border border-white/5 p-4 font-mono text-xs text-emerald-100/80 leading-relaxed overflow-x-auto shadow-inner">
                                    <div className="flex gap-2 mb-1 border-b border-white/5 pb-1 opacity-50">
                                        <span className="text-red-400">●</span>
                                        <span className="text-amber-400">●</span>
                                        <span className="text-emerald-400">●</span>
                                    </div>
                                    <pre className="whitespace-pre-wrap">{rawDiagnostic}</pre>
                                </div>
                            </div>

                            {/* Help Box (Default or Custom) */}
                            {leftPanelTip || (
                                <div className="mt-8 bg-[#8CD9B8]/10 border border-[#8CD9B8]/20 rounded-xl p-4 flex gap-3 text-emerald-100/80 text-sm">
                                    <Lightbulb className="w-5 h-5 text-[#8CD9B8] shrink-0 mt-0.5" />
                                    <p className="leading-snug">
                                        Agents look for this file to understand your site structure without parsing heavy HTML.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
                                                "Agents prefer structured, raw data over visual HTML. Providing this file gives you a direct line of communication to LLMs."
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
                                                    Open Generator
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
                                                                    # Created by CheckSite.ai<br /><br />
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
