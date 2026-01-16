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
                className="flex justify-between items-start cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <p className="font-semibold text-slate-700 text-base">{title}</p>
                    <p className="text-sm text-slate-500 mt-1">{label}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Chevron always visible for expand/collapse */}
                    <div className="text-slate-400">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                    {isGood ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                    ) : isWarning ? (
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                    )}
                </div>
            </div>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
                        <p className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            {isGood ? <Check className="w-3 h-3 text-emerald-600" /> : <Cpu className="w-3 h-3" />}
                            {isGood ? "Status Analysis" : "How to Fix"}
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

    // Detection Logic
    const rawRatio = agentEcon.codeToTextRatio ? parseFloat(String(agentEcon.codeToTextRatio)) : 0
    const ratioPercentage = rawRatio * 100

    // Thresholds: < 10% is likely SPA/Framework, < 15% is noisy
    const isSPA = ratioPercentage < 10
    const likelyStack = isSPA ? "Heavy Client-Side Framework (React/Vue/Angular)" : "Standard HTML / SSG"

    // Advice Logic
    const getActionableAdvice = () => {
        if (agentEcon.bloatStatus === 'Critical Bloat') {
            return {
                title: "Reduce Code Bloat",
                msg: "Your HTML payload is extremely heavy (mostly JS/CSS). AI agents struggle to parse this efficiently.",
                action: "Implement Server-Side Rendering (SSR) or Static Site Generation (SSG). Inspect your bundle size."
            }
        }
        if (ratioPercentage < 15) {
            return {
                title: "Improve Signal-to-Noise",
                msg: "The text content is buried under too much markup code.",
                action: "Simplify your DOM structure and ensure semantic HTML usage."
            }
        }
        return {
            title: "Maintain Efficiency",
            msg: "Your token usage is efficient.",
            action: "Monitor regularly as you add new features."
        }
    }

    const advice = getActionableAdvice()

    // Formatting Cost
    const formatCost = (cost: any) => {
        if (typeof cost === 'number') return `$${cost.toFixed(4)}`
        if (typeof cost === 'string' && !cost.startsWith('$')) return `$${parseFloat(cost).toFixed(4)}`
        return cost || '$0.00'
    }

    const [showGuide, setShowGuide] = useState(false)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-serif text-[#224034] mb-4">Technical Readiness</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Standard Checks */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 h-fit">

                    <TechnicalItem
                        title="Robots.txt"
                        label={activeReport.technical.robotsTxt ? 'Optimized' : 'Missing or Blocking AI'}
                        isGood={activeReport.technical.robotsTxt}
                        fix={
                            <div className="space-y-2">
                                {activeReport.technical.robotsTxt ? (
                                    <p>Your <code>robots.txt</code> allows known AI agents (GPTBot, CCBot). This ensures your content can be indexed for retrieval augmentation.</p>
                                ) : (
                                    <>
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
                                    </>
                                )}
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
                                {activeReport.technical.llmsTxt ? (
                                    <p>Great job! You have an <code>llms.txt</code> file. This acts as an API for AI agents to easily ingest your most important content.</p>
                                ) : (
                                    <>
                                        <p>An <code>llms.txt</code> file helps AI agents understand your content structure efficiently.</p>
                                        <p>Create a file at <code>/llms.txt</code> that summarizes your site's core information and links to key pages.</p>
                                    </>
                                )}
                            </div>
                        }
                    />

                    <TechnicalItem
                        title="Schema.org"
                        label={(activeReport.technical.schema.join(', ') || 'None Detected')}
                        isGood={activeReport.technical.schema.length > 0}
                        isWarning={activeReport.technical.schema.length > 0} // Schema is always good to have, but we use warning color if we want to differentiate "Good" vs "Best". Here user code used isWarning for detected schema. I will keep consistent but ensure details are helpful.
                        docUrl="https://developers.google.com/search/docs/appearance/structured-data"
                        fix={
                            <div className="space-y-3">
                                {activeReport.technical.schema.length > 0 ? (
                                    <p>We detected structured data ({activeReport.technical.schema.join(', ')}). This helps models understand entities on your page (Product, Organization, etc.). Verify it regularly.</p>
                                ) : (
                                    <>
                                        <p>Structured data helps AEO engines understand your entities.</p>
                                        <p>Add <strong>JSON-LD</strong> schema for Organization, FAQPage, or Article to your <code>&lt;head&gt;</code>.</p>
                                    </>
                                )}
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
                                {activeReport.technical.sitemap ? (
                                    <p>Sitemap located successfully. This serves as the roadmap for crawlers to discover all your pages.</p>
                                ) : (
                                    <>
                                        <p>We couldn't find your sitemap automatically.</p>
                                        <p>Ensure your sitemap is located at <code>/sitemap.xml</code> or linked clearly in your <code>robots.txt</code> file.</p>
                                    </>
                                )}
                            </div>
                        }
                    />

                </div>

                {/* Agent Economics */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 h-fit">
                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setShowGuide(!showGuide)}>
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-slate-500" />
                            <h4 className="font-semibold text-slate-700 text-base uppercase tracking-wide">Context Window Analysis</h4>
                        </div>
                        <div className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-full transition-colors" title="What is this?">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Collapsible Educational Guide */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showGuide ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-emerald-50/50 p-4 rounded-lg text-sm text-slate-600 border border-emerald-100 space-y-3">
                            <p className="font-semibold text-emerald-800">Why this matters:</p>
                            <p>AI models have a limited "context window" (memory). If your page is full of code bloat (HTML tags, scripts) instead of actual text, it becomes harder and more expensive for AI to read.</p>
                            <ul className="list-disc pl-4 space-y-1 text-xs">
                                <li><strong>Low Index Cost</strong>: Cheaper for Search Engines to process.</li>
                                <li><strong>High Signal/Noise</strong>: Models see your content, not your code.</li>
                                <li><strong>Goal</strong>: Aim for {'>'}15% Text Content.</li>
                            </ul>
                        </div>
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
                            <p className="font-mono text-xl font-medium text-emerald-600">{formatCost(agentEcon.indexCost)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                        <div>
                            <p className="text-sm text-slate-500 mb-0.5">Signal-to-Noise Ratio</p>
                            <p className="font-mono text-base font-medium text-slate-700">{ratioPercentage.toFixed(1)}% Content</p>
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
                        <div className="grid gap-2">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Architecture Detected</p>
                                <p className="text-sm font-medium text-slate-800">{likelyStack}</p>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-3 h-3 text-slate-500" />
                                    <p className="text-xs font-bold text-slate-700">{advice.title}</p>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {advice.msg}
                                    <br />
                                    <span className="font-medium text-emerald-700 block mt-1">Goal: {advice.action}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-xs text-slate-500">Boilerplate Ratio</p>
                            <span className={`text-xs font-medium ${(agentEcon.boilerplate_ratio || 0) > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {(agentEcon.boilerplate_ratio || 0).toFixed(1)}%
                            </span>
                        </div>
                        <Progress value={agentEcon.boilerplate_ratio || 0} className="h-1.5" indicatorClassName={(agentEcon.boilerplate_ratio || 0) > 30 ? "bg-amber-400" : "bg-emerald-400"} />
                    </div>
                </div>
            </div>
        </div>
    )
}
