"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Activity, BarChart3, Flame, Wallet } from "lucide-react"
import { formatDiamonds, toDiamonds } from "@/lib/diamonds"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

interface SiteHistoryPoint {
    created_at: string
    aeo_score: number
}

interface SiteLite {
    id: string
    url: string
    status: string
    created_at: string
    last_scanned_at?: string | null
    aeo_score: number
    site_history?: SiteHistoryPoint[] | null
}

interface TokenTransaction {
    created_at: string
    tokens: number
    transaction_type: string
}

interface OverviewAnalyticsPanelProps {
    tokenBalance: number
    totalTokensUsed: number
    totalTokensPurchased: number
    dailyFreeTokens: number
    tokensPerScan: number
    tokensPerChat: number
    tokensPerDiamond: number
    canClaimDailyFree: boolean
    sites: SiteLite[]
    tokenTransactions: TokenTransaction[]
}

function dateKeyFromIso(value: string) {
    return value.slice(0, 10)
}

function shortLabel(value: string) {
    const date = new Date(`${value}T00:00:00`)
    return `${date.getMonth() + 1}/${date.getDate()}`
}

export function OverviewAnalyticsPanel({
    tokenBalance,
    totalTokensUsed,
    totalTokensPurchased,
    dailyFreeTokens,
    tokensPerScan,
    tokensPerChat,
    tokensPerDiamond,
    canClaimDailyFree,
    sites,
    tokenTransactions,
}: OverviewAnalyticsPanelProps) {
    const [scansPerDay, setScansPerDay] = useState<number>(1)
    const [chatsPerDay, setChatsPerDay] = useState<number>(3)
    const [horizonDays, setHorizonDays] = useState<number>(30)

    const tokenFlowData = useMemo(() => {
        const days = 30
        const now = new Date()
        const rows: Array<{ date: string; label: string; used: number; daily: number; topups: number }> = []
        const indexByDate = new Map<string, number>()

        for (let i = days - 1; i >= 0; i -= 1) {
            const d = new Date(now)
            d.setDate(now.getDate() - i)
            const key = d.toISOString().slice(0, 10)
            indexByDate.set(key, rows.length)
            rows.push({
                date: key,
                label: shortLabel(key),
                used: 0,
                daily: 0,
                topups: 0,
            })
        }

        for (const tx of tokenTransactions) {
            if (!tx?.created_at) continue
            const key = dateKeyFromIso(tx.created_at)
            const index = indexByDate.get(key)
            if (index === undefined) continue

            const amount = Number(tx.tokens || 0)
            if (amount < 0 || tx.transaction_type === "scan_usage") {
                rows[index].used += Math.abs(amount)
            } else if (tx.transaction_type === "daily_grant") {
                rows[index].daily += amount
            } else {
                rows[index].topups += amount
            }
        }

        return rows
    }, [tokenTransactions])

    const scoreTrendData = useMemo(() => {
        const aggregate = new Map<string, { total: number; count: number }>()
        const oldest = new Date()
        oldest.setDate(oldest.getDate() - 30)
        const oldestTs = oldest.getTime()

        for (const site of sites) {
            const points = site.site_history && site.site_history.length > 0
                ? site.site_history
                : [{
                    created_at: site.last_scanned_at || site.created_at,
                    aeo_score: site.aeo_score || 0,
                }]

            for (const point of points) {
                if (!point?.created_at) continue
                const ts = new Date(point.created_at).getTime()
                if (Number.isNaN(ts) || ts < oldestTs) continue
                const key = dateKeyFromIso(point.created_at)
                const prev = aggregate.get(key) || { total: 0, count: 0 }
                prev.total += Number(point.aeo_score || 0)
                prev.count += 1
                aggregate.set(key, prev)
            }
        }

        return Array.from(aggregate.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, values]) => ({
                date,
                label: shortLabel(date),
                score: Math.round(values.total / Math.max(values.count, 1)),
            }))
    }, [sites])

    const usage7d = useMemo(() => {
        return tokenFlowData.slice(-7).reduce((total, day) => total + day.used, 0)
    }, [tokenFlowData])

    const topups30d = useMemo(() => {
        return tokenFlowData.reduce((total, day) => total + day.topups, 0)
    }, [tokenFlowData])

    const effectiveNow = tokenBalance + (canClaimDailyFree ? dailyFreeTokens : 0)
    const scanCapacity = Math.floor(effectiveNow / Math.max(tokensPerScan, 1))
    const chatCapacity = Math.floor(effectiveNow / Math.max(tokensPerChat, 1))

    const dailyDemand = (scansPerDay * Math.max(tokensPerScan, 1)) + (chatsPerDay * Math.max(tokensPerChat, 1))
    const dailyPaidDemand = Math.max(0, dailyDemand - dailyFreeTokens)
    const projectedPaidNeed = dailyPaidDemand * horizonDays
    const projectedCoverage = projectedPaidNeed <= 0
        ? 100
        : Math.min(100, Math.round((tokenBalance / projectedPaidNeed) * 100))
    const topUpRecommendation = Math.max(0, projectedPaidNeed - tokenBalance)
    const runwayDays = dailyPaidDemand <= 0 ? null : Math.floor(tokenBalance / dailyPaidDemand)
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/60 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:shadow-[#224034]/5 group">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <Wallet className="w-32 h-32 text-[#224034]" />
                    </div>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
                        <CardTitle className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Diamonds Available</CardTitle>
                        <div className="p-2 bg-emerald-50 rounded-full">
                            <Wallet className="h-4 w-4 text-[#224034]" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <p className="text-4xl font-serif text-[#224034]">{formatDiamonds(toDiamonds(effectiveNow, tokensPerDiamond))}</p>
                        <p className="text-xs font-medium text-slate-500 mt-2">
                            {canClaimDailyFree ? `Includes today’s ${formatDiamonds(toDiamonds(dailyFreeTokens, tokensPerDiamond))} free diamonds` : "Daily free grant already applied today"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/60 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:shadow-[#224034]/5 group">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <Flame className="w-32 h-32 text-rose-500" />
                    </div>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
                        <CardTitle className="text-sm font-semibold tracking-wide text-slate-500 uppercase">7-Day Burn</CardTitle>
                        <div className="p-2 bg-rose-50 rounded-full">
                            <Flame className="h-4 w-4 text-rose-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <p className="text-4xl font-serif text-[#224034]">{formatDiamonds(toDiamonds(usage7d, tokensPerDiamond))}</p>
                        <p className="text-xs font-medium text-slate-500 mt-2">Avg. {formatDiamonds(toDiamonds(Math.round(usage7d / 7), tokensPerDiamond))}/day this week</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/60 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:shadow-[#224034]/5 group">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <BarChart3 className="w-32 h-32 text-blue-500" />
                    </div>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
                        <CardTitle className="text-sm font-semibold tracking-wide text-slate-500 uppercase">30-Day Credits Added</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-full">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <p className="text-4xl font-serif text-[#224034]">{formatDiamonds(toDiamonds(topups30d, tokensPerDiamond))}</p>
                        <p className="text-xs font-medium text-slate-500 mt-2">
                            Lifetime: {formatDiamonds(toDiamonds(totalTokensPurchased, tokensPerDiamond))} diamonds
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/60 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:shadow-[#224034]/5 group">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <Activity className="w-32 h-32 text-indigo-500" />
                    </div>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
                        <CardTitle className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Capacity</CardTitle>
                        <div className="p-2 bg-indigo-50 rounded-full">
                            <Activity className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <p className="text-3xl font-serif text-[#224034]">{scanCapacity.toLocaleString()} <span className="text-lg font-sans text-slate-400">scans</span></p>
                        <p className="text-xs font-medium text-slate-500 mt-2">{chatCapacity.toLocaleString()} chats available</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                <Card className="xl:col-span-2 relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/60 transition-all duration-500 hover:shadow-xl hover:shadow-[#224034]/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-[#224034] font-serif text-2xl tracking-tight">Diamond Flow <span className="font-sans text-sm font-medium text-slate-400 ml-2">(Last 30 Days)</span></CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-2 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tokenFlowData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2efe8" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number, name: string) => {
                                        const labels: Record<string, string> = {
                                            used: "Used",
                                            daily: "Daily Free",
                                            topups: "Credits Added",
                                        }
                                        return [formatDiamonds(toDiamonds(Number(value), tokensPerDiamond)), labels[name] || name]
                                    }}
                                />
                                <Bar dataKey="used" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="daily" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="topups" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/60 transition-all duration-500 hover:shadow-xl hover:shadow-[#224034]/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-[#224034] font-serif text-2xl tracking-tight">Diamond Planner</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-slate-500 font-medium">Scans per day</span>
                                    <span className="font-bold text-[#224034] bg-slate-100 px-2 py-0.5 rounded-md">{scansPerDay}</span>
                                </div>
                                <input type="range" min={0} max={8} step={1} value={scansPerDay} onChange={(e) => setScansPerDay(Number(e.target.value))} className="w-full accent-[#34d399] cursor-pointer" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-slate-500 font-medium">Chats per day</span>
                                    <span className="font-bold text-[#224034] bg-slate-100 px-2 py-0.5 rounded-md">{chatsPerDay}</span>
                                </div>
                                <input type="range" min={0} max={40} step={1} value={chatsPerDay} onChange={(e) => setChatsPerDay(Number(e.target.value))} className="w-full accent-[#34d399] cursor-pointer" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-slate-500 font-medium">Planning window</span>
                                    <span className="font-bold text-[#224034] bg-slate-100 px-2 py-0.5 rounded-md">{horizonDays} days</span>
                                </div>
                                <input type="range" min={7} max={90} step={1} value={horizonDays} onChange={(e) => setHorizonDays(Number(e.target.value))} className="w-full accent-[#34d399] cursor-pointer" />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/80 bg-white/50 p-5 space-y-3 shadow-inner">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium">Projected Need</span>
                                <span className="font-bold text-[#224034]">
                                    {formatDiamonds(toDiamonds(projectedPaidNeed, tokensPerDiamond))} diamonds
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium">Current Balance</span>
                                <span className="font-bold text-[#224034]">
                                    {formatDiamonds(toDiamonds(tokenBalance, tokensPerDiamond))} diamonds
                                </span>
                            </div>
                            <div className="pt-2">
                                <Progress value={projectedCoverage} className="h-2 bg-slate-200" indicatorClassName={projectedCoverage < 100 ? "bg-[#34d399]" : "bg-[#10b981]"} />
                            </div>
                            <div className="flex items-center justify-between text-xs mt-1">
                                <span className="text-slate-500 font-medium">Coverage</span>
                                <span className="font-bold text-[#224034]">{projectedCoverage}%</span>
                            </div>
                            
                            <div className="text-xs text-slate-500 pt-2 border-t border-slate-200/60 mt-2 font-medium">
                                {dailyPaidDemand === 0
                                    ? "✨ Daily free diamonds cover this usage."
                                    : `Estimated paid runway: ${runwayDays?.toLocaleString() || 0} days`}
                            </div>
                            {topUpRecommendation > 0 && (
                                <div className="text-xs font-bold text-rose-500 pt-1">
                                    Suggested top up: {formatDiamonds(toDiamonds(topUpRecommendation, tokensPerDiamond))} diamonds
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/60 transition-all duration-500 hover:shadow-xl hover:shadow-[#224034]/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
                <CardHeader className="pb-4">
                    <CardTitle className="text-[#224034] font-serif text-2xl tracking-tight">AEO Score Trend <span className="font-sans text-sm font-medium text-slate-400 ml-2">(Last 30 Days)</span></CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pt-2 relative z-10">
                    {scoreTrendData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={scoreTrendData}>
                                <defs>
                                    <linearGradient id="aeoScoreFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2efe8" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`${value}`, "Avg AEO score"]}
                                />
                                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fill="url(#aeoScoreFill)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full rounded-2xl border border-dashed border-slate-300 bg-white/40 flex items-center justify-center text-sm font-medium text-slate-400">
                            Not enough scan history yet to render trend data.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
