"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlayCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"
import { createClient } from "@/lib/supabase/client"
import { formatDiamonds } from "@/lib/diamonds"

interface RescanButtonProps {
    siteId: string
    url: string
}

export function RescanButton({ siteId, url }: RescanButtonProps) {
    const [loading, setLoading] = useState(false)
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')
    const [scanMessage, setScanMessage] = useState("")
    const [usage, setUsage] = useState<{
        remainingDiamonds: number
        dailyFreeDiamonds: number
        diamondBalance: number
        remainingTokens: number
        tokensPerScan: number
        diamondsPerScan: number
        canClaimDailyFree?: boolean
    } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetch('/api/usage')
            .then(res => res.json())
            .then(data => {
                if (data.remainingTokens !== undefined) setUsage(data)
            })
            .catch(err => console.error("Failed to fetch usage:", err))
    }, [])

    const handleRescan = async () => {
        setLoading(true)
        setScanDialogOpen(true)
        setScanStatus('scanning')
        setScanMessage("")

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteId, url })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Scan initiation failed");
            }

            // Poll for completion
            let attempts = 0;
            const maxAttempts = 60; // 2 minutes (2s interval)

            while (attempts < maxAttempts) {
                const { data: site } = await supabase
                    .from('sites')
                    .select('status')
                    .eq('id', siteId)
                    .single();

                if (site?.status === 'completed') {
                    setScanStatus('complete');
                    setScanMessage("Analysis completed successfully.")
                    setTimeout(() => {
                        setScanDialogOpen(false)
                        setLoading(false)
                        // Refresh usage count
                        fetch('/api/usage').then(res => res.json()).then(data => setUsage(data))
                        router.refresh()
                    }, 2000);
                    return;
                }
                if (site?.status === 'error') {
                    throw new Error("Analysis failed. Please retry scan.");
                }

                await new Promise(r => setTimeout(r, 2000));
                attempts++;
            }
            throw new Error("Analysis timed out. Please try again.");

        } catch (error: unknown) {
            console.error("Rescan failed", error)
            setScanStatus('error')
            setScanMessage(error instanceof Error ? error.message : "Scan failed. Please try again.")
            setTimeout(() => {
                setLoading(false)
            }, 3000)
        }
    }

    const usageHint = usage
        ? usage.canClaimDailyFree
            ? `${formatDiamonds(usage.diamondBalance)} paid + ${formatDiamonds(usage.dailyFreeDiamonds)} free today (${formatDiamonds(usage.remainingDiamonds)} available) • ${formatDiamonds(usage.diamondsPerScan)} diamonds per scan`
            : `${formatDiamonds(usage.remainingDiamonds)} diamonds available • ${formatDiamonds(usage.diamondsPerScan)} diamonds per scan`
        : ""

    return (
        <>
            <ScanProgressDialog
                open={scanDialogOpen}
                onOpenChange={(open) => {
                    if (!open && scanStatus === 'scanning') return; // Prevent closing while scanning
                    setScanDialogOpen(open)
                    if (!open) setLoading(false)
                }}
                siteUrl={url}
                status={scanStatus}
                message={scanMessage}
                title="Rescanning Site"
            />

            <div className="flex items-end">
                <Button
                    onClick={handleRescan}
                    disabled={loading || (usage ? usage.remainingTokens < (usage.tokensPerScan || 1) : false)}
                    title={usageHint || "Rescan this site"}
                    className="bg-[#224034] hover:bg-[#1a3027] text-white pr-6 transition-colors shadow-sm"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Rescan Site
                        </>
                    )}
                </Button>
            </div>
        </>
    )
}
