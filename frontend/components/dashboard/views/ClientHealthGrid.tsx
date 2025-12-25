"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, ArrowRight, ArrowUpRight, ArrowDownRight, Activity, CheckCircle, AlertTriangle, Zap, MoreHorizontal, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RescanButton } from "@/components/dashboard/RescanButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Site } from "@/lib/types"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"

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
    const [scanningId, setScanningId] = useState<string | null>(null) // Keep for disabling buttons

    // Helper to calculate trend from site history
    const getTrend = (site: Site) => {
        if (!site.site_history || site.site_history.length < 2) return 'neutral';
        const current = site.site_history[0].aeo_score;
        const previous = site.site_history[1].aeo_score;
        return current > previous ? 'up' : current < previous ? 'down' : 'neutral';
    }

    const handleQuickScan = async (site: Site) => {
        if (scanningId) return // Prevent multiple scans

        // Init Dialog
        setScanningId(site.id)
        setCurrentScanUrl(site.url)
        setScanStatus('scanning')
        setScanDialogOpen(true)
        setScanMessage("")

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: site.url,
                    siteId: site.id
                }),
            })

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Rate limit exceeded. Please wait 24h between scans.")
                }
                const data = await response.json()
                throw new Error(data.error || "Scan failed")
            }

            const data = await response.json()

            // Success State
            setScanStatus('complete')
            setTimeout(() => {
                setScanDialogOpen(false)
                router.refresh()
                setScanningId(null)
            }, 1500) // Close after 1.5s delay to show success

        } catch (error: any) {
            setScanStatus('error')
            setScanMessage(error.message)
            setScanningId(null) // Release immediately on error so user can retry or close
        }
    }

    const StatusBadge = ({ status, label }: { status: string, label: string }) => {
        // Handle "neutral" or missing status gracefully
        const safeStatus = status || 'neutral';

        const styles = safeStatus === 'healthy'
            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            : safeStatus === 'warning'
                ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                : safeStatus === 'critical'
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100" // Neutral

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

            <Card className="border-slate-200 shadow-xs overflow-hidden">
                <CardHeader className="py-4 px-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-[#224034] font-serif text-lg">Client Health Grid</CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 text-slate-500">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="w-[300px] pl-6 h-10 text-xs font-semibold tracking-wide text-slate-500 uppercase">Client / Site</TableHead>
                                <TableHead className="h-10 text-xs font-semibold tracking-wide text-slate-500 uppercase">Trend (30d)</TableHead>
                                <TableHead className="h-10 text-xs font-semibold tracking-wide text-slate-500 uppercase">Health Status</TableHead>
                                <TableHead className="h-10 text-xs font-semibold tracking-wide text-slate-500 uppercase">Last Change</TableHead>
                                <TableHead className="h-10 text-right pr-6 text-xs font-semibold tracking-wide text-slate-500 uppercase">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sites.map((site) => {
                                const trend = getTrend(site);
                                const health = site.health_status || { robots: 'neutral', schema: 'neutral', content: 'neutral' };
                                const isScanning = scanningId === site.id

                                // Sort history by date desc (assuming it comes back sorted, but good to ensure for graph)
                                // We need to REVERSE it for the graph (Left = Oldest, Right = Newest)
                                const graphHistory = [...(site.site_history || [])].reverse();

                                return (
                                    <TableRow key={site.id} className="group border-slate-100 hover:bg-slate-50/80 transition-colors">
                                        <TableCell className="py-3 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-[#224034]/5 flex items-center justify-center text-[#224034] ring-1 ring-[#224034]/10">
                                                    <Globe className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-slate-900 group-hover:text-[#224034] transition-colors">{site.url}</span>
                                                    <Badge variant={site.status === 'analyzing' ? 'secondary' : 'outline'} className="text-[10px] w-fit capitalize font-normal px-1.5 py-0 h-4">
                                                        {site.status === 'analyzing' ? 'Scanning...' : site.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                {/* Real Sparkline using History */}
                                                <div className="h-6 w-24 flex items-end gap-[2px] opacity-90">
                                                    {graphHistory.length > 0 ? (
                                                        graphHistory.map((h, i) => {
                                                            const height = Math.max(10, h.aeo_score); // Min 10% height
                                                            return (
                                                                <div
                                                                    key={h.id}
                                                                    className="w-1.5 rounded-t-[1px] bg-[#1A4036]"
                                                                    style={{ height: `${height}%`, opacity: 0.4 + ((i / graphHistory.length) * 0.6) }}
                                                                    title={`Score: ${h.aeo_score}`}
                                                                />
                                                            )
                                                        })
                                                    ) : (
                                                        // Empty state line if no history
                                                        <div className="w-full h-[1px] bg-slate-200"></div>
                                                    )}
                                                </div>

                                                {trend === 'up' ? (
                                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                                ) : trend === 'down' ? (
                                                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex gap-2">
                                                <StatusBadge status={health.robots} label="Robots" />
                                                <StatusBadge status={health.schema} label="Schema" />
                                                <StatusBadge status={health.content} label="Content" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-700' : trend === 'down' ? 'text-red-700' : 'text-slate-600'}`}>
                                                    {site.aeo_score ? `Score: ${site.aeo_score}` : 'Pending Scan'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {site.last_scanned_at ? formatDistanceToNow(new Date(site.last_scanned_at), { addSuffix: true }) : 'Never'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 px-2 text-xs gap-1.5 border-slate-200 text-slate-600 hover:text-[#224034] hover:border-[#224034]/30"
                                                    onClick={() => handleQuickScan(site)}
                                                    disabled={isScanning || site.status === 'analyzing'}
                                                >
                                                    {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                                    {isScanning ? 'Scanning' : 'Quick Scan'}
                                                </Button>
                                                <Link href={`/dashboard/sites/${site.id}`} className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </>
    )
}
