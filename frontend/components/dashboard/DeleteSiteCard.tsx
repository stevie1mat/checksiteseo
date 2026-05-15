"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, ArrowLeft, Loader2, Trash2 } from "lucide-react"

interface DeleteSiteCardProps {
    siteId: string
    siteUrl: string
}

export function DeleteSiteCard({ siteId, siteUrl }: DeleteSiteCardProps) {
    const router = useRouter()
    const [typedUrl, setTypedUrl] = useState("")
    const [typedDeletePhrase, setTypedDeletePhrase] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const requiredUrl = useMemo(() => {
        const trimmed = siteUrl.trim()
        if (trimmed.startsWith("https://")) return trimmed
        return `https://${trimmed.replace(/^https?:\/\//, "")}`
    }, [siteUrl])

    const canDelete = useMemo(
        () =>
            typedUrl.trim() === requiredUrl &&
            typedDeletePhrase.trim().toLowerCase() === "delete my site",
        [typedUrl, typedDeletePhrase, requiredUrl]
    )

    const handleDelete = async () => {
        if (!canDelete || isDeleting) return
        setIsDeleting(true)
        setError(null)

        try {
            const response = await fetch(`/api/sites/${siteId}`, {
                method: "DELETE",
            })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(data.error || "Failed to delete site")
            }

            router.push("/dashboard/sites")
            router.refresh()
        } catch (deleteError: unknown) {
            if (deleteError instanceof Error) {
                setError(deleteError.message)
            } else {
                setError("Failed to delete site")
            }
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6 w-full p-6">
            <div className="rounded-2xl border border-[#d9e8df] bg-white/80 backdrop-blur-sm shadow-[0_14px_46px_rgba(30,64,48,0.08)] p-8 w-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-11 w-11 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                        <h1 className="font-serif text-2xl text-[#224034]">Delete Site</h1>
                        <p className="text-slate-500 text-sm">This action permanently removes this site and its data.</p>
                    </div>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-800 mb-6">
                    To confirm deletion, type the exact HTTPS site URL and then type <strong>delete my site</strong>.
                </div>

                <div className="space-y-3 mb-6">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Site URL</p>
                    <p className="font-medium text-slate-900 break-all">{requiredUrl}</p>
                </div>

                <div className="space-y-3 mb-6">
                    <label htmlFor="confirm-url" className="text-sm font-medium text-slate-700">
                        Type exact URL to confirm (must start with `https://`)
                    </label>
                    <Input
                        id="confirm-url"
                        value={typedUrl}
                        onChange={(event) => setTypedUrl(event.target.value)}
                        placeholder={requiredUrl}
                        autoComplete="off"
                    />
                </div>

                <div className="space-y-3 mb-6">
                    <label htmlFor="confirm-phrase" className="text-sm font-medium text-slate-700">
                        Type `delete my site`
                    </label>
                    <Input
                        id="confirm-phrase"
                        value={typedDeletePhrase}
                        onChange={(event) => setTypedDeletePhrase(event.target.value)}
                        placeholder="delete my site"
                        autoComplete="off"
                    />
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost">
                        <Link href={`/dashboard/sites/${siteId}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Cancel
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={!canDelete || isDeleting}
                        onClick={handleDelete}
                        className="bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300 disabled:text-white"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Confirm Delete Site
                    </Button>
                </div>
                {!canDelete && (
                    <p className="mt-3 text-xs text-slate-500">
                        Confirm button unlocks after both fields are matched exactly.
                    </p>
                )}
            </div>
        </div>
    )
}
