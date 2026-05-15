"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, ArrowRight, Clock, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Site } from "@/lib/types"

interface SiteHealthGridProps {
    sites: Site[]
    isFreePlan?: boolean
}

type GridFilterTab = "all" | "unverified" | "improvements" | "best"

export function SiteHealthGrid({ sites }: SiteHealthGridProps) {
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const searchQuery = searchParams.get('search')?.toLowerCase() || ''
    const [activeTab, setActiveTab] = useState<GridFilterTab>("all")

    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)
    const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null)
    const [hiddenSiteIds, setHiddenSiteIds] = useState<Set<string>>(new Set())
    const [siteToVerify, setSiteToVerify] = useState<Site | null>(null)
    const [verificationSiteId, setVerificationSiteId] = useState<string | null>(null)
    const [verificationToken, setVerificationToken] = useState<string | null>(null)
    const [verificationLoading, setVerificationLoading] = useState(false)
    const [verificationError, setVerificationError] = useState<string | null>(null)
    const [verificationPreparing, setVerificationPreparing] = useState(false)
    const supabase = createClient()
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

    const isUnverifiedSite = (status: string) => status === "unverified" || status === "pending_verification"
    const isPendingSite = (status: string) => status === "pending"
    const canDeleteFromGrid = (status: string) => isUnverifiedSite(status) || isPendingSite(status)
    const isBestSite = (site: Site) => !isUnverifiedSite(site.status) && site.status === "completed" && site.aeo_score >= 80
    const isImprovementSite = (site: Site) =>
        !isUnverifiedSite(site.status) && !isBestSite(site)
    const getErrorMessage = (error: unknown, fallback: string) =>
        error instanceof Error && error.message ? error.message : fallback

    const searchedSites = !searchQuery
        ? sites
        : sites.filter((site) => site.url.toLowerCase().includes(searchQuery))

    const tabCounts = {
        all: searchedSites.length,
        unverified: searchedSites.filter((site) => isUnverifiedSite(site.status)).length,
        improvements: searchedSites.filter((site) => isImprovementSite(site)).length,
        best: searchedSites.filter((site) => isBestSite(site)).length,
    }

    const filteredSites = activeTab === "all"
        ? searchedSites
        : activeTab === "unverified"
            ? searchedSites.filter((site) => isUnverifiedSite(site.status))
            : activeTab === "improvements"
                ? searchedSites.filter((site) => isImprovementSite(site))
                : searchedSites.filter((site) => isBestSite(site))
    const visibleFilteredSites = filteredSites.filter((site) => !hiddenSiteIds.has(site.id))

    const getStatusBadge = (score: number) => {
        if (score >= 90) {
            return { label: "Healthy", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
        } else if (score >= 70) {
            return { label: "Good, Can Improve", className: "bg-blue-100 text-blue-700 border-blue-200" };
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

    const openVerificationDialog = async (site: Site) => {
        setSiteToVerify(site)
        setVerificationSiteId(site.id)
        setVerificationToken(site.verification_token || null)
        setVerificationError(null)
        setVerifyDialogOpen(true)
        setVerificationPreparing(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("Not authenticated")

            const response = await fetch(`${BACKEND_URL}/initiate-verification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ url: site.url }),
            })

            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.detail || "Failed to load verification token")

            if (data.verified) {
                setVerifyDialogOpen(false)
                toast({
                    title: "Site already verified",
                    description: "Opening your site report.",
                })
                router.push(`/dashboard/sites/${site.id}`)
                return
            }

            if (typeof data.token === "string" && data.token.length > 0) {
                setVerificationToken(data.token)
            }
            if (typeof data.site_id === "string" && data.site_id.length > 0) {
                setVerificationSiteId(data.site_id)
            }
        } catch (error: unknown) {
            setVerificationError(getErrorMessage(error, "Could not prepare verification."))
        } finally {
            setVerificationPreparing(false)
        }
    }

    const downloadVerificationFile = () => {
        if (!verificationToken) return
        const blob = new Blob([verificationToken], { type: "text/plain" })
        const fileUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = fileUrl
        a.download = "checksite-verification.txt"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(fileUrl)
    }

    const verifyOwnershipAndOpenSite = async () => {
        if (!siteToVerify || !verificationSiteId) return
        setVerificationLoading(true)
        setVerificationError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("Not authenticated")

            const response = await fetch(`${BACKEND_URL}/verify-ownership`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ site_id: verificationSiteId }),
            })

            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.detail || "Verification failed")

            toast({
                title: "Verification successful",
                description: "Opening your site report.",
            })
            setVerifyDialogOpen(false)
            router.push(`/dashboard/sites/${verificationSiteId}`)
            router.refresh()
        } catch (error: unknown) {
            setVerificationError(getErrorMessage(error, "Verification failed."))
        } finally {
            setVerificationLoading(false)
        }
    }

    const openDeleteDialog = (site: Site) => {
        setSiteToDelete(site)
        setDeleteDialogOpen(true)
    }

    const deleteUnverifiedSite = async () => {
        if (!siteToDelete) return
        setDeletingSiteId(siteToDelete.id)

        try {
            const response = await fetch(`/api/sites/${siteToDelete.id}`, {
                method: "DELETE",
            })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.error || "Delete failed")

            setHiddenSiteIds((prev) => new Set(prev).add(siteToDelete.id))
            toast({
                title: "Site deleted",
                description: "Unverified site removed successfully.",
            })
            setDeleteDialogOpen(false)
            setSiteToDelete(null)
            router.refresh()
        } catch (error: unknown) {
            toast({
                title: "Delete failed",
                description: getErrorMessage(error, "Could not delete site."),
                variant: "destructive",
            })
        } finally {
            setDeletingSiteId(null)
        }
    }

    return (
        <>
            <Card className="border-[#d9e8df] bg-white/75 backdrop-blur-sm shadow-[0_14px_46px_rgba(30,64,48,0.08)] overflow-hidden">
                <CardHeader className="py-4 px-6 border-b border-[#e2efe8] bg-white/70">
                    <div className="flex flex-col gap-3">
                        <CardTitle className="text-[#224034] font-serif text-lg tracking-wide">Site Health Grid</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            {([
                                { key: "all", label: "All" },
                                { key: "unverified", label: "Unverified" },
                                { key: "improvements", label: "Improvements" },
                                { key: "best", label: "Best" },
                            ] as Array<{ key: GridFilterTab; label: string }>).map((tab) => (
                                <Button
                                    key={tab.key}
                                    variant="ghost"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={cn(
                                        "h-8 rounded-full border px-3 text-xs font-semibold tracking-wide",
                                        activeTab === tab.key
                                            ? "bg-[#224034] text-white border-[#224034] hover:bg-[#1d372d]"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-[#224034]/30 hover:text-[#224034]"
                                    )}
                                >
                                    {tab.label}
                                    <span className={cn(
                                        "ml-2 inline-flex min-w-5 justify-center rounded-full px-1.5 py-0.5 text-[10px]",
                                        activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                                    )}>
                                        {tabCounts[tab.key]}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-[#e2efe8] bg-[#edf6f1]/60">
                                <TableHead className="w-[300px] pl-6 h-10 text-xs font-semibold tracking-widest text-slate-500 uppercase">Client / Site</TableHead>
                                <TableHead className="h-10 text-xs font-semibold tracking-widest text-slate-500 uppercase">Health Status</TableHead>
                                <TableHead className="h-10 text-xs font-semibold tracking-widest text-slate-500 uppercase">Last Change</TableHead>
                                <TableHead className="h-10 text-right pr-6 text-xs font-semibold tracking-widest text-slate-500 uppercase">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleFilteredSites.map((site) => {
                                const badgeInfo = getStatusBadge(site.aeo_score);
                                const needsVerification = isUnverifiedSite(site.status)
                                const canDelete = canDeleteFromGrid(site.status)

                                // History Logic for Last Change
                                const history = [...(site.site_history || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                                const currentScore = site.aeo_score;
                                const previousScore = history.length > 1 ? history[history.length - 2].aeo_score : currentScore;
                                const delta = currentScore - previousScore;

                                return (
                                    <TableRow key={site.id} className="group border-[#e5f0ea] hover:bg-[#f5fbf8] transition-all duration-200">
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
                                                            site.status === 'analyzing'
                                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                : needsVerification
                                                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                    : "bg-slate-50 text-slate-500"
                                                        )}>
                                                            {site.status === 'analyzing'
                                                                ? 'Scanning...'
                                                                : needsVerification
                                                                    ? "Unverified"
                                                                    : site.status}
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
                                                {needsVerification ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-all shadow-sm p-0"
                                                            onClick={() => openDeleteDialog(site)}
                                                            title="Delete unverified site"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all shadow-sm p-0"
                                                            onClick={() => openVerificationDialog(site)}
                                                            title="Verify site ownership"
                                                        >
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : canDelete ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-all shadow-sm p-0"
                                                            onClick={() => openDeleteDialog(site)}
                                                            title="Delete pending site"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                        <Link href={`/dashboard/sites/${site.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white text-slate-400 hover:text-[#224034] hover:bg-slate-50 border border-slate-200 hover:border-[#224034]/30 transition-all shadow-sm">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <Link href={`/dashboard/sites/${site.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white text-slate-400 hover:text-[#224034] hover:bg-slate-50 border border-slate-200 hover:border-[#224034]/30 transition-all shadow-sm">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {visibleFilteredSites.length === 0 && (
                                <TableRow className="border-[#e5f0ea]">
                                    <TableCell colSpan={4} className="py-10 text-center text-slate-500">
                                        No sites found in this filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div >
            </Card >
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open)
                    if (!open) {
                        setSiteToDelete(null)
                        setDeletingSiteId(null)
                    }
                }}
            >
                <DialogContent className="sm:max-w-[480px] p-8 gap-6 bg-[#1d332b] border-[#2a4e40] text-white">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-white font-serif text-2xl text-center">
                            {siteToDelete && isPendingSite(siteToDelete.status) ? "Delete Pending Site" : "Delete Unverified Site"}
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-center text-base leading-relaxed">
                            Are you sure you want to delete
                            <br />
                            <span className="text-[#8cd9b8] font-bold block my-1 text-lg">{siteToDelete?.url}</span>
                            This only removes this site record.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex items-center justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="text-white hover:text-white hover:bg-white/10"
                            disabled={!!deletingSiteId}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={deleteUnverifiedSite}
                            disabled={!!deletingSiteId}
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            {deletingSiteId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete Site
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog
                open={verifyDialogOpen}
                onOpenChange={(open) => {
                    setVerifyDialogOpen(open)
                    if (!open) {
                        setVerificationError(null)
                        setVerificationLoading(false)
                        setVerificationPreparing(false)
                        setVerificationToken(null)
                        setSiteToVerify(null)
                        setVerificationSiteId(null)
                    }
                }}
            >
                <DialogContent className="sm:max-w-[560px] p-8 gap-6 bg-[#1d332b] border-[#2a4e40] text-white">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-white font-serif text-2xl text-center">Verify Ownership</DialogTitle>
                        <DialogDescription className="text-white/70 text-center">
                            This site is unverified. Complete these steps to access it.
                        </DialogDescription>
                    </DialogHeader>

                    {verificationError && (
                        <div className="bg-red-500/10 text-red-300 text-sm p-3 rounded-md border border-red-500/20">
                            {verificationError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="p-4 bg-black/20 rounded-lg border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/80">1. Download verification file</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={downloadVerificationFile}
                                    disabled={!verificationToken || verificationPreparing}
                                    className="h-8 border-white/20 text-white hover:bg-white/10 hover:text-white"
                                >
                                    Download TXT
                                </Button>
                            </div>
                            <div className="text-xs text-white/50 border-t border-white/5 pt-2">
                                Filename: <code className="text-[#8cd9b8]">checksite-verification.txt</code>
                            </div>
                        </div>

                        <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                            <div className="text-sm font-medium text-white/80 mb-2">2. Upload to your root directory</div>
                            <div className="text-xs text-white/60 mb-2">
                                The file must be publicly reachable at:
                            </div>
                            <div className="p-2 bg-black/30 rounded text-xs font-mono text-blue-300 break-all select-all cursor-pointer">
                                {`${(siteToVerify?.url || "").replace(/\/$/, "")}/checksite-verification.txt`}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setVerifyDialogOpen(false)}
                            className="text-white hover:text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={verifyOwnershipAndOpenSite}
                            disabled={verificationLoading || verificationPreparing}
                            className="bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7]"
                        >
                            {verificationLoading ? "Verifying..." : "Verify & Open Site"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
