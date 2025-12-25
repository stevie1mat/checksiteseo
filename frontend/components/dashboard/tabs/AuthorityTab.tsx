import { Badge } from "@/components/ui/badge"
import { Check, XCircle, Database } from "lucide-react"
import { AEOReport } from "@/types/aeo"

interface AuthorityTabProps {
    activeReport: AEOReport
}

export function AuthorityTab({ activeReport }: AuthorityTabProps) {
    const knowledgeGraph = activeReport.knowledgeGraph || {}

    return (
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
                        {knowledgeGraph.primaryEntity ? (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                                        {knowledgeGraph.type || 'Entity'}
                                    </Badge>
                                    <span className="font-serif text-xl text-slate-800">{knowledgeGraph.primaryEntity}</span>
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
                                {(activeReport.authority.eeat?.signals || []).filter((s: string) => s.startsWith("Pro:")).slice(0, 4).map((signal: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 pb-1 last:pb-0">
                                        <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                                        <span className="leading-snug">{signal.replace("Pro:", "").trim()}</span>
                                    </li>
                                ))}
                                {(!activeReport.authority.eeat?.signals || activeReport.authority.eeat.signals.filter((s: string) => s.startsWith("Pro:")).length === 0) && <li className="text-xs text-slate-400">No signals detected.</li>}
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Weaknesses</p>
                            <ul className="space-y-2">
                                {(activeReport.authority.eeat?.signals || []).filter((s: string) => s.startsWith("Con:")).slice(0, 4).map((signal: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 pb-1 last:pb-0">
                                        <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                                        <span className="leading-snug">{signal.replace("Con:", "").trim()}</span>
                                    </li>
                                ))}
                                {(!activeReport.authority.eeat?.signals || activeReport.authority.eeat.signals.filter((s: string) => s.startsWith("Con:")).length === 0) && <li className="text-xs text-slate-400 italic">No major weaknesses detected.</li>}
                            </ul>
                        </div>

                        {/* Hallucination Risk Card */}
                        {activeReport.authority.eeat?.hallucination_risk && (
                            <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hallucination Risk</p>
                                    <Badge variant="outline" className={`
                                        ${activeReport.authority.eeat.hallucination_risk.level === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                            activeReport.authority.eeat.hallucination_risk.level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-200'}
                                    `}>
                                        {activeReport.authority.eeat.hallucination_risk.level} Risk
                                    </Badge>
                                </div>

                                <p className="text-sm text-slate-700 font-medium mb-1">
                                    "{activeReport.authority.eeat.hallucination_risk.reason}"
                                </p>

                                {activeReport.authority.eeat.hallucination_risk.fix && (
                                    <div className="mt-2 bg-white rounded border border-gray-200 p-3 text-sm">
                                        <span className="font-bold text-indigo-600 block mb-0.5">Suggested Fix:</span>
                                        <span className="text-slate-600 italic">{activeReport.authority.eeat.hallucination_risk.fix}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
