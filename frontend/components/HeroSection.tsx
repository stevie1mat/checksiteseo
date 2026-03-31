"use client"

import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, AlertCircle, XCircle, Code, AlignLeft, Lock, Copy } from "lucide-react"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"
import { analytics } from "@/lib/analytics"

type AnalysisResult = {
    url: string
    total_score: number
    breakdown: {
        technical: {
            robots: { score: number; details: string[] }
            llms: { score: number; details: string[] }
            schema: { score: number; details: string[] }
            https: { score: number; details: string[] }
            sitemap: { score: number; details: string[] }
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

export function HeroSection() {
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState("")
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)

    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')

    const handleAnalyze = async () => {
        const rawUrl = url.trim()
        if (!rawUrl) {
            setError("Please enter a website URL.")
            return
        }

        setLoading(true)
        setScanStatus('scanning')
        setError("")
        setResult(null)

        // Auto-add https:// if missing protocol
        let targetUrl = rawUrl
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = `https://${targetUrl}`
            setUrl(targetUrl) // Update UI
        }

        try {
            new URL(targetUrl)
        } catch {
            setError("Please enter a valid URL.")
            setLoading(false)
            setScanStatus('idle')
            return
        }

        // Track scan started
        analytics.trackScanStarted(targetUrl)

        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${BACKEND_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl, sync: true }),
            })

            if (!res.ok) throw new Error("Analysis failed.")
            const data = await res.json()

            setScanStatus('complete')

            // Track scan completed
            analytics.trackScanCompleted(targetUrl, data.total_score || data.score)

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
            setTimeout(() => setLoading(false), 3000)
        }
    }

    return (
        <section className={`relative min-h-[90vh] flex flex-col items-center pt-64 pb-20 px-6 bg-[#224034] text-white transition-all duration-700 overflow-hidden ${result ? 'min-h-screen' : ''}`}>

            {/* Background Details */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

            {/* Top Banner Tag */}


            <div className="text-center max-w-4xl mx-auto space-y-6 z-10">
                <h1 className="font-serif text-5xl md:text-7xl leading-tight">
                    Fix Your <span className="text-emerald-400">ChatGPT & AI</span> Search Rankings
                    <span className="block mt-4 text-3xl md:text-5xl italic opacity-90 font-light">in under 30 seconds.</span>
                </h1>
                <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                    Find what’s blocking your AI rankings and get exact fixes you can apply instantly.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-white/60 font-medium mt-6">
                    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-emerald-500/10 hover:border-emerald-500/30">ChatGPT SEO</span>
                    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-emerald-500/10 hover:border-emerald-500/30">Perplexity Ranking Check</span>
                    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-emerald-500/10 hover:border-emerald-500/30">Claude Optimization</span>
                    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-emerald-500/10 hover:border-emerald-500/30">AI Search Visibility</span>
                    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-emerald-500/10 hover:border-emerald-500/30">Google Gemini SEO</span>
                    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-emerald-500/10 hover:border-emerald-500/30">Answer Engine Optimization</span>
                </div>

                {/* Search Input Box - Refined */}
                {!result && (
                    <div className="mt-16 w-full max-w-lg mx-auto animate-in fade-in zoom-in duration-500 group">

                        {/* Input Wrapper with Glow */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

                            <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-1.5 focus-within:bg-white/10 focus-within:border-white/20 transition-all shadow-2xl">
                                <Input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Enter your website URL"
                                    className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 h-12 text-base px-4 flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#8cd9b8] hover:bg-[#7bcfa7] text-[#16211d] h-11 px-6 rounded-md font-bold text-sm tracking-wide whitespace-nowrap shadow-lg shadow-[#8cd9b8]/20 transition-all transform active:scale-95"
                                >
                                    {loading ? "Scanning..." : "Fix My AI Rankings"}
                                </Button>
                            </form>
                        </div>

                        <p className="mt-4 text-xs text-white/30 text-center font-light tracking-wide">
                            Instant Analysis • No Credit Card Required • Free for 14 Days
                        </p>
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                            <Link href="/aeo-checker-tool" className="text-xs text-emerald-200 hover:text-white transition-colors underline-offset-4 hover:underline">
                                View Sample Report
                            </Link>
                            <span className="text-white/30">•</span>
                            <Link href="/aeo-readiness" className="text-xs text-emerald-200 hover:text-white transition-colors underline-offset-4 hover:underline">
                                Learn AEO & GEO Readiness
                            </Link>
                            <span className="text-white/30">•</span>
                            <Link href="/aeo-monitoring" className="text-xs text-emerald-200 hover:text-white transition-colors underline-offset-4 hover:underline">
                                Learn AEO & GEO Monitoring
                            </Link>
                        </div>
                    </div>
                )}
                {error && <p className="text-red-300 mt-4 text-sm bg-red-900/20 p-2 rounded">{error}</p>}
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
