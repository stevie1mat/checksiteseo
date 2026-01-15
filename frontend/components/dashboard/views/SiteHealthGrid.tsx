"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, ArrowRight, Activity, CheckCircle, AlertTriangle, Zap, Clock, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Site } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SiteHealthGridProps {
    sites: Site[]
    isFreePlan?: boolean
}

export function SiteHealthGrid({ sites, isFreePlan = false }: SiteHealthGridProps) {
    const router = useRouter()
    const [localSites, setLocalSites] = useState<Site[]>(sites)

    useEffect(() => {
        setLocalSites(sites)
    }, [sites])

    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)
    const supabase = createClient()

    const handleDeleteClick = (site: Site) => {
        setSiteToDelete(site)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!siteToDelete) return

        setDeletingId(siteToDelete.id)
        try {
            console.log("Requesting deletion via API proxy for:", siteToDelete.id);

            const response = await fetch(`/api/sites/${siteToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Delete failed");
            }

            // Optimistic Update: Remove from UI immediately
            setLocalSites(prev => prev.filter(s => s.id !== siteToDelete.id))

            setDeleteDialogOpen(false)
            router.refresh()

            // Fallback: Reload page if simple refresh doesn't clear the stale cache visible to user
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        } catch (error: any) {
            console.error("Error deleting site:", error)
            alert(`Failed to delete site: ${error.message}`)
        } finally {
            setDeletingId(null)
            setSiteToDelete(null)
        }
    }

    const getStatusBadge = (score: number) => {
        if (score >= 90) {
            return { label: "Healthy", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
        } else if (score >= 70) {
            return { label: "Snippet Opp.", className: "bg-blue-100 text-blue-700 border-blue-200" };
        } else if (score < 50) {
            return { label: "Schema Critical", className: "bg-rose-100 text-rose-700 border-rose-200" };
        } else {
            return { label: "Needs Improvement", className: "bg-amber-100 text-amber-700 border-amber-200" };
        }
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

    return (
        <>
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
                                <TableHead className="h-10 text-xs font-semibold tracking-widest text-slate-500 uppercase">Health Status</TableHead>
                                <TableHead className="h-10 text-xs font-semibold tracking-widest text-slate-500 uppercase">Last Change</TableHead>
                                <TableHead className="h-10 text-right pr-6 text-xs font-semibold tracking-widest text-slate-500 uppercase">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localSites.map((site) => {
                                const badgeInfo = getStatusBadge(site.aeo_score);

                                // History Logic for Last Change
                                let history = [...(site.site_history || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                                const currentScore = site.aeo_score;
                                const previousScore = history.length > 1 ? history[history.length - 2].aeo_score : currentScore;
                                const delta = currentScore - previousScore;

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
                                            <div className="flex items-center gap-3">
                                                {/* Circular Score */}
                                                <ScoreRing score={site.aeo_score} />

                                                {/* Health Status Badge */}
                                                <Badge
                                                    variant="outline"
                                                    className={cn("px-2 py-0.5 text-[10px] font-medium border", badgeInfo.className)}
                                                >
                                                    {badgeInfo.label}
                                                </Badge>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                {delta !== 0 ? (
                                                    <span className={cn(
                                                        "text-sm font-bold flex items-center gap-1",
                                                        delta > 0 ? "text-emerald-600" : "text-rose-600"
                                                    )}>
                                                        {delta > 0 ? '+' : ''}{delta}%
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        {site.last_scanned_at ? formatDistanceToNow(new Date(site.last_scanned_at), { addSuffix: true }) : 'Just now'}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                    Since last scan
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <TooltipProvider>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            <span tabIndex={0}>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className={cn(
                                                                        "h-8 w-8 p-0 text-slate-400 border border-transparent transition-all shadow-none",
                                                                        "hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100"
                                                                    )}
                                                                    onClick={() => handleDeleteClick(site)}
                                                                    disabled={deletingId === site.id}
                                                                >
                                                                    {deletingId === site.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                </Button>
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[200px] text-center">
                                                            <p>Delete site</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

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
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[480px] p-8 gap-6 bg-[#1d332b] border-[#2a4e40] text-white">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-white font-serif text-2xl text-center">Delete Site</DialogTitle>
                        <DialogDescription className="text-white/60 text-center text-base leading-relaxed">
                            Are you sure you want to delete
                            <br />
                            <span className="text-[#8cd9b8] font-bold block my-1 text-lg">{siteToDelete?.url}</span>
                            This action cannot be undone and will remove all historical data.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center gap-3 w-full mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="text-white hover:text-white hover:bg-white/10 h-11 px-8 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={!!deletingId}
                            className="bg-rose-500 hover:bg-rose-600 text-white h-11 px-6 rounded-lg shadow-md hover:shadow-lg transition-all border border-rose-400/20"
                        >
                            {deletingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete Site
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
