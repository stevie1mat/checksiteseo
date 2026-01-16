"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"

interface AddSiteDialogProps {
    currentSiteCount: number
    maxSites: number
}

export function AddSiteDialog({ currentSiteCount, maxSites }: AddSiteDialogProps) {
    // State
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'input' | 'verify'>('input')
    const [url, setUrl] = useState("")
    const [siteId, setSiteId] = useState<string | null>(null)
    const [verificationToken, setVerificationToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [verificationLoading, setVerificationLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Scan Progress
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')

    const router = useRouter()
    const supabase = createClient()
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("Not authenticated")

            const response = await fetch(`${BACKEND_URL}/initiate-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ url: url })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.detail || "Failed to initiate verification")

            if (data.verified) {
                // Already verified, go straight to scan
                startScan(data.site_id, url)
            } else {
                // Show verification step
                setSiteId(data.site_id)
                setVerificationToken(data.token)
                setStep('verify')
            }

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        if (!siteId) return
        setVerificationLoading(true)
        setError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("Not authenticated")

            const response = await fetch(`${BACKEND_URL}/verify-ownership`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ site_id: siteId })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.detail || "Verification failed")

            // Success
            startScan(siteId, url)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setVerificationLoading(false)
        }
    }

    const downloadVerificationFile = () => {
        if (!verificationToken) return
        const blob = new Blob([verificationToken], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "checksite-verification.txt"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const startScan = async (id: string, siteUrl: string) => {
        setOpen(false)
        setScanStatus('scanning')
        setScanDialogOpen(true)

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteId: id, url: siteUrl })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Scan initiation failed");
            }

            // Poll
            let attempts = 0;
            const maxAttempts = 60;

            while (attempts < maxAttempts) {
                const { data: site } = await supabase
                    .from('sites')
                    .select('status')
                    .eq('id', id)
                    .single();

                if (site?.status === 'completed') {
                    setScanStatus('complete');
                    setTimeout(() => {
                        setScanDialogOpen(false)
                        setUrl("")
                        setStep('input')
                        router.refresh()
                    }, 2000);
                    return;
                }
                if (site?.status === 'error') throw new Error("Analysis failed.");

                await new Promise(r => setTimeout(r, 2000));
                attempts++;
            }
            throw new Error("Timeout");

        } catch (err: any) {
            setScanStatus('error')
        }
    }

    // Reset on close
    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            setTimeout(() => {
                setStep('input')
                setUrl("")
                setError(null)
            }, 300)
        }
    }

    return (
        <>
            <ScanProgressDialog
                open={scanDialogOpen}
                onOpenChange={setScanDialogOpen}
                siteUrl={url}
                status={scanStatus}
            />

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button className="group bg-gradient-to-br from-[#2a4e40] to-[#1d332b] hover:from-[#335c4a] hover:to-[#224034] text-white shadow-lg shadow-[#224034]/25 border border-[#3e5c50]/50 hover:shadow-xl hover:shadow-[#224034]/30 hover:-translate-y-0.5 transition-all duration-300 gap-2 h-12 !px-12 rounded-xl font-medium tracking-wide text-base">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="relative top-[1px]">Add New Site</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#1d332b] border-[#2a4e40] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {step === 'input' ? "Add a new site" : "Verify Ownership"}
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            {step === 'input'
                                ? "Enter the URL of the website you want to analyze."
                                : "Please verify you own this domain to proceed."}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 'input' ? (
                        <form onSubmit={handleInitiate} className="space-y-4 py-4">
                            {error && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-md border border-red-500/20">{error}</div>}
                            <div className="space-y-2">
                                <Label htmlFor="url" className="text-white">Website URL</Label>
                                <Input
                                    id="url"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-white hover:bg-white/10">Cancel</Button>
                                <Button type="submit" disabled={loading} className="bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7]">
                                    {loading ? "Checking..." : "Next"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 py-4">
                            {error && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-md border border-red-500/20">{error}</div>}

                            <div className="space-y-4">
                                <div className="p-4 bg-black/20 rounded-lg border border-white/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-white/80">1. Download verification file</span>
                                        <Button size="sm" variant="outline" onClick={downloadVerificationFile} className="h-8 border-white/20 text-white hover:bg-white/10 hover:text-white">
                                            Download
                                        </Button>
                                    </div>
                                    <div className="text-xs text-white/40 border-t border-white/5 pt-2">
                                        Filename: <code className="text-[#8cd9b8]">checksite-verification.txt</code>
                                    </div>
                                </div>

                                <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                                    <div className="text-sm font-medium text-white/80 mb-2">2. Upload to root directory</div>
                                    <div className="text-xs text-white/60">
                                        Upload the file to your server so it's accessible at:
                                    </div>
                                    <div className="mt-2 p-2 bg-black/30 rounded text-xs font-mono text-blue-300 break-all select-all cursor-pointer">
                                        {url.replace(/\/$/, '')}/checksite-verification.txt
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setStep('input')} className="text-white hover:bg-white/10">Back</Button>
                                <Button type="button" onClick={handleVerify} disabled={verificationLoading} className="bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7]">
                                    {verificationLoading ? "Verifying..." : "Verify & Scan"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
