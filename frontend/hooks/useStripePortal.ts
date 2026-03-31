"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { getApiUrl } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export function useStripePortal() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    const redirectToPortal = async () => {
        setIsLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            if (!token) {
                throw new Error("Not authenticated")
            }

            const response = await fetch(`${getApiUrl()}/create-portal-session`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Failed to create portal session")
            }

            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error("Portal Error:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to redirect to billing portal",
                variant: "destructive",
            })
            setIsLoading(false) // Only stop loading on error, as success redirects
        }
    }

    return { redirectToPortal, isLoading }
}
