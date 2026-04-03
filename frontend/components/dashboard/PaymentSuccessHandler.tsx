"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

function PaymentSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            // Show success message
            toast({
                title: "Tokens Added!",
                description: "Your Stripe payment was successful and your token balance has been updated.",
                duration: 5000,
            })

            // Refresh data to reflect new plan
            router.refresh()

            // Remove query param without reload
            const newUrl = window.location.pathname
            window.history.replaceState({}, "", newUrl)
        }
    }, [searchParams, router, toast])

    return null
}

export function PaymentSuccessHandler() {
    return (
        <Suspense fallback={null}>
            <PaymentSuccessContent />
        </Suspense>
    )
}
