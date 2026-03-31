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
                title: "Payment Successful!",
                description: "Your subscription has been updated. Welcome to the new plan!",
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
