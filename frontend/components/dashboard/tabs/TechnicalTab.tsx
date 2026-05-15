import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, XCircle, AlertCircle, Cpu, ChevronDown, ChevronUp, Copy, RefreshCw, ChevronRight } from "lucide-react"
import { AEOReport } from "@/types/aeo"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"

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
    guideUrl?: string
    keepOpen?: boolean
    statusVariant?: "pass" | "issue" | "improve"
}

type TechnicalCheck = {
    key: string
    title: string
    label: string
    isGood: boolean
    isWarning?: boolean
    status: "passed" | "failed" | "improve"
    fix: React.ReactNode
    docUrl?: string
    guideUrl?: string
    statusVariant?: "pass" | "issue" | "improve"
}

type ScanReportLike = {
    status?: "completed" | "processing" | "failed"
    technical?: {
        robotsTxt?: boolean
        llmsTxt?: boolean
        sitemap?: string | null
        schema?: string[]
    }
    agentEconomics?: {
        codeToTextRatio?: number | string
    }
}

function TechnicalItem({ title, label, isGood, fix, isWarning, docUrl, guideUrl, keepOpen, statusVariant }: TechnicalItemProps) {
    const [isOpen, setIsOpen] = useState(false)
    const isExpanded = keepOpen || isOpen
    const variant = statusVariant || (isGood ? "pass" : isWarning ? "improve" : "issue")
    const statusLabel = variant === "pass" ? "Pass" : variant === "improve" ? "Can Improve" : "Issue"
    const statusClass = variant === "pass"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : variant === "improve"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-rose-50 text-rose-700 border-rose-200"

    return (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div
                className="flex justify-between items-start cursor-pointer hover:bg-slate-50/80 px-4 py-3.5 transition-colors"
                onClick={() => {
                    if (!keepOpen) setIsOpen(!isOpen)
                }}
            >
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-base">{title}</p>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass}`}>
                            {statusLabel}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{label}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Chevron always visible for expand/collapse */}
                    <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                    {variant === "pass" ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                    ) : variant === "improve" ? (
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                    )}
                </div>
            </div>

            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="bg-slate-50 p-4 border-t border-slate-200/70 text-sm text-slate-600">
                        <p className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            {variant === "pass" ? <Check className="w-3 h-3 text-emerald-600" /> : <Cpu className="w-3 h-3" />}
                            {variant === "pass" ? "Status Analysis" : variant === "improve" ? "How to Improve" : "How to Fix"}
                        </p>
                        {fix}
                        {(guideUrl || docUrl) && (
                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                                {guideUrl && (
                                    <a
                                        href={guideUrl}
                                        className="text-emerald-700 hover:underline text-xs font-semibold flex items-center gap-1"
                                    >
                                        Open Full Guide <ChevronDown className="w-3 h-3 -rotate-90" />
                                    </a>
                                )}
                                {docUrl && (
                                    <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-xs font-medium center flex items-center gap-1">
                                        Read Documentation <ChevronDown className="w-3 h-3 -rotate-90" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

type FixItem = {
    key: string
    title: string
    effort: "Low" | "Medium" | "High"
    impact: "Low" | "Medium" | "High"
    estimatedLift: number
    done: boolean
    snippet?: string
}

const SIMPLE_FIX_INSTRUCTIONS: Record<string, string> = {
    robots: "Open your robots.txt and allow GPTBot, CCBot, and Google-Extended.",
    llms: "Create /llms.txt with a short site summary and links to your top pages.",
    sitemap: "Publish /sitemap.xml and add its URL inside robots.txt.",
    schema: "Add JSON-LD schema on key pages (Organization, FAQPage, Article).",
    payload: "Reduce heavy scripts/CSS and make key content render in initial HTML.",
}

const SIMPLE_FIX_ISSUES: Record<string, string> = {
    robots: "AI crawlers may still be blocked from reading important pages.",
    llms: "AI agents still cannot find a clear summary file for your site.",
    sitemap: "Crawlers may still miss important URLs because sitemap discovery is incomplete.",
    schema: "Your structured data coverage is still too low for strong entity understanding.",
    payload: "Your pages still contain too much code vs readable content, so AI can miss key answers.",
}

const SIMPLE_FIX_SOLUTIONS: Record<string, string[]> = {
    robots: [
        "Update robots.txt with explicit allow directives for GPTBot, CCBot, and Google-Extended.",
        "Make sure robots.txt is reachable at /robots.txt and returns HTTP 200.",
        "Re-run verification after deployment.",
    ],
    llms: [
        "Create /llms.txt at your site root with a short site summary.",
        "Include your most important URLs in that file.",
        "Publish changes and run verification again.",
    ],
    sitemap: [
        "Generate sitemap.xml with your key canonical pages.",
        "Add the sitemap URL to robots.txt.",
        "Deploy and verify /sitemap.xml is publicly reachable.",
    ],
    schema: [
        "Add JSON-LD schema to core pages (Organization, FAQPage, Article, BreadcrumbList).",
        "Validate with Rich Results Test and schema validator.",
        "Fix validation warnings, then reverify.",
    ],
    payload: [
        "Reduce heavy JS/CSS bundles and remove unused code.",
        "Render key content in initial HTML (SSR/SSG where possible).",
        "Move important answers higher in page HTML structure.",
    ],
}

export function TechnicalTab({ activeReport, siteId }: TechnicalTabProps) {
    const searchParams = useSearchParams()
    const viewMode = searchParams.get("mode") || "simple"
    const isAdvancedMode = viewMode === "advanced"
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
    const formatCost = (cost: number | string | undefined) => {
        if (typeof cost === 'number') return `$${cost.toFixed(4)}`
        if (typeof cost === 'string' && !cost.startsWith('$')) return `$${parseFloat(cost).toFixed(4)}`
        return cost || '$0.00'
    }

    const [showGuide, setShowGuide] = useState(false)
    const [checkFilter, setCheckFilter] = useState<"all" | "passed" | "failed" | "improve">("all")
    const [advancedTab, setAdvancedTab] = useState<"all" | "fix-plan" | "crawl-index" | "render-files" | "schema-payload" | "actions">("all")
    const [isRecrawling, setIsRecrawling] = useState(false)
    const [recrawlMessage, setRecrawlMessage] = useState<string | null>(null)
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [scanDialogStatus, setScanDialogStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')
    const [scanDialogMessage, setScanDialogMessage] = useState<string>("")
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const [fixDoneOverrides, setFixDoneOverrides] = useState<Record<string, boolean>>({})
    const normalizedDomain = (() => {
        const raw = (activeReport.domain || "https://example.com").trim().replace(/\/$/, "")
        if (raw.startsWith("http://") || raw.startsWith("https://")) return raw
        return `https://${raw}`
    })()
    const domainHost = (() => {
        try {
            return new URL(normalizedDomain).hostname.replace(/^www\./, "")
        } catch {
            return "example.com"
        }
    })()
    const [wizardStep, setWizardStep] = useState<number>(0)
    const getDoneStatusFromReport = (report: ScanReportLike): Record<string, boolean> => {
        const schemaTypes = Array.isArray(report.technical?.schema)
            ? report.technical.schema.map((item) => String(item).toLowerCase())
            : []
        const schemaCoverageFromScan = Math.round(
            (["organization", "faqpage", "article", "breadcrumblist"].filter((schema) => schemaTypes.includes(schema)).length / 4) * 100
        )
        const ratioPercentageFromScan = Number(report.agentEconomics?.codeToTextRatio || 0) * 100

        return {
            robots: Boolean(report.technical?.robotsTxt),
            llms: Boolean(report.technical?.llmsTxt),
            sitemap: Boolean(report.technical?.sitemap),
            schema: schemaCoverageFromScan >= 75,
            payload: Number.isFinite(ratioPercentageFromScan) && ratioPercentageFromScan >= 15,
        }
    }

    useEffect(() => {
        setRecrawlMessage(null)
        setScanDialogMessage("")
        setScanDialogStatus("idle")
    }, [wizardStep])

    const checklistSummary = [
        activeReport.technical.robotsTxt,
        activeReport.technical.llmsTxt,
        activeReport.technical.schema.length > 0,
        !!activeReport.technical.sitemap,
    ]
    const passedChecks = checklistSummary.filter(Boolean).length
    const technicalChecks: TechnicalCheck[] = [
        {
            key: "robots",
            title: "Robots.txt",
            label: activeReport.technical.robotsTxt ? "Optimized" : "Missing or Blocking AI",
            isGood: activeReport.technical.robotsTxt,
            isWarning: false,
            status: activeReport.technical.robotsTxt ? "passed" : "failed",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/robots?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
            fix: (
                <div className="space-y-2">
                    {activeReport.technical.robotsTxt ? (
                        <p>
                            {isAdvancedMode
                                ? "Your robots.txt allows known AI agents (GPTBot, CCBot). This ensures your content can be indexed for retrieval augmentation."
                                : "Great news: your robots.txt is letting major AI crawlers read your site."}
                        </p>
                    ) : (
                        <>
                            <p>
                                {isAdvancedMode
                                    ? "Your robots.txt file is either missing or blocking AI agents."
                                    : "Your robots.txt is missing or blocking AI tools, so they may not read your site."}
                            </p>
                            <p><strong>{isAdvancedMode ? "Add this to your robots.txt:" : "Copy this into robots.txt:"}</strong></p>
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
            ),
        },
        {
            key: "llms",
            title: "LLMs.txt",
            label: activeReport.technical.llmsTxt ? "Found" : "Missing",
            isGood: activeReport.technical.llmsTxt,
            isWarning: false,
            status: activeReport.technical.llmsTxt ? "passed" : "failed",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/llms?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
            docUrl: "https://llmstxt.org/",
            fix: (
                <div className="space-y-2">
                    {activeReport.technical.llmsTxt ? (
                        <p>
                            {isAdvancedMode
                                ? "Great job! You have an llms.txt file. This acts as an API for AI agents to easily ingest your most important content."
                                : "Nice work: you already have an llms.txt file, which helps AI tools find your most important pages quickly."}
                        </p>
                    ) : (
                        <>
                            <p>
                                {isAdvancedMode
                                    ? "An llms.txt file helps AI agents understand your content structure efficiently."
                                    : "AI tools need a short guide file to understand your site faster."}
                            </p>
                            <p>
                                {isAdvancedMode
                                    ? "Create a file at /llms.txt that summarizes your site's core information and links to key pages."
                                    : "Create /llms.txt with a short summary of your site and links to key pages."}
                            </p>
                        </>
                    )}
                </div>
            ),
        },
        {
            key: "schema",
            title: "Schema.org",
            label: activeReport.technical.schema.join(", ") || "None Detected",
            isGood: activeReport.technical.schema.length > 0,
            isWarning: activeReport.technical.schema.length > 0,
            statusVariant: activeReport.technical.schema.length > 0 ? "improve" : "issue",
            status: activeReport.technical.schema.length > 0 ? "improve" : "failed",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/schema?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
            docUrl: "https://developers.google.com/search/docs/appearance/structured-data",
            fix: (
                <div className="space-y-3">
                    {activeReport.technical.schema.length > 0 ? (
                        <p>
                            {isAdvancedMode
                                ? `We detected structured data (${activeReport.technical.schema.join(", ")}). This helps models understand entities on your page (Product, Organization, etc.). Verify it regularly.`
                                : `We found schema markup (${activeReport.technical.schema.join(", ")}), which helps AI understand what your page is about.`}
                        </p>
                    ) : (
                        <>
                            <p>
                                {isAdvancedMode
                                    ? "Structured data helps AEO engines understand your entities."
                                    : "AI can understand your pages better when schema markup is added."}
                            </p>
                            <p>
                                {isAdvancedMode
                                    ? <>Add <strong>JSON-LD</strong> schema for Organization, FAQPage, or Article to your <code>&lt;head&gt;</code>.</>
                                    : <>Add JSON-LD schema like Organization, FAQPage, or Article in your page head.</>}
                            </p>
                        </>
                    )}
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-700">{isAdvancedMode ? "Validation Tools:" : "Check your schema here:"}</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Rich Results Test</a></li>
                            <li><a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Schema Markup Validator</a></li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            key: "sitemap",
            title: "Sitemap.xml",
            label: activeReport.technical.sitemap ? "Valid" : "Not Found",
            isGood: !!activeReport.technical.sitemap,
            isWarning: false,
            status: activeReport.technical.sitemap ? "passed" : "failed",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/sitemap?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
            fix: (
                <div className="space-y-2">
                    {activeReport.technical.sitemap ? (
                        <p>
                            {isAdvancedMode
                                ? "Sitemap located successfully. This serves as the roadmap for crawlers to discover all your pages."
                                : "Your sitemap was found, so search engines and AI crawlers can discover your pages more easily."}
                        </p>
                    ) : (
                        <>
                            <p>
                                {isAdvancedMode
                                    ? "We could not find your sitemap automatically."
                                    : "We couldn't find your sitemap, so crawlers may miss pages."}
                            </p>
                            <p>
                                {isAdvancedMode
                                    ? <>Ensure your sitemap is located at <code>/sitemap.xml</code> or linked clearly in your <code>robots.txt</code> file.</>
                                    : <>Make sure sitemap.xml exists and is linked in robots.txt.</>}
                            </p>
                        </>
                    )}
                </div>
            ),
        },
    ]
    const filterCounts = {
        all: technicalChecks.length,
        passed: technicalChecks.filter((check) => check.status === "passed").length,
        failed: technicalChecks.filter((check) => check.status === "failed").length,
        improve: technicalChecks.filter((check) => check.status === "improve").length,
    }
    const totalChecks = technicalChecks.length
    const filteredChecks = checkFilter === "all"
        ? technicalChecks
        : technicalChecks.filter((check) => check.status === checkFilter)
    const filterDescription = checkFilter === "all"
        ? "Showing all technical checks."
        : checkFilter === "passed"
            ? "These checks are healthy and passing."
            : checkFilter === "failed"
                ? "These checks need immediate fixes."
                : "These checks are good baseline, but can still be improved."
    const detectedSchema = activeReport.technical.schema.map((item) => item.toLowerCase())
    const requiredSchema = [
        { key: "organization", label: "Organization", lift: 6, guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/schema?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined },
        { key: "faqpage", label: "FAQPage", lift: 5, guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/schema?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined },
        { key: "article", label: "Article", lift: 4, guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/schema?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined },
        { key: "breadcrumblist", label: "BreadcrumbList", lift: 3, guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/schema?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined },
    ]
    const schemaCoverage = Math.round((requiredSchema.filter((schema) => detectedSchema.includes(schema.key)).length / requiredSchema.length) * 100)

    const unsortedFixQueue: FixItem[] = [
        {
            key: "robots",
            title: "Fix robots.txt agent access",
            effort: "Low",
            impact: "High",
            estimatedLift: 12,
            done: fixDoneOverrides.robots ?? activeReport.technical.robotsTxt,
            snippet: `User-agent: GPTBot\nDisallow:\n\nUser-agent: CCBot\nDisallow:\n\nUser-agent: Google-Extended\nDisallow:`,
        },
        {
            key: "llms",
            title: "Publish llms.txt summary file",
            effort: "Low",
            impact: "High",
            estimatedLift: 11,
            done: fixDoneOverrides.llms ?? activeReport.technical.llmsTxt,
            snippet: `# ${normalizedDomain}\n> Machine-readable summary for AI agents.\n\n## Key Pages\n- / (homepage)\n- /<your-most-important-page>\n- /<your-second-most-important-page>\n\n## Contact\n- <contact@${domainHost}>`,
        },
        {
            key: "sitemap",
            title: "Ensure sitemap.xml discoverability",
            effort: "Low",
            impact: "Medium",
            estimatedLift: 8,
            done: fixDoneOverrides.sitemap ?? !!activeReport.technical.sitemap,
            snippet: `Sitemap: ${activeReport.domain?.replace(/\/$/, "") || "https://example.com"}/sitemap.xml`,
        },
        {
            key: "schema",
            title: "Increase schema coverage depth",
            effort: "Medium",
            impact: "Medium",
            estimatedLift: schemaCoverage >= 75 ? 0 : 9,
            done: fixDoneOverrides.schema ?? schemaCoverage >= 75,
            snippet: `<script type="application/ld+json">\n{\n  "@context":"https://schema.org",\n  "@type":"Organization",\n  "name":"${activeReport.domain || "Your Brand"}",\n  "url":"${activeReport.domain || "https://example.com"}"\n}\n</script>`,
        },
        {
            key: "payload",
            title: "Reduce code-to-text bloat",
            effort: "High",
            impact: "High",
            estimatedLift: ratioPercentage >= 15 ? 0 : 10,
            done: fixDoneOverrides.payload ?? ratioPercentage >= 15,
        },
    ]

    const fixQueue: FixItem[] = unsortedFixQueue.sort((a, b) => {
        const impactRank = { High: 3, Medium: 2, Low: 1 }
        const effortRank = { Low: 3, Medium: 2, High: 1 }
        const scoreA = impactRank[a.impact] * 10 + effortRank[a.effort]
        const scoreB = impactRank[b.impact] * 10 + effortRank[b.effort]
        return scoreB - scoreA
    })

    const projectedScore = Math.min(
        100,
        Math.round(
            techScore +
            fixQueue.filter((item) => !item.done).reduce((sum, item) => sum + item.estimatedLift, 0)
        )
    )
    const plainReadability = ratioPercentage < 10
        ? "Hard for AI to read"
        : ratioPercentage < 15
            ? "Somewhat hard for AI to read"
            : "Easy for AI to read"
    const plainCost = typeof agentEcon.indexCost === "number" && agentEcon.indexCost > 0.1
        ? "Higher-than-normal processing cost"
        : "Normal processing cost"
    const plainArchitecture = isSPA
        ? "Your site likely loads lots of code before content appears."
        : "Your site likely delivers readable content quickly."
    const plainBloat = agentEcon.bloatStatus === "Critical Bloat"
        ? "There is too much technical code compared to useful text."
        : "Code-to-content balance is acceptable."

    const crawlerMatrix = [
        {
            crawler: "GPTBot",
            access: activeReport.technical.robotsTxt ? "Allowed" : "Blocked / Unknown",
            note: activeReport.technical.robotsTxt ? "Found compatible robots directives." : "Robots policy may block crawling.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/robots?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
        {
            crawler: "CCBot",
            access: activeReport.technical.robotsTxt ? "Allowed" : "Blocked / Unknown",
            note: activeReport.technical.robotsTxt ? "Crawl path likely reachable." : "No clear agent allowance detected.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/robots?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
        {
            crawler: "Google-Extended",
            access: activeReport.technical.robotsTxt ? "Allowed" : "Blocked / Unknown",
            note: activeReport.technical.robotsTxt ? "Opt-in likely available." : "Set explicit directives in robots.txt.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/robots?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
        {
            crawler: "AI Summary Fetch",
            access: activeReport.technical.llmsTxt ? "Optimized" : "Missing llms.txt",
            note: activeReport.technical.llmsTxt ? "llms.txt provides direct summary path." : "Add llms.txt for better retrieval.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/llms?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
    ]

    const canonicalChecks = [
        {
            label: "HTTPS Enabled",
            status: activeReport.technical.https ? "pass" : "fail",
            detail: activeReport.technical.https ? "Secure transport detected." : "Site should enforce HTTPS.",
            simpleAction: "Redirect all pages to https:// and update internal links.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/https?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
        {
            label: "Indexability Baseline",
            status: activeReport.technical.robotsTxt ? "pass" : "warn",
            detail: activeReport.technical.robotsTxt ? "Crawler access baseline is present." : "Robots file may be missing or restrictive.",
            simpleAction: "Review robots.txt and remove accidental crawl blocks.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/indexability?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
        {
            label: "Canonical Consistency",
            status: activeReport.technical.sitemap ? "warn" : "fail",
            detail: activeReport.technical.sitemap
                ? "Sitemap found. Canonical tags not fully validated in this scan."
                : "Sitemap missing; canonical discovery risk is elevated.",
            simpleAction: "Add canonical tags and make sure sitemap includes your main pages.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/canonical?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
    ]

    const coreFileHealth = [
        {
            file: "/robots.txt",
            state: activeReport.technical.robotsTxt ? "Healthy" : "Missing / Blocking",
            color: activeReport.technical.robotsTxt ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200",
            simpleAction: "Allow major crawlers and avoid blocking important page paths.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/robots?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
        {
            file: "/llms.txt",
            state: activeReport.technical.llmsTxt ? "Healthy" : "Missing",
            color: activeReport.technical.llmsTxt ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200",
            simpleAction: "Add a machine-readable summary file with important links.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/llms?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
        {
            file: "/sitemap.xml",
            state: activeReport.technical.sitemap ? "Healthy" : "Missing",
            color: activeReport.technical.sitemap ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200",
            simpleAction: "Generate sitemap.xml and submit it to search tools.",
            guideUrl: siteId ? `/dashboard/sites/${siteId}/technical/fixes/sitemap?mode=${isAdvancedMode ? "advanced" : "simple"}` : undefined,
        },
    ]

    const contentShare = Math.min(100, Math.max(0, ratioPercentage))
    const boilerplateShare = Math.min(100, Math.max(0, Number(agentEcon.boilerplate_ratio || 0)))
    const nonContentShare = Math.min(100, Math.max(0, 100 - contentShare))
    const scriptStyleShare = Math.min(100, Math.max(0, Math.round(nonContentShare * 0.7)))
    const structuralMarkupShare = Math.max(0, nonContentShare - scriptStyleShare)

    const copySnippet = async (value: string, key: string) => {
        try {
            await navigator.clipboard.writeText(value)
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 1200)
        } catch {
            setCopiedKey(null)
        }
    }

    const runValidationRecrawl = async () => {
        if (!siteId) return
        setIsRecrawling(true)
        setRecrawlMessage(null)
        setScanDialogMessage("AI agents are crawling your full site now, not just a single page.")
        setScanDialogOpen(true)
        setScanDialogStatus("scanning")
        try {
            const response = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ siteId, url: activeReport.domain }),
            })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.error || "Could not schedule recrawl")

            let attempts = 0
            const maxAttempts = 60
            let completedReport: ScanReportLike | null = null

            while (attempts < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 2000))
                const pollResponse = await fetch(`/api/scan?domain=${encodeURIComponent(activeReport.domain)}`, { cache: "no-store" })
                const pollData = await pollResponse.json().catch(() => ({} as ScanReportLike))

                if (!pollResponse.ok) {
                    attempts += 1
                    continue
                }

                if (pollData.status === "completed") {
                    completedReport = pollData
                    break
                }

                if (pollData.status === "failed") {
                    throw new Error("Verification scan completed with errors.")
                }

                attempts += 1
            }

            if (!completedReport) {
                throw new Error("Verification timed out. Please refresh and check again.")
            }

            const freshDoneStatus = getDoneStatusFromReport(completedReport)
            setFixDoneOverrides((prev) => ({ ...prev, ...freshDoneStatus }))

            const currentFixKey = unsortedFixQueue[wizardStep]?.key
            const currentFixDone = currentFixKey ? freshDoneStatus[currentFixKey] : undefined

            if (typeof currentFixDone === "boolean") {
                setRecrawlMessage(currentFixDone ? "Reverification complete: this step is verified." : "Reverification complete: this step is still not verified.")
                setScanDialogMessage(currentFixDone ? "Verification complete. This step is verified." : "Verification complete. This step is still not verified.")
            } else {
                setRecrawlMessage("Reverification complete. Results updated.")
                setScanDialogMessage("Verification complete. Results updated.")
            }

            setScanDialogStatus("complete")
            window.dispatchEvent(new Event("diamonds-updated"))
            setTimeout(() => setScanDialogOpen(false), 1200)
        } catch (error: unknown) {
            if (error instanceof Error) {
                setRecrawlMessage(error.message)
                setScanDialogMessage(error.message)
            } else {
                setRecrawlMessage("Could not start recrawl.")
                setScanDialogMessage("Could not start recrawl.")
            }
            setScanDialogStatus("error")
        } finally {
            setIsRecrawling(false)
        }
    }

    const recrawlMessageTone = !recrawlMessage
        ? "neutral"
        : recrawlMessage.toLowerCase().includes("not verified")
            ? "error"
            : recrawlMessage.toLowerCase().includes("verified")
                ? "success"
                : recrawlMessage.toLowerCase().includes("started")
                    ? "success"
                    : "warning"

    const recrawlMessagePanelClass = recrawlMessageTone === "success"
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : recrawlMessageTone === "error"
            ? "bg-rose-50 text-rose-700 border border-rose-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"

    const recrawlMessageInlineClass = recrawlMessageTone === "success"
        ? "text-emerald-700"
        : recrawlMessageTone === "error"
            ? "text-rose-700"
            : "text-amber-700"

    if (!isAdvancedMode) {
        const allDone = unsortedFixQueue.every(f => f.done)

        if (allDone) {
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 w-full max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <ScanProgressDialog
                        open={scanDialogOpen}
                        onOpenChange={(open) => {
                            if (!open && scanDialogStatus === "scanning") return
                            setScanDialogOpen(open)
                        }}
                        siteUrl={activeReport.domain}
                        status={scanDialogStatus}
                        message={scanDialogMessage}
                        title="Reverification In Progress"
                    />
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-8 border-white">
                        <Check className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-4xl font-serif text-[#224034] leading-tight mb-4">You&apos;re All Set!</h2>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto mb-8">
                        You have completed all the simple technical readiness steps. AI chatbots like ChatGPT and Claude can now easily discover and read your website.
                    </p>
                    <button onClick={() => setWizardStep(0)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm">
                        Review Steps
                    </button>
                </div>
            )
        }

        const activeFix = unsortedFixQueue[wizardStep] || unsortedFixQueue[0]

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 w-full pb-20 pt-2">
                <ScanProgressDialog
                    open={scanDialogOpen}
                    onOpenChange={(open) => {
                        if (!open && scanDialogStatus === "scanning") return
                        setScanDialogOpen(open)
                    }}
                    siteUrl={activeReport.domain}
                    status={scanDialogStatus}
                    message={scanDialogMessage}
                    title="Reverification In Progress"
                />
                {/* Step Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-4">
                    {unsortedFixQueue.map((fix, idx) => (
                        <button
                            key={fix.key}
                            onClick={() => setWizardStep(idx)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${wizardStep === idx ? 'bg-[#224034] text-white shadow-md' : fix.done ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                        >
                            {fix.done ? <Check className="w-4 h-4" /> : <span className="opacity-80 text-xs">{idx + 1}</span>}
                            <span className="hidden sm:inline-block">{fix.title.split(' ').slice(0, 2).join(' ')}</span>
                        </button>
                    ))}
                </div>

                {/* Active Step Card */}
                {activeFix && (
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
                        <div className={`h-2.5 w-full ${activeFix.done ? 'bg-emerald-400' : 'bg-[#224034]'}`} />

                        <div className="p-8 md:p-12">
                            <div className="flex flex-col md:flex-row gap-12">
                                {/* Left Side: Instructions */}
                                <div className="flex-1 space-y-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-2">
                                        Step {wizardStep + 1} of {unsortedFixQueue.length}
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-serif text-[#224034] leading-tight flex flex-wrap items-center gap-4">
                                        {activeFix.title}
                                        {activeFix.done && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 px-3 py-1 text-sm">Done</Badge>}
                                    </h2>

                                    <div className="prose prose-slate text-slate-600 text-lg leading-relaxed max-w-none">
                                        <p>{SIMPLE_FIX_INSTRUCTIONS[activeFix.key]}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-4 pt-6 mt-6 border-t border-slate-100">
                                        <button
                                            onClick={runValidationRecrawl}
                                            disabled={isRecrawling}
                                            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${activeFix.done ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' : 'bg-[#10b981] hover:bg-[#059669] text-white shadow-lg shadow-emerald-500/30'} disabled:opacity-70`}
                                        >
                                            {isRecrawling ? (
                                                <><RefreshCw className="w-5 h-5 animate-spin" /> Verifying...</>
                                            ) : activeFix.done ? (
                                                <>Reverify</>
                                            ) : (
                                                <><Check className="w-5 h-5" /> Check if completed</>
                                            )}
                                        </button>
                                        {activeFix.done && (
                                            <p className="text-xs text-slate-500">

                                            </p>
                                        )}

                                        {!activeFix.done && (
                                            <button
                                                onClick={() => setWizardStep(prev => Math.min(unsortedFixQueue.length - 1, prev + 1))}
                                                className="px-6 py-3.5 bg-white text-slate-600 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                                            >
                                                Skip for now
                                            </button>
                                        )}
                                        {activeFix.done && wizardStep < unsortedFixQueue.length - 1 && (
                                            <button
                                                onClick={() => setWizardStep(prev => Math.min(unsortedFixQueue.length - 1, prev + 1))}
                                                className="px-6 py-3.5 bg-[#224034] text-white font-semibold rounded-xl hover:bg-[#1a3228] transition-colors shadow-md"
                                            >
                                                Next Step <ChevronRight className="w-4 h-4 inline-block ml-1" />
                                            </button>
                                        )}
                                    </div>

                                    {recrawlMessage && (
                                        <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${recrawlMessagePanelClass}`}>
                                            <p>{recrawlMessage}</p>
                                            {recrawlMessageTone === "error" && activeFix && (
                                                <div className="mt-3 pt-3 border-t border-rose-200/70 space-y-2 text-sm font-normal">
                                                    <p><strong>Issue:</strong> {SIMPLE_FIX_ISSUES[activeFix.key] || "This step is still not passing in the latest scan."}</p>
                                                    <div>
                                                        <p><strong>How to solve:</strong></p>
                                                        <ul className="list-disc pl-5 space-y-1 mt-1">
                                                            {(SIMPLE_FIX_SOLUTIONS[activeFix.key] || ["Apply the fix guidance for this step and verify again."]).map((item) => (
                                                                <li key={item}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Code Snippet */}
                                {activeFix.snippet && (
                                    <div className="md:w-[45%] flex flex-col justify-center">
                                        <div className="bg-[#0f172a] rounded-2xl p-6 shadow-2xl relative group w-full overflow-hidden border border-slate-800">
                                            <div className="flex justify-between items-center mb-5">
                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Copy this code</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(activeFix.snippet!)
                                                        setCopiedKey(activeFix.key)
                                                        setTimeout(() => setCopiedKey(null), 2000)
                                                    }}
                                                    className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                                >
                                                    {copiedKey === activeFix.key ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <pre className="text-[#34d399] text-sm overflow-x-auto font-mono leading-relaxed pb-2">
                                                <code>{activeFix.snippet}</code>
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <ScanProgressDialog
                open={scanDialogOpen}
                onOpenChange={(open) => {
                    if (!open && scanDialogStatus === "scanning") return
                    setScanDialogOpen(open)
                }}
                siteUrl={activeReport.domain}
                status={scanDialogStatus}
                message={scanDialogMessage}
                title="Reverification In Progress"
            />
            <div className="rounded-2xl border border-[#d9e8df] bg-gradient-to-br from-white via-white to-emerald-50/40 shadow-sm px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-3xl font-serif text-[#224034] leading-tight">Technical Readiness</h2>
                        <p className="text-slate-500 text-sm mt-1">Core crawlability and machine-readability checks for AI visibility.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1">
                            {passedChecks}/4 checks passing
                        </Badge>
                        <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 px-3 py-1">
                            Score {Math.round(techScore)}/100
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Checks */}
                <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 h-fit">
                    <div className="pb-2 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Technical Checks</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setCheckFilter("all")}
                                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${checkFilter === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                            >
                                All ({filterCounts.all}/{totalChecks})
                            </button>
                            <button
                                onClick={() => setCheckFilter("passed")}
                                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${checkFilter === "passed" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-300"}`}
                            >
                                Passed ({filterCounts.passed}/{totalChecks})
                            </button>
                            <button
                                onClick={() => setCheckFilter("failed")}
                                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${checkFilter === "failed" ? "bg-rose-600 text-white border-rose-600" : "bg-white text-rose-700 border-rose-200 hover:border-rose-300"}`}
                            >
                                Failed ({filterCounts.failed}/{totalChecks})
                            </button>
                            <button
                                onClick={() => setCheckFilter("improve")}
                                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${checkFilter === "improve" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-amber-700 border-amber-200 hover:border-amber-300"}`}
                            >
                                Can Be Improved ({filterCounts.improve}/{totalChecks})
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">{filterDescription}</p>
                    </div>

                    {filteredChecks.map((check) => (
                        <TechnicalItem
                            key={check.key}
                            title={check.title}
                            label={check.label}
                            isGood={check.isGood}
                            isWarning={check.isWarning}
                            docUrl={check.docUrl}
                            guideUrl={check.guideUrl}
                            keepOpen={check.key === "robots"}
                            fix={check.fix}
                            statusVariant={check.statusVariant}
                        />
                    ))}
                    {filteredChecks.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                            No checks in this category.
                        </div>
                    )}

                </div>

                {/* Agent Economics */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 h-fit">
                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setShowGuide(!showGuide)}>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                <Cpu className="w-4 h-4 text-slate-500" />
                            </div>
                            <h4 className="font-semibold text-slate-800 text-base uppercase tracking-wide">Context Window Analysis</h4>
                        </div>
                        <div className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-full transition-colors" title="What is this?">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    </div>
                    {siteId && (
                        <a
                            href={`/dashboard/sites/${siteId}/technical/fixes/payload?mode=${isAdvancedMode ? "advanced" : "simple"}`}
                            className="inline-flex text-xs font-medium text-emerald-700 hover:underline"
                        >
                            Open Full Guide
                        </a>
                    )}

                    {/* Collapsible Educational Guide */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showGuide ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-emerald-50/50 p-4 rounded-lg text-sm text-slate-600 border border-emerald-100 space-y-3">
                            <p className="font-semibold text-emerald-800">Why this matters:</p>
                            <p>AI models have a limited &quot;context window&quot; (memory). If your page is full of code bloat (HTML tags, scripts) instead of actual text, it becomes harder and more expensive for AI to read.</p>
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

                    {isAdvancedMode ? (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                                    <p className="text-sm text-slate-500">Total Tokens</p>
                                    <p className="font-mono text-xl font-medium text-[#224034]">{agentEcon.totalTokens?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
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
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                <p className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-1">Simple Summary</p>
                                <p className="text-sm text-slate-700">
                                    AI is currently reading a lot of technical code before getting to your real page content.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="rounded-lg border border-slate-200 p-3">
                                    <p className="text-xs text-slate-500 mb-1">How hard is it for AI to read this page?</p>
                                    <p className="text-sm font-semibold text-slate-800">{plainReadability} ({ratioPercentage.toFixed(1)}% useful content)</p>
                                </div>
                                <div className="rounded-lg border border-slate-200 p-3">
                                    <p className="text-xs text-slate-500 mb-1">What does this cost search engines?</p>
                                    <p className="text-sm font-semibold text-slate-800">{plainCost} ({formatCost(agentEcon.indexCost)})</p>
                                </div>
                                <div className="rounded-lg border border-slate-200 p-3">
                                    <p className="text-xs text-slate-500 mb-1">Site build style</p>
                                    <p className="text-sm font-semibold text-slate-800">{plainArchitecture}</p>
                                </div>
                                <div className="rounded-lg border border-slate-200 p-3">
                                    <p className="text-xs text-slate-500 mb-1">Main issue</p>
                                    <p className="text-sm font-semibold text-slate-800">{plainBloat}</p>
                                </div>
                            </div>
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                <p className="text-xs text-emerald-800 font-semibold mb-1">What to do next</p>
                                <p className="text-sm text-emerald-900">
                                    Reduce code bloat and move key page content higher in the HTML output so AI can read important answers faster.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {([
                            { key: "all", label: "All Cards" },
                            { key: "fix-plan", label: "Fix Plan" },
                            { key: "crawl-index", label: "Crawl & Index" },
                            { key: "render-files", label: "Render & Files" },
                            { key: "schema-payload", label: "Schema & Payload" },
                            { key: "actions", label: "Actions" },
                        ] as const).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setAdvancedTab(tab.key)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${advancedTab === tab.key
                                    ? "bg-slate-800 text-white border-slate-800"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {(advancedTab === "all" || advancedTab === "fix-plan") && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900">{isAdvancedMode ? "Priority Fix Queue" : "What to Fix First"}</h3>
                                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                                        {fixQueue.filter((item) => !item.done).length} open
                                    </Badge>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                                        <span>Fix completion</span>
                                        <span>{fixQueue.filter((item) => item.done).length}/{fixQueue.length}</span>
                                    </div>
                                    <Progress
                                        value={(fixQueue.filter((item) => item.done).length / Math.max(fixQueue.length, 1)) * 100}
                                        className="h-1.5"
                                        indicatorClassName="bg-emerald-500"
                                    />
                                    {!isAdvancedMode && (
                                        <p className="text-xs text-slate-600 mt-2">
                                            Work top-to-bottom. These are already ranked by best impact for effort.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {fixQueue.map((item, index) => (
                                    <div
                                        key={item.key}
                                        className={`rounded-xl border p-3 transition-colors ${item.done ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                                                        #{index + 1}
                                                    </span>
                                                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                                        Effort: {item.effort}
                                                    </span>
                                                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                                        Impact: {item.impact}
                                                    </span>
                                                </div>
                                                {!isAdvancedMode && !item.done && (
                                                    <p className="text-xs text-slate-600 mt-2">
                                                        Next step: {SIMPLE_FIX_INSTRUCTIONS[item.key] || "Apply the recommended fix and run a recheck."}
                                                    </p>
                                                )}
                                                {siteId && (
                                                    <Link
                                                        href={`/dashboard/sites/${siteId}/technical/fixes/${item.key}?mode=${isAdvancedMode ? "advanced" : "simple"}`}
                                                        className="inline-flex text-xs font-medium text-emerald-700 hover:underline mt-2"
                                                    >
                                                        View full guide
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.done ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Done</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                                        +{item.estimatedLift}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">{isAdvancedMode ? "Before vs After Estimate" : "Score Change If You Apply Fixes"}</h3>
                            {siteId && (
                                <a
                                    href={`/dashboard/sites/${siteId}/technical/fixes/payload?mode=${isAdvancedMode ? "advanced" : "simple"}`}
                                    className="inline-flex text-xs font-medium text-emerald-700 hover:underline mb-3"
                                >
                                    Open Full Guide
                                </a>
                            )}
                            {!isAdvancedMode && (
                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 mb-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">What This Means</p>
                                    <p className="text-sm text-slate-700">
                                        This is an estimate of how much your technical score can improve if you complete the open fixes below.
                                    </p>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                                        <span>{isAdvancedMode ? "Current Technical Score" : "Current score"}</span>
                                        <span className="font-semibold text-slate-800">{Math.round(techScore)}/100</span>
                                    </div>
                                    <Progress value={Math.round(techScore)} className="h-2" indicatorClassName="bg-slate-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                                        <span>{isAdvancedMode ? "Projected Score (after fixes)" : "Expected score after fixes"}</span>
                                        <span className="font-semibold text-emerald-700">{projectedScore}/100</span>
                                    </div>
                                    <Progress value={projectedScore} className="h-2" indicatorClassName="bg-emerald-500" />
                                </div>
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                    {isAdvancedMode ? "Estimated improvement" : "Expected gain"}: <strong>+{Math.max(0, projectedScore - Math.round(techScore))} points</strong>
                                </div>
                                {!isAdvancedMode && (
                                    <div className="rounded-lg border border-slate-200 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">How To Use This</p>
                                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                                            <li>Start with low-effort, high-impact fixes first.</li>
                                            <li>Apply 1-2 fixes, then run a re-scan to confirm real changes.</li>
                                            <li>If score growth stalls, move to medium/high-effort fixes next.</li>
                                        </ul>
                                    </div>
                                )}
                                {!isAdvancedMode && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                                        Note: this is a forecast, not a guarantee. Actual score depends on what the next scan detects after deployment.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {(advancedTab === "all" || advancedTab === "crawl-index") && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">{isAdvancedMode ? "Crawler Access Matrix" : "Can AI Crawlers Reach Your Site?"}</h3>
                            <div className="space-y-2">
                                {crawlerMatrix.map((row) => (
                                    <div key={row.crawler} className="grid grid-cols-[1.2fr_1fr] gap-3 rounded-lg border border-slate-200 p-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{row.crawler}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {isAdvancedMode ? row.note : row.access.includes("Allowed") || row.access.includes("Optimized")
                                                    ? "This crawler can likely read your important pages."
                                                    : "This crawler may struggle to access your important pages."}
                                            </p>
                                            {!isAdvancedMode && (
                                                <p className="text-xs text-slate-600 mt-2">
                                                    Next step: {row.access === "Allowed" || row.access === "Optimized"
                                                        ? "No action needed right now. Keep monitoring after major site updates."
                                                        : "Update robots.txt and publish llms.txt so this crawler can access your important content."}
                                                </p>
                                            )}
                                            {row.guideUrl && (
                                                <a
                                                    href={row.guideUrl}
                                                    className="inline-flex text-xs font-medium text-emerald-700 hover:underline mt-2"
                                                >
                                                    Open Full Guide
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    row.access === "Allowed" || row.access === "Optimized"
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : row.access.includes("Unknown")
                                                            ? "border-amber-200 bg-amber-50 text-amber-700"
                                                            : "border-rose-200 bg-rose-50 text-rose-700"
                                                }
                                            >
                                                {row.access}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">{isAdvancedMode ? "Canonical & Indexability Checks" : "Search Readiness Checks"}</h3>
                            <div className="space-y-2">
                                {canonicalChecks.map((check) => (
                                    <div key={check.label} className="rounded-lg border border-slate-200 p-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-800">{check.label}</p>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    check.status === "pass"
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : check.status === "warn"
                                                            ? "border-amber-200 bg-amber-50 text-amber-700"
                                                            : "border-rose-200 bg-rose-50 text-rose-700"
                                                }
                                            >
                                                {check.status === "pass" ? "Pass" : check.status === "warn" ? "Needs Review" : "Fail"}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {isAdvancedMode ? check.detail : check.status === "pass"
                                                ? "Looks healthy."
                                                : check.status === "warn"
                                                    ? "Usable, but should be improved."
                                                    : "This likely hurts discoverability."}
                                        </p>
                                        {!isAdvancedMode && check.status !== "pass" && (
                                            <p className="text-xs text-slate-600 mt-2">
                                                Next step: {check.simpleAction}
                                            </p>
                                        )}
                                        {check.guideUrl && (
                                            <a
                                                href={check.guideUrl}
                                                className="inline-flex text-xs font-medium text-emerald-700 hover:underline mt-2"
                                            >
                                                Open Full Guide
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(advancedTab === "all" || advancedTab === "render-files") && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">{isAdvancedMode ? "JavaScript Render Risk" : "Will AI See Content Quickly?"}</h3>
                            {siteId && (
                                <a
                                    href={`/dashboard/sites/${siteId}/technical/fixes/payload?mode=${isAdvancedMode ? "advanced" : "simple"}`}
                                    className="inline-flex text-xs font-medium text-emerald-700 hover:underline mb-3"
                                >
                                    Open Full Guide
                                </a>
                            )}
                            <div className="space-y-3 text-sm">
                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">What This Means</p>
                                    <p className="text-sm text-slate-700">
                                        {isAdvancedMode
                                            ? "Crawler-visible content should appear in initial HTML response before client hydration completes."
                                            : "AI works best when important page text appears quickly, without waiting for heavy scripts to load."}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                                    <span className="text-slate-600">Rendering Profile</span>
                                    <span className={`font-semibold ${isSPA ? "text-amber-700" : "text-emerald-700"}`}>
                                        {isSPA ? "Client-heavy" : "Crawler-friendly"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                                    <span className="text-slate-600">Code-to-text efficiency</span>
                                    <span className={`font-semibold ${ratioPercentage < 10 ? "text-rose-700" : ratioPercentage < 15 ? "text-amber-700" : "text-emerald-700"}`}>
                                        {ratioPercentage.toFixed(1)}% content
                                    </span>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                                    {isAdvancedMode
                                        ? "Recommendation: prefer SSR/SSG for critical pages, reduce JS payload, and ensure key content is visible without hydration."
                                        : "Recommendation: make key content load in page HTML earlier and reduce heavy scripts."}
                                </div>
                                <div className="rounded-lg border border-slate-200 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
                                        {isAdvancedMode ? "Practical Checklist" : "What To Do Next"}
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                                        <li>{isAdvancedMode ? "Server-render heading/body copy for key templates." : "Show key page text in HTML, not only after JS runs."}</li>
                                        <li>{isAdvancedMode ? "Trim non-critical JS/CSS from initial payload." : "Reduce heavy scripts and unused CSS."}</li>
                                        <li>{isAdvancedMode ? "Re-scan after each release to track ratio improvements." : "Run a scan after updates and check if this card improves."}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">{isAdvancedMode ? "Core File Health" : "Core File Status"}</h3>
                            <div className="space-y-2">
                                {coreFileHealth.map((item) => (
                                    <div key={item.file} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{item.file}</p>
                                            <p className="text-xs text-slate-500">{isAdvancedMode ? "Checked in this scan" : "Important file for AI crawlers"}</p>
                                            {!isAdvancedMode && (
                                                <p className="text-xs text-slate-600 mt-1">Next step: {item.simpleAction}</p>
                                            )}
                                            {item.guideUrl && (
                                                <a
                                                    href={item.guideUrl}
                                                    className="inline-flex text-xs font-medium text-emerald-700 hover:underline mt-2"
                                                >
                                                    Open Full Guide
                                                </a>
                                            )}
                                        </div>
                                        <Badge variant="outline" className={`border ${item.color}`}>
                                            {item.state}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(advancedTab === "all" || advancedTab === "schema-payload") && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">{isAdvancedMode ? "Schema Coverage Depth" : "How Much Structured Data You Have"}</h3>
                            {siteId && (
                                <a
                                    href={`/dashboard/sites/${siteId}/technical/fixes/schema?mode=${isAdvancedMode ? "advanced" : "simple"}`}
                                    className="inline-flex text-xs font-medium text-emerald-700 hover:underline mb-3"
                                >
                                    Open Full Guide
                                </a>
                            )}
                            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Why This Matters</p>
                                <p className="text-sm text-slate-700">
                                    {isAdvancedMode
                                        ? "Schema markup improves entity resolution and helps retrieval systems map page meaning with higher confidence."
                                        : "Schema helps AI understand what each page is about, so recommendations are more accurate."}
                                </p>
                            </div>
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm text-slate-600">Coverage</span>
                                <span className="text-sm font-semibold text-slate-800">{schemaCoverage}%</span>
                            </div>
                            <Progress value={schemaCoverage} className="h-2" indicatorClassName={schemaCoverage >= 75 ? "bg-emerald-500" : "bg-amber-500"} />
                            <div className="mt-3 rounded-lg border border-slate-200 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Current Status</p>
                                <p className="text-sm text-slate-700">
                                    {schemaCoverage >= 75
                                        ? "Strong schema baseline detected. Keep templates consistent as you publish new pages."
                                        : schemaCoverage >= 50
                                            ? "Moderate coverage. Add missing schema types on key templates for faster AI understanding."
                                            : "Low coverage. Prioritize Organization and FAQ/Article schema first for the biggest lift."}
                                </p>
                            </div>
                            <div className="mt-4 space-y-2">
                                {requiredSchema.map((schema) => {
                                    const hasSchema = detectedSchema.includes(schema.key)
                                    return (
                                        <div key={schema.key} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                                            <div>
                                                <span className="text-sm text-slate-700">{schema.label}</span>
                                                {schema.guideUrl && (
                                                    <a
                                                        href={schema.guideUrl}
                                                        className="block text-xs font-medium text-emerald-700 hover:underline mt-1"
                                                    >
                                                        Open Full Guide
                                                    </a>
                                                )}
                                            </div>
                                            {hasSchema ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Detected</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                                    Missing (+{schema.lift})
                                                </Badge>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="mt-3 rounded-lg border border-slate-200 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Recommended Order</p>
                                <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600">
                                    <li>Organization schema on homepage and main brand pages.</li>
                                    <li>FAQPage on support/help and high-intent pages.</li>
                                    <li>Article schema on blog/content templates.</li>
                                    <li>BreadcrumbList on pages with hierarchical navigation.</li>
                                </ol>
                            </div>
                            {!isAdvancedMode && (
                                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                                    Next step: add missing schema types to key pages, then test with Google Rich Results.
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">{isAdvancedMode ? "Advanced Payload Breakdown" : "Page Weight Breakdown"}</h3>
                            {siteId && (
                                <a
                                    href={`/dashboard/sites/${siteId}/technical/fixes/payload?mode=${isAdvancedMode ? "advanced" : "simple"}`}
                                    className="inline-flex text-xs font-medium text-emerald-700 hover:underline mb-3"
                                >
                                    Open Full Guide
                                </a>
                            )}
                            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">How To Read This</p>
                                <p className="text-sm text-slate-700">
                                    {isAdvancedMode
                                        ? "Higher content share and lower script/style share generally improve crawl efficiency and semantic extraction quality."
                                        : "The more real text and the less heavy code, the easier it is for AI to read your pages quickly."}
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Content Text</span>
                                        <span>{contentShare.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={contentShare} className="h-2" indicatorClassName="bg-emerald-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Script / Style Weight (estimated)</span>
                                        <span>{scriptStyleShare.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={scriptStyleShare} className="h-2" indicatorClassName="bg-amber-400" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Structural Markup (estimated)</span>
                                        <span>{structuralMarkupShare.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={structuralMarkupShare} className="h-2" indicatorClassName="bg-slate-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Boilerplate Ratio</span>
                                        <span>{boilerplateShare.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={boilerplateShare} className="h-2" indicatorClassName={boilerplateShare > 30 ? "bg-rose-500" : "bg-emerald-500"} />
                                </div>
                            </div>
                            <div className="mt-3 rounded-lg border border-slate-200 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
                                    {isAdvancedMode ? "Interpretation" : "Quick Take"}
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                                    <li>{contentShare < 10 ? "Content share is very low; key text is likely buried under markup/scripts." : "Content share is acceptable but can still be improved."}</li>
                                    <li>{scriptStyleShare > 55 ? "Script/style weight is high; reduce bundle size and non-critical JS." : "Script/style weight looks manageable."}</li>
                                    <li>{boilerplateShare > 30 ? "Boilerplate ratio is elevated; simplify repeated layout/DOM wrappers where possible." : "Boilerplate ratio is under control."}</li>
                                </ul>
                            </div>
                            {!isAdvancedMode && (
                                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                                    Next step: reduce JS/CSS bundle size and move key content text higher in the initial page HTML.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(advancedTab === "all" || advancedTab === "actions") && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">{isAdvancedMode ? "Recrawl Validation" : "Recheck After Fixes"}</h3>
                            {siteId && (
                                <a
                                    href={`/dashboard/sites/${siteId}/technical/fixes/indexability?mode=${isAdvancedMode ? "advanced" : "simple"}`}
                                    className="inline-flex text-xs font-medium text-emerald-700 hover:underline mb-3"
                                >
                                    Open Full Guide
                                </a>
                            )}
                            <p className="text-sm text-slate-600 mb-4">
                                {isAdvancedMode
                                    ? "Run a fresh validation scan after applying fixes to confirm updated technical signals."
                                    : "Run a new scan after updates to confirm your fixes worked."}
                            </p>
                            <button
                                onClick={runValidationRecrawl}
                                disabled={!siteId || isRecrawling}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#224034] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3027] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRecrawling ? "animate-spin" : ""}`} />
                                {isRecrawling ? "Starting..." : isAdvancedMode ? "Run Validation Recrawl" : "Run Recheck"}
                            </button>
                            {recrawlMessage && <p className={`text-xs mt-3 ${recrawlMessageInlineClass}`}>{recrawlMessage}</p>}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">{isAdvancedMode ? "Copy-Paste Fixes" : "Quick Fix Templates"}</h3>
                            <div className="space-y-2">
                                {fixQueue.filter((item) => !item.done && item.snippet).slice(0, 3).map((item) => (
                                    <div key={item.key} className="rounded-lg border border-slate-200 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                            <button
                                                onClick={() => copySnippet(item.snippet || "", item.key)}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                                {copiedKey === item.key ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                        <pre className="rounded bg-slate-900 p-2 text-[11px] leading-relaxed text-emerald-300 overflow-x-auto">
                                            {item.snippet}
                                        </pre>
                                        {siteId && (
                                            <Link
                                                href={`/dashboard/sites/${siteId}/technical/fixes/${item.key}?mode=${isAdvancedMode ? "advanced" : "simple"}`}
                                                className="inline-flex text-xs font-medium text-emerald-700 hover:underline mt-2"
                                            >
                                                Open Full Guide
                                            </Link>
                                        )}
                                    </div>
                                ))}
                                {fixQueue.filter((item) => !item.done && item.snippet).length === 0 && (
                                    <p className="text-sm text-emerald-700">{isAdvancedMode ? "No copy snippets needed right now. Great technical baseline." : "No quick templates needed right now. Great technical baseline."}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
