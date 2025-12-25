"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlayCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RescanButtonProps {
    siteId: string
    url: string
}

export function RescanButton({ siteId, url }: RescanButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRescan = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteId, url })
            })

            if (!response.ok) throw new Error('Scan failed')

            // Refresh to show updated data
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Rescan failed. Please check the backend connection.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleRescan}
            disabled={loading}
            className="bg-[#224034] hover:bg-[#1a3027] text-white pr-6"
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
    )
}
