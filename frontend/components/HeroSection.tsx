"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback, type ReactNode, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Sparkles, AlertCircle, XCircle, Code, AlignLeft, Lock, Copy, Bot, ChevronLeft, ChevronRight } from "lucide-react"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"
import { analytics } from "@/lib/analytics"
import { requestAnalysis, saveCachedAnalysis } from "@/lib/analysis-client"

type AnalysisResult = {
    url: string
    total_score: number
    engine_scores?: {
        chatgpt: number
        claude: number
        gemini: number
        perplexity: number
        searchgpt: number
        meta: number
        mistral: number
        grok: number
        you: number
    }
    breakdown: {
        technical: {
            robots: { score: number; details: string[]; status?: string }
            llms: { score: number; details: string[]; status?: string }
            schema: { score: number; details: string[]; types?: string[] }
            https: { score: number; details: string[]; status?: string }
            sitemap: { score: number; details: string[]; status?: string }
        }
        content: {
            questions: { score: number; details: string[] }
            readability: { score: number; details: string[] }
            visual: { score: number; details: string[] }
            freshness: { score: number; details: string[] }
            word_count: { score: number; details: string[] }
            gap?: { score: number; details: string[] } // Optional
            geo?: { score: number; details: string[] } // Optional
        }
        authority: {
            eeat: { score: number; details: string[] }
        }
    }
}

type EngineCard = {
    name: string
    score: number
    desc: string
    icon: ReactNode
    fix: string
    aeoHow: string
    geoHow: string
    exampleFix: string
}

const PLATFORM_CAROUSEL = [
    { name: "ChatGPT", logo: "/logos/chatgpt-logo.png" },
    { name: "Claude", logo: "/logos/claude-logo.png" },
    { name: "Gemini", logo: "/logos/gemini-logo.png" },
    { name: "Perplexity", logo: "/logos/perplexity-logo.png" },
    { name: "Meta AI", logo: "/logos/meta-logo.webp" },
    { name: "Grok", logo: "/logos/grok-logo.svg" },
    { name: "Mistral", logo: "/logos/mistral-logo.png" },
    { name: "You.com", logo: "/logos/you-logo.png" },
]
const PLATFORM_CAROUSEL_LOOP = [...PLATFORM_CAROUSEL, ...PLATFORM_CAROUSEL]

function AIFixBox({ text }: { text: string }) {
    if (!text) return null;
    return (
        <div className="mt-3 bg-slate-950 rounded-xl p-4 border border-slate-800 relative overflow-hidden shadow-inner group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">AI Optimized Fix</p>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800 -mt-1 -mr-1"
                    onClick={() => navigator.clipboard.writeText(text)}
                >
                    <Copy className="h-3 w-3" />
                </Button>
            </div>
            <p className="text-emerald-50 font-medium font-mono text-xs leading-relaxed">
                {text}
            </p>
        </div>
    );
}

interface HeroSectionProps {
    initialUrl?: string
    autoAnalyze?: boolean
    analyzeMode?: "inline" | "redirect"
}

export function HeroSection({
    initialUrl = "",
    autoAnalyze = false,
    analyzeMode = "inline",
}: HeroSectionProps) {
    const router = useRouter()
    const hasAutoAnalyzedRef = useRef(false)
    const [url, setUrl] = useState(initialUrl)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)
    const [isEngineDialogOpen, setIsEngineDialogOpen] = useState(false)
    const [selectedEngineName, setSelectedEngineName] = useState<string | null>(null)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')

    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleAnalyze = useCallback(async (urlOverride?: string) => {
        const rawUrl = (urlOverride ?? url).trim()
        if (!rawUrl) {
            setError("Please enter a website URL.")
            return
        }

        // Auto-add https:// if missing protocol
        let targetUrl = rawUrl
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = `https://${targetUrl}`
        }

        try {
            new URL(targetUrl)
        } catch {
            setError("Please enter a valid URL.")
            setLoading(false)
            setScanStatus('idle')
            return
        }

        setUrl(targetUrl)
        setError("")

        setLoading(true)
        setScanStatus('scanning')
        setResult(null)

        // Track scan started
        analytics.trackScanStarted(targetUrl)

        try {
            const data = await requestAnalysis<AnalysisResult>(targetUrl)

            setScanStatus('complete')

            // Track scan completed
            analytics.trackScanCompleted(targetUrl, data.total_score)

            if (analyzeMode === "redirect") {
                saveCachedAnalysis(targetUrl, data)
                setTimeout(() => {
                    setLoading(false)
                    setScanStatus('idle')
                    router.push(`/insights?url=${encodeURIComponent(targetUrl)}`)
                }, 700)
                return
            }

            // Small delay to show complete state before showing results
            setTimeout(() => {
                setResult(data)
                setLoading(false)
                setScanStatus('idle')
            }, 1500)

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred."
            setError(errorMessage)
            setScanStatus('error')

            // Track scan failed
            analytics.trackScanFailed(targetUrl, errorMessage)

            // Don't close immediately on error so user can see it
            setTimeout(() => {
                setLoading(false)
                setScanStatus('idle')
            }, 3000)
        }
    }, [analyzeMode, router, url])

    useEffect(() => {
        if (!autoAnalyze || !initialUrl || hasAutoAnalyzedRef.current || analyzeMode !== "inline") {
            return
        }
        hasAutoAnalyzedRef.current = true
        void handleAnalyze(initialUrl)
    }, [autoAnalyze, initialUrl, analyzeMode, handleAnalyze])

    const handleHeroSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const submitted = new FormData(e.currentTarget).get("site_url")
        const submittedUrl = typeof submitted === "string" ? submitted : ""
        void handleAnalyze(submittedUrl)
    }, [handleAnalyze])

    const engineCards: EngineCard[] = result ? [
        {
            name: 'ChatGPT',
            score: result.engine_scores?.chatgpt ?? Math.min(100, (result.total_score || 0) + 2),
            desc: 'GPT-4o Search',
            icon: <Image src="/logos/chatgpt-logo.png" alt="ChatGPT logo" width={24} height={24} className="w-6 h-6 object-contain" />,
            fix: (result.breakdown?.content?.visual?.score || 100) < 100
                ? "Some images are missing alt text, so ChatGPT may miss what they show."
                : (result.breakdown?.content?.readability?.score || 100) < 80
                    ? "The writing is a bit hard to read. ChatGPT works better with simple wording."
                    : "Some answers are not direct enough. ChatGPT prefers clear, quick answers.",
            aeoHow: "AEO for ChatGPT means your page clearly answers a real question and looks trustworthy.",
            geoHow: "GEO means your wording is easy for AI to quote. Short paragraphs and clear headings help.",
            exampleFix: "On {site}, add a heading like 'What does this service do?' and answer it in 2-3 simple sentences."
        },
        {
            name: 'Gemini',
            score: result.engine_scores?.gemini ?? Math.min(100, Math.max(0, (result.total_score || 0) + 1)),
            desc: 'Google Gemini',
            icon: <Image src="/logos/gemini-logo.png" alt="Gemini logo" width={22} height={22} className="w-[22px] h-[22px] object-contain" />,
            fix: (result.breakdown?.technical?.robots?.status !== "valid")
                ? "Gemini may not be able to read your pages because robots.txt is blocking access."
                : (result.breakdown?.content?.word_count?.score || 100) < 100
                    ? "This page may be too short. Gemini usually needs more context."
                    : "Your page structure is unclear. Gemini prefers clear headings and sections.",
            aeoHow: "For Gemini, AEO means Google can crawl your page and understand what it is about.",
            geoHow: "For GEO, format content cleanly so Gemini can pull useful lines into AI answers.",
            exampleFix: "On {site}, add clear H2 headings and a short summary paragraph under each heading."
        },
        {
            name: 'Perplexity',
            score: result.engine_scores?.perplexity ?? Math.min(100, Math.max(0, (result.total_score || 0) - 3)),
            desc: 'Pro Search',
            icon: <Image src="/logos/perplexity-logo.png" alt="Perplexity logo" width={22} height={22} className="w-[22px] h-[22px] object-contain" />,
            fix: (result.breakdown?.content?.freshness?.score || 100) === 0
                ? "No publish date was found, so Perplexity may treat this as older content."
                : (result.breakdown?.technical?.schema?.score || 100) <= 50
                    ? "Perplexity may not fully understand your page because schema markup is missing."
                    : "There are not enough source links for Perplexity to trust this page.",
            aeoHow: "For Perplexity, AEO means your page is easy to verify with clear facts and sources.",
            geoHow: "For GEO, keep facts and source links close together so AI can quote both.",
            exampleFix: "On {site}, add a short 'Sources' section with 2-3 trusted links."
        },
        {
            name: 'Claude',
            score: result.engine_scores?.claude ?? Math.min(100, Math.max(0, (result.total_score || 0) - 1)),
            desc: 'Claude 3.5 Sonnet',
            icon: <Image src="/logos/claude-logo.png" alt="Claude logo" width={22} height={22} className="w-[22px] h-[22px] object-contain" />,
            fix: (result.breakdown?.content?.questions?.score || 0) < 50
                ? "Claude may struggle to find direct questions and answers on this page."
                : (result.breakdown?.content?.word_count?.score || 100) < 100
                    ? "The page may be too thin for Claude to explain with confidence."
                    : "Some sections are too dense. Claude works better with simpler structure.",
            aeoHow: "For Claude, AEO means a clear flow: question, answer, then proof.",
            geoHow: "For GEO, split long text into short sections Claude can summarize safely.",
            exampleFix: "On {site}, turn one long section into 3 short FAQ questions with direct answers."
        },
        {
            name: 'SearchGPT',
            score: result.engine_scores?.searchgpt ?? Math.min(100, (result.total_score || 0) + 1),
            desc: 'OpenAI Prototype',
            icon: <Image src="/logos/chatgpt-logo.png" alt="SearchGPT logo" width={24} height={24} className="w-6 h-6 object-contain" />,
            fix: "SearchGPT needs clearer page structure data before it can trust and cite this page.",
            aeoHow: "For SearchGPT, AEO means clear page purpose, trust signals, and direct answers.",
            geoHow: "For GEO, use short, exact statements that can be quoted without heavy rewriting.",
            exampleFix: "On {site}, add FAQ schema for one top customer question and answer."
        },
        {
            name: 'Meta AI',
            score: result.engine_scores?.meta ?? Math.min(100, (result.total_score || 0) - 2),
            desc: 'Llama 3 Web Search',
            icon: <Image src="/logos/meta-logo.webp" alt="Meta AI logo" width={22} height={22} className="w-[22px] h-[22px] object-contain" />,
            fix: "Some wording is complex, which can reduce how well Meta AI understands this page.",
            aeoHow: "For Meta AI, AEO means simple language and clear topic signals.",
            geoHow: "For GEO, keep each paragraph focused on one idea so AI can reuse it correctly.",
            exampleFix: "On {site}, rewrite one paragraph in plain language with one key point per sentence."
        },
        {
            name: 'Grok',
            score: result.engine_scores?.grok ?? Math.min(100, (result.total_score || 0) - 4),
            desc: 'xAI Search',
            icon: <Image src="/logos/grok-logo.svg" alt="Grok logo" width={22} height={22} className="w-[22px] h-[22px] object-contain" />,
            fix: "If crawler access is limited, Grok may miss important updates from your site.",
            aeoHow: "For Grok, AEO means your pages are easy to crawl and updated often.",
            geoHow: "For GEO, add fast, factual summaries near the top of the page.",
            exampleFix: "On {site}, add a 2-line 'Quick answer' summary at the top of your main page."
        },
        {
            name: 'Mistral',
            score: result.engine_scores?.mistral ?? Math.min(100, (result.total_score || 0) - 1),
            desc: 'Le Chat Search',
            icon: <Image src="/logos/mistral-logo.png" alt="Mistral logo" width={22} height={22} className="w-[22px] h-[22px] object-contain" />,
            fix: "Mistral may struggle if your headings and sections are unclear.",
            aeoHow: "For Mistral, AEO means clean structure with clear section names.",
            geoHow: "For GEO, use short sections with direct wording so AI can quote correctly.",
            exampleFix: "On {site}, rename vague headings like 'Overview' to specific ones like 'Pricing and Timeline'."
        },
        {
            name: 'You.com',
            score: result.engine_scores?.you ?? Math.min(100, (result.total_score || 0) + 1),
            desc: 'YouChat Search',
            icon: <Image src="/logos/you-logo.png" alt="You.com logo" width={22} height={22} className="w-[22px] h-[22px] object-contain" />,
            fix: "Add clear image descriptions and source links so You.com can trust and quote your page.",
            aeoHow: "For You.com, AEO means clear answers and clear proof of where the info came from.",
            geoHow: "For GEO, use short paragraphs, simple wording, and source links so AI quotes you accurately.",
            exampleFix: "On {site}, add alt text to one main image and cite a source under one key claim."
        },
    ] : []

    const selectedEngine = engineCards.find((engine) => engine.name === selectedEngineName)
    const siteLabel = (() => {
        const fallback = "your site"
        if (!result?.url) return fallback
        try {
            return new URL(result.url).hostname.replace(/^www\./, "")
        } catch {
            return result.url.replace(/^https?:\/\//, "")
        }
    })()
    const selectedEngineExample = selectedEngine?.exampleFix?.replace("{site}", siteLabel)
    const copyPasteExample = (() => {
        if (!selectedEngine) {
            return `<h2>What does ${siteLabel} offer?</h2>
<p>${siteLabel} helps customers with [service] using [main benefit].</p>`
        }

        switch (selectedEngine.name) {
            case "ChatGPT":
                return `<h2>What does ${siteLabel} offer?</h2>
<p>${siteLabel} provides [service] for [audience]. Most customers start in [timeframe].</p>`
            case "Gemini":
                return `<h2>Pricing and Timeline</h2>
<p>Plans start at [price]. Setup usually takes [timeline].</p>`
            case "Perplexity":
                return `<p><strong>Claim:</strong> [Insert key claim]</p>
<p>Source: <a href="[trusted-source-url]">Trusted source for this claim</a></p>`
            case "Claude":
                return `<h2>Frequently Asked Question</h2>
<p><strong>Q:</strong> How long does it take?</p>
<p><strong>A:</strong> Most customers are live within [timeframe].</p>`
            case "SearchGPT":
                return `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What does ${siteLabel} do?","acceptedAnswer":{"@type":"Answer","text":"${siteLabel} provides [service] for [audience]."}}]}
</script>`
            case "Meta AI":
                return `<p>Old: Our innovative integrated optimization architecture enables robust multi-channel outcomes.</p>
<p>New: We help businesses get more leads from AI search.</p>`
            case "Grok":
                return `<p><strong>Quick answer:</strong> ${siteLabel} helps [audience] do [result] in [timeframe].</p>`
            case "Mistral":
                return `<h2>Pricing and Timeline</h2>
<p>Plans start at [price]. Most projects begin within [timeline].</p>`
            case "You.com": {
                const altText = `${siteLabel} product or service shown in the main hero section`
                const claimText = "Add your key trust claim here."
                const sourceHref = result?.url || "https://example.com/source"
                const sourceLabel = "Source page that proves this claim"
                return `<img alt="${altText}" />
<p><strong>Claim:</strong> ${claimText}</p>
<p>Source: <a href="${sourceHref}">${sourceLabel}</a></p>`
            }
            default:
                return `<h2>What does ${siteLabel} offer?</h2>
<p>${siteLabel} helps customers with [service] using [main benefit].</p>`
        }
    })()
    const isResultView = Boolean(result && result.breakdown)

    return (
        <section className={`relative min-h-[90vh] flex flex-col items-center pt-40 pb-20 px-6 bg-[#e9f4ee] text-[#223f33] transition-all duration-700 overflow-hidden ${isResultView ? 'min-h-screen' : ''}`}>

            {/* Background Details */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-[#7dc9a7]/15 rounded-full blur-[120px] pointer-events-none -z-0" />
            <div className="absolute bottom-0 right-0 w-[640px] h-[640px] bg-[#8cd9b8]/15 rounded-full blur-[120px] pointer-events-none -z-0" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#6d7f7514_1px,transparent_1px),linear-gradient(to_bottom,#6d7f7514_1px,transparent_1px)] bg-[size:38px_38px] pointer-events-none -z-0" />

            {/* Top Banner Tag */}


            <div className={`z-10 w-full ${!result ? "max-w-6xl rounded-[32px] border border-[#d9e8df] bg-white/70 backdrop-blur-sm shadow-[0_24px_90px_rgba(30,64,48,0.12)] px-6 md:px-12 py-16 md:py-20 relative overflow-hidden" : "max-w-4xl text-center"}`}>
                {!result && (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#7f94891f_1px,transparent_1px)] bg-[size:160px_100%] pointer-events-none" />
                        <div className="absolute -left-24 top-24 w-64 h-64 bg-[#d5ebe0] rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute -right-16 top-20 w-64 h-64 bg-[#dff1e8] rounded-full blur-[90px] pointer-events-none" />
                    </>
                )}

                <div className={`relative ${!result ? "max-w-4xl mx-auto text-center space-y-6" : "space-y-6"}`}>
                    <p className="font-serif italic text-3xl md:text-5xl leading-tight text-[#2a4a3b]/90">
                        Fix Your AI Search Visibility
                    </p>
                    <h1 className="font-urbanist font-semibold text-[clamp(1.85rem,5.4vw,4.5rem)] leading-[1.05] tracking-tight text-[#1f2f2a] whitespace-nowrap">
                        When Your Customer Searches
                    </h1>
                    {!result && (
                        <div className="pt-2">
                            <div className="mx-auto max-w-5xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                                <div className="flex w-max gap-3 pb-2 px-1 animate-[platform-marquee_26s_linear_infinite]">
                                    {PLATFORM_CAROUSEL_LOOP.map((platform, index) => (
                                    <div
                                        key={`${platform.name}-${index}`}
                                        className="snap-start shrink-0 flex items-center gap-2.5 rounded-full border border-[#d6e6dd] bg-white/90 px-4 py-2 shadow-sm"
                                    >
                                        <Image
                                            src={platform.logo}
                                            alt={`${platform.name} logo`}
                                            width={18}
                                            height={18}
                                            className="w-[18px] h-[18px] object-contain"
                                        />
                                        <span className="text-sm font-medium text-[#2f4e40]">{platform.name}</span>
                                    </div>
                                    ))}
                                </div>
                            </div>
                            <style jsx>{`
                                @keyframes platform-marquee {
                                    0% { transform: translateX(0); }
                                    100% { transform: translateX(-50%); }
                                }
                            `}</style>
                        </div>
                    )}
                    <p className="text-lg md:text-2xl text-[#3f5f50] max-w-3xl mx-auto leading-relaxed">
                        Find what’s blocking your AI rankings and get exact fixes you can apply instantly.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-[#3f6252] font-medium mt-6">
                        <span className="px-3 py-1 rounded-full border border-[#cfe3d8] bg-white/80 transition-colors hover:bg-[#edf8f2]">ChatGPT SEO</span>
                        <span className="px-3 py-1 rounded-full border border-[#cfe3d8] bg-white/80 transition-colors hover:bg-[#edf8f2]">Perplexity Rankings</span>
                        <span className="px-3 py-1 rounded-full border border-[#cfe3d8] bg-white/80 transition-colors hover:bg-[#edf8f2]">Google Gemini SEO</span>
                    </div>

                    {/* Search Input Box - Refined */}
                    {!result && (
                        <div className="mt-12 w-full max-w-xl mx-auto animate-in fade-in zoom-in duration-500">
                            <form onSubmit={handleHeroSubmit} className="relative flex items-center bg-[#e8f1db] border border-[#d5e3ca] rounded-full p-1.5 shadow-sm">
                                <Input
                                    name="site_url"
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Enter your website URL"
                                    className="border-0 bg-transparent text-[#1f3a2f] placeholder:text-[#587565] focus-visible:ring-0 h-12 text-base px-5 flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#224034] hover:bg-[#1b332a] text-white h-11 px-7 rounded-full font-semibold text-sm tracking-wide whitespace-nowrap shadow-lg shadow-[#224034]/20 transition-all transform active:scale-95"
                                >
                                    {loading ? "Scanning..." : "Fix My AI Rankings"}
                                </Button>
                            </form>

                            <p className="mt-4 text-xs text-[#5e776a] text-center font-medium tracking-wide">
                                Instant Analysis • No Credit Card Required • Free for 14 Days
                            </p>
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                                <Link href="/aeo-checker-tool" className="text-xs text-[#2f6651] hover:text-[#224034] transition-colors underline-offset-4 hover:underline">
                                    View Sample Report
                                </Link>
                                <span className="text-[#9cb6aa]">•</span>
                                <Link href="/aeo-readiness" className="text-xs text-[#2f6651] hover:text-[#224034] transition-colors underline-offset-4 hover:underline">
                                    Learn AEO & GEO Readiness
                                </Link>
                                <span className="text-[#9cb6aa]">•</span>
                                <Link href="/aeo-monitoring" className="text-xs text-[#2f6651] hover:text-[#224034] transition-colors underline-offset-4 hover:underline">
                                    Learn AEO & GEO Monitoring
                                </Link>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-red-600 mt-4 text-sm bg-red-50 border border-red-200 p-2 rounded">{error}</p>}
                </div>
            </div>

            {/* Result Dashboard */}
            {/* Result Dashboard */}
            {result && result.breakdown && (
                <div className="w-full max-w-6xl mt-16 bg-[#F8F9FA] rounded-2xl p-6 md:p-10 shadow-2xl animate-in slide-in-from-bottom-20 duration-1000 text-slate-900">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 pb-8 border-b border-gray-100 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-4xl font-serif text-[#224034] tracking-tight">Audit Results</h2>
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 px-3 py-1 text-xs uppercase tracking-wider">
                                    Live Scan
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-500 text-lg font-medium">Target: <span className="text-slate-800">{result.url}</span></p>
                                <p className="text-slate-400 text-sm">Generated on {new Date().toLocaleDateString()} • AEO & GEO Monitor Engine v1.0</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Score Highline */}
                    <div className="mb-12">
                        <div className="bg-[#224034] text-white rounded-2xl p-8 md:p-10 text-center shadow-lg relative overflow-hidden max-w-4xl mx-auto">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8cd9b8]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">

                                {/* Total Score Section */}
                                <div className="text-center">
                                    <p className="text-emerald-200/80 font-medium uppercase tracking-widest text-xs mb-3">Overall AEO & GEO Readiness</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="text-7xl md:text-8xl font-serif tracking-tighter leading-none">
                                            {result.total_score || 0}
                                        </div>
                                        <div className="text-left space-y-1">
                                            <div className="text-xl font-light opacity-80">/ 100</div>
                                            <div className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded text-white shadow-sm backdrop-blur-sm">
                                                {result.total_score >= 80 ? 'Excellent' : result.total_score >= 50 ? 'Average' : 'Critical'}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-emerald-100/70 text-sm mt-3 max-w-[200px] mx-auto leading-relaxed">
                                        Combined score of Tech, Content, and Authority.
                                    </p>
                                </div>

                                {/* Divider (Desktop only) */}
                                <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

                                {/* E-E-A-T Section */}
                                <div className="text-center">
                                    <p className="text-emerald-200/80 font-medium uppercase tracking-widest text-xs mb-3">Authority / E-E-A-T</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="text-6xl md:text-7xl font-serif tracking-tighter leading-none">
                                            {result.breakdown?.authority?.eeat?.score || 0}
                                        </div>
                                        <div className="text-left space-y-1">
                                            <div className="text-lg font-light opacity-80">/ 100</div>
                                            <div className={`text-sm font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm ${(result.breakdown?.authority?.eeat?.score || 0) >= 80 ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-500/20 text-amber-100'
                                                }`}>
                                                {(result.breakdown?.authority?.eeat?.score || 0) >= 80 ? 'High' : (result.breakdown?.authority?.eeat?.score || 0) >= 50 ? 'Medium' : 'Low'}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-emerald-100/70 text-sm mt-3 max-w-[200px] mx-auto leading-relaxed">
                                        Trust signals detected by AI models.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Engine Specific Estimates */}
                    <div className="mb-12 relative group/carousel">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Bot className="w-6 h-6 text-emerald-600" />
                                <h3 className="font-serif text-2xl text-[#224034]">AI Engine Visibility Estimate</h3>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => scroll('left')}
                                    className="rounded-full border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all opacity-0 group-hover/carousel:opacity-100"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => scroll('right')}
                                    className="rounded-full border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all opacity-0 group-hover/carousel:opacity-100"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div 
                            ref={scrollRef}
                            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {engineCards.map((engine) => (
                                <button
                                    key={engine.name}
                                    type="button"
                                    onClick={() => {
                                        setSelectedEngineName(engine.name)
                                        setIsEngineDialogOpen(true)
                                    }}
                                    className="flex-none w-[280px] md:w-[320px] bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center justify-start relative overflow-hidden group hover:border-emerald-200 transition-all h-full snap-start text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                                >
                                    <div className="flex items-center gap-1 mb-1">
                                        <div className={`rounded-lg flex items-center justify-center ${(["ChatGPT", "Gemini", "Perplexity", "Claude", "SearchGPT", "Meta AI", "Grok", "Mistral", "You.com"].includes(engine.name)) ? "w-9 h-9 bg-transparent" : "w-8 h-8 bg-emerald-50 text-emerald-600"}`}>
                                            {engine.icon}
                                        </div>
                                        <div className="text-slate-800 font-bold text-lg">{engine.name}</div>
                                    </div>
                                    <div className="text-slate-400 text-xs mb-3">{engine.desc}</div>
                                    
                                    <div className="flex items-baseline gap-1 mt-auto">
                                        <span className={`text-3xl font-bold tracking-tighter ${engine.score >= 85 ? 'text-emerald-600' : engine.score >= 72 ? 'text-emerald-400' : engine.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{engine.score}</span>
                                        <span className="text-sm text-slate-400 font-medium">/ 100</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden shrink-0">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${engine.score >= 85 ? 'bg-emerald-500' : engine.score >= 72 ? 'bg-emerald-400' : engine.score >= 50 ? 'bg-amber-400' : 'bg-red-500'}`} 
                                            style={{ width: `${engine.score}%` }}
                                        ></div>
                                    </div>
                                    
                                    {engine.fix && engine.score < 95 && (
                                        <div className="mt-4 pt-3 border-t border-gray-100 w-full text-center shrink-0">
                                            <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Core Issue
                                            </div>
                                            <p className="text-xs text-slate-600 leading-tight">{engine.fix}</p>
                                        </div>
                                    )}
                                    <p className="mt-3 text-[11px] uppercase tracking-wider text-emerald-600 font-semibold">Click for AEO/GEO details</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3-Column Dashboard Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Column 1: Technical Readiness */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Code className="w-5 h-5 text-slate-400" />
                                <h3 className="font-serif text-xl text-[#224034]">Technical Readiness</h3>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                                {/* Robots */}
                                <div className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">Robots.txt</p>
                                            <p className="text-xs text-slate-500 mt-1">{result.breakdown?.technical?.robots?.details?.[0] || "N/A"}</p>
                                        </div>
                                        {(result.breakdown?.technical?.robots?.score || 0) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                    </div>
                                    {(result.breakdown?.technical?.robots?.score || 0) <= 50 && <AIFixBox text="Create a robots.txt file at your site root to control AI crawler access." />}
                                </div>
                                {/* LLMs */}
                                <div className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">LLMs.txt</p>
                                            <p className="text-xs text-slate-500 mt-1">{result.breakdown?.technical?.llms?.details?.[0] || "N/A"}</p>
                                        </div>
                                        {(result.breakdown?.technical?.llms?.score || 0) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                    </div>
                                    {(result.breakdown?.technical?.llms?.score || 0) <= 50 && <AIFixBox text="Create an /llms.txt file summarizing your core offerings for LLM agents." />}
                                </div>
                                {/* Schema */}
                                <div className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">Schema.org</p>
                                            <p className="text-xs text-slate-500 mt-1">{result.breakdown?.technical?.schema?.details?.[0] || "N/A"}</p>
                                        </div>
                                        {(result.breakdown?.technical?.schema?.score || 0) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                                    </div>
                                    {(result.breakdown?.technical?.schema?.score || 0) <= 50 && <AIFixBox text="Implement JSON-LD schema markup (Organization/WebSite) to explicitly describe your entities to AI." />}
                                </div>
                                {/* Sitemap */}
                                <div className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">Sitemap.xml</p>
                                            <p className="text-xs text-slate-500 mt-1">{result.breakdown?.technical?.sitemap?.details?.[0] || "N/A"}</p>
                                        </div>
                                        {(result.breakdown?.technical?.sitemap?.score || 0) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                                    </div>
                                    {(result.breakdown?.technical?.sitemap?.score || 0) <= 50 && <AIFixBox text="Generate and submit an XML sitemap to help AI consistently discover your pages." />}
                                </div>
                                {/* HTTPS */}
                                <div className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">HTTPS Secured</p>
                                            <p className="text-xs text-slate-500 mt-1">{result.breakdown?.technical?.https?.details?.[0] || "N/A"}</p>
                                        </div>
                                        {(result.breakdown?.technical?.https?.score || 0) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                                    </div>
                                    {(result.breakdown?.technical?.https?.score || 0) <= 50 && <AIFixBox text="Install an SSL certificate to ensure trusted, encrypted connections." />}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Content Structure */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <AlignLeft className="w-5 h-5 text-slate-400" />
                                <h3 className="font-serif text-xl text-[#224034]">Content Structure</h3>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                                {/* Questions */}
                                <div className="pb-4 border-b border-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">Question Targeting</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Headers asking questions</p>
                                        </div>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                            {result.breakdown?.content?.questions?.details?.[0]?.split('/')[0] || 0} / 5
                                        </Badge>
                                    </div>
                                    {((parseInt(result.breakdown?.content?.questions?.details?.[0]?.split('/')[0] || "0")) < 5) && <AIFixBox text="Add H2/H3 headers phrased as natural questions (e.g., 'What is...?', 'How does...?') to trigger AI answer cards." />}
                                </div>
                                {/* Readability */}
                                <div className="pb-4 border-b border-gray-50">
                                    <div className="flex justify-between items-center mb-1">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">Readability</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Flesch-Kincaid Grade</p>
                                        </div>
                                        <Badge variant="outline" className={`${(result.breakdown?.content?.readability?.details?.[0] || "").includes('Complex') ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                            {(result.breakdown?.content?.readability?.details?.[0] || "N/A").split('(')[0]}
                                        </Badge>
                                    </div>
                                    <AIFixBox text={result.breakdown?.content?.readability?.details?.find(d => d.startsWith("Suggestion:"))?.replace("Suggestion:", "").trim() || ""} />
                                </div>
                                {/* Visual Context */}
                                <div className="pb-4 border-b border-gray-50">
                                    <div className="flex justify-between mb-2">
                                        <p className="font-semibold text-slate-700 text-sm">Visual Context</p>
                                        <p className="text-xs font-medium text-slate-600">{result.breakdown?.content?.visual?.details?.[0] || "0% Alt Text"}</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: (result.breakdown?.content?.visual?.details?.[0]?.split('%')[0] || "0") + '%' }}></div>
                                    </div>
                                    {(parseInt(result.breakdown?.content?.visual?.details?.[0]?.split('%')[0] || "0") < 100) && <AIFixBox text="Add descriptive alt-text to your images so multimodal AI models can process them." />}
                                </div>
                                {/* Freshness */}
                                <div className="pb-4 border-b border-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">Content Freshness</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Dates validated in metadata</p>
                                        </div>
                                        {(result.breakdown?.content?.freshness?.score || 0) > 0 ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                                    </div>
                                    {(result.breakdown?.content?.freshness?.score || 0) === 0 && <AIFixBox text="Update your article metadata with article:published_time to signal fresh content to AI." />}
                                </div>
                                {/* Word Count */}
                                <div className="pb-4 border-b border-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">Word Count</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{result.breakdown?.content?.word_count?.details?.[0] || "N/A"}</p>
                                        </div>
                                        {(result.breakdown?.content?.word_count?.score || 0) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                                    </div>
                                    {(result.breakdown?.content?.word_count?.score || 0) <= 50 && <AIFixBox text="Expand your page content to >500 words to provide enough contextual depth for AI analysis." />}
                                </div>
                                {/* GEO Analysis */}
                                <div className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">GEO Analysis</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{result.breakdown?.content?.geo?.details?.[0] || "Generative Engine Optimization Formats"}</p>
                                        </div>
                                        {(result.breakdown?.content?.geo?.score || 0) > 50 ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                                    </div>
                                    {(result.breakdown?.content?.geo?.score || 0) <= 50 && <AIFixBox text="Restructure paragraphs into direct, concise `<p>` answer blocks to maximize citation extraction in AI Overviews." />}
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Authority Signals */}
                        <div className="space-y-6 md:row-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-slate-400" />
                                <h3 className="font-serif text-xl text-[#224034]">Authority Signals</h3>
                            </div>
                            {/* Detected Entities - AI Trust Analysis */}
                            <div className="space-y-4">
                                <p className="font-semibold text-slate-700 text-sm">AI Trust Analysis</p>

                                {/* Strengths (Pros) */}
                                <div className="space-y-2">
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">Strengths</p>
                                        <ul className="space-y-3">
                                            {result.breakdown?.authority?.eeat?.details?.filter(s => s.startsWith("Pro:")).slice(0, 5).map((signal, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                                    <span className="text-sm leading-relaxed">{signal.replace("Pro:", "").trim()}</span>
                                                </li>
                                            ))}
                                            {(result.breakdown?.authority?.eeat?.details?.filter(s => s.startsWith("Pro:"))?.length || 0) > 5 && (
                                                <li className="text-center pt-3 border-t border-gray-50 mt-1">
                                                    <button
                                                        onClick={() => setIsRegisterOpen(true)}
                                                        className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-4 py-1.5 rounded-full transition-colors w-full border border-emerald-100/50 shadow-sm"
                                                    >
                                                        Show more
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* Weaknesses (Cons) */}
                                <div className="space-y-2 pt-2">
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                        <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">Weaknesses & Risks</p>
                                        <ul className="space-y-3">
                                            {result.breakdown?.authority?.eeat?.details?.filter(s => s.startsWith("Con:")).slice(0, 5).map((signal, i) => (
                                                <li key={i} className="border-b border-gray-50 pb-4 mb-2 last:border-0 last:pb-0 last:mb-0">
                                                    <div className="flex items-start gap-3 text-sm text-slate-600 mb-2">
                                                        <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                                                        <span className="text-sm leading-relaxed">{signal.replace("Con:", "").trim()}</span>
                                                    </div>
                                                    <AIFixBox text={`Address this risk: ${signal.replace("Con:", "").trim()}`} />
                                                </li>
                                            ))}
                                            {(result.breakdown?.authority?.eeat?.details?.filter(s => s.startsWith("Con:"))?.length || 0) > 5 && (
                                                <li className="text-center pt-3 border-t border-gray-50 mt-1">
                                                    <button
                                                        onClick={() => setIsRegisterOpen(true)}
                                                        className="text-xs md:text-sm text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-full transition-colors w-full border border-red-100/50 shadow-sm"
                                                    >
                                                        Show full analysis
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* [NEW] Content Gap Analysis - Full Width */}
                        {result.breakdown?.content?.gap && (result.breakdown.content.gap.details?.length || 0) > 0 && (
                            <div className="md:col-span-2 bg-[#224034] rounded-xl p-8 text-white shadow-lg relative overflow-hidden group h-fit">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-700" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8cd9b8]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                                {/* Score Section */}
                                <div className="text-center mb-8 relative z-10">
                                    <p className="text-emerald-200/80 font-medium uppercase tracking-widest text-xs mb-3">The Missing Answer</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="text-6xl md:text-7xl font-serif tracking-tighter leading-none">
                                            {Math.max(0, 100 - ((result.breakdown.content.gap?.details?.length || 0) * 10))}
                                        </div>
                                        <div className="text-left space-y-1">
                                            <div className="text-lg font-light opacity-80">/ 100</div>
                                            <div className={`text-sm font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm ${(result.breakdown.content.gap?.details?.length || 0) <= 3 ? 'bg-emerald-400/20 text-emerald-100' :
                                                (result.breakdown.content.gap?.details?.length || 0) <= 5 ? 'bg-amber-500/20 text-amber-100' :
                                                    'bg-red-500/20 text-red-100'
                                                }`}>
                                                {(result.breakdown.content.gap?.details?.length || 0) <= 3 ? 'Good' :
                                                    (result.breakdown.content.gap?.details?.length || 0) <= 5 ? 'Fair' :
                                                        'Needs Work'}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-emerald-100/70 text-sm mt-3 max-w-[300px] mx-auto leading-relaxed">
                                        What AI models want to see on this page to rank it higher.
                                    </p>
                                </div>

                                {/* Gap Topics Grid */}
                                <div className="relative z-10 border-t border-emerald-500/20 pt-6">
                                    <p className="text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-4">Missing Topics</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {result.breakdown.content.gap?.details?.map((topic: string, i: number) => (
                                            <div key={i} className="bg-white/5 p-4 rounded-lg border border-emerald-500/20 hover:bg-white/10 transition-colors">
                                                <span className="font-medium text-emerald-50 text-sm">{topic}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* AI Fix Pack Results Dashboard */}
                    <div className="w-full mt-16 bg-[#0B1120] text-slate-300 rounded-3xl p-6 md:p-12 shadow-2xl animate-in slide-in-from-bottom-20 duration-1000 border border-slate-800/60 relative overflow-hidden text-left mb-4">
                        {/* Background glow effects */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10">

                            {/* Conversion Block (DFY Upgrade) */}
                            <div className="font-sans">
                                <div className="text-center mb-12">
                                    <h3 className="text-3xl md:text-4xl font-serif text-white">Ready to Fix All Your AI Search Issues? Sign Up Today.</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 max-w-5xl mx-auto mb-12 text-left">
                                    {/* Technical/Core */}
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Robots.txt Analysis</h4><p className="text-slate-500 text-xs mt-0.5">Control how AI agent bots crawl your site.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">LLMs.txt Generation</h4><p className="text-slate-500 text-xs mt-0.5">Direct LLMs swiftly to your core services.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">JSON-LD Schema</h4><p className="text-slate-500 text-xs mt-0.5">Speak directly to AI models in raw code.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Sitemap Tracking</h4><p className="text-slate-500 text-xs mt-0.5">Ensure AI bots index all your valid pages.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">HTTPS Protocols</h4><p className="text-slate-500 text-xs mt-0.5">Maintain secure handshakes for AI trust.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Technical Health</h4><p className="text-slate-500 text-xs mt-0.5">Flag slow load times penalizing AI extraction.</p></div></div>
                                    </div>

                                    {/* Content/Context */}
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Question Targeting</h4><p className="text-slate-500 text-xs mt-0.5">Optimize headers for exact voice searches.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Readability Scoring</h4><p className="text-slate-500 text-xs mt-0.5">Match the Flesch-Kincaid grade AI prefers.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Visual Context</h4><p className="text-slate-500 text-xs mt-0.5">Audit descriptive Alt-texts for multimodal AI.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Content Freshness</h4><p className="text-slate-500 text-xs mt-0.5">Signal recency via article:published_time.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Word Count Depth</h4><p className="text-slate-500 text-xs mt-0.5">Hit the context sweet spot for RAG pipelines.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Missing Topics Gap</h4><p className="text-slate-500 text-xs mt-0.5">Discover exact keywords your page lacks.</p></div></div>
                                    </div>

                                    {/* Authority/E-E-A-T & AI Optimization */}
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Brand Entities</h4><p className="text-slate-500 text-xs mt-0.5">Map your organization globally to the KG.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Author Signals</h4><p className="text-slate-500 text-xs mt-0.5">Validate E-E-A-T expertise automatically.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Trust Markers</h4><p className="text-slate-500 text-xs mt-0.5">Detect necessary policies and legal links.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">AI Auto-Rewrites</h4><p className="text-slate-500 text-xs mt-0.5">1-click AI generation for missing metadata.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Code Snippet Exports</h4><p className="text-slate-500 text-xs mt-0.5">Copy and paste schema directly to your CMS.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Visibility Over Time</h4><p className="text-slate-500 text-xs mt-0.5">Track ChatGPT ranking metrics week-by-week.</p></div></div>
                                    </div>

                                    {/* Extra New Features (GEO) */}
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">GEO Analysis Check</h4><p className="text-slate-500 text-xs mt-0.5">Generative Engine Optimization formatting.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">AI Answers Extraction</h4><p className="text-slate-500 text-xs mt-0.5">Analyze how often you are quoted as a source.</p></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><div><h4 className="text-white font-medium text-sm">Citation Link Gap</h4><p className="text-slate-500 text-xs mt-0.5">Find E-E-A-T linked mentions you are missing.</p></div></div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Button asChild className="w-full md:w-auto px-12 bg-emerald-500 hover:bg-emerald-600 text-white h-14 text-lg font-bold shadow-xl shadow-emerald-500/20 rounded-xl transition-all hover:scale-105">
                                        <Link href="/signup">Create Free Account</Link>
                                    </Button>
                                    <p className="text-xs text-slate-500 mt-4 tracking-wide uppercase font-semibold">Instant access • No credit card required</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            <Dialog
                open={isEngineDialogOpen}
                onOpenChange={(open) => {
                    setIsEngineDialogOpen(open)
                    if (!open) {
                        setSelectedEngineName(null)
                    }
                }}
            >
                <DialogContent className="z-[70] max-w-[95vw] sm:max-w-5xl border-emerald-200 bg-white text-slate-900 shadow-[0_30px_90px_rgba(2,20,14,0.45)] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#224034] text-2xl font-serif">
                            {selectedEngine?.name || "AI Engine"} Visibility Breakdown
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 mt-1">
                            {selectedEngine ? `${selectedEngine.desc} • Visibility estimate: ${selectedEngine.score}/100` : "Engine details"}
                        </DialogDescription>
                        <p className="text-xs text-slate-500">
                            AEO means getting found by AI search. GEO means getting quoted correctly in AI answers.
                        </p>
                    </DialogHeader>

                    <div className="space-y-4 text-sm">
                        <div className="rounded-xl border border-red-200/70 p-4">
                            <p className="text-[11px] uppercase tracking-widest font-bold text-red-500 mb-1">Current Issue</p>
                            <p className="text-slate-600 leading-relaxed">{selectedEngine?.fix || "No major issue detected."}</p>
                        </div>

                        <div className="rounded-xl border border-emerald-200/70 p-4">
                            <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-600 mb-1">How This Engine Uses AEO</p>
                            <p className="text-slate-600 leading-relaxed">{selectedEngine?.aeoHow || "AEO determines whether your page can be trusted and selected as a source."}</p>
                        </div>

                        <div className="rounded-xl border border-blue-200/70 p-4">
                            <p className="text-[11px] uppercase tracking-widest font-bold text-blue-600 mb-1">How This Engine Uses GEO</p>
                            <p className="text-slate-600 leading-relaxed">{selectedEngine?.geoHow || "GEO influences how easily your wording can be extracted into generated answers."}</p>
                        </div>

                        <div className="rounded-xl border border-violet-200/70 p-4">
                            <p className="text-[11px] uppercase tracking-widest font-bold text-violet-600 mb-1">Example Fix For {siteLabel}</p>
                            <p className="text-slate-600 leading-relaxed">
                                {selectedEngineExample || "Add one short FAQ and one source link to make this page easier for AI to trust and quote."}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 p-4">
                            <p className="text-[11px] uppercase tracking-widest font-bold text-slate-600 mb-2">Copy/Paste Example (Matches The Fix Above)</p>
                            <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 rounded-lg p-3 border border-slate-200/80">{copyPasteExample}</pre>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <Button
                                asChild
                                onClick={() => analytics.trackSignupStarted()}
                                className="w-full bg-[#224034] hover:bg-[#1a3329] text-white h-11 text-sm font-semibold shadow-lg shadow-[#224034]/20"
                            >
                                <Link href="/signup">
                                    Improve {selectedEngine?.name || "AI Engine"} Visibility
                                </Link>
                            </Button>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Create your free account to get full fixes and ongoing monitoring.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Registration Modal */}
            {isRegisterOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsRegisterOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 relative shadow-inner">
                                <Lock className="w-8 h-8 text-emerald-600" />
                                <div className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm border border-emerald-100">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-serif text-[#224034]">Unlock Full Analysis</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Get access to all <strong>{result?.breakdown?.authority?.eeat?.details?.length || 0} authority signals</strong>, detailed competitor comparisons, and the full content gap report.
                            </p>

                            <div className="pt-2 space-y-3">
                                <Button
                                    asChild
                                    onClick={() => analytics.trackSignupStarted()}
                                    className="w-full bg-[#224034] hover:bg-[#1a3329] text-white h-11 text-base font-semibold shadow-lg shadow-[#224034]/20"
                                >
                                    <Link href="/signup">
                                        Create Free Account
                                    </Link>
                                </Button>
                                <p className="text-xs text-slate-400">
                                    No credit card required • Free for 14 days
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Dialog */}
            <ScanProgressDialog
                open={loading}
                onOpenChange={setLoading}
                siteUrl={url}
                status={scanStatus}
            />

        </section>
    );
}
