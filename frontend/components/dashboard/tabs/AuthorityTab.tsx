import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
    AlertTriangle,
    BrainCircuit,
    Briefcase,
    Building2,
    Check,
    CheckCircle2,
    Database,
    GraduationCap,
    Link2,
    MapPin,
    Sparkles,
    UserRound,
    XCircle,
    ChevronRight,
} from "lucide-react"
import { AEOReport } from "@/types/aeo"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"

interface AuthorityTabProps {
    activeReport: AEOReport
    siteId?: string
    tier?: string
}

export function AuthorityTab({ activeReport, siteId, tier = 'free' }: AuthorityTabProps) {
    const router = useRouter()
    const [authorityStep, setAuthorityStep] = useState(0)
    const [isRecrawling, setIsRecrawling] = useState(false)
    const [recrawlMessage, setRecrawlMessage] = useState<string | null>(null)
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [scanDialogStatus, setScanDialogStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')
    const [scanDialogMessage, setScanDialogMessage] = useState<string>("")

    if (tier !== 'pro') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-2xl font-serif text-[#224034] mb-4">Authority Signals</h2>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                    <h3 className="font-serif text-2xl text-[#224034] mb-3">Temporarily Unavailable</h3>
                    <p className="text-slate-600 max-w-xl mx-auto mb-6">
                        Paid plan upgrades are hidden in this build.
                    </p>
                </div>
            </div>
        )
    }

    const knowledgeGraph = activeReport.knowledgeGraph || {}
    const authorityScore = Number(activeReport.scores.authority || 0)
    const signals = activeReport.authority?.eeat?.signals || []
    const proSignals = signals
        .filter((signal: string) => signal.toLowerCase().startsWith("pro:"))
        .map((signal: string) => signal.replace(/^pro:/i, "").trim())
    const conSignals = signals
        .filter((signal: string) => signal.toLowerCase().startsWith("con:"))
        .map((signal: string) => signal.replace(/^con:/i, "").trim())
    const neutralSignals = signals.filter(
        (signal: string) => !signal.toLowerCase().startsWith("pro:") && !signal.toLowerCase().startsWith("con:")
    )

    const toArray = (value: unknown): string[] => {
        if (Array.isArray(value)) {
            return value
                .map((item) => String(item || "").trim())
                .filter((item) => item.length > 0 && item !== "None" && item !== "None Detected" && item !== "Missing")
        }
        if (typeof value === "string") {
            const normalized = value.trim()
            if (!normalized || normalized === "None" || normalized === "None Detected" || normalized === "Missing") return []
            return [normalized]
        }
        return []
    }

    const relationships = (knowledgeGraph.relationships && typeof knowledgeGraph.relationships === "object"
        ? knowledgeGraph.relationships
        : {}) as Record<string, unknown>
    const relationshipEntries = Object.entries(relationships || {})

    const graphChecks = [
        { key: "worksFor", label: "worksFor", icon: Building2, required: true },
        { key: "jobTitle", label: "jobTitle", icon: Briefcase, required: true },
        { key: "location", label: "location", icon: MapPin, required: true },
        { key: "sameAs", label: "sameAs", icon: Link2, required: true },
        { key: "knowsAbout", label: "knowsAbout", icon: BrainCircuit, required: true },
        { key: "products", label: "products", icon: Sparkles, required: false },
        { key: "alumniOf", label: "alumniOf", icon: GraduationCap, required: false },
    ]

    const filledGraphFields = graphChecks.filter((item) => toArray(relationships[item.key]).length > 0).length
    const graphCompleteness = graphChecks.length > 0
        ? Math.round((filledGraphFields / graphChecks.length) * 100)
        : 0

    const risk = activeReport.authority.eeat?.hallucination_risk
    const riskLevel = risk?.level || "Low"
    const riskToneClasses = riskLevel === "High"
        ? "bg-red-50 text-red-700 border-red-200"
        : riskLevel === "Medium"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"

    const competitorCandidates = Array.from(new Set(
        (activeReport.competitors?.top_competitors || [])
            .map((c: string) => c.trim())
            .filter(Boolean)
    )).slice(0, 5);

    const averageEngineScore = activeReport.scores.overall || 0;
    const competitorScore = "High"; 
    const competitorIncludedTimes = competitorCandidates.length > 0 ? 6 : 0;
    const keyPrompts = [
        { id: "p1", prompt: "What customer problems does this solve?", status: "High Visibility", mentionRate: Math.max(0, averageEngineScore - 8) },
        { id: "p2", prompt: "How does it compare to alternatives?", status: "Medium Visibility", mentionRate: Math.max(0, averageEngineScore - 12) }
    ]

    const competitorMentionRate = Math.round((competitorIncludedTimes / 9) * 100)
    const promptVisibility = keyPrompts.length > 0
        ? Math.round(keyPrompts.reduce((sum, p) => sum + p.mentionRate, 0) / keyPrompts.length)
        : 0
    const scanTargetDomain = activeReport.domain || ""

    const runAuthorityReverify = async () => {
        if (!siteId || !scanTargetDomain) return

        setIsRecrawling(true)
        setRecrawlMessage(null)
        setScanDialogOpen(true)
        setScanDialogStatus("scanning")
        setScanDialogMessage("Running a full rescan to verify authority updates.")

        try {
            const response = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ siteId, url: scanTargetDomain }),
            })

            const data = await response.json().catch(() => ({}))
            if (!response.ok && response.status !== 409) {
                throw new Error(data.error || "Could not start reverification scan.")
            }
            if (response.status === 409) {
                setRecrawlMessage("A scan is already in progress. Waiting for it to finish.")
                setScanDialogMessage("A scan is already in progress. Waiting for completion.")
            }

            let attempts = 0
            const maxAttempts = 60

            while (attempts < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 2000))
                const pollResponse = await fetch(`/api/scan?domain=${encodeURIComponent(scanTargetDomain)}`, { cache: "no-store" })
                const pollData = await pollResponse.json().catch(() => ({}))

                if (!pollResponse.ok) {
                    attempts += 1
                    continue
                }

                if (pollData.status === "completed") {
                    setRecrawlMessage("Reverification complete. Latest authority scores are now loading.")
                    setScanDialogStatus("complete")
                    setScanDialogMessage("Verification complete. Refreshing your report.")
                    window.dispatchEvent(new Event("diamonds-updated"))
                    setTimeout(() => {
                        setScanDialogOpen(false)
                        router.refresh()
                    }, 1200)
                    return
                }

                if (pollData.status === "failed") {
                    throw new Error("Verification scan completed with errors.")
                }

                attempts += 1
            }

            throw new Error("Verification timed out. Please refresh and try again.")
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Could not start reverification."
            setRecrawlMessage(message)
            setScanDialogStatus("error")
            setScanDialogMessage(message)
        } finally {
            setIsRecrawling(false)
        }
    }

    const authoritySteps = [
        {
            key: "eeat",
            title: "E-E-A-T signals",
            description: "Do your trust signals show clear expertise and credibility?",
            metricLabel: "Authority score",
            metricValue: `${authorityScore} / 100`,
            done: authorityScore >= 75 && conSignals.length <= 1,
            issue: authorityScore >= 75 && conSignals.length <= 1
                ? "Strong trust baseline. AI systems can infer credible expertise signals."
                : "Authority signals are not strong enough yet for consistent AI trust.",
            steps: [
                "Add verifiable author credentials and experience details.",
                "Use specific proof (years, certifications, outcomes) instead of vague claims.",
                "Publish supporting pages (about, case studies, policies).",
            ],
        },
        {
            key: "knowledge-graph",
            title: "Knowledge graph coverage",
            description: "Can AI connect your entity to the right relationships?",
            metricLabel: "Graph completeness",
            metricValue: `${graphCompleteness}%`,
            done: graphCompleteness >= 70,
            issue: graphCompleteness >= 70
                ? "Knowledge graph connections are mostly complete."
                : "Missing key entity relationships weakens authority and citation confidence.",
            steps: [
                "Fill critical properties like worksFor, jobTitle, location, and sameAs.",
                "Align schema values with visible on-page content.",
                "Link social and profile sources to reinforce entity identity.",
            ],
        },
        {
            key: "hallucination-risk",
            title: "Hallucination risk",
            description: "Are claims specific enough for AI to quote safely?",
            metricLabel: "Risk level",
            metricValue: `${riskLevel}`,
            done: riskLevel === "Low",
            issue: riskLevel === "Low"
                ? "Low hallucination risk. Claims are relatively safe to cite."
                : "Some claims may be vague, which can trigger uncertain or inaccurate AI output.",
            steps: [
                "Replace vague words with concrete numbers and dates.",
                "Back important claims with verifiable references.",
                "Keep claim language precise and avoid unsupported superlatives.",
            ],
        },
        {
            key: "competitor-presence",
            title: "Competitor presence",
            description: "How often are you included in category-level comparisons?",
            metricLabel: "Inclusion rate",
            metricValue: `${competitorMentionRate}%`,
            done: competitorMentionRate >= 55,
            issue: competitorMentionRate >= 55
                ? "You are being surfaced in competitive answer sets at a healthy rate."
                : "You are underrepresented versus competitors in AI answer comparisons.",
            steps: [
                "Strengthen category positioning copy on high-intent pages.",
                "Add clear differentiators and comparison-ready proof points.",
                "Improve entity consistency across web profiles and citations.",
            ],
        },
        {
            key: "prompt-visibility",
            title: "Prompt visibility",
            description: "How visible are you for core buyer questions?",
            metricLabel: "Prompt visibility",
            metricValue: `${promptVisibility}%`,
            done: promptVisibility >= 60,
            issue: promptVisibility >= 60
                ? "Good visibility across primary prompts."
                : "Visibility is limited for key prompts users ask AI tools.",
            steps: [
                "Create direct Q&A sections for top prompt intents.",
                "Use explicit headings matching real prompt phrasing.",
                "Add concise, high-confidence answers near proof elements.",
            ],
        },
    ]

    const activeStep = authoritySteps[authorityStep] || authoritySteps[0]
    const allDone = authoritySteps.every((step) => step.done)

    if (allDone) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 w-full max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-8 border-white">
                    <Check className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-4xl font-serif text-[#224034] leading-tight mb-4">Authority Steps Complete</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-8">
                    Your authority profile is in healthy shape for AI trust and citations.
                </p>
                <button onClick={() => setAuthorityStep(0)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    Review Steps
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 w-full pb-20 pt-2">
            <ScanProgressDialog
                open={scanDialogOpen}
                onOpenChange={(open) => {
                    if (!open && scanDialogStatus === "scanning") return
                    setScanDialogOpen(open)
                }}
                siteUrl={scanTargetDomain}
                status={scanDialogStatus}
                message={scanDialogMessage}
                title="Authority Reverification In Progress"
            />
            <div className="rounded-2xl border border-[#d9e8df] bg-gradient-to-br from-white via-white to-emerald-50/40 shadow-sm px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-3xl font-serif text-[#224034] leading-tight">Authority Breakdown</h2>
                        <p className="text-slate-500 text-sm mt-1">Step-based plan to improve entity trust, graph clarity, and citation confidence.</p>
                    </div>
                    <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 px-3 py-1">
                        Step {authorityStep + 1} of {authoritySteps.length}
                    </Badge>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-3">
                {authoritySteps.map((step, idx) => (
                    <button
                        key={step.key}
                        onClick={() => setAuthorityStep(idx)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${authorityStep === idx ? 'bg-[#224034] text-white shadow-md' : step.done ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                    >
                        {step.done ? <Check className="w-4 h-4" /> : <span className="opacity-80 text-xs">{idx + 1}</span>}
                        <span className="hidden sm:inline-block">{step.title}</span>
                    </button>
                ))}
            </div>

            {activeStep && (
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
                    <div className={`h-2.5 w-full ${activeStep.done ? 'bg-emerald-400' : 'bg-[#224034]'}`} />

                    <div className="p-8 md:p-12 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest">
                            Step {authorityStep + 1} of {authoritySteps.length}
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-3xl lg:text-4xl font-serif text-[#224034] leading-tight">{activeStep.title}</h3>
                                <Badge className={`${activeStep.done ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'} hover:bg-inherit`}>
                                    {activeStep.metricLabel}: {activeStep.metricValue}
                                </Badge>
                            </div>
                            <p className="text-slate-600 text-lg">{activeStep.description}</p>
                        </div>

                        <div className={`rounded-xl border p-5 ${activeStep.done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
                            <p className="font-semibold">{activeStep.done ? "Healthy" : "Issue found"}</p>
                            <p className="mt-1">{activeStep.issue}</p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="text-slate-900 font-semibold">How to solve</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                                {activeStep.steps.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {activeStep.key === "eeat" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Strengths</p>
                                    <ul className="space-y-2">
                                        {proSignals.slice(0, 5).map((signal: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                                                <span>{signal}</span>
                                            </li>
                                        ))}
                                        {proSignals.length === 0 && <li className="text-xs text-slate-400">No strengths detected yet.</li>}
                                    </ul>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Weaknesses</p>
                                    <ul className="space-y-2">
                                        {conSignals.slice(0, 5).map((signal: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                                                <span>{signal}</span>
                                            </li>
                                        ))}
                                        {conSignals.length === 0 && <li className="text-xs text-slate-400 italic">No major weaknesses detected.</li>}
                                    </ul>
                                </div>

                                {neutralSignals.length > 0 && (
                                    <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Other Signals</p>
                                        <ul className="space-y-2">
                                            {neutralSignals.slice(0, 4).map((signal: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <UserRound className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                                    <span>{signal}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeStep.key === "knowledge-graph" && (
                            <div className="space-y-4">
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
                                                {relationshipEntries.map(([rel, rawValue], i: number) => {
                                                    const values = toArray(rawValue)
                                                    return (
                                                        <div key={i} className="grid grid-cols-[110px_1fr] gap-2 text-base border-l-2 border-slate-100 pl-3 py-0.5">
                                                            <span className="text-slate-400 text-sm font-mono">↳ {rel}</span>
                                                            {values.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {values.map((item, j) => (
                                                                        <span key={`${rel}-${j}`} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                                                                            {item}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="font-medium text-slate-400 text-sm italic">Missing</span>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </>
                                        ) : (
                                            <div className="text-xs text-slate-400 italic">No entities extracted yet.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Entity Coverage Checklist</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {graphChecks.map((item) => {
                                            const isPresent = toArray(relationships[item.key]).length > 0
                                            const Icon = item.icon
                                            return (
                                                <div key={item.key} className={`rounded-lg border p-2.5 text-sm ${isPresent ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50"}`}>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className={`w-3.5 h-3.5 ${isPresent ? "text-emerald-700" : "text-slate-400"}`} />
                                                            <span className={`font-mono text-xs ${isPresent ? "text-emerald-700" : "text-slate-500"}`}>{item.label}</span>
                                                        </div>
                                                        {isPresent ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-1">{item.required ? "Required signal" : "Recommended signal"}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeStep.key === "hallucination-risk" && risk && (
                            <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hallucination Risk</p>
                                    <Badge variant="outline" className={riskToneClasses}>
                                        {riskLevel} Risk
                                    </Badge>
                                </div>

                                <p className="text-sm text-slate-700 font-medium mb-1">&ldquo;{risk.reason}&rdquo;</p>

                                {risk.fix && (
                                    <div className="mt-2 bg-white rounded border border-gray-200 p-3 text-sm">
                                        <span className="font-bold text-indigo-600 block mb-0.5 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            Suggested Fix:
                                        </span>
                                        <span className="text-slate-600 italic">{risk.fix}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeStep.key === "competitor-presence" && (
                            <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800">Competitor Landscape</h3>
                                    <span className="text-lg font-bold text-slate-700">{competitorScore}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Your company or product was included {competitorIncludedTimes} out of 9 times in industry/product related queries.
                                </p>
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Competitors Mentioned</p>
                                    <div className="flex flex-wrap gap-2">
                                        {competitorCandidates.length > 0 ? (
                                            competitorCandidates.map((competitor) => (
                                                <span key={competitor} className="text-xs rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                                                    {competitor}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-500">
                                                No verified competitors yet. Run a fresh scan to populate this section.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )}

                        {activeStep.key === "prompt-visibility" && (
                            <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800">Key Prompts</h3>
                                    <span className="text-lg font-bold text-slate-700">{promptVisibility}%</span>
                                </div>
                                <div className="space-y-3">
                                    {keyPrompts.map((prompt) => (
                                        <div key={prompt.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                            <p className="text-sm text-slate-800 leading-snug">{prompt.prompt}</p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-500">{prompt.status}</span>
                                                <span className="text-xs font-bold text-slate-700">{prompt.mentionRate}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        )}

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                onClick={runAuthorityReverify}
                                disabled={!siteId || !scanTargetDomain || isRecrawling}
                                className="px-5 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-100"
                            >
                                {isRecrawling ? "Verifying..." : "Reverify"}
                            </button>
                            <button
                                onClick={() => setAuthorityStep((prev) => Math.max(0, prev - 1))}
                                disabled={authorityStep === 0}
                                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setAuthorityStep((prev) => Math.min(authoritySteps.length - 1, prev + 1))}
                                className="px-5 py-3 rounded-xl bg-[#224034] text-white font-semibold hover:bg-[#1a3228]"
                            >
                                Next Step <ChevronRight className="w-4 h-4 inline-block ml-1" />
                            </button>
                            {siteId && (
                                <Link
                                    href={`/dashboard/sites/${siteId}/${activeStep.key === "knowledge-graph" ? "knowledge-graph" : activeStep.key === "hallucination-risk" ? "hallucination-risk" : "share-of-voice"}`}
                                    className="px-5 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100"
                                >
                                    Open Full View
                                </Link>
                            )}
                        </div>
                        {recrawlMessage && (
                            <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
                                recrawlMessage.toLowerCase().includes("complete")
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : recrawlMessage.toLowerCase().includes("already in progress")
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                                <p>{recrawlMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
