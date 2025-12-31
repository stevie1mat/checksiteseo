"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Globe, Activity, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
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
        <div className="grid gap-6 md:grid-cols-3">
            {/* Portfolio Usage */}
            <Card className={cn(
                "shadow-xs bg-white transition-all duration-300",
                siteCount >= maxSites ? "border-amber-200 ring-4 ring-amber-50" : "border-slate-200"
            )}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Portfolio Usage</CardTitle>
                    {siteCount >= maxSites ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : (
                        <Globe className="h-4 w-4 text-slate-400" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between mb-2">
                        <div className="text-2xl font-bold text-[#224034]">{siteCount} <span className="text-sm font-normal text-slate-400">/ {maxSites} Sites</span></div>
                    </div>
                    <Progress value={(siteCount / maxSites) * 100} className={cn("h-2", siteCount >= maxSites ? "bg-amber-100" : "")} indicatorClassName={siteCount >= maxSites ? "bg-amber-500" : ""} />

                    <div className="flex items-center justify-between mt-3">
                        <p className={cn("text-xs", siteCount >= maxSites ? "text-amber-600 font-medium" : "text-slate-500")}>
                            {siteCount >= maxSites ? 'Limit reached' : `${maxSites - siteCount} slots remaining`}
                        </p>
                        {siteCount >= maxSites && (
                            <Link href="/#pricing" className="text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 hover:underline">
                                Upgrade Plan
                            </Link>
                        )}
                    </div>

                </CardContent>
            </Card>

            {/* Portfolio Health */}
            <Card className="border-slate-200 shadow-xs bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Portfolio Health</CardTitle>
                    <Activity className={`h-4 w-4 ${healthColor}`} />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${healthColor}`}>{Math.round(averageScore)}</div>
                        <div className="text-sm font-medium text-slate-600 px-2 py-0.5 rounded-full bg-slate-100">
                            {healthLabel}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">avg. score across {scannedSites.length} active sites</p>
                </CardContent>
            </Card>

            {/* Competitor Movements */}
            <Card className="border-slate-200 shadow-xs bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Active Competitors</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[#224034]">{totalCompetitors}</div>
                    <p className="text-xs text-slate-500 mt-1">Competitors being tracked</p>
                </CardContent>
            </Card>
        </div>
    )
}
