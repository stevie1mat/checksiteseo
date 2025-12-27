"use client"

import { useState } from "react"
import { Share2, FileCode, Lightbulb, CheckCircle2, AlertTriangle, Network, Search, ArrowRight, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

import { RealtimeMetricView } from "@/components/dashboard/views/RealtimeMetricView"
import { MetricDetailLayout } from "@/components/dashboard/MetricDetailLayout"
import { AEOReport } from "@/types/aeo"

interface KnowledgeGraphViewProps {
    siteId: string
    domain: string
    initialData: any
}

const KG_TABS = [
    { id: 'what-why', label: 'What & Why', icon: Lightbulb },
    { id: 'visualizer', label: 'Entity Visualizer', icon: Network }, // Network icon for graph
    { id: 'schema', label: 'Schema Audit', icon: FileCode },
];

export function KnowledgeGraphView({ siteId, domain, initialData }: KnowledgeGraphViewProps) {
    const { toast } = useToast()

    // transform logic extracted for reuse
    const transformReport = (report: AEOReport) => {
        // Unified logic: Try finding data in authority.eeat.knowledge_graph (backend) or root (legacy/api)
        const rawKG = report.authority?.knowledge_graph?.data;
        const rootKG = report.knowledgeGraph;

        const combined = {
            primary_entity: rawKG?.primary_entity || rootKG?.primaryEntity || 'Not found',
            type: rawKG?.type || rootKG?.type || 'Thing',
            relationships: rawKG?.relationships || rootKG?.relationships || {},
            missing_critical: rawKG?.missing_critical || rootKG?.missing_critical || []
        };

        return combined;
    }

    return (
        <RealtimeMetricView
            siteId={siteId}
            domain={domain}
            initialData={initialData}
            transform={transformReport}
        >
            {(kg: any) => {
                const missing = kg.missing_critical || [];
                const hasEntity = kg.primary_entity && kg.primary_entity !== 'Not found';
                const status = hasEntity && missing.length === 0 ? 'pass' : hasEntity ? 'warning' : 'critical';

                // Helpers for the visualizer
                const rels = kg.relationships || {};
                const nodes: any[] = [];

                // Construct nodes similarly to OverviewTab
                if (rels.worksFor && rels.worksFor !== 'None' && rels.worksFor !== 'None Detected') nodes.push({ label: rels.worksFor, type: "Org", color: "bg-blue-500" });
                if (rels.jobTitle && rels.jobTitle !== 'None' && rels.jobTitle !== 'None Detected') nodes.push({ label: rels.jobTitle, type: "Role", color: "bg-purple-500" });
                if (rels.location && rels.location !== 'None') nodes.push({ label: rels.location, type: "Loc", color: "bg-orange-500" });

                if (Array.isArray(rels.knowsAbout)) {
                    rels.knowsAbout.slice(0, 4).forEach((s: string) => {
                        if (s) nodes.push({ label: s, type: "Topic", color: "bg-emerald-500" });
                    });
                }
                if (Array.isArray(rels.products)) {
                    rels.products.slice(0, 3).forEach((p: string) => {
                        if (p) nodes.push({ label: p, type: "Prod", color: "bg-pink-500" });
                    });
                }
                if (Array.isArray(rels.founders)) {
                    rels.founders.slice(0, 2).forEach((f: string) => {
                        if (f) nodes.push({ label: f, type: "Person", color: "bg-indigo-500" });
                    });
                }

                return (
                    <MetricDetailLayout
                        title="Knowledge Graph Analysis"
                        status={status}
                        impact={hasEntity ? `${kg.primary_entity} Found` : 'No Entity Found'}
                        rawDiagnostic={JSON.stringify(kg, null, 2)}
                        pullQuote="A Knowledge Graph transforms your brand from a 'string' of characters into a 'thing' with meaning. Without clear entities, AI models struggle to trust or recommend you."
                        actionLabel="Update Schema"
                        customTabs={KG_TABS}
                        leftPanelTip={
                            <div className="mt-8 bg-[#8CD9B8]/10 border border-[#8CD9B8]/20 rounded-xl p-4 flex gap-3 text-emerald-100/80 text-sm">
                                <Network className="w-5 h-5 text-[#8CD9B8] shrink-0 mt-0.5" />
                                <p className="leading-snug">
                                    The more connections (nodes) found, the harder it is for competitors to displace you.
                                </p>
                            </div>
                        }
                        whatAndWhyContent={
                            <div className="space-y-4 text-slate-600">
                                <p>
                                    <strong>What is it?</strong><br />
                                    Your "Digital Identity Card" that tells Search Engines and AI exactly who you are, what you do, and who you are connected to.
                                </p>
                                <p>
                                    <strong>Why it matters:</strong><br />
                                    Google's Knowledge Graph is the primary source of truth for Answer Engines. If you aren't in it, you don't exist to them.
                                </p>
                            </div>
                        }
                        renderTabContent={(activeTab: string) => (
                            <>
                                {activeTab === 'what-why' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-serif text-slate-800 tracking-tight">Understanding Knowledge Graphs</h2>
                                            <p className="text-slate-600 text-lg leading-relaxed">
                                                AI models don't just read text; they map relationships. A robust Knowledge Graph entry ensures your brand is understood as an authoritative entity, not just a keyword mention.
                                            </p>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                                            <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                                                <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" /> Weak Graph Signals
                                                </h3>
                                                <ul className="list-disc list-inside space-y-2 text-sm text-red-800/80">
                                                    <li>Ambiguous name ("Smith Consulting")</li>
                                                    <li>No physical address or "Contact Us" page</li>
                                                    <li>Missing social profile links (SameAs)</li>
                                                </ul>
                                            </div>
                                            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" /> Strong Graph Signals
                                                </h3>
                                                <ul className="list-disc list-inside space-y-2 text-sm text-emerald-800/80">
                                                    <li>Clear Schema.org/Organization markup</li>
                                                    <li>Verified "SameAs" links (LinkedIn, Crunchbase)</li>
                                                    <li>Wikipedia or Wikidata entry</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'visualizer' && (
                                    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h2 className="text-xl font-bold text-[#1A4036]">Entity Map</h2>
                                                <p className="text-slate-500 text-sm">How AI models visualize your brand's connections.</p>
                                            </div>
                                            <Badge variant="outline" className="border-slate-200">
                                                {nodes.length} Nodes Detected
                                            </Badge>
                                        </div>

                                        <div className="grow bg-[#0f1f1a] rounded-xl border border-[#224034] relative overflow-hidden shadow-inner flex items-center justify-center min-h-[400px]">
                                            {/* Background Grid */}
                                            <div className="absolute inset-0 opacity-20"
                                                style={{
                                                    backgroundImage: 'radial-gradient(#224034 1px, transparent 1px)',
                                                    backgroundSize: '30px 30px'
                                                }}
                                            />

                                            {hasEntity ? (
                                                <div className="relative w-full h-full flex items-center justify-center p-12">
                                                    {/* Central Node */}
                                                    <div className="z-20 relative flex flex-col items-center">
                                                        <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center border-4 border-[#0f1f1a] shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-pulse-slow">
                                                            <Database className="w-10 h-10 text-white" />
                                                        </div>
                                                        <div className="mt-4 bg-[#224034] text-emerald-100 px-4 py-1.5 rounded-full border border-emerald-500/30 text-sm font-bold shadow-lg">
                                                            {kg.primary_entity}
                                                        </div>
                                                    </div>

                                                    {/* Orbiting Nodes */}
                                                    {nodes.map((node, i) => {
                                                        // Calculate position on a circle
                                                        const angle = (i / nodes.length) * 2 * Math.PI;
                                                        const radius = 160; // Distance from center
                                                        const x = Math.cos(angle) * radius;
                                                        const y = Math.sin(angle) * radius;

                                                        return (
                                                            <div
                                                                key={i}
                                                                className="absolute z-10 flex flex-col items-center group transition-all duration-500 hover:scale-110 cursor-pointer"
                                                                style={{
                                                                    transform: `translate(${x}px, ${y}px)`,
                                                                }}
                                                            >
                                                                {/* Connection Line (Pseudo-element approach hard in React inline, using SVG line instead) */}

                                                                <div className={`w-12 h-12 ${node.color} rounded-full flex items-center justify-center border-4 border-[#0f1f1a] shadow-lg`}>
                                                                    <Share2 className="w-5 h-5 text-white opacity-80" />
                                                                </div>
                                                                <div className="mt-2 bg-[#1a2e28] text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-white/5">
                                                                    {node.type}
                                                                </div>
                                                                <div className="absolute top-14 mt-1 w-32 text-center text-xs text-white/90 font-medium bg-black/60 backdrop-blur-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    {node.label}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}

                                                    {/* SVG Lines for connections */}
                                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                                        <g transform="translate(50%, 50%)" className="overflow-visible">
                                                            {nodes.map((_, i) => {
                                                                const angle = (i / nodes.length) * 2 * Math.PI;
                                                                const radius = 160;
                                                                const x = Math.cos(angle) * radius;
                                                                const y = Math.sin(angle) * radius;
                                                                return (
                                                                    <line
                                                                        key={i}
                                                                        x1="0"
                                                                        y1="0"
                                                                        x2={x}
                                                                        y2={y}
                                                                        stroke="#224034"
                                                                        strokeWidth="2"
                                                                        className="opacity-50"
                                                                    />
                                                                )
                                                            })}
                                                        </g>
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="text-center text-slate-500">
                                                    <Network className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                                    <p>No Entity Graph found.</p>
                                                    <Button variant="outline" className="mt-4 border-slate-700 text-slate-400 hover:text-white hover:bg-[#224034]">Run Deep Scan</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'schema' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-[#1A4036]">Schema Validation</h2>
                                            <Badge variant={missing.length > 0 ? "destructive" : "outline"} className="gap-1">
                                                {missing.length > 0 ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                                {missing.length > 0 ? `${missing.length} Missing Fields` : "All Critical Fields Found"}
                                            </Badge>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Missing Fields */}
                                            <Card className="p-4 border-red-100 bg-red-50/50">
                                                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" /> Missing Attributes
                                                </h3>
                                                {missing.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {missing.map((m: string, i: number) => (
                                                            <li key={i} className="flex items-center gap-2 text-sm text-red-800 bg-white p-2 rounded border border-red-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                                {m}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic">None. Good job!</p>
                                                )}
                                            </Card>

                                            {/* Found Fields */}
                                            <Card className="p-4 border-slate-200">
                                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    <Database className="w-4 h-4" /> Extracted Properties
                                                </h3>
                                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                                    {Object.entries(rels).map(([k, v], i) => (
                                                        <div key={i} className="flex flex-col gap-0.5 text-sm p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors">
                                                            <span className="font-mono text-xs text-slate-400 font-bold uppercase">{k}</span>
                                                            <span className="text-slate-700 truncate font-medium">
                                                                {Array.isArray(v) ? v.join(", ") : String(v)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {!rels || Object.keys(rels).length === 0 && (
                                                        <div className="text-sm text-slate-400 text-center py-4">No specific properties extracted.</div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    />
                )
            }}
        </RealtimeMetricView>
    )
}
