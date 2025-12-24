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

interface AddSiteDialogProps {
    currentSiteCount: number
    maxSites: number
}

export function AddSiteDialog({ currentSiteCount, maxSites }: AddSiteDialogProps) {
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

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

            const { error: insertError } = await supabase
                .from('sites')
                .insert({
                    url: url,
                    user_id: user.id,
                    status: 'pending'
                })

            if (insertError) throw insertError

            setOpen(false)
            setUrl("")
            router.refresh()

        } catch (err: any) {
            setError(err.message || "Failed to add site")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#224034] hover:bg-[#1a332a] text-white gap-2 h-11 px-6">
                    <Plus className="w-4 h-4" />
                    Add New Site
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
    )
}
