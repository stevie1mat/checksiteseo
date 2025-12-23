"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, AlertCircle, Download, XCircle } from "lucide-react"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"

type AnalysisResult = {
    url: string
    total_score: number
    breakdown: {
        robots: { score: number; details: string[] }
        llms: { score: number; details: string[] }
        schema: { score: number; details: string[] }
        content: { score: number; details: string[] }
    }
}

export function HeroSection() {
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState("")

    const handleAnalyze = async () => {
        if (!url) return
        setLoading(true)
        setError("")
        setResult(null)

        try {
            const res = await fetch("http://127.0.0.1:8000/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            })
            if (!res.ok) throw new Error("Analysis failed.")
            const data = await res.json()
            setResult(data)
        } catch (err: any) {
            setError(err.message || "An error occurred.")
        } finally {
            setLoading(false)
        }
    }

    const chartData = result
        ? [
            { subject: 'Robots', A: result.breakdown.robots.score, fullMark: 25 },
            { subject: 'LLMs.txt', A: result.breakdown.llms.score, fullMark: 20 },
            { subject: 'Schema', A: result.breakdown.schema.score, fullMark: 30 },
            { subject: 'Content', A: result.breakdown.content.score, fullMark: 25 },
        ]
        : []


    return (
        <section className={`relative min-h-[90vh] flex flex-col items-center pt-40 pb-20 px-6 bg-[#224034] text-white transition-all duration-700 overflow-hidden ${result ? 'min-h-screen' : ''}`}>

            {/* Background Details */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

            {/* Top Banner Tag */}
            <div className="mt-12 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-white/90">AI Powered Analysis</span>
            </div>

            <div className="text-center max-w-4xl mx-auto space-y-6 z-10">
                <h1 className="font-serif text-5xl md:text-7xl leading-tight">
                    The future of <br />
                    <span className="italic opacity-90">search visibility.</span>
                </h1>
                <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                    CheckSite AEO is the AI-powered platform built to streamline your technical readiness for the next generation of Answer Engines.
                </p>

                {/* Search Input Box - Refined */}
                {!result && (
                    <div className="mt-16 w-full max-w-lg mx-auto animate-in fade-in zoom-in duration-500 group">

                        {/* Input Wrapper with Glow */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

                            <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-1.5 focus-within:bg-white/10 focus-within:border-white/20 transition-all shadow-2xl">
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                                    placeholder="Enter your website URL"
                                    className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 h-12 text-base px-4 flex-1"
                                />
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    className="bg-[#8cd9b8] hover:bg-[#7bcfa7] text-[#16211d] h-11 px-6 rounded-md font-bold text-sm tracking-wide whitespace-nowrap shadow-lg shadow-[#8cd9b8]/20 transition-all transform active:scale-95"
                                >
                                    {loading ? "Scanning..." : "Analyze Now"}
                                </Button>
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-white/30 text-center font-light tracking-wide">
                            Instant Analysis • No Credit Card Required • Free for 14 Days
                        </p>
                    </div>
                )}
                {error && <p className="text-red-300 mt-4 text-sm bg-red-900/20 p-2 rounded">{error}</p>}
            </div>

            {/* Hero Image / Dashboard Mockup Placeholder - REMOVED */}
            {result && (
                <div className="w-full max-w-6xl mt-16 bg-[#F8F9FA] rounded-2xl p-6 md:p-10 shadow-2xl animate-in slide-in-from-bottom-20 duration-1000">
                    {/* ... Dashboard Content ... */}
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-2xl font-serif text-[#224034] mb-1">Audit Results</h2>
                            <p className="text-slate-500 text-sm">Target: {result.url}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => window.print()} className="border-gray-200 text-slate-600">
                                <Download className="w-4 h-4 mr-2" /> Export
                            </Button>
                            <Button className="bg-[#224034] text-white hover:bg-[#1a3329]">
                                Create Account
                            </Button>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Col: Details */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                                <h3 className="font-serif text-xl text-[#224034] mb-6">Technical Checklist</h3>
                                <div className="space-y-4">
                                    {Object.entries(result.breakdown).map(([key, data]) => (
                                        <div key={key} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className={`mt-1 p-1 rounded-full ${data.score > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {data.score > 0 ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <h4 className="font-semibold text-slate-800 capitalize">{key === 'llms' ? 'LLMs.txt' : key}</h4>
                                                    <Badge variant={data.score > 0 ? "outline" : "destructive"} className={data.score > 0 ? "border-green-200 text-green-700 bg-green-50" : ""}>
                                                        {data.score} pts
                                                    </Badge>
                                                </div>
                                                <ul className="space-y-1">
                                                    {data.details.map((d, i) => (
                                                        <li key={i} className="text-sm text-slate-500">{d}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Score & Chart */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Score */}
                            <div className="bg-[#224034] text-white rounded-xl p-8 text-center shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                <p className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Total Score</p>
                                <div className="text-7xl font-serif mb-2">{result.total_score}</div>
                                <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium border border-white/10">
                                    {result.total_score >= 80 ? 'Excellent' : result.total_score >= 50 ? 'Average' : 'Critical'}
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm h-[300px]">
                                <h4 className="font-medium text-slate-500 text-xs uppercase tracking-wider mb-4 text-center">Breakdown</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="45%" outerRadius="70%" data={chartData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Score"
                                            dataKey="A"
                                            stroke="#224034"
                                            strokeWidth={2}
                                            fill="#224034"
                                            fillOpacity={0.2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </section>
    )
}
