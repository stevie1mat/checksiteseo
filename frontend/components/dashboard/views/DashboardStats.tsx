"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Globe, Activity, TrendingUp, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStatsProps {
    siteCount: number
    maxSites: number
    sites: any[]
}

export function DashboardStats({ siteCount, maxSites, sites }: DashboardStatsProps) {
    // Calculate REAL average score from scanned sites
    const scannedSites = sites.filter(s => s.status === 'completed' && s.aeo_score > 0)
    const averageScore = scannedSites.length > 0 ?
        scannedSites.reduce((acc, site) => acc + (site.aeo_score || 0), 0) / scannedSites.length : 0

    // Determine health color
    const getHealthColor = (score: number) => {
        if (score >= 80) return "text-green-600"
        if (score >= 50) return "text-yellow-600"
        return "text-red-600"
    }

    const healthColor = getHealthColor(averageScore)
    const healthLabel = averageScore >= 80 ? "Healthy" : averageScore >= 50 ? "Needs Improvement" : "Critical"
    const healthGradient = averageScore >= 80 ? "from-emerald-400/20 via-emerald-400/5" : averageScore >= 50 ? "from-amber-400/20 via-amber-400/5" : "from-rose-400/20 via-rose-400/5"

    // Aggregated Competitor Movements (Real Data Sum)
    // Assuming 'competitors' column has 'top_competitors' array
    // We can count total unique competitors tracked across portfolio or just show a count
    let totalCompetitors = 0;
    sites.forEach(site => {
        if (site.competitors?.top_competitors) {
            totalCompetitors += site.competitors.top_competitors.length;
        }
    });

    return (
        <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            {/* Portfolio Usage */}
            <Card className={cn(
                "relative overflow-hidden bg-white/60 backdrop-blur-xl transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:shadow-[#224034]/5 border-white/60",
                siteCount >= maxSites ? "border-amber-200 ring-2 ring-amber-50" : ""
            )}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Portfolio Usage</CardTitle>
                    {siteCount >= maxSites ? (
                        <div className="p-2 bg-amber-100 rounded-full">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                    ) : (
                        <div className="p-2 bg-slate-100 rounded-full">
                            <Globe className="h-4 w-4 text-slate-500" />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="mt-4">
                    <div className="flex items-end justify-between mb-3">
                        <div className="text-4xl font-serif text-[#224034]">{siteCount} <span className="text-lg font-sans font-medium text-slate-400">/ {maxSites} Sites</span></div>
                    </div>
                    <Progress value={(siteCount / maxSites) * 100} className={cn("h-2.5 bg-slate-200/50", siteCount >= maxSites ? "bg-amber-100" : "")} indicatorClassName={siteCount >= maxSites ? "bg-amber-500" : "bg-[#2f7d61]"} />

                    <div className="flex items-center justify-between mt-4">
                        <p className={cn("text-sm", siteCount >= maxSites ? "text-amber-600 font-semibold" : "text-slate-500 font-medium")}>
                            {siteCount >= maxSites ? 'Limit reached' : `${maxSites - siteCount} slots remaining`}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Portfolio Health */}
            <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:shadow-[#224034]/5 border-white/60">
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${healthGradient} to-transparent rounded-full blur-3xl opacity-60 -mr-10 -mt-10 pointer-events-none`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Portfolio Health</CardTitle>
                    <div className="p-2 bg-slate-100 rounded-full">
                        <Activity className={cn("h-4 w-4", healthColor)} />
                    </div>
                </CardHeader>
                <CardContent className="mt-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`text-5xl font-serif tracking-tight ${healthColor}`}>{Math.round(averageScore)}</div>
                        <div className={cn(
                            "text-sm font-bold px-3 py-1.5 rounded-full border",
                            averageScore >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                            averageScore >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" : 
                            "bg-rose-50 text-rose-700 border-rose-200"
                        )}>
                            {healthLabel}
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-3 font-medium">Avg. score across {scannedSites.length} active sites</p>
                </CardContent>
            </Card>

            {/* Competitor Movements */}
            <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:shadow-[#224034]/5 border-white/60">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Active Competitors</CardTitle>
                    <div className="p-2 bg-blue-50 rounded-full">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent className="mt-4 relative z-10">
                    <div className="text-5xl font-serif tracking-tight text-[#224034]">{totalCompetitors}</div>
                    <p className="text-sm text-slate-500 mt-3 font-medium">Total competitors being tracked</p>
                </CardContent>
            </Card>
        </div>
    )
}
