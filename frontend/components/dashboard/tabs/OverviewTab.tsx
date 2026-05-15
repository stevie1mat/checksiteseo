import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Info, FileText, AlertCircle, Sparkles, Code, Search, Check, Clock, Cpu, XCircle, Linkedin, Youtube, MessageSquare, ChevronRight } from "lucide-react"
import { AEOReport } from "@/types/aeo"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface OverviewTabProps {
    activeReport: AEOReport
    setActiveTab: (tab: 'overview' | 'technical' | 'content' | 'authority') => void
    siteId?: string
    tier?: string
    domain?: string
}

type EngineKey =
    | "chatgpt"
    | "gemini"
    | "claude"
    | "perplexity"
    | "searchgpt"
    | "meta"
    | "grok"
    | "mistral"
    | "you"

type PromptResponse = {
    engineKey: EngineKey
    engineLabel: string
    model: string
    mentionRate: number
    response: string
    mentions: string[]
}

const ENGINE_META: Array<{
    key: EngineKey
    label: string
    model: string
    logo: string
    fallbackOffset: number
}> = [
        { key: "chatgpt", label: "OpenAI", model: "GPT-5 Mini + Search", logo: "/logos/chatgpt-logo.png", fallbackOffset: 4 },
        { key: "gemini", label: "Gemini", model: "Gemini 2.5 Flash + Search", logo: "/logos/gemini-logo.png", fallbackOffset: 1 },
        { key: "claude", label: "Claude", model: "Claude Sonnet 4", logo: "/logos/claude-logo.png", fallbackOffset: 0 },
        { key: "perplexity", label: "Perplexity", model: "Perplexity + Search", logo: "/logos/perplexity-logo.png", fallbackOffset: 2 },
        { key: "searchgpt", label: "SearchGPT", model: "OpenAI Prototype", logo: "/logos/chatgpt-logo.png", fallbackOffset: 1 },
        { key: "meta", label: "Meta AI", model: "Llama + Web Search", logo: "/logos/meta-logo.webp", fallbackOffset: -1 },
        { key: "grok", label: "Grok", model: "Grok 3", logo: "/logos/grok-logo.svg", fallbackOffset: -2 },
        { key: "mistral", label: "Mistral", model: "Le Chat Search", logo: "/logos/mistral-logo.png", fallbackOffset: -1 },
        { key: "you", label: "You.com", model: "YouChat Pro", logo: "/logos/you-logo.png", fallbackOffset: 2 },
    ]

const ENGINE_AEO_COPY: Record<EngineKey, string> = {
    chatgpt: "ChatGPT rewards pages that answer quickly, use simple wording, and show trust signals.",
    gemini: "Gemini relies on clean heading structure and explicit section labels to parse your page.",
    claude: "Claude performs best when content is broken into short Q&A style sections.",
    perplexity: "Perplexity favors claims with nearby citations and source-backed language.",
    searchgpt: "SearchGPT favors clear entity context and answer-first formatting for fast retrieval.",
    meta: "Meta AI responds better to plain-language sections with clear topical focus.",
    grok: "Grok prefers fast factual summaries and consistently crawlable content.",
    mistral: "Mistral responds best to crisp section intent and short direct paragraphs.",
    you: "You.com rewards clear answers paired with visible source proof.",
}

const ENGINE_GEO_COPY: Record<EngineKey, string> = {
    chatgpt: "Use short answer-first blocks so quotes are extracted with minimal rewriting.",
    gemini: "Keep one idea per paragraph and pair each heading with a plain-language summary line.",
    claude: "Split dense text into clean chunks so generated summaries preserve your original meaning.",
    perplexity: "Put source links right below major claims to improve citation confidence.",
    searchgpt: "Add explicit entity definitions and one source-backed claim near the top of the page.",
    meta: "Reduce jargon and use short direct wording so outputs stay accurate.",
    grok: "Add a quick answer near the top and keep key pages freshly updated.",
    mistral: "Tighten headings and simplify long sentences to improve quote accuracy.",
    you: "Combine short paragraphs with citation-friendly source links under key claims.",
}

const ENGINE_FIX_COPY: Record<EngineKey, { exampleFix: string; copyPaste: string }> = {
    chatgpt: {
        exampleFix: "Add a short FAQ answer block under one key customer claim.",
        copyPaste: `<h2>What problem does this service solve?</h2>\n<p>We help [audience] solve [specific problem] in [timeframe].</p>\n<p>Source: <a href="[source-url]">Supporting source</a></p>`,
    },
    gemini: {
        exampleFix: "Rename vague headings and add one summary sentence under each heading.",
        copyPaste: `<h2>Implementation Timeline</h2>\n<p>Most teams launch in [timeframe] with [onboarding step].</p>`,
    },
    claude: {
        exampleFix: "Break one long paragraph into 2-3 Q&A blocks.",
        copyPaste: `<h2>Frequently Asked Question</h2>\n<p><strong>Q:</strong> How long does setup take?</p>\n<p><strong>A:</strong> Most customers are live in [timeframe].</p>`,
    },
    perplexity: {
        exampleFix: "Place source links directly below one important claim.",
        copyPaste: `<p><strong>Claim:</strong> [Insert key claim]</p>\n<p>Source: <a href="[trusted-source-url]">Trusted source</a></p>`,
    },
    searchgpt: {
        exampleFix: "Add one entity-focused summary line and a supporting source near the top.",
        copyPaste: `<p><strong>Summary:</strong> [Brand] helps [audience] with [specific outcome].</p>\n<p>Source: <a href="[source-url]">Source link</a></p>`,
    },
    meta: {
        exampleFix: "Rewrite one technical section into plain language with concrete wording.",
        copyPaste: `<p>We help [audience] get [result] using [method], usually in [timeframe].</p>`,
    },
    grok: {
        exampleFix: "Add a 2-line quick answer summary at the top of your page.",
        copyPaste: `<p><strong>Quick answer:</strong> We help [audience] achieve [outcome] in [timeframe].</p>`,
    },
    mistral: {
        exampleFix: "Clarify section names and shorten one long paragraph for direct quoting.",
        copyPaste: `<h2>Pricing and Timeline</h2>\n<p>Plans start at [price]. Projects usually begin within [timeline].</p>`,
    },
    you: {
        exampleFix: "Add alt text to a primary image and cite one source under a key claim.",
        copyPaste: `<img alt="[Brand] service shown in use by customer" />\n<p><strong>Claim:</strong> [Insert key claim]</p>\n<p>Source: <a href="[source-url]">Source page</a></p>`,
    },
}

function clamp(value: number, min = 0, max = 100) {
    return Math.min(max, Math.max(min, value))
}

function average(values: number[]) {
    if (!values.length) return 0
    return values.reduce((sum, current) => sum + current, 0) / values.length
}

function toTitleCase(input: string) {
    return input
        .replace(/[-_]/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
}

function getDomain(rawUrl: string) {
    try {
        return new URL(rawUrl).hostname.replace(/^www\./, "")
    } catch {
        return rawUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    }
}

function getBrandName(domain: string) {
    const parts = domain.split(".").filter(Boolean)
    if (!parts.length) return "Your Brand"
    const root = parts.length >= 2 ? parts[parts.length - 2] : parts[0]
    return toTitleCase(root)
}

function formatCompetitorLabel(input: string) {
    const trimmed = input.trim()
    if (!trimmed) return ""

    if (trimmed.includes(".")) {
        try {
            const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
            const host = new URL(normalized).hostname.replace(/^www\./, "")
            const parts = host.split(".").filter(Boolean)
            const root = parts.length >= 2 ? parts[parts.length - 2] : parts[0]
            return toTitleCase(root)
        } catch {
            return toTitleCase(trimmed.replace(/^www\./, "").split(".")[0] || trimmed)
        }
    }

    return toTitleCase(trimmed)
}

function pickEngineCompetitorPair(competitors: string[], engineIndex: number, prompt: string) {
    if (!competitors.length) return { focus: "", support: "" }
    const promptSeed = prompt.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const focusIndex = (promptSeed + engineIndex) % competitors.length
    const supportIndex = (focusIndex + 2) % competitors.length
    const focus = competitors[focusIndex] ?? ""
    const support = competitors.length > 1 ? competitors[supportIndex] ?? "" : ""
    return { focus, support: support === focus ? "" : support }
}

function buildPromptResponses(
    prompt: string,
    brandName: string,
    domain: string,
    competitors: string[],
    engines: Array<{ key: EngineKey; label: string; model: string; score: number }>
): PromptResponse[] {
    const styleByEngine: Record<EngineKey, { variation: number; fix: string; template: "analysis" | "structure" | "qa" | "citation" | "summary" }> = {
        chatgpt: { variation: 4, fix: "add a short FAQ answer block and one cited source directly below the claim", template: "analysis" },
        gemini: { variation: 2, fix: "rename vague headings and add one direct summary sentence under each section heading", template: "structure" },
        claude: { variation: 0, fix: "split dense paragraphs into short Q&A sections and keep one idea per paragraph", template: "qa" },
        perplexity: { variation: 3, fix: "place source links right under key claims to increase quote confidence", template: "citation" },
        searchgpt: { variation: 1, fix: "add explicit entity context and one source-backed key claim near the top", template: "summary" },
        meta: { variation: -2, fix: "simplify technical wording and add short plain-language summary lines", template: "summary" },
        grok: { variation: -4, fix: "add a quick answer summary near the top and keep updates visible", template: "summary" },
        mistral: { variation: -1, fix: "tighten heading clarity and shorten long paragraphs for direct quoting", template: "structure" },
        you: { variation: 2, fix: "add one image alt text improvement and one cited source under a primary claim", template: "citation" },
    }

    return engines.map((engine, index) => {
        const style = styleByEngine[engine.key]
        const pair = pickEngineCompetitorPair(competitors, index, prompt)
        const topCompetitors = [pair.focus, pair.support].filter(Boolean).join(" and ") || "other established brands"
        const mentions = Array.from(new Set([brandName, pair.focus, pair.support].filter(Boolean))) as string[]
        const mentionRate = clamp(
            Math.round(
                engine.score - (prompt.toLowerCase().includes("leading products") ? 18 : 10) + style.variation
            )
        )
        const promptLower = prompt.toLowerCase()
        const responseByTemplate: Record<typeof style.template, string> = {
            analysis:
                `${engine.label} signals that ${brandName} can perform well for "${promptLower}" when content stays answer-first and easy to verify. ` +
                `In this snapshot, it aligns ${domain} closest with ${topCompetitors}. ` +
                `Highest-impact fix: ${style.fix}.`,
            structure:
                `${engine.label} is likely to elevate ${brandName} on "${promptLower}" once heading hierarchy is cleaner and sections are easier to parse. ` +
                `Current benchmark overlap is strongest with ${topCompetitors}. ` +
                `Next step: ${style.fix}.`,
            qa:
                `${engine.label} currently reads ${domain} as relevant but not consistently quote-ready for "${promptLower}". ` +
                `It clusters your page near ${topCompetitors}. ` +
                `To improve reliability, ${style.fix}.`,
            citation:
                `${engine.label} rewards pages that prove claims. For "${promptLower}", ${brandName} is in range but still behind parts of ${topCompetitors}. ` +
                `You can raise citation confidence if you ${style.fix}.`,
            summary:
                `${engine.label} can surface ${brandName} for "${promptLower}" when your page starts with a fast factual summary and clear entity context. ` +
                `Right now, comparison signals trend toward ${topCompetitors}. ` +
                `Recommended action: ${style.fix}.`,
        }

        return {
            engineKey: engine.key,
            engineLabel: engine.label,
            model: engine.model,
            mentionRate,
            response: responseByTemplate[style.template],
            mentions,
        }
    })
}

export function OverviewTab({ activeReport, setActiveTab, siteId, tier = 'free', domain }: OverviewTabProps) {
    const { toast } = useToast()
    const isPlusOrPro = tier === 'plus' || tier === 'pro'
    const isPro = tier === 'pro'
    const [hasPendingScan, setHasPendingScan] = useState(false)
    const [isScheduling, setIsScheduling] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const [nextScheduledFor, setNextScheduledFor] = useState<string | null>(null)
    const [selectedEngineKey, setSelectedEngineKey] = useState<EngineKey | null>(null)
    const [activePromptIndex, setActivePromptIndex] = useState(0)
    const [animatedAeoScore, setAnimatedAeoScore] = useState(0)
    const [overviewStep, setOverviewStep] = useState(0)
    
    const searchParams = useSearchParams()
    const viewMode = searchParams.get('mode') || 'simple'

    // Helper variables
    const failedQueries = activeReport.content?.missingAnswers || []
    const techScore = typeof activeReport.scores?.technical === 'number' ? Math.round(activeReport.scores.technical) : 0
    const contentScore = typeof activeReport.scores?.content === 'number' ? Math.round(activeReport.scores.content) : 0
    const aeoScore = typeof activeReport.scores?.overall === 'number' ? Math.round(activeReport.scores.overall) : 0
    
    // Hallucination level - check if there's a hallucination risk indicator
    const hallucinationLevel = activeReport.authority?.eeat?.hallucination_risk?.level === 'High' 
                               ? 'High' : 'Low'
    
    // Knowledge graph data
    const knowledgeGraph = activeReport.authority?.knowledge_graph || {} as any
    const reportDomain = getDomain(domain || activeReport.domain || "")
    const brandName = getBrandName(reportDomain)


    const dailySeries = useMemo(() => {
        return Array.from({ length: 14 }, (_, index) => {
            const wave = Math.sin((index / 3) * Math.PI) * 5
            const drift = (index - 6) * 0.6
            return clamp(Math.round(aeoScore - 6 + wave + drift))
        })
    }, [aeoScore])

    const questionTargeting = activeReport?.content?.questionTargetingScore ?? 0
    const readabilityScore = 100 - (activeReport?.content?.readabilityGrade || 10) * 5
    const answerability = clamp(Math.round((questionTargeting * 20 + readabilityScore) / 2))
    const structuredData = activeReport?.technical?.schema?.length ? 100 : 0
    const crawlerAccessibility = clamp(
        Math.round(
            average([
                activeReport?.technical?.robotsTxt ? 100 : 0,
                activeReport?.technical?.llmsTxt ? 100 : 0,
                activeReport?.technical?.sitemap ? 100 : 0,
            ])
        )
    )
    const webPresence = typeof activeReport?.scores?.authority === 'number' ? activeReport.scores.authority : 0
    const strategyScore = clamp(
        Math.round(average([answerability, structuredData, crawlerAccessibility, webPresence]))
    )
    const redditPresenceScore = clamp(
        Math.round(average([webPresence, answerability]))
    )
    const linkedinScore = clamp(Math.round(webPresence * 1.1))
    const youtubeScore = clamp(Math.round(webPresence * 0.85))
    const forumScore = clamp(Math.round(webPresence * 0.95))

    const wikipediaDetected = Boolean((knowledgeGraph as any).primaryEntity || (knowledgeGraph as any).primary_entity)
    const sentimentScore = clamp(
        Math.round(
            average([
                typeof activeReport?.scores?.authority === 'number' ? activeReport.scores.authority : 0,
                100 - (activeReport?.content?.readabilityGrade || 10) * 5,
            ])
        )
    )

    const [isSearchSliderPaused, setIsSearchSliderPaused] = useState(false)

    const competitorCandidates = useMemo(() => {
        const genericLabels = new Set(["wikipedia", "linkedin", "medium"])
        const raw = activeReport.competitors?.top_competitors || []
        return Array.from(
            new Set(
                raw
                    .map(formatCompetitorLabel)
                    .filter(Boolean)
                    .filter((item) => !genericLabels.has(item.toLowerCase()))
                    .filter((item) => item.toLowerCase() !== brandName.toLowerCase())
            )
        ).slice(0, 6)
    }, [activeReport.competitors?.top_competitors, brandName])

    const engineRows = useMemo(() => {
        return ENGINE_META.map((engine) => {
            const fromReport = activeReport.engineScores?.[engine.key]
            const fallback = clamp(aeoScore + engine.fallbackOffset)
            return {
                ...engine,
                score: typeof fromReport === "number" ? clamp(fromReport) : fallback,
            }
        })
    }, [activeReport.engineScores, aeoScore])

    const averageEngineScore = Math.round(
        engineRows.length ? average(engineRows.map((engine) => engine.score)) : 0
    )

    const engineIssueByKey = useMemo(() => ({
        chatgpt:
            activeReport.content?.readabilityGrade && activeReport.content.readabilityGrade > 12
                ? "Your content is hard to read in places. ChatGPT prefers simple, direct wording."
                : "Add more answer-first blocks and proof links for stronger ChatGPT extraction.",
        gemini:
            !activeReport.technical?.robotsTxt
                ? "Crawler access looks limited. Gemini may miss key pages."
                : "Use clearer headings and section labels for Gemini understanding.",
        claude:
            (activeReport.content?.questionTargetingScore || 0) < 3
                ? "Question-led structure is limited, so Claude has less clean Q&A context."
                : "Break long sections into short, explicit Q&A blocks.",
        perplexity:
            (activeReport.technical?.schema?.length || 0) === 0
                ? "Structured citation signals are weak, reducing quote confidence."
                : "Add source links directly under key claims for stronger citations.",
        searchgpt:
            !activeReport.technical?.llmsTxt
                ? "No llms.txt detected, so SearchGPT may miss concise agent-friendly summaries."
                : "Improve entity clarity near the top so SearchGPT can retrieve key claims faster.",
        meta:
            activeReport.content?.readabilityGrade && activeReport.content.readabilityGrade > 11
                ? "Complex wording reduces recall quality for Meta AI."
                : "Use more plain-language summaries and direct section intent.",
        grok:
            !activeReport.technical?.sitemap
                ? "Discovery signals are weak. Grok may miss fresh updates."
                : "Keep fast factual summaries near the top for better pickup.",
        mistral:
            activeReport.content?.readabilityGrade && activeReport.content.readabilityGrade > 11
                ? "Long, complex paragraphs lower quote quality for Mistral."
                : "Tighten section intent and simplify long paragraphs.",
        you:
            (activeReport.content?.visualContextScore || 0) < 70
                ? "Visual context signals are weak. You.com may skip key page evidence."
                : "Add source-backed claims and maintain clear image context for better extraction.",
    }), [
        activeReport.content?.questionTargetingScore,
        activeReport.content?.readabilityGrade,
        activeReport.content?.visualContextScore,
        activeReport.technical?.llmsTxt,
        activeReport.technical?.robotsTxt,
        activeReport.technical?.schema,
        activeReport.technical?.sitemap,
    ])

    const promptBundles = useMemo(() => {
        const prompts = [
            `What customer problems does ${brandName} solve best?`,
            `How does ${brandName} compare with leading alternatives?`,
            `Why should buyers trust ${brandName}?`,
        ]

        const avgScore = average(engineRows.map((engine) => engine.score))
        const baseRates = [
            clamp(Math.round(avgScore - 8)),
            clamp(Math.round(avgScore - 12)),
            clamp(Math.round(avgScore - 10)),
        ]

        return prompts.map((prompt, index) => ({
            id: `prompt-${index + 1}`,
            prompt,
            mentionRate: baseRates[index] ?? clamp(Math.round(avgScore - 10)),
            responses: buildPromptResponses(
                prompt,
                brandName,
                reportDomain || activeReport.domain || "your-site.com",
                competitorCandidates,
                engineRows.map((engine) => ({
                    key: engine.key,
                    label: engine.label,
                    model: engine.model,
                    score: engine.score,
                }))
            ),
        }))
    }, [activeReport.domain, brandName, competitorCandidates, engineRows, reportDomain])

    const activePrompt = promptBundles[activePromptIndex] || promptBundles[0]
    const selectedEngine = engineRows.find((engine) => engine.key === selectedEngineKey) || null
    const strongestEngine = [...engineRows].sort((a, b) => b.score - a.score)[0] || null
    const weakestEngine = [...engineRows].sort((a, b) => a.score - b.score)[0] || null

    const placeholderAiPreviewPattern = /i found several options|leading provider in this space/i
    const rawAiPreviewResponse = activeReport.authority?.ai_preview?.response?.trim() || ""
    const hasMeaningfulAiPreview = rawAiPreviewResponse.length > 0 && !placeholderAiPreviewPattern.test(rawAiPreviewResponse)
    const missingAnswersCount = failedQueries.filter((q: any) => q.status !== 'Explicitly Stated').length

    const generatedAiPreviewQuery = activeReport.authority?.ai_preview?.query?.trim() || `Is ${brandName} a strong choice for this service?`
    type AiPreviewLine = { text: string; logo?: string; label?: string }
    const generatedAiPreviewLines: AiPreviewLine[] = [
        {
            text: `Based on this scan, ${brandName} has an AEO visibility score of ${aeoScore}/100.`,
        },
        ...(strongestEngine
            ? [{
                text: `${strongestEngine.label} shows the strongest confidence (${strongestEngine.score}/100).`,
                logo: strongestEngine.logo,
                label: strongestEngine.label,
            }]
            : []),
        ...(weakestEngine && weakestEngine.key !== strongestEngine?.key
            ? [{
                text: `${weakestEngine.label} is currently the weakest channel (${weakestEngine.score}/100).`,
                logo: weakestEngine.logo,
                label: weakestEngine.label,
            }]
            : []),
        {
            text: missingAnswersCount > 0
                ? `Your site is missing clear answers to ${missingAnswersCount} important user question${missingAnswersCount > 1 ? "s" : ""}, so AI may recommend you less consistently.`
                : "Your site clearly answers core user questions, which helps AI recommend you more consistently.",
        },
        {
            text: !activeReport.technical?.robotsTxt || !activeReport.technical?.sitemap
                ? "Crawlability signals are incomplete, so some engines may not surface your best answers reliably."
                : "Crawlability signals look healthy, so engines can discover core pages more reliably.",
        },
    ]

    const aiPreviewResponse = hasMeaningfulAiPreview
        ? rawAiPreviewResponse
        : generatedAiPreviewLines.map((line) => line.text).join(" ")
    const verdictLabel = aeoScore >= 80 ? "Strong Visibility" : aeoScore >= 50 ? "Moderate Visibility" : "Needs Improvement"
    const verdictBadgeClass = aeoScore >= 80
        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
        : aeoScore >= 50
            ? "bg-amber-100 text-amber-800 border-amber-200"
            : "bg-rose-100 text-rose-800 border-rose-200"
    const scoreRingPercent = clamp(animatedAeoScore)
    const scoreRingRadius = 88
    const scoreRingCircumference = 2 * Math.PI * scoreRingRadius
    const scoreRingOffset = scoreRingCircumference - (scoreRingPercent / 100) * scoreRingCircumference
    const simpleOverviewSteps = [
        { key: "verdict", title: "AI verdict" },
        { key: "engines", title: "Engine visibility" },
        { key: "actions", title: "Action plan" },
    ]

    useEffect(() => {
        const loadScheduledStatus = async () => {
            if (!siteId || !isPlusOrPro) return
            try {
                const response = await fetch(`/api/scheduled-scan-status?site_id=${siteId}`)
                if (!response.ok) return
                const data = await response.json()
                setHasPendingScan(!!data.hasPendingScan)
                setNextScheduledFor(data.scan?.scheduled_for || null)
            } catch {
                // Best effort only
            }
        }
        loadScheduledStatus()
    }, [siteId, isPlusOrPro])

    useEffect(() => {
        setAnimatedAeoScore(0)
        const frame = requestAnimationFrame(() => {
            setAnimatedAeoScore(clamp(aeoScore))
        })
        return () => cancelAnimationFrame(frame)
    }, [aeoScore])

    const handleScheduleScan = async () => {
        if (!isPlusOrPro) {
            toast({
                title: "Upgrade required",
                description: "Weekly monitoring is available on the Plus plan.",
                variant: "destructive"
            })
            return
        }
        if (!siteId || !domain) {
            toast({ title: "Unable to schedule", description: "Missing site context.", variant: "destructive" })
            return
        }

        setIsScheduling(true)
        try {
            const response = await fetch('/api/schedule-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    site_id: siteId,
                    url: domain,
                    delay_hours: 168,
                    scan_type: "full",
                })
            })

            const data = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(data.detail || data.error || "Failed to schedule weekly monitoring")
            }

            setHasPendingScan(true)
            setNextScheduledFor(data.next_run_time || null)
            toast({ title: "Weekly monitoring enabled", description: "Your scan is scheduled every 7 days." })
        } catch (error: any) {
            toast({ title: "Could not schedule", description: error.message, variant: "destructive" })
        } finally {
            setIsScheduling(false)
        }
    };

    const handleCancelScan = async () => {
        if (!isPlusOrPro) {
            toast({
                title: "Upgrade required",
                description: "Weekly monitoring is available on the Plus plan.",
                variant: "destructive"
            })
            return
        }
        if (!siteId) return

        setIsCancelling(true)
        try {
            const response = await fetch('/api/cancel-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ site_id: siteId })
            })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(data.detail || data.error || "Failed to cancel monitoring")
            }
            setHasPendingScan(false)
            setNextScheduledFor(null)
            toast({ title: "Weekly monitoring disabled", description: "Recurring scans are now turned off." })
        } catch (error: any) {
            toast({ title: "Could not cancel", description: error.message, variant: "destructive" })
        } finally {
            setIsCancelling(false)
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {viewMode === 'simple' ? (
                <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-2">
                    <div className="rounded-2xl border border-[#d9e8df] bg-gradient-to-br from-white via-white to-emerald-50/40 shadow-sm px-6 py-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-3xl font-serif text-[#224034] leading-tight">Overview Breakdown</h2>
                                <p className="text-slate-500 text-sm mt-1">Step-based summary of where AI visibility is strong and what to fix first.</p>
                            </div>
                            <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 px-3 py-1">
                                Step {overviewStep + 1} of {simpleOverviewSteps.length}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
                        {simpleOverviewSteps.map((step, idx) => (
                            <button
                                key={step.key}
                                onClick={() => setOverviewStep(idx)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${overviewStep === idx ? 'bg-[#224034] text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                            >
                                <span className="opacity-80 text-xs">{idx + 1}</span>
                                <span>{step.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* 1. The Verdict */}
                    {overviewStep === 0 && (
                    <div className="bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
                        <div className="shrink-0 relative z-10 w-48 h-48 flex items-center justify-center">
                            <svg
                                viewBox="0 0 220 220"
                                className="absolute inset-0 w-full h-full -rotate-90"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="110"
                                    cy="110"
                                    r={scoreRingRadius}
                                    fill="none"
                                    stroke="#d1fae5"
                                    strokeWidth="16"
                                />
                                <circle
                                    cx="110"
                                    cy="110"
                                    r={scoreRingRadius}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeLinecap="round"
                                    strokeWidth="16"
                                    strokeDasharray={scoreRingCircumference}
                                    strokeDashoffset={scoreRingOffset}
                                    style={{ transition: "stroke-dashoffset 900ms ease-out" }}
                                />
                            </svg>
                            <div className="flex flex-col items-center justify-center w-40 h-40 rounded-full bg-white shadow-[inset_0_2px_16px_rgba(16,185,129,0.08)] border border-emerald-100">
                                <span className="text-7xl font-serif font-medium text-[#224034]">{aeoScore}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">AEO Score</span>
                            </div>
                        </div>
                        <div className="flex-1 relative z-10 w-full">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <h2 className="text-3xl font-serif text-slate-800">Here's how AI sees you.</h2>
                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${verdictBadgeClass}`}>
                                    {verdictLabel}
                                </span>
                            </div>
                            <p className="text-lg text-slate-600 leading-relaxed mb-5 w-full">
                                {aeoScore > 80 
                                    ? `Great news! ${brandName} is highly visible. AI engines can easily read your site and are likely to recommend you.`
                                    : aeoScore > 50
                                    ? `${brandName} is somewhat visible to AI. Engines can read your site, but they might struggle to find your best answers quickly.`
                                    : `AI engines are struggling to understand ${brandName}. Your site needs structural changes before they will confidently recommend you.`}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {strongestEngine && (
                                    <div className="inline-flex items-center gap-2 rounded-lg bg-white border border-emerald-100 px-3 py-1.5 text-xs text-slate-600">
                                        <Image src={strongestEngine.logo} alt={strongestEngine.label} width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                                        Best: <span className="font-semibold text-slate-800">{strongestEngine.label} {strongestEngine.score}/100</span>
                                    </div>
                                )}
                                {weakestEngine && (
                                    <div className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
                                        <Image src={weakestEngine.logo} alt={weakestEngine.label} width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                                        Lowest: <span className="font-semibold text-slate-800">{weakestEngine.label} {weakestEngine.score}/100</span>
                                    </div>
                                )}
                                <div className="inline-flex items-center rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
                                    Missing answers: <span className="font-semibold text-slate-800 ml-1">{missingAnswersCount}</span>
                                </div>
                            </div>
                            
                            <div className="bg-emerald-50/60 rounded-xl p-6 border border-emerald-100 relative w-full shadow-sm">
                                <div className="absolute -top-3 left-6 bg-white px-3 py-0.5 rounded-full border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-widest shadow-sm">AI Visibility Summary</div>
                                <div className="flex items-start">
                                    <div className="text-sm text-slate-700 leading-relaxed font-medium">
                                        {hasMeaningfulAiPreview ? (
                                            aiPreviewResponse
                                        ) : (
                                            <div className="space-y-2">
                                                {generatedAiPreviewLines.map((line, index) => (
                                                    <div key={`preview-line-${index}`} className="flex items-start gap-2">
                                                        {line.logo ? (
                                                            <Image
                                                                src={line.logo}
                                                                alt={`${line.label || "Engine"} logo`}
                                                                width={16}
                                                                height={16}
                                                                className="w-4 h-4 object-contain mt-0.5 shrink-0"
                                                            />
                                                        ) : (
                                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                        )}
                                                        <span>{line.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* 2. Engine Visibility Buckets */}
                    {overviewStep === 1 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
                        <h3 className="text-2xl font-serif text-slate-800 mb-6">Which AIs are recommending you?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Strong */}
                            <div className="rounded-xl bg-emerald-50/30 border border-emerald-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <h4 className="font-semibold text-emerald-900 text-lg">Strong</h4>
                                </div>
                                <div className="space-y-3">
                                    {engineRows.filter(e => e.score >= 80).map(engine => (
                                        <div key={engine.key} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-emerald-50/50 hover:border-emerald-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Image src={engine.logo} alt={engine.label} width={24} height={24} className="w-6 h-6 object-contain drop-shadow-sm" />
                                                <span className="text-sm font-semibold text-slate-700">{engine.label}</span>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{engine.score}</span>
                                        </div>
                                    ))}
                                    {engineRows.filter(e => e.score >= 80).length === 0 && <p className="text-sm text-slate-500 italic px-2">No engines in this tier yet.</p>}
                                </div>
                            </div>

                            {/* Moderate */}
                            <div className="rounded-xl bg-amber-50/30 border border-amber-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                                    </div>
                                    <h4 className="font-semibold text-amber-900 text-lg">Moderate</h4>
                                </div>
                                <div className="space-y-3">
                                    {engineRows.filter(e => e.score >= 50 && e.score < 80).map(engine => (
                                        <div key={engine.key} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-amber-50/50 hover:border-amber-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Image src={engine.logo} alt={engine.label} width={24} height={24} className="w-6 h-6 object-contain drop-shadow-sm" />
                                                <span className="text-sm font-semibold text-slate-700">{engine.label}</span>
                                            </div>
                                            <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{engine.score}</span>
                                        </div>
                                    ))}
                                    {engineRows.filter(e => e.score >= 50 && e.score < 80).length === 0 && <p className="text-sm text-slate-500 italic px-2">No engines in this tier.</p>}
                                </div>
                            </div>

                            {/* Needs Work */}
                            <div className="rounded-xl bg-rose-50/30 border border-rose-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200">
                                        <AlertCircle className="w-4 h-4 text-rose-600" />
                                    </div>
                                    <h4 className="font-semibold text-rose-900 text-lg">Needs Work</h4>
                                </div>
                                <div className="space-y-3">
                                    {engineRows.filter(e => e.score < 50).map(engine => (
                                        <div key={engine.key} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-rose-50/50 hover:border-rose-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Image src={engine.logo} alt={engine.label} width={24} height={24} className="w-6 h-6 object-contain drop-shadow-sm" />
                                                <span className="text-sm font-semibold text-slate-700">{engine.label}</span>
                                            </div>
                                            <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{engine.score}</span>
                                        </div>
                                    ))}
                                    {engineRows.filter(e => e.score < 50).length === 0 && <p className="text-sm text-slate-500 italic px-2">No engines in this tier. Great job!</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* 3. Plain English Action Items */}
                    {overviewStep === 2 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
                        <h3 className="text-2xl font-serif text-slate-800 mb-8">What should you fix?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {techScore < 80 && (
                                <div className="flex gap-5 items-start bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                        <Code className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">Make it easier for AI to read your site.</h4>
                                        <p className="text-sm text-slate-600 mt-2 mb-4 leading-relaxed">AI engines are having trouble scanning your website code. You need to add specific "maps" (like Robots.txt or LLMs.txt) that tell AI where to look.</p>
                                        <button onClick={() => setActiveTab('technical')} className="text-sm font-bold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2">Fix Technical Issues <ChevronRight className="w-4 h-4 opacity-50" /></button>
                                    </div>
                                </div>
                            )}
                            {activeReport.agentEconomics?.codeToTextRatio < 0.15 && (
                                <div className="flex gap-5 items-start bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                        <Cpu className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">Make your website load faster.</h4>
                                        <p className="text-sm text-slate-600 mt-2 mb-4 leading-relaxed">Your website has too much background code. AI engines might give up and leave before they read your actual content.</p>
                                        <Link href={`/dashboard/sites/${siteId}/payload-efficiency`} className="text-sm font-bold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2">Check Website Speed <ChevronRight className="w-4 h-4 opacity-50" /></Link>
                                    </div>
                                </div>
                            )}
                            {failedQueries.length > 0 && failedQueries.some((q: any) => q.status !== 'Explicitly Stated') && (
                                <div className="flex gap-5 items-start bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                        <Search className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">Answer the questions people are asking.</h4>
                                        <p className="text-sm text-slate-600 mt-2 mb-4 leading-relaxed">Users are asking questions about your business, but your website doesn't explicitly answer them. We found {failedQueries.filter((q: any) => q.status !== 'Explicitly Stated').length} missing answers.</p>
                                        <button onClick={() => setActiveTab('content')} className="text-sm font-bold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2">See Missing Answers <ChevronRight className="w-4 h-4 opacity-50" /></button>
                                    </div>
                                </div>
                            )}
                            {techScore >= 80 && failedQueries.every((q: any) => q.status === 'Explicitly Stated') && activeReport.agentEconomics?.codeToTextRatio >= 0.15 && (
                                <div className="col-span-2 text-center py-12 bg-emerald-50/30 rounded-xl border border-emerald-100">
                                    <div className="w-20 h-20 bg-white shadow-sm border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <Check className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h4 className="text-2xl font-serif text-emerald-900 mb-2">Everything looks great!</h4>
                                    <p className="text-emerald-700/80">Your site is fast, easy to read, and answers user questions well.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-1">
                        <button
                            onClick={() => setOverviewStep((prev) => Math.max(0, prev - 1))}
                            disabled={overviewStep === 0}
                            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setOverviewStep((prev) => Math.min(simpleOverviewSteps.length - 1, prev + 1))}
                            disabled={overviewStep === simpleOverviewSteps.length - 1}
                            className="px-5 py-3 rounded-xl bg-[#224034] text-white font-semibold hover:bg-[#1a3228] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next Step <ChevronRight className="w-4 h-4 inline-block ml-1" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* KPI 0: Deep Scan Monitoring */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden md:col-span-1">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-emerald-50 rounded-lg text-[#224034]">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monitoring</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Automatic weekly deep scans to track your progress.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {!isPlusOrPro && <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">PLUS</Badge>}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${hasPendingScan ? 'text-emerald-700' : 'text-slate-600'}`}>
                                    {hasPendingScan ? "Active" : "Inactive"}
                                </span>
                                <button
                                    onClick={() => hasPendingScan ? handleCancelScan() : handleScheduleScan()}
                                    disabled={isScheduling || isCancelling}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 
                                ${hasPendingScan ? 'bg-emerald-500' : (!isPlusOrPro ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-200')} 
                                ${(isScheduling || isCancelling) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span className={`${hasPendingScan ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm`} />
                                </button>
                            </div>
                            {hasPendingScan && nextScheduledFor && (
                                <p className="text-[10px] text-slate-500">
                                    Next run: {new Date(nextScheduledFor).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* KPI 1: Share of Voice (Competitor Widget) */}
                <div
                    onClick={(e) => {
                        if (!isPro && siteId) {
                            e.preventDefault();
                            toast({
                                title: "Upgrade required",
                                description: "Competitor analysis is available on the Pro plan.",
                            })
                        }
                    }}
                    className="h-full md:col-span-1"
                >
                    <Link href={isPro && siteId ? `/dashboard/sites/${siteId}/share-of-voice` : '#'} className={`block h-full ${!isPro ? 'cursor-default' : ''}`}>
                        <div className="bg-white p-5 h-full rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 hover:shadow-md transition-all">
                            {!isPro && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge className="bg-[#1A4036] hover:bg-[#224034]">Upgrade to Unlock</Badge>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-emerald-50 rounded-lg text-[#224034]">
                                    <BarChart3 className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Share of Voice</span>
                                {!isPro && <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">PRO</Badge>}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3 h-3 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Percentage of AI responses where your brand is cited vs competitors.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="space-y-3 relative z-10">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-emerald-700">You</span>
                                        <span className="font-medium text-slate-600">12%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: '12%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-500">Competitors</span>
                                        <span className="font-medium text-slate-600">60%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-300" style={{ width: '60%' }} />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <BarChart3 className="w-16 h-16 text-[#224034]" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* KPI 2: Content Gap */}
                <div
                    onClick={(e) => {
                        if (!isPlusOrPro && siteId) {
                            e.preventDefault();
                            toast({
                                title: "Upgrade required",
                                description: "AI content gap detection is available on Plus and Pro plans.",
                            })
                        }
                    }}
                    className="md:col-span-1"
                >
                    <Link href={isPlusOrPro && siteId ? `/dashboard/sites/${siteId}/answer-rate` : '#'} className={`block h-full ${!isPlusOrPro ? 'cursor-default' : ''}`}>
                        <div className="bg-white p-5 h-full rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 hover:shadow-md transition-all">
                            {!isPlusOrPro && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge className="bg-[#1A4036] hover:bg-[#224034]">Upgrade to Unlock</Badge>
                                </div>
                            )}
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText className="w-16 h-16 text-[#224034]" />
                            </div>
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className="p-2 bg-emerald-50 rounded-lg text-[#224034]">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Answer Rate</span>
                                {!isPlusOrPro && <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">PLUS</Badge>}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3 h-3 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">How many user questions your content directly answers.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="text-3xl font-serif font-medium text-slate-800">
                                    {failedQueries.length > 0 && Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / failedQueries.length) * 100) > 0 ?
                                        Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / failedQueries.length) * 100) + '%' :
                                        '0%'
                                    }
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length} / {failedQueries.length} Questions Answered
                                </p>
                                <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{
                                        width: (failedQueries.length > 0 && Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / failedQueries.length) * 100) > 0) ?
                                            (Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / failedQueries.length) * 100)) + '%' :
                                            '0%'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* KPI 3: Hallucination Risk */}
                <div
                    onClick={(e) => {
                        if (!isPro && siteId) {
                            e.preventDefault();
                            toast({
                                title: "Upgrade required",
                                description: "E-E-A-T authority scoring is available on the Pro plan.",
                            })
                        }
                    }}
                    className="md:col-span-1"
                >
                    <Link href={isPro && siteId ? `/dashboard/sites/${siteId}/hallucination-risk` : '#'} className={`block h-full ${!isPro ? 'cursor-default' : ''}`}>
                        <div className="bg-white p-5 h-full rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#224034]/30 hover:shadow-md transition-all">
                            {!isPro && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge className="bg-[#1A4036] hover:bg-[#224034]">Upgrade to Unlock</Badge>
                                </div>
                            )}
                            <div className="absolute top-4 right-4 w-16 h-16 opacity-20">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {/* Background Circle */}
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="4" />
                                    {/* Progress Circle */}
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${hallucinationLevel === 'High' ? '25' : '95'}, 100`} className={hallucinationLevel === 'High' ? 'text-red-600' : 'text-emerald-600'} />
                                </svg>
                            </div>
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className={`p-2 rounded-lg ${hallucinationLevel === 'High' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safety Score</span>
                                {!isPro && <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">PRO</Badge>}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3 h-3 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Risk of AI models hallucinating when citing your content.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative z-10">
                                <div className={`text-3xl font-serif font-medium ${hallucinationLevel === 'High' ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {hallucinationLevel === 'High' ? 'High Risk' : 'Safe'}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Hallucination Probability</p>
                                <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${hallucinationLevel === 'High' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: hallucinationLevel === 'High' ? '25%' : '90%' }} />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Left Column: Priority Actions & Score Breakdown */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Priority Action Plan */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h3 className="text-md font-bold text-slate-800">Priority Recommendations</h3>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100">High Impact</Badge>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {/* Action 1: Technical */}
                            {techScore < 80 && (
                                <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                            <Code className="w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Improve Technical Foundation</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                            Your technical score is low ({techScore}/100). Check your <strong>Robots.txt</strong> and <strong>Sitemap</strong> to ensure agents can crawl your site.
                                        </p>
                                        <button onClick={() => setActiveTab('technical')} className="text-xs text-blue-600 font-medium mt-2 hover:underline">View Technical Fixes →</button>
                                    </div>
                                </div>
                            )}

                            {/* Action 1.5: Payload Efficiency Check */}
                            {activeReport.agentEconomics?.codeToTextRatio < 0.15 && (
                                <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                            <Cpu className="w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Code Bloat Detected</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                            Your site has a low signal-to-noise ratio. AEO Agents may time out or truncate your content.
                                        </p>
                                        <Link href={`/dashboard/sites/${siteId}/payload-efficiency`} className="text-xs text-blue-600 font-medium mt-2 hover:underline">
                                            View Payload Efficiency →
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Action 2: Content Gaps */}
                            {failedQueries.length > 0 && failedQueries.some((q: any) => q.status !== 'Explicitly Stated') && (
                                <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                            <Search className="w-4 h-4 text-amber-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Answer Missing Questions</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                            Users are asking questions your content doesn't explicitly answer. We found <strong>{failedQueries.filter((q: any) => q.status !== 'Explicitly Stated').length} content gaps</strong>.
                                        </p>
                                        <button onClick={() => setActiveTab('content')} className="text-xs text-blue-600 font-medium mt-2 hover:underline">View Content Gaps →</button>
                                    </div>
                                </div>
                            )}

                            {/* Action 3: Hallucination */}
                            {isPro && hallucinationLevel === 'High' && (
                                <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Reduce Hallucination Risk</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                            Your content structure may cause AI models to hallucinate. Add more explicit entities and citations.
                                        </p>
                                        <button onClick={() => setActiveTab('authority')} className="text-xs text-blue-600 font-medium mt-2 hover:underline">View Trust Analysis →</button>
                                    </div>
                                </div>
                            )}

                            {!isPro && (
                                <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                            <AlertCircle className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Authority Signals Locked</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                            Paid upgrades are hidden in this build.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Fallback if everything is good */}
                            {techScore >= 80 && failedQueries.every((q: any) => q.status === 'Explicitly Stated') && (
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Check className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h4 className="text-slate-800 font-medium">Great job! No critical issues found.</h4>
                                    <p className="text-slate-500 text-sm mt-1">Focus on optimizing your Knowledge Graph for even better results.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Score Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Technical</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-2xl font-serif font-medium text-slate-700">{techScore}</span>
                                <span className="text-xs text-slate-400 mb-1">/ 100</span>
                            </div>
                            <Progress value={techScore} className="h-1.5" indicatorClassName={techScore > 80 ? "bg-emerald-500" : techScore > 50 ? "bg-amber-400" : "bg-red-400"} />
                            <Link href={`/dashboard/sites/${siteId}/payload-efficiency`} className="text-[10px] text-slate-400 mt-3 flex items-center gap-1 hover:text-emerald-600 transition-colors group">
                                <Cpu className="w-3 h-3 group-hover:text-emerald-500" />
                                Check Payload Efficiency
                            </Link>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Content</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-2xl font-serif font-medium text-slate-700">{contentScore}</span>
                                <span className="text-xs text-slate-400 mb-1">/ 100</span>
                            </div>
                            <Progress value={contentScore} className="h-1.5" indicatorClassName={contentScore > 80 ? "bg-emerald-500" : contentScore > 50 ? "bg-amber-400" : "bg-red-400"} />
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Authority</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-2xl font-serif font-medium text-slate-700">{typeof activeReport.scores.authority === 'number' ? activeReport.scores.authority : '0'}</span>
                                <span className="text-xs text-slate-400 mb-1">/ 100</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${activeReport.scores.authority && activeReport.scores.authority > 80 ? 'bg-emerald-500' : (activeReport.scores.authority && activeReport.scores.authority > 50 ? 'bg-amber-400' : 'bg-red-400')}`} style={{ width: `${activeReport.scores.authority || 0}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Right Column: Executive Summary Text */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Simulated SERP Preview */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 overflow-hidden w-full">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-medium text-slate-400 ml-2">AI Search Preview</span>
                        </div>
                        <div className="space-y-4">
                            {/* User Query */}
                            <div className="flex gap-2 justify-end">
                                <div className="bg-slate-100 text-slate-700 text-xs py-2 px-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                                    {generatedAiPreviewQuery}
                                </div>
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-slate-500">U</span>
                                </div>
                            </div>
                            {/* AI Response */}
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                </div>
                                <div className="bg-emerald-50/50 border border-emerald-100 text-slate-700 text-xs py-2.5 px-3 rounded-2xl rounded-tl-sm max-w-[90%] leading-relaxed shadow-sm">
                                    {hasMeaningfulAiPreview ? (
                                        aiPreviewResponse
                                    ) : (
                                        <div className="space-y-1.5">
                                            {generatedAiPreviewLines.map((line, index) => (
                                                <div key={`chat-preview-line-${index}`} className="flex items-start gap-1.5">
                                                    {line.logo ? (
                                                        <Image
                                                            src={line.logo}
                                                            alt={`${line.label || "Engine"} logo`}
                                                            width={12}
                                                            height={12}
                                                            className="w-3 h-3 object-contain mt-0.5 shrink-0"
                                                        />
                                                    ) : (
                                                        <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                                                    )}
                                                    <span>{line.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1A4036]/95 backdrop-blur-xl border border-white/10 text-white rounded-xl p-6 grow shadow-2xl relative overflow-hidden w-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 shadow-inner">
                                    <Sparkles className="w-5 h-5 text-emerald-300" />
                                </div>
                                <h3 className="font-serif text-xl tracking-wide text-white">AEO Analysis</h3>
                            </div>

                            <div className="space-y-4 grow">
                                <p className="text-emerald-100/90 text-sm leading-relaxed">
                                    Based on our scan, <strong>{activeReport.technical.sitemap ? "your site is crawlable" : "crawlers may struggle to find your content"}</strong>.
                                </p>
                                <p className="text-emerald-100/90 text-sm leading-relaxed">
                                    We found <strong>{((knowledgeGraph as any).primaryEntity || (knowledgeGraph as any).primary_entity) ? `a clear primary entity ("${(knowledgeGraph as any).primaryEntity || (knowledgeGraph as any).primary_entity}")` : "no clear primary entity"}</strong>, which {((knowledgeGraph as any).primaryEntity || (knowledgeGraph as any).primary_entity) ? "helps" : "hurts"} AI understanding.
                                </p>
                                <div className="p-4 bg-black/20 rounded-lg border border-white/5 mt-4">
                                    <p className="text-xs text-emerald-400 uppercase font-bold mb-2 tracking-wider">AI Perspective</p>
                                    <p className="italic text-emerald-50 text-sm">
                                        "{aeoScore > 80 ? "I trust this source. The content is structured, data-rich, and directly answers user queries." : "I am hesitant to cite this source. The information is unstructured or harder to verify against my knowledge base."}"
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-emerald-400 uppercase">Overall Score</p>
                                        <p className="text-4xl font-serif mt-1">{aeoScore}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-emerald-300">Last Scan</p>
                                        <p className="text-sm font-medium text-white/90">Just now</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm py-6 md:py-8">
                    <div className="mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-8">
                        <div className="mb-6 md:mb-0 max-w-sm">
                            <h3 className="text-xl font-serif text-slate-800">Search Engine View</h3>
                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                AI models don't crawl like Google. Here is how easily major agents can read, understand, and quote {reportDomain || "your site"}.
                            </p>
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Click card for AEO/GEO details</p>
                        </div>
                        <div
                            className="relative flex w-full md:w-[65%] overflow-hidden"
                            onMouseEnter={() => setIsSearchSliderPaused(true)}
                            onMouseLeave={() => setIsSearchSliderPaused(false)}
                        >
                            <div
                                className="flex w-max items-center"
                                style={{
                                    animation: `searchAiMarquee 40s linear infinite`,
                                    animationPlayState: isSearchSliderPaused ? "paused" : "running",
                                }}
                            >
                                {[...engineRows, ...engineRows].map((engine, i) => (
                                    <button
                                        key={`marquee-${engine.key}-${i}`}
                                        type="button"
                                        onClick={() => setSelectedEngineKey(engine.key)}
                                        className="mx-2 w-64 shrink-0 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 text-left p-4 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src={engine.logo}
                                                alt={`${engine.label} logo`}
                                                width={18}
                                                height={18}
                                                className="w-[18px] h-[18px] object-contain"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{engine.label}</p>
                                                <p className="text-[11px] text-slate-500">{engine.model}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-end gap-1">
                                            <span className="text-2xl font-semibold text-[#224034]">{engine.score}</span>
                                            <span className="text-xs text-slate-400 mb-1">/100</span>
                                        </div>
                                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${engine.score}%` }} />
                                        </div>
                                        <p className="mt-3 text-[10px] uppercase tracking-wider text-red-500 font-semibold">Core Issue</p>
                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                                            {engineIssueByKey[engine.key]}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                    @keyframes searchAiMarquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    `}</style>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 lg:col-span-1">
                        <h3 className="text-lg font-semibold text-slate-800">Daily Analytics</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Visibility, sentiment, and mention-rate trend.
                        </p>
                        <div className="mt-4 h-40 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-end gap-1.5">
                            {dailySeries.map((value, index) => (
                                <div
                                    key={`daily-${index}`}
                                    className="flex-1 rounded-t bg-sky-400/80"
                                    style={{ height: `${Math.max(10, value)}%` }}
                                />
                            ))}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                                <p className="text-slate-500">Mention Rate</p>
                                <p className="font-semibold text-slate-800">
                                    {activePrompt ? activePrompt.mentionRate : 0}%
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                                <p className="text-slate-500">Sentiment</p>
                                <p className="font-semibold text-slate-800">{sentimentScore}/100</p>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-slate-800">Engine Visibility Details</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Model-level awareness check and confidence indicators.
                        </p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="pb-2 pr-3">Name</th>
                                        <th className="pb-2 pr-3">Model</th>
                                        <th className="pb-2 pr-3">Search Access</th>
                                        <th className="pb-2 text-right">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {engineRows.map((engine) => (
                                        <tr key={`presence-${engine.key}`} className="border-t border-slate-100">
                                            <td className="py-2 pr-3">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <Image
                                                        src={engine.logo}
                                                        alt={`${engine.label} logo`}
                                                        width={16}
                                                        height={16}
                                                        className="w-4 h-4 object-contain"
                                                    />
                                                    {engine.label}
                                                </div>
                                            </td>
                                            <td className="py-2 pr-3 text-slate-600">{engine.model}</td>
                                            <td className="py-2 pr-3 text-slate-600">Yes</td>
                                            <td className="py-2 text-right font-semibold text-slate-800">
                                                {engine.score}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Strategy Review</h3>
                            <span className="text-lg font-bold text-slate-700">{strategyScore}</span>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
                                    <span>Answerability</span>
                                    <span className="font-semibold">{answerability}</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-amber-400"
                                        style={{ width: `${answerability}%` }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="flex items-center justify-between mb-2 text-sm text-slate-600">
                                    <span>Web Presence</span>
                                    <span className="font-semibold">{webPresence}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700">LinkedIn</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{linkedinScore}</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                                                <Youtube className="h-3.5 w-3.5 text-red-600" />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700">YouTube</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{youtubeScore}</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center">
                                                <MessageSquare className="h-3.5 w-3.5 text-violet-600" />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700">Industry Forums</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{forumScore}</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                                                <Image
                                                    src="/logos/reddit-logo.svg"
                                                    alt="Reddit logo"
                                                    width={14}
                                                    height={14}
                                                    className="h-3.5 w-3.5"
                                                />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700">Reddit</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{redditPresenceScore}</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Image
                                                    src="/logos/wikipedia-logo.svg"
                                                    alt="Wikipedia logo"
                                                    width={14}
                                                    height={14}
                                                    className="h-3.5 w-3.5"
                                                />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700">Wikipedia</span>
                                        </div>
                                        {wikipediaDetected ? (
                                            <span className="h-6 w-6 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center">
                                                <Check className="h-4 w-4 text-emerald-600" />
                                            </span>
                                        ) : (
                                            <span className="h-6 w-6 rounded-full border border-rose-200 bg-rose-50 flex items-center justify-center">
                                                <XCircle className="h-4 w-4 text-rose-500" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
                                    <span>Structured Data</span>
                                    <span className="font-semibold">{structuredData}</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-amber-400"
                                        style={{ width: `${structuredData}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
                                    <span>AI Crawler Accessibility</span>
                                    <span className="font-semibold">{crawlerAccessibility}</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-amber-400"
                                        style={{ width: `${crawlerAccessibility}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </article>
                    <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Top Recommendations</h3>
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="space-y-3 flex-1">
                            {engineRows.filter(e => e.score < 80).slice(0, 3).map((engine) => (
                                <div key={engine.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Image src={engine.logo} alt={`${engine.label} logo`} width={14} height={14} className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold text-slate-700">{engine.label} Optimization</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-snug">{engineIssueByKey[engine.key]}</p>
                                </div>
                            ))}
                            {engineRows.filter(e => e.score < 80).length === 0 && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                                    <Check className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-emerald-700">All engines are highly optimized!</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 text-right">
                            <button onClick={() => setActiveTab('technical')} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                View full technical checklist →
                            </button>
                        </div>
                    </article>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-600">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Simulated AI Responses</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Predicted model behavior based on your current knowledge graph and authority signals.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-2 lg:border-r border-slate-100 lg:pr-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 pl-2">Test Queries</p>
                            {promptBundles.map((item, index) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActivePromptIndex(index)}
                                    className={`w-full text-left rounded-xl px-4 py-3 transition-all ${index === activePromptIndex
                                            ? "bg-slate-50 border border-slate-200 shadow-sm"
                                            : "bg-transparent border border-transparent hover:bg-slate-50/50"
                                        }`}
                                >
                                    <p className={`text-sm leading-relaxed ${index === activePromptIndex ? "text-slate-800 font-semibold" : "text-slate-600"}`}>
                                        "{item.prompt}"
                                    </p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mention Rate</span>
                                        <span className={`text-xs font-bold ${index === activePromptIndex ? "text-indigo-600" : "text-slate-500"}`}>{item.mentionRate}%</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex gap-3 justify-end items-start mb-8 pb-6 border-b border-slate-100">
                                <div className="bg-[#224034] text-white text-sm py-3 px-4 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm leading-relaxed">
                                    {activePrompt?.prompt}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                    <span className="text-xs font-bold text-slate-600">U</span>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {(activePrompt?.responses || []).map((entry) => (
                                    <div key={`${activePrompt?.id}-${entry.engineKey}`} className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                            <Image
                                                src={
                                                    ENGINE_META.find((engine) => engine.key === entry.engineKey)?.logo ||
                                                    "/logos/chatgpt-logo.png"
                                                }
                                                alt={`${entry.engineLabel} logo`}
                                                width={16}
                                                height={16}
                                                className="w-4 h-4 object-contain"
                                            />
                                        </div>
                                        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl rounded-tl-sm p-4 flex-1 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-baseline gap-2">
                                                    <h4 className="font-semibold text-slate-800 text-sm">{entry.engineLabel}</h4>
                                                    <span className="text-[10px] font-medium text-slate-400">{entry.model}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-sm">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${entry.mentionRate > 50 ? 'bg-emerald-500' : entry.mentionRate > 20 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                    <span className="text-[10px] font-bold text-slate-600">{entry.mentionRate}% Match</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {entry.response}
                                            </p>
                                            <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60">
                                                {entry.mentions.slice(0, 6).map((mention) => (
                                                    <span
                                                        key={`${entry.engineKey}-${mention}`}
                                                        className="text-[10px] font-semibold tracking-wide rounded-md bg-white border border-slate-200 text-slate-600 px-2 py-1 shadow-sm"
                                                    >
                                                        {mention}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                open={Boolean(selectedEngine)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedEngineKey(null)
                        setIsSearchSliderPaused(false)
                    }
                }}
            >
                <DialogContent className="sm:max-w-4xl border border-slate-200 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif text-[#224034]">
                            {selectedEngine?.label} Visibility Breakdown
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <p className="text-base text-slate-600">
                            {selectedEngine?.model} • Visibility estimate: {selectedEngine?.score || 0}/100
                        </p>
                        <p className="text-sm text-slate-500">
                            AEO means getting found by AI search. GEO means getting quoted correctly in AI answers.
                        </p>

                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="text-[11px] uppercase tracking-wider text-red-600 font-semibold">Current Issue</p>
                            <p className="text-sm text-slate-700 mt-1">
                                {selectedEngine ? engineIssueByKey[selectedEngine.key] : ""}
                            </p>
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">How This Engine Uses AEO</p>
                            <p className="text-sm text-slate-700 mt-1">
                                {selectedEngine ? ENGINE_AEO_COPY[selectedEngine.key] : ""}
                            </p>
                        </div>

                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <p className="text-[11px] uppercase tracking-wider text-blue-700 font-semibold">How This Engine Uses GEO</p>
                            <p className="text-sm text-slate-700 mt-1">
                                {selectedEngine ? ENGINE_GEO_COPY[selectedEngine.key] : ""}
                            </p>
                        </div>

                        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                            <p className="text-[11px] uppercase tracking-wider text-violet-700 font-semibold">
                                Example Fix for {(reportDomain || activeReport.domain || "your-site.com").toUpperCase()}
                            </p>
                            <p className="text-sm text-slate-700 mt-1">
                                {selectedEngine ? ENGINE_FIX_COPY[selectedEngine.key].exampleFix : ""}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Copy/Paste Example</p>
                            <pre className="mt-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 whitespace-pre-wrap break-words">
                                {selectedEngine ? ENGINE_FIX_COPY[selectedEngine.key].copyPaste : ""}
                            </pre>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
                </div>
            )}
        </div>
    )
}
