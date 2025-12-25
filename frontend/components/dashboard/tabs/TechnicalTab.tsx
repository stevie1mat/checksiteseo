import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, XCircle, AlertCircle, Cpu } from "lucide-react"
import { AEOReport } from "@/types/aeo"

interface TechnicalTabProps {
    activeReport: AEOReport
}

export function TechnicalTab({ activeReport }: TechnicalTabProps) {
    const agentEcon = activeReport.agentEconomics || {}
    const techScore = activeReport.scores?.technical || 0

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-serif text-[#224034] mb-4">Technical Readiness</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Standard Checks */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                    {/* Robots */}
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                        <div>
                            <p className="font-semibold text-slate-700 text-base">Robots.txt</p>
                            <p className="text-sm text-slate-500 mt-1">{activeReport.technical.robotsTxt ? 'Optimized' : 'Missing or Blocking'}</p>
                        </div>
                        {activeReport.technical.robotsTxt ? <Check className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
                    </div>
                    {/* LLMs */}
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                        <div>
                            <p className="font-semibold text-slate-700 text-base">LLMs.txt</p>
                            <p className="text-sm text-slate-500 mt-1">{activeReport.technical.llmsTxt ? 'Found' : 'Missing'}</p>
                        </div>
                        {activeReport.technical.llmsTxt ?
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
                            <p className="text-sm text-slate-500 mt-1">{activeReport.technical.schema.join(', ') || 'None Detected'}</p>
                        </div>
                        {activeReport.technical.schema.length > 0 ? <Check className="w-5 h-5 text-emerald-500" /> :
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
                            <p className="text-sm text-slate-500 mt-1">{activeReport.technical.sitemap ? 'Valid' : 'Not Found'}</p>
                        </div>
                        {activeReport.technical.sitemap ? <Check className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
                    </div>
                </div>

                {/* Agent Economics */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-slate-500" />
                        <h4 className="font-semibold text-slate-700 text-base uppercase tracking-wide">Context Window Analysis</h4>
                    </div>

                    {/* Zero Token Warning */}
                    {agentEcon.totalTokens === 0 && activeReport.status === 'completed' && (
                        <div className="border border-amber-200 bg-amber-50 p-4 rounded-xl mb-4">
                            <h4 className="text-amber-800 font-bold flex items-center gap-2 text-sm">
                                <AlertCircle size={16} />
                                Scraping Issue Detected
                            </h4>
                            <p className="text-amber-700 text-xs mt-1">
                                We detected 0 tokens. This often happens with <strong>Single Page Apps (SPA)</strong>.
                                Your site might be invisible to basic crawlers.
                            </p>
                            <button className="mt-2 text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded hover:bg-amber-300 transition-colors">
                                Try "Headless Browser" Scan
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500">Total Tokens</p>
                            <p className="font-mono text-xl font-medium text-[#224034]">{agentEcon.totalTokens?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Est. Index Cost</p>
                            <p className="font-mono text-xl font-medium text-emerald-600">{agentEcon.indexCost || '$0.00'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                        <div>
                            <p className="text-sm text-slate-500 mb-0.5">Signal-to-Noise Ratio</p>
                            <p className="font-mono text-base font-medium text-slate-700">{agentEcon.codeToTextRatio || '0%'} Content</p>
                            <p className="text-xs text-slate-400">vs Raw HTML</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-0.5">Bloat Status</p>
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 h-6 border-0 ${agentEcon.bloatStatus === 'Critical Bloat' ? 'bg-red-100 text-red-700' :
                                agentEcon.bloatStatus === 'Moderate Bloat' ? 'bg-amber-100 text-amber-700' :
                                    'bg-emerald-100 text-emerald-700'
                                }`}>
                                {agentEcon.bloatStatus || 'Unknown'}
                            </Badge>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-xs text-slate-500">Boilerplate Ratio</p>
                            <span className={`text-xs font-medium ${(agentEcon.boilerplate_ratio || 0) > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {agentEcon.boilerplate_ratio || 0}%
                            </span>
                        </div>
                        <Progress value={agentEcon.boilerplate_ratio || 0} className="h-1.5" indicatorClassName={(agentEcon.boilerplate_ratio || 0) > 30 ? "bg-amber-400" : "bg-emerald-400"} />
                    </div>
                </div>
            </div>
        </div>
    )
}
