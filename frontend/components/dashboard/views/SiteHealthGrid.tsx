"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, ArrowRight, ArrowUpRight, ArrowDownRight, Activity, CheckCircle, AlertTriangle, Zap, MoreHorizontal, Clock, Loader2, Minus } from "lucide-react"
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

interface SiteHealthGridProps {
    sites: Site[]
}

export function SiteHealthGrid({ sites }: SiteHealthGridProps) {
    const router = useRouter()

    // Dialog State
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [currentScanUrl, setCurrentScanUrl] = useState("")
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')
    const [scanMessage, setScanMessage] = useState("")
    const [scanningId, setScanningId] = useState<string | null>(null)

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

    // Smoothed SVG Path Generator
    const getSmoothPath = (data: number[], width: number, height: number, max: number, min: number) => {
        if (data.length === 0) return "";

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / (max - min)) * height;
            return [x, y];
        });

        // Helper to get control point
        const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
            const p = previous || current;
            const n = next || current;
            const smoothing = 0.2;
            const line = [n[0] - p[0], n[1] - p[1]];
            const angle = Math.atan2(line[1], line[0]) + (reverse ? Math.PI : 0);
            const length = Math.sqrt(Math.pow(line[0], 2) + Math.pow(line[1], 2)) * smoothing;
            return [current[0] + Math.cos(angle) * length, current[1] + Math.sin(angle) * length];
        };

        const d = points.reduce((acc, point, i, a) => {
            if (i === 0) return `M ${point[0]},${point[1]}`;
            const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
            const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
            return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
        }, "");

        return d;
    };

    // Mini Sparkline Component
    const Sparkline = ({ data }: { data: number[] }) => {
        if (data.length < 2) return <div className="h-8 w-24 bg-slate-50 rounded flex items-center justify-center text-[10px] text-slate-300">Not enough data</div>;

        const height = 32;
        const width = 96;
        const max = 100;
        const min = 0;

        // Color Logic: Last Point vs First Point
        const first = data[0];
        const last = data[data.length - 1];
        const isGrowth = last > first;
        const isDecline = last < first;

        const color = isGrowth ? "#10b981" : isDecline ? "#f43f5e" : "#94a3b8"; // emerald-500, rose-500, slate-400

        // Generate Smooth Path
        const pathD = getSmoothPath(data, width, height, max, min);

        return (
            <svg width={width} height={height} className="overflow-visible">
                <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* End Dot */}
                <circle
                    cx={width}
                    cy={height - ((last - min) / (max - min)) * height}
                    r="2.5"
                    fill={color}
                    className="animate-pulse"
                />
            </svg>
        );
    };

    // Circular Score Ring Component
    const ScoreRing = ({ score }: { score: number }) => {
        const radius = 18;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;

        const color = score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500";

        return (
            <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-slate-100"
                    />
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`${color} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                <span className={`absolute text-[10px] font-bold ${color}`}>{Math.round(score)}</span>
            </div>
        )
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
                        <CardTitle className="text-[#224034] font-serif text-lg tracking-wide">Site Health Grid</CardTitle>
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
                            {sites.map((site, index) => {
                                const isScanning = scanningId === site.id

                                // History Logic
                                let graphHistory = [...(site.site_history || [])].reverse();

                                // --- MOCK DATA INJECTION FOR DEMO ---
                                // Different mock patterns based on index to show variety
                                let sparklineData: number[] = [];

                                if (graphHistory.length < 2) {
                                    if (index === 0) sparklineData = [65, 68, 72, 70, 75, 82, 85, 90]; // Growth
                                    else if (index === 1) sparklineData = [80, 78, 75, 76, 72, 68, 65, 60]; // Decline
                                    else if (index === 2) sparklineData = [50, 55, 52, 58, 54, 56, 55, 55]; // Stable/Fluctuating
                                    else sparklineData = [40, 42, 45, 48, 50, 52, 55, 65]; // Default Growth

                                    // Override score for demo consistency if needed, or just display sparkline
                                } else {
                                    sparklineData = graphHistory.map(h => h.aeo_score);
                                }
                                // -------------------------------------

                                const health = site.health_status || { robots: 'neutral', schema: 'neutral', content: 'neutral' };

                                // Trend Calculation for Arrow logic (based on Sparkline Data now)
                                const first = sparklineData[0] || 0;
                                const last = sparklineData[sparklineData.length - 1] || 0;
                                const trendValue = last - first;
                                const trendDirection = trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'neutral';

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
                                                {/* Sparkline Visualization */}
                                                <div className="h-8 w-24 flex items-center justify-start">
                                                    <Sparkline data={sparklineData} />
                                                </div>

                                                {/* Direction Indicator */}
                                                {trendDirection !== 'neutral' ? (
                                                    <div className={cn("flex items-center text-xs font-bold", trendDirection === 'up' ? "text-emerald-600" : "text-rose-600")}>
                                                        {trendDirection === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                                        {Math.abs(trendValue).toFixed(0)}%
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">-</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Circular Score */}
                                                <ScoreRing score={site.aeo_score} />

                                                <div className="flex flex-col gap-1.5">
                                                    {/* Voice Ready Badge */}
                                                    {site.aeo_score >= 90 && (
                                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-1.5 py-0 w-fit gap-1">
                                                            <Activity className="w-3 h-3" /> Voice Ready
                                                        </Badge>
                                                    )}
                                                    {/* Snippet Opportunity Badge */}
                                                    {site.aeo_score >= 70 && site.aeo_score < 90 && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 w-fit gap-1">
                                                            <Zap className="w-3 h-3" /> Snippet Opp.
                                                        </Badge>
                                                    )}
                                                    {/* Fallback Badge if score is low */}
                                                    {site.aeo_score < 70 && (
                                                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] px-1.5 py-0 w-fit">
                                                            Needs Optimization
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                {/* LAST CHANGE Logic */}
                                                {(() => {
                                                    // We use the same history/sparkline data for consistency in delta?
                                                    // Or strictly utilize last two points of sparklineData
                                                    if (sparklineData.length < 2) {
                                                        return <span className="text-xs text-slate-400 font-medium">First Scan</span>;
                                                    }

                                                    const current = sparklineData[sparklineData.length - 1];
                                                    const previous = sparklineData[sparklineData.length - 2];
                                                    const delta = current - previous;

                                                    if (delta === 0) {
                                                        return (
                                                            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                                <Clock className="w-3 h-3" />
                                                                {site.last_scanned_at ? formatDistanceToNow(new Date(site.last_scanned_at), { addSuffix: true }) : 'Just now'}
                                                            </span>
                                                        )
                                                    }

                                                    return (
                                                        <span className={cn(
                                                            "text-sm font-bold flex items-center gap-1",
                                                            delta > 0 ? "text-emerald-600" : "text-rose-600"
                                                        )}>
                                                            {delta > 0 ? '+' : ''}{delta}%
                                                        </span>
                                                    )
                                                })()}

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
