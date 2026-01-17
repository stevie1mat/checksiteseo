"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function AuthRedirectHandler() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams.get("code")
        if (code) {
            // Keep existing params but ensure code is passed to callback
            const newUrl = `/auth/callback?code=${code}`
            window.location.href = newUrl
        }
    }, [searchParams])

    return null
}
