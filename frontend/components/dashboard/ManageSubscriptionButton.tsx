"use client"

import { Loader2 } from "lucide-react"
import { useStripePortal } from "@/hooks/useStripePortal"

export function ManageSubscriptionButton() {
    const { redirectToPortal, isLoading } = useStripePortal()

    return (
        <button
            onClick={redirectToPortal}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#224034] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Manage Subscription
        </button>
    )
}

