"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface RescanButtonProps {
    siteId: string
    url: string
}

export function RescanButton({ siteId, url }: RescanButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRescan = async () => {
        setLoading(true)
        try {
            await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteId, url })
            })
            router.refresh()
        } catch (error) {
            console.error("Rescan failed", error)
            alert("Rescan failed. Check console/network logs.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRescan}
            disabled={loading}
            className="text-[#224034] border-[#224034]/20 hover:bg-[#224034]/5 pr-6"
        >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning...' : 'Rescan'}
        </Button>
    )
}
