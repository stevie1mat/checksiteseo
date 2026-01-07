import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, XCircle, AlertCircle, Cpu, ChevronDown, ChevronUp } from "lucide-react"
import { AEOReport } from "@/types/aeo"

interface TechnicalTabProps {
    activeReport: AEOReport
    setActiveTab?: (tab: 'overview' | 'technical' | 'content' | 'authority') => void
    siteId?: string
}

interface TechnicalItemProps {
    title: string
    label: string
    isGood: boolean
    fix: React.ReactNode
    isWarning?: boolean
    docUrl?: string
}

function TechnicalItem({ title, label, isGood, fix, isWarning, docUrl }: TechnicalItemProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
            <div
                className={`flex justify-between items-start ${!isGood ? 'cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors' : ''}`}
                onClick={() => !isGood && setIsOpen(!isOpen)}
            >
                <div>
                    <p className="font-semibold text-slate-700 text-base">{title}</p>
                    <p className="text-sm text-slate-500 mt-1">{label}</p>
                </div>
                <div className="flex items-center gap-2">
                    {!isGood && (
                        <div className="text-slate-400">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    )}
                    {isGood ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                    ) : isWarning ? (
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                    )}
                </div>
            </div>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen && !isGood ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
                        <p className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <Cpu className="w-3 h-3" /> How to Fix
                        </p>
                        {fix}
                        {docUrl && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-xs font-medium center flex items-center gap-1">
                                    Read Documentation <ChevronDown className="w-3 h-3 -rotate-90" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function TechnicalTab({ activeReport, setActiveTab, siteId }: TechnicalTabProps) {
    const agentEcon = activeReport.agentEconomics || {}
    const techScore = activeReport.scores?.technical || 0

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-serif text-[#224034] mb-4">Technical Readiness</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Standard Checks */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">

                    <TechnicalItem
                        title="Robots.txt"
                        label={activeReport.technical.robotsTxt ? 'Optimized' : 'Missing or Blocking AI'}
                        isGood={activeReport.technical.robotsTxt}
                        fix={
                            <div className="space-y-2">
                                <p>Your <code>robots.txt</code> file is either missing or blocking AI agents.</p>
                                <p><strong>Add this to your robots.txt:</strong></p>
                                <pre className="bg-slate-800 text-slate-50 p-2 rounded text-xs overflow-x-auto">
                                    {`User-agent: GPTBot
Disallow:

User-agent: CCBot
Disallow:

User-agent: Google-Extended
Disallow:`}
                                </pre>
                            </div>
                        }
                    />

                    <TechnicalItem
                        title="LLMs.txt"
                        label={activeReport.technical.llmsTxt ? 'Found' : 'Missing'}
                        isGood={activeReport.technical.llmsTxt}
                        docUrl="https://llmstxt.org/"
                        fix={
                            <div className="space-y-2">
                                <p>An <code>llms.txt</code> file helps AI agents understand your content structure efficiently.</p>
                                <p>Create a file at <code>/llms.txt</code> that summarizes your site's core information and links to key pages.</p>
                            </div>
                        }
                    />

                    <TechnicalItem
                        title="Schema.org"
                        label={(activeReport.technical.schema.join(', ') || 'None Detected')}
                        isGood={activeReport.technical.schema.length > 0}
                        isWarning={true}
                        docUrl="https://developers.google.com/search/docs/appearance/structured-data"
                        fix={
                            <div className="space-y-3">
                                <p>Structured data helps AEO engines understand your entities.</p>
                                <p>Add <strong>JSON-LD</strong> schema for Organization, FAQPage, or Article to your <code>&lt;head&gt;</code>.</p>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-700">Validation Tools:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li><a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Rich Results Test</a></li>
                                        <li><a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Schema Markup Validator</a></li>
                                    </ul>
                                </div>
                            </div>
                        }
                    />

                    <TechnicalItem
                        title="Sitemap.xml"
                        label={activeReport.technical.sitemap ? 'Valid' : 'Not Found'}
                        isGood={!!activeReport.technical.sitemap}
                        fix={
                            <div className="space-y-2">
                                <p>We couldn't find your sitemap automatically.</p>
                                <p>Ensure your sitemap is located at <code>/sitemap.xml</code> or linked clearly in your <code>robots.txt</code> file.</p>
                            </div>
                        }
                    />

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
