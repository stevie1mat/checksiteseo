"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, ArrowRight, ArrowUpRight, ArrowDownRight, Activity, CheckCircle, AlertTriangle, Zap, MoreHorizontal, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Site } from "@/lib/types"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"
import { cn } from "@/lib/utils"

interface ClientHealthGridProps {
    sites: Site[]
}

export function ClientHealthGrid({ sites }: ClientHealthGridProps) {
    const router = useRouter()

    // Dialog State
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [currentScanUrl, setCurrentScanUrl] = useState("")
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')
    const [scanMessage, setScanMessage] = useState("")
    const [scanningId, setScanningId] = useState<string | null>(null)

    // Helper to calculate trend from site history
    const getTrend = (site: Site) => {
        if (!site.site_history || site.site_history.length === 0) return 'neutral';
        if (site.site_history.length === 1) return 'new';
        const current = site.site_history[0].aeo_score;
        const previous = site.site_history[1].aeo_score;
        return current > previous ? 'up' : current < previous ? 'down' : 'neutral';
    }

    const handleQuickScan = async (site: Site) => {
        if (scanningId) return

        setScanningId(site.id)
        setCurrentScanUrl(site.url)
        setScanStatus('scanning')
        setScanDialogOpen(true)
        setScanMessage("")

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: site.url, siteId: site.id }),
            })

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Rate limit exceeded. Please wait 24h between scans.")
                }
                const data = await response.json()
                throw new Error(data.error || "Scan failed")
            }

            setScanStatus('complete')
            setTimeout(() => {
                setScanDialogOpen(false)
                router.refresh()
                setScanningId(null)
            }, 1500)

        } catch (error: any) {
            setScanStatus('error')
            setScanMessage(error.message)
            setScanningId(null)
        }
    }

    const StatusBadge = ({ status, label }: { status: string, label: string }) => {
        const safeStatus = status || 'neutral';

        // Premium Light Theme Colors
        const styles = safeStatus === 'healthy'
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : safeStatus === 'warning'
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : safeStatus === 'critical'
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-slate-50 text-slate-600 border-slate-200"

        const Icon = safeStatus === 'healthy' ? CheckCircle : safeStatus === 'neutral' ? Clock : AlertTriangle

        return (
            <Badge variant="outline" className={`gap-1 pr-2 pl-1.5 py-0.5 text-xs font-medium border ${styles}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
            </Badge>
        )
    }

    return (
        <>
            <ScanProgressDialog
                open={scanDialogOpen}
                onOpenChange={setScanDialogOpen}
                siteUrl={currentScanUrl}
                status={scanStatus}
                message={scanMessage}
            />

            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="py-4 px-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-[#224034] font-serif text-lg tracking-wide">Client Health Grid</CardTitle>
                        {/* More button removed to keep it clean */}
                    </div>
                </CardHeader>
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100 bg-slate-50/50">
                                <TableHead className="w-[300px] pl-6 h-10 text-xs font-semibold tracking-widest text-slate-500 uppercase">Client / Site</TableHead>
                                <TableHead className="h-10 text-xs font-semibold tracking-widest text-slate-500 uppercase">Trend (30d)</TableHead>
                                <TableHead className="h-10 text-xs font-semibold tracking-widest text-slate-500 uppercase">Health Status</TableHead>
                                <TableHead className="h-10 text-xs font-semibold tracking-widest text-slate-500 uppercase">Last Change</TableHead>
                                <TableHead className="h-10 text-right pr-6 text-xs font-semibold tracking-widest text-slate-500 uppercase">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sites.map((site) => {
                                const isScanning = scanningId === site.id

                                // Enhanced History Logic:
                                // If history is empty but we have a score (first scan before fix), use current score as history point.
                                let graphHistory = [...(site.site_history || [])].reverse();
                                if (graphHistory.length === 0 && site.aeo_score > 0) {
                                    graphHistory = [{ id: 'synthetic-now', site_id: site.id, aeo_score: site.aeo_score, created_at: site.last_scanned_at || new Date().toISOString() }];
                                }

                                const health = site.health_status || { robots: 'neutral', schema: 'neutral', content: 'neutral' };

                                // Recalculate trend with potentially synthetic history
                                const getDisplayTrend = () => {
                                    if (graphHistory.length === 0) return 'neutral';
                                    if (graphHistory.length === 1) return 'new';
                                    const current = graphHistory[graphHistory.length - 1].aeo_score; // Last item in our graph array (which is reversed history)
                                    const previous = graphHistory[graphHistory.length - 2].aeo_score;
                                    // Wait, graphHistory is [...history].reverse(). 
                                    // Original logic: site.site_history[0] is newest. 
                                    // So graphHistory[0] is OLDEST. graphHistory[length-1] is NEWEST.

                                    // Let's stick to using the sorted array directly for trend to be safe
                                    // But graphHistory is easier for graph.

                                    // Re-evaluating based on original "getTrend":
                                    // original: site.site_history[0] (newest) vs [1] (older)
                                    // graphHistory above (reversed): [0] (oldest) ... [last] (newest)

                                    if (graphHistory.length < 2) return 'new';
                                    const curr = graphHistory[graphHistory.length - 1].aeo_score;
                                    const prev = graphHistory[graphHistory.length - 2].aeo_score;
                                    return curr > prev ? 'up' : curr < prev ? 'down' : 'neutral';
                                };

                                const trend = getDisplayTrend();

                                // Prepare data for sparkline (normalize to 0-100)
                                const sparklineData = graphHistory.map(h => h.aeo_score);

                                return (
                                    <TableRow key={site.id} className="group border-slate-100 hover:bg-slate-50 transition-all duration-200">
                                        <TableCell className="py-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-[#224034]/5 flex items-center justify-center text-[#224034] ring-1 ring-slate-200 shadow-sm">
                                                    <Globe className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-sm text-slate-900 group-hover:text-[#224034] transition-colors tracking-tight">{site.url}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={cn(
                                                            "text-[10px] w-fit capitalize font-normal px-1.5 py-0 h-4 border-slate-200",
                                                            site.status === 'analyzing' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-500"
                                                        )}>
                                                            {site.status === 'analyzing' ? 'Scanning...' : site.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-8 w-24 flex items-end gap-[3px]">
                                                    {graphHistory.length > 0 ? (
                                                        graphHistory.map((h, i) => {
                                                            const height = Math.max(15, h.aeo_score);
                                                            // Opacity: 100% if single item, otherwise distributed
                                                            const opacity = graphHistory.length === 1 ? 1 : 0.3 + ((i / (graphHistory.length - 1)) * 0.7);

                                                            return (
                                                                <div
                                                                    key={h.id}
                                                                    className="w-1.5 rounded-t-[1px] bg-[#224034]"
                                                                    style={{
                                                                        height: `${height}%`,
                                                                        opacity: opacity
                                                                    }}
                                                                />
                                                            )
                                                        })
                                                    ) : (
                                                        /* Empty state line if absolutely no data (should be rare/impossible with fallback) */
                                                        <div className="w-full h-[1px] bg-slate-200"></div>
                                                    )}
                                                </div>

                                                {trend === 'up' ? (
                                                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                                ) : trend === 'down' ? (
                                                    <ArrowDownRight className="w-4 h-4 text-rose-600" />
                                                ) : trend === 'new' ? (
                                                    <span className="text-[10px] font-medium text-[#224034] bg-[#224034]/10 px-1.5 py-0.5 rounded">NEW</span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex gap-2">
                                                <StatusBadge status={health.robots} label="Robots" />
                                                <StatusBadge status={health.schema} label="Schema" />
                                                <StatusBadge status={health.content} label="Content" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                {/* LAST CHANGE COLUMN: Delta */}
                                                {(graphHistory.length > 1 && trend !== 'new') ? (
                                                    (() => {
                                                        const current = graphHistory[graphHistory.length - 1].aeo_score;
                                                        const previous = graphHistory[graphHistory.length - 2].aeo_score;
                                                        const delta = current - previous;
                                                        return (
                                                            <span className={cn(
                                                                "text-sm font-bold",
                                                                delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-slate-600"
                                                            )}>
                                                                {delta > 0 ? '+' : ''}{delta}%
                                                            </span>
                                                        )
                                                    })()
                                                ) : (
                                                    <span className="text-sm font-medium text-slate-400">First Scan</span>
                                                )}

                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                    Since last scan
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-3 text-xs gap-2 bg-white text-slate-600 hover:text-[#224034] hover:bg-slate-50 border border-slate-200 hover:border-[#224034]/30 transition-all shadow-sm"
                                                    onClick={() => handleQuickScan(site)}
                                                    disabled={isScanning || site.status === 'analyzing'}
                                                >
                                                    {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                                    {isScanning ? 'Scan' : 'Quick Scan'}
                                                </Button>
                                                <Link href={`/dashboard/sites/${site.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white text-slate-400 hover:text-[#224034] hover:bg-slate-50 border border-slate-200 hover:border-[#224034]/30 transition-all shadow-sm">
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div >
            </Card >
        </>
    )
}
