"use client"

import {
    AlertTriangle,
    ArrowRight,
    BrainCircuit,
    CheckCircle2,
    Database,
    FileCode,
    Gem,
    Layers,
    Lightbulb,
    Link2,
    Network,
    Orbit,
    Search,
    Share2,
    ShieldCheck,
    Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { RealtimeMetricView } from "@/components/dashboard/views/RealtimeMetricView"
import { MetricDetailLayout } from "@/components/dashboard/MetricDetailLayout"
import { AEOReport } from "@/types/aeo"
import { SchemaFixer } from "@/components/dashboard/views/SchemaFixer"

interface KnowledgeGraphViewProps {
    siteId: string
    domain: string
    initialData: any
}

const KG_TABS = [
    { id: "what-why", label: "What & Why", icon: Lightbulb },
    { id: "visualizer", label: "Entity Visualizer", icon: Network },
    { id: "schema", label: "Schema Builder", icon: FileCode },
]

const toArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || "").trim())
            .filter((item) => item && item !== "None" && item !== "None Detected" && item !== "Missing")
    }
    if (typeof value === "string") {
        const normalized = value.trim()
        if (!normalized || normalized === "None" || normalized === "None Detected" || normalized === "Missing") return []
        return [normalized]
    }
    return []
}

export function KnowledgeGraphView({ siteId, domain, initialData }: KnowledgeGraphViewProps) {
    const transformReport = (report: AEOReport) => {
        const rawKG = report.authority?.knowledge_graph?.data
        const rootKG = report.knowledgeGraph

        return {
            primary_entity: rawKG?.primary_entity || rootKG?.primaryEntity || "Not found",
            type: rawKG?.type || rootKG?.type || "Thing",
            relationships: rawKG?.relationships || rootKG?.relationships || {},
            missing_critical: rawKG?.missing_critical || rootKG?.missing_critical || [],
        }
    }

    return (
        <RealtimeMetricView siteId={siteId} domain={domain} initialData={initialData} transform={transformReport}>
            {(kg: any) => {
                const missing = Array.isArray(kg.missing_critical) ? kg.missing_critical : []
                const hasEntity = Boolean(kg.primary_entity && kg.primary_entity !== "Not found")
                const status = hasEntity && missing.length === 0 ? "pass" : hasEntity ? "warning" : "critical"

                const rels = (kg.relationships && typeof kg.relationships === "object" ? kg.relationships : {}) as Record<string, unknown>
                const relationshipEntries = Object.entries(rels)

                const nodes: Array<{ label: string; type: string; color: string }> = []
                if (toArray(rels.worksFor)[0]) nodes.push({ label: toArray(rels.worksFor)[0], type: "Org", color: "bg-blue-500" })
                if (toArray(rels.jobTitle)[0]) nodes.push({ label: toArray(rels.jobTitle)[0], type: "Role", color: "bg-purple-500" })
                if (toArray(rels.location)[0]) nodes.push({ label: toArray(rels.location)[0], type: "Loc", color: "bg-orange-500" })
                toArray(rels.knowsAbout).slice(0, 4).forEach((s) => nodes.push({ label: s, type: "Topic", color: "bg-emerald-500" }))
                toArray(rels.products).slice(0, 3).forEach((p) => nodes.push({ label: p, type: "Prod", color: "bg-pink-500" }))
                toArray(rels.founders).slice(0, 2).forEach((f) => nodes.push({ label: f, type: "Person", color: "bg-indigo-500" }))

                const sameAsLinks = toArray(rels.sameAs)
                const mappedRelationshipCount = relationshipEntries.filter(([, value]) => toArray(value).length > 0).length
                const confidenceScore = Math.min(
                    100,
                    Math.round((hasEntity ? 30 : 0) + mappedRelationshipCount * 10 + sameAsLinks.length * 8 - missing.length * 10)
                )

                return (
                    <MetricDetailLayout
                        title="Knowledge Graph Analysis"
                        description={`Entity integrity report for ${domain}`}
                        status={status}
                        impact={hasEntity ? `${kg.primary_entity} recognized as a mapped entity` : "No primary entity detected"}
                        rawDiagnostic={JSON.stringify(kg, null, 2)}
                        pullQuote="Premium AEO positioning comes from explicit entities, clear relationship edges, and verifiable identity links."
                        actionLabel="Open Schema Builder"
                        customTabs={KG_TABS}
                        leftPanelTip={
                            <div className="mt-6 rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-[#17342c] via-[#1d4337] to-[#1A4036] p-4 text-emerald-100 shadow-[0_12px_36px_rgba(19,60,47,0.35)]">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl border border-emerald-300/25 bg-white/10 p-2">
                                        <Gem className="w-5 h-5 text-emerald-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-emerald-200/90">Premium Signal</p>
                                        <p className="text-sm leading-relaxed text-emerald-50/95">
                                            Add 2-3 authoritative `sameAs` links and one verified `worksFor`/`alumniOf` connection to raise model trust quickly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        }
                        whatAndWhyContent={
                            <div className="space-y-4 text-slate-600">
                                <p>
                                    <strong>What is it?</strong><br />
                                    Your entity card for AI engines. It defines who you are, what you offer, and how external references connect back to you.
                                </p>
                                <p>
                                    <strong>Why it matters:</strong><br />
                                    Strong graph structure reduces ambiguity and gives models stable evidence when answering brand-related queries.
                                </p>
                            </div>
                        }
                        renderTabContent={(activeTab: string) => (
                            <>
                                {activeTab === "what-why" && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="rounded-2xl border border-[#d8ebe0] bg-gradient-to-br from-[#f6fcf8] via-white to-[#edf8f2] p-6 shadow-sm">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#5a7c6f]">Entity Trust Summary</p>
                                                    <h2 className="text-3xl font-serif text-[#1f3f33] mt-1">Knowledge Graph Health</h2>
                                                    <p className="text-sm text-slate-600 mt-2 max-w-xl">
                                                        Clear entity definitions and relationship edges increase retrieval confidence across ChatGPT, Gemini, and other answer engines.
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                                                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                                    {confidenceScore}% confidence
                                                </Badge>
                                            </div>

                                            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="rounded-xl border border-white/80 bg-white/85 p-3">
                                                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Primary Entity</p>
                                                    <p className="font-medium text-[#224034] mt-1">{hasEntity ? kg.primary_entity : "Missing"}</p>
                                                </div>
                                                <div className="rounded-xl border border-white/80 bg-white/85 p-3">
                                                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Mapped Relationships</p>
                                                    <p className="font-medium text-[#224034] mt-1">{mappedRelationshipCount} groups</p>
                                                </div>
                                                <div className="rounded-xl border border-white/80 bg-white/85 p-3">
                                                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Missing Critical</p>
                                                    <p className="font-medium text-[#224034] mt-1">{missing.length}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                                                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    Weak Graph Signals
                                                </h3>
                                                <ul className="space-y-2 text-sm text-red-800/90">
                                                    <li className="flex gap-2"><span>•</span><span>Missing identity references (`sameAs`) from trusted sources.</span></li>
                                                    <li className="flex gap-2"><span>•</span><span>Generic role/location statements without explicit schema fields.</span></li>
                                                    <li className="flex gap-2"><span>•</span><span>Few connection edges between person, organization, and offerings.</span></li>
                                                </ul>
                                            </div>
                                            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Strong Graph Signals
                                                </h3>
                                                <ul className="space-y-2 text-sm text-emerald-800/90">
                                                    <li className="flex gap-2"><span>•</span><span>Specific `Person`/`Organization` entity with consistent naming.</span></li>
                                                    <li className="flex gap-2"><span>•</span><span>Multiple validated profile links (`sameAs`).</span></li>
                                                    <li className="flex gap-2"><span>•</span><span>Topic/offer relationships like `knowsAbout` and `products`.</span></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "visualizer" && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <h2 className="text-xl font-bold text-[#1A4036] flex items-center gap-2">
                                                    <Orbit className="w-5 h-5 text-emerald-600" />
                                                    Entity Map
                                                </h2>
                                                <p className="text-slate-500 text-sm">How answer engines connect your identity graph.</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="border-slate-200">
                                                    {nodes.length} Nodes
                                                </Badge>
                                                <Badge variant="outline" className="border-slate-200">
                                                    {sameAsLinks.length} Identity Links
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
                                            <div className="relative bg-gradient-to-br from-[#0e1f1a] via-[#153128] to-[#1A4036] rounded-2xl border border-[#224034] overflow-hidden shadow-[inset_0_0_80px_rgba(6,20,15,0.6)] min-h-[460px] flex items-center justify-center">
                                                <div
                                                    className="absolute inset-0 opacity-25"
                                                    style={{
                                                        backgroundImage: "radial-gradient(#4a7c68 1px, transparent 1px)",
                                                        backgroundSize: "26px 26px",
                                                    }}
                                                />
                                                <div className="absolute -top-20 left-1/3 h-64 w-64 rounded-full bg-emerald-400/12 blur-3xl" />
                                                <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />

                                                {hasEntity ? (
                                                    <div className="relative w-full h-full flex items-center justify-center p-10">
                                                        <div className="z-20 relative flex flex-col items-center">
                                                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center border-4 border-[#0f1f1a] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                                                                <Database className="w-10 h-10 text-white" />
                                                            </div>
                                                            <div className="mt-4 max-w-[260px] text-center bg-[#224034]/90 text-emerald-100 px-4 py-1.5 rounded-full border border-emerald-400/30 text-sm font-bold shadow-lg">
                                                                {kg.primary_entity}
                                                            </div>
                                                        </div>

                                                        {nodes.map((node, i) => {
                                                            const angle = (i / Math.max(nodes.length, 1)) * 2 * Math.PI
                                                            const radius = nodes.length > 8 ? 190 : 165
                                                            const x = Math.cos(angle) * radius
                                                            const y = Math.sin(angle) * radius

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className="absolute z-10 flex flex-col items-center group transition-all duration-500 hover:scale-110 cursor-pointer"
                                                                    style={{ transform: `translate(${x}px, ${y}px)` }}
                                                                >
                                                                    <div className={`w-12 h-12 ${node.color} rounded-full flex items-center justify-center border-4 border-[#0f1f1a] shadow-lg`}>
                                                                        <Share2 className="w-5 h-5 text-white opacity-85" />
                                                                    </div>
                                                                    <div className="mt-2 bg-[#1a2e28] text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-white/10">
                                                                        {node.type}
                                                                    </div>
                                                                    <div className="absolute top-14 mt-1 w-36 text-center text-xs text-white/95 font-medium bg-black/60 backdrop-blur-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                        {node.label}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}

                                                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                                            <g transform="translate(50%, 50%)" className="overflow-visible">
                                                                {nodes.map((_, i) => {
                                                                    const angle = (i / Math.max(nodes.length, 1)) * 2 * Math.PI
                                                                    const radius = nodes.length > 8 ? 190 : 165
                                                                    const x = Math.cos(angle) * radius
                                                                    const y = Math.sin(angle) * radius
                                                                    return (
                                                                        <line
                                                                            key={i}
                                                                            x1="0"
                                                                            y1="0"
                                                                            x2={x}
                                                                            y2={y}
                                                                            stroke="#3f6c5a"
                                                                            strokeWidth="2"
                                                                            className="opacity-55"
                                                                        />
                                                                    )
                                                                })}
                                                            </g>
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-slate-400">
                                                        <Network className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                                        <p>No entity graph found yet.</p>
                                                        <Button variant="outline" className="mt-4 border-slate-700 text-slate-300 hover:text-white hover:bg-[#224034]">
                                                            Run Deep Scan
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Core Entity</p>
                                                    <p className="font-medium text-[#224034] mt-1">{hasEntity ? kg.primary_entity : "Not found"}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Type: {kg.type || "Thing"}</p>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1">
                                                        <Link2 className="w-3.5 h-3.5" />
                                                        Identity Links
                                                    </p>
                                                    {sameAsLinks.length > 0 ? (
                                                        <div className="mt-2 space-y-1.5">
                                                            {sameAsLinks.slice(0, 4).map((link, index) => (
                                                                <a
                                                                    key={index}
                                                                    href={link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="block truncate text-xs text-blue-600 hover:text-blue-800"
                                                                >
                                                                    {link}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-500 mt-2">No sameAs links detected.</p>
                                                    )}
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1">
                                                        <BrainCircuit className="w-3.5 h-3.5" />
                                                        Priority Gaps
                                                    </p>
                                                    {missing.length > 0 ? (
                                                        <ul className="mt-2 space-y-1.5">
                                                            {missing.slice(0, 4).map((entry: string, idx: number) => (
                                                                <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-[1px] shrink-0" />
                                                                    <span>{entry}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1.5">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            No critical gaps detected.
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1">
                                                        <Layers className="w-3.5 h-3.5" />
                                                        Relationship Coverage
                                                    </p>
                                                    <p className="mt-2 text-xs text-slate-600">{mappedRelationshipCount} mapped relationship groups detected.</p>
                                                    <p className="text-xs text-slate-500 mt-1">Add structured references to strengthen multi-hop retrieval.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "schema" && (
                                    <div className="h-full space-y-4 animate-in fade-in duration-300">
                                        <div className="rounded-xl border border-[#dce9e2] bg-[#f7fcf9] p-4">
                                            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#5a7c6f]">Schema Builder</p>
                                            <p className="text-sm text-slate-600 mt-1">
                                                Generate structured entity markup and close critical graph gaps in one pass.
                                            </p>
                                        </div>
                                        <SchemaFixer
                                            domain={domain}
                                            entityType={kg.type || "Organization"}
                                            primaryEntity={kg.primary_entity !== "Not found" ? kg.primary_entity : ""}
                                            missingAttributes={missing}
                                        />
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
