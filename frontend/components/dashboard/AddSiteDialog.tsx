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
    // Main Dialog state
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    // Scan Progress Dialog State
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')

    // We keep the scan dialog logic separate but triggered after add

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (currentSiteCount >= maxSites) {
            setError(`Free plan limit reached (${maxSites} site). Please upgrade to add more.`)
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { data, error: insertError } = await supabase
                .from('sites')
                .insert({
                    url: url,
                    user_id: user.id,
                    status: 'pending'
                })
                .select()

            if (insertError) throw insertError

            // Site Added - Switch to Scan Progress
            setOpen(false) // Close add dialog

            if (data && data[0]) {
                const siteId = data[0].id

                // Open Scan Dialog
                setScanStatus('scanning')
                setScanDialogOpen(true)

                // Trigger the scan
                const response = await fetch('/api/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ siteId, url })
                })

                if (!response.ok) {
                    throw new Error("Scan initiation failed")
                }

                setScanStatus('complete')
                setTimeout(() => {
                    setScanDialogOpen(false)
                    setUrl("")
                    router.refresh()
                }, 2000)
            } else {
                setOpen(false)
                setUrl("")
                router.refresh()
            }

        } catch (err: any) {
            setError(err.message || "Failed to add site")
            // If we are in scan mode, update that status
            if (scanDialogOpen) {
                setScanStatus('error')
            }
        } finally {
            setLoading(false)
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

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="group bg-gradient-to-br from-[#2a4e40] to-[#1d332b] hover:from-[#335c4a] hover:to-[#224034] text-white shadow-lg shadow-[#224034]/25 border border-[#3e5c50]/50 hover:shadow-xl hover:shadow-[#224034]/30 hover:-translate-y-0.5 transition-all duration-300 gap-2 h-12 !px-12 rounded-xl font-medium tracking-wide text-base">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="relative top-[1px]">Add New Site</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#1d332b] border-[#2a4e40] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Add a new site</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Enter the URL of the website you want to analyze.
                            <br />
                            <span className="text-[#8cd9b8] text-xs">
                                Free Plan: {currentSiteCount} / {maxSites} sites used
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-white">Website URL</Label>
                            <Input
                                id="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/30"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-white hover:text-white hover:bg-white/10">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || currentSiteCount >= maxSites} className="bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7]">
                                {loading ? "Adding..." : "Add Site"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
