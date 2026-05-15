import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Loader2, AlertTriangle, ChevronRight } from "lucide-react"
import { AEOReport } from "@/types/aeo"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"

interface ContentTabProps {
    activeReport: AEOReport
    siteId?: string
    domain?: string
    tier?: string
}

type MissingAnswerItem = AEOReport["content"]["missingAnswers"][number]

type AmbiguityImprovement = {
    category: string
    originalText: string
    suggestedFix: string
}

type AmbiguityResponse = {
    improvements?: AmbiguityImprovement[]
}

type ContentStep = {
    key: string
    title: string
    description: string
    metricLabel: string
    metricValue: string
    done: boolean
    issue: string
    steps: string[]
    locked?: boolean
}

const getDisplayQuery = (query: MissingAnswerItem) => {
    const value = (query?.query || "").trim()
    return value.length > 0 ? value : "No query text returned by scan"
}

export function ContentTab({ activeReport, siteId, domain, tier }: ContentTabProps) {
    const router = useRouter()

    const content = activeReport.content
    const failedQueries: MissingAnswerItem[] = content?.missingAnswers || []
    const isPlusOrPro = tier === 'plus' || tier === 'pro'

    const [contentStep, setContentStep] = useState(0)

    const [ambiguityLoading, setAmbiguityLoading] = useState(false)
    const [ambiguityData, setAmbiguityData] = useState<AmbiguityResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isRecrawling, setIsRecrawling] = useState(false)
    const [recrawlMessage, setRecrawlMessage] = useState<string | null>(null)
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [scanDialogStatus, setScanDialogStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')
    const [scanDialogMessage, setScanDialogMessage] = useState<string>("")

    const handleAnalyzeAmbiguity = async () => {
        if (!domain) return
        setAmbiguityLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/analyze-ambiguity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_domain: domain })
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data?.error || "Analysis failed")
            setAmbiguityData(data)
            window.dispatchEvent(new Event("diamonds-updated"))
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Could not analyze content. Please try again.")
        } finally {
            setAmbiguityLoading(false)
        }
    }

    const questionTargetingScore = Number(content?.questionTargetingScore || 0)
    const readabilityGrade = Number(content?.readabilityGrade || 0)
    const visualContextScore = Number(content?.visualContextScore || 0)
    const freshnessScore = Number(content?.freshnessScore || 0)
    const readabilitySuggestion = content?.readabilityDetails?.find((d: string) => d.startsWith("Suggestion:"))
    const ambiguityImprovements = ambiguityData?.improvements ?? []

    const explicitAnswers = failedQueries.filter((q) => q.status === 'Explicitly Stated').length
    const aiConfidence = Math.round((explicitAnswers / Math.max(failedQueries.length, 1)) * 100)
    const unresolvedAnswers = failedQueries.filter((q) => q.status !== 'Explicitly Stated').length
    const scanTargetDomain = activeReport.domain || domain || ""

    const runContentReverify = async () => {
        if (!siteId || !scanTargetDomain) return

        setIsRecrawling(true)
        setRecrawlMessage(null)
        setScanDialogOpen(true)
        setScanDialogStatus("scanning")
        setScanDialogMessage("Running a full rescan to verify content updates.")

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
                    setRecrawlMessage("Reverification complete. Latest content scores are now loading.")
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

    const contentSteps: ContentStep[] = useMemo(() => {
        return [
            {
                key: "question-targeting",
                title: "Question targeting",
                description: "Are your headings aligned to real user questions?",
                metricLabel: "Headers asking questions",
                metricValue: `${questionTargetingScore} / 5`,
                done: questionTargetingScore >= 3,
                issue: questionTargetingScore >= 3
                    ? "Great coverage. Your pages already include question-style headings."
                    : "Too few question-style headings. AI may not map your page to user intent quickly.",
                steps: [
                    "Add clear H2/H3 question headings users actually search for.",
                    "Start each major section with one direct question.",
                    "Match wording to long-tail searches (who, what, how, cost, timeline).",
                ],
            },
            {
                key: "readability",
                title: "Readability",
                description: "Is the writing easy for humans and AI to understand quickly?",
                metricLabel: "Flesch-Kincaid grade",
                metricValue: readabilityGrade > 0 ? `Grade ${readabilityGrade}` : "Calculating...",
                done: readabilityGrade > 0 && readabilityGrade <= 10,
                issue: readabilityGrade > 0 && readabilityGrade <= 10
                    ? "Your writing is easy to parse."
                    : readabilityGrade > 10
                        ? "Your writing may be too complex, which lowers answer extraction quality."
                        : "Readability score is not ready yet.",
                steps: [
                    "Use shorter sentences and plain language.",
                    "Keep paragraphs to 2-4 lines.",
                    "Replace vague words with concrete facts and numbers.",
                ],
            },
            {
                key: "visual-context",
                title: "Visual context",
                description: "Do images and layout support clear page meaning?",
                metricLabel: "Visual context",
                metricValue: `${visualContextScore}%`,
                done: visualContextScore >= 85,
                issue: visualContextScore >= 85
                    ? "Strong visual context."
                    : "Visual context can be improved for better model interpretation.",
                steps: [
                    "Add descriptive alt text to important images.",
                    "Put key message text near related visuals.",
                    "Avoid decorative images that do not support content meaning.",
                ],
            },
            {
                key: "freshness",
                title: "Content freshness",
                description: "Can AI trust that your content is current?",
                metricLabel: "Dates validated",
                metricValue: freshnessScore > 0 ? "Validated" : "Needs review",
                done: freshnessScore > 0,
                issue: freshnessScore > 0
                    ? "Freshness signals are present."
                    : "Missing clear timestamps can reduce trust in your content.",
                steps: [
                    "Show published and updated dates on key pages.",
                    "Keep pricing, policies, and product info current.",
                    "Update outdated sections and rescan after publishing.",
                ],
            },
            {
                key: "missing-answers",
                title: "The missing answer",
                description: "Do your pages directly answer simulated user questions?",
                metricLabel: "AI confidence",
                metricValue: `${aiConfidence} / 100`,
                done: unresolvedAnswers === 0,
                issue: unresolvedAnswers === 0
                    ? "All tested questions are explicitly answered."
                    : `${unresolvedAnswers} simulated questions are still implied or missing.`,
                steps: [
                    "Add a direct answer block for each missing question.",
                    "Use exact phrasing from user queries in your headings.",
                    "Add concise FAQ sections with explicit statements.",
                ],
                locked: !isPlusOrPro,
            },
            {
                key: "ambiguity",
                title: "Ambiguity inspector",
                description: "Remove vague claims so AI can cite you accurately.",
                metricLabel: "Ambiguity checks",
                metricValue: ambiguityData ? "Scanned" : "Not scanned",
                done: Boolean(ambiguityData) && ambiguityImprovements.length === 0,
                issue: ambiguityData
                    ? (ambiguityImprovements.length > 0
                        ? "We found vague wording that should be made concrete."
                        : "No major ambiguity found.")
                    : "Run ambiguity scan to detect weak phrases.",
                steps: [
                    "Replace words like 'best' or 'fast' with measurable proof.",
                    "Add numbers, dates, and source-backed claims.",
                    "Update pages with specific outcomes and examples.",
                ],
                locked: !isPlusOrPro,
            },
        ]
    }, [aiConfidence, ambiguityData, ambiguityImprovements.length, freshnessScore, isPlusOrPro, questionTargetingScore, readabilityGrade, unresolvedAnswers, visualContextScore])

    const activeStep = contentSteps[contentStep] || contentSteps[0]
    const allDone = contentSteps.every((step) => step.done || step.locked)

        if (allDone) {
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 w-full max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <ScanProgressDialog
                        open={scanDialogOpen}
                        onOpenChange={(open) => {
                            if (!open && scanDialogStatus === "scanning") return
                            setScanDialogOpen(open)
                        }}
                        siteUrl={scanTargetDomain}
                        status={scanDialogStatus}
                        message={scanDialogMessage}
                        title="Content Reverification In Progress"
                    />
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-8 border-white">
                        <Check className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-4xl font-serif text-[#224034] leading-tight mb-4">Content Steps Complete</h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-8">
                        Your core content checks are healthy. AI systems should be able to read, interpret, and cite your pages more reliably.
                    </p>
                    <button onClick={() => setContentStep(0)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm">
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
                    title="Content Reverification In Progress"
                />
                <div className="rounded-2xl border border-[#d9e8df] bg-gradient-to-br from-white via-white to-emerald-50/40 shadow-sm px-6 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-3xl font-serif text-[#224034] leading-tight">Content Breakdown</h2>
                            <p className="text-slate-500 text-sm mt-1">Step-based plan to improve answer clarity, readability, and AI confidence.</p>
                        </div>
                        <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 px-3 py-1">
                            Step {contentStep + 1} of {contentSteps.length}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 overflow-x-auto pb-3">
                    {contentSteps.map((step, idx) => {
                        const doneOrLocked = step.done || step.locked
                        return (
                            <button
                                key={step.key}
                                onClick={() => setContentStep(idx)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${contentStep === idx ? 'bg-[#224034] text-white shadow-md' : doneOrLocked ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                            >
                                {doneOrLocked ? <Check className="w-4 h-4" /> : <span className="opacity-80 text-xs">{idx + 1}</span>}
                                <span className="hidden sm:inline-block">{step.title}</span>
                            </button>
                        )
                    })}
                </div>

                {activeStep && (
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
                        <div className={`h-2.5 w-full ${activeStep.done ? 'bg-emerald-400' : activeStep.locked ? 'bg-violet-400' : 'bg-[#224034]'}`} />

                        <div className="p-8 md:p-12 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest">
                                Step {contentStep + 1} of {contentSteps.length}
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-3xl lg:text-4xl font-serif text-[#224034] leading-tight">{activeStep.title}</h3>
                                    <Badge className={`${activeStep.done ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : activeStep.locked ? 'bg-violet-100 text-violet-800 border-violet-200' : 'bg-slate-100 text-slate-700 border-slate-200'} hover:bg-inherit`}>{activeStep.metricLabel}: {activeStep.metricValue}</Badge>
                                </div>
                                <p className="text-slate-600 text-lg">{activeStep.description}</p>
                            </div>

                            {activeStep.locked ? (
                                <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
                                    <p className="text-violet-800 font-medium">This step is temporarily unavailable.</p>
                                    <p className="text-violet-700 mt-1 text-sm">Paid upgrades are hidden in this build.</p>
                                </div>
                            ) : (
                                <>
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

                                    {activeStep.key === "readability" && readabilitySuggestion && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                                            <p className="text-amber-800 font-semibold mb-1">AI rewrite suggestion</p>
                                            <p className="text-amber-900/90">&ldquo;{readabilitySuggestion.replace("Suggestion:", "").trim()}&rdquo;</p>
                                        </div>
                                    )}

                                    {activeStep.key === "missing-answers" && (
                                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                                            <p className="text-slate-900 font-semibold mb-3">Simulated user query results</p>
                                            {failedQueries.length === 0 ? (
                                                <p className="text-slate-600">No query data available yet for this scan.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {failedQueries.slice(0, 5).map((query, i) => (
                                                        <div key={`${query.query}-${i}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
                                                            <p className="text-slate-700 text-sm max-w-2xl">&ldquo;{getDisplayQuery(query)}&rdquo;</p>
                                                            <Badge className={`${query.status === 'Explicitly Stated' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'} hover:bg-inherit`}>{query.status || "Missing"}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeStep.key === "ambiguity" && (
                                        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <div>
                                                    <p className="font-semibold text-slate-900">Run ambiguity scan</p>
                                                    <p className="text-sm text-slate-600">Find vague words and replace them with clearer, trust-building language.</p>
                                                </div>
                                                <Button
                                                    onClick={handleAnalyzeAmbiguity}
                                                    disabled={ambiguityLoading}
                                                    className="bg-[#224034] hover:bg-[#1b3028] text-white"
                                                >
                                                    {ambiguityLoading ? (
                                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                                                    ) : (
                                                        <>Inspect Content</>
                                                    )}
                                                </Button>
                                            </div>

                                            {error && (
                                                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    {error}
                                                </div>
                                            )}

                                            {ambiguityImprovements.length > 0 && (
                                                <div className="space-y-2">
                                                    {ambiguityImprovements.slice(0, 4).map((item, i) => (
                                                        <div key={i} className="rounded-lg border border-violet-100 bg-violet-50/40 p-3">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">{item.category}</p>
                                                            <p className="text-slate-700 mt-1">&ldquo;{item.originalText}&rdquo;</p>
                                                            <p className="text-sm text-violet-800 mt-1">Suggested: {item.suggestedFix}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    onClick={runContentReverify}
                                    disabled={!siteId || !scanTargetDomain || isRecrawling}
                                    className="px-5 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-100"
                                >
                                    {isRecrawling ? "Verifying..." : "Reverify"}
                                </button>
                                <button
                                    onClick={() => setContentStep((prev) => Math.max(0, prev - 1))}
                                    disabled={contentStep === 0}
                                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setContentStep((prev) => Math.min(contentSteps.length - 1, prev + 1))}
                                    className="px-5 py-3 rounded-xl bg-[#224034] text-white font-semibold hover:bg-[#1a3228]"
                                >
                                    Next Step <ChevronRight className="w-4 h-4 inline-block ml-1" />
                                </button>
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
