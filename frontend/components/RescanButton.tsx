"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlayCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"
import { createClient } from "@/lib/supabase/client"

interface RescanButtonProps {
    siteId: string
    url: string
}

export function RescanButton({ siteId, url }: RescanButtonProps) {
    const [loading, setLoading] = useState(false)
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')
    const [usage, setUsage] = useState<{
        tokenBalance: number
        remainingTokens: number
        tokensPerScan: number
        dailyFreeTokens: number
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
                    throw new Error("Analysis failed.");
                }

                await new Promise(r => setTimeout(r, 2000));
                attempts++;
            }
            throw new Error("Timeout");

        } catch (error: any) {
            console.error("Rescan failed", error)
            setScanStatus('error')
            setTimeout(() => {
                setLoading(false)
            }, 3000)
        }
    }

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
                title="Rescanning Site"
            />

            <div className="flex flex-col items-end gap-1">
                <Button
                    onClick={handleRescan}
                    disabled={loading || (usage ? usage.remainingTokens < (usage.tokensPerScan || 1) : false)}
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
                {usage && (
                    <span className="text-[10px] text-slate-400 font-medium px-1">
                        {usage.canClaimDailyFree
                            ? `${usage.tokenBalance} paid tokens + ${usage.dailyFreeTokens} daily free available • ${usage.tokensPerScan} token per scan`
                            : `${usage.tokenBalance} tokens available • ${usage.tokensPerScan} token per scan`}
                    </span>
                )}
            </div>
        </>
    )
}
