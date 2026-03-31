"use client"

import { useStripePortal } from "@/hooks/useStripePortal"
import { ArrowUpRight, Loader2 } from "lucide-react"

export function BillingPortalLink() {
    const { redirectToPortal, isLoading } = useStripePortal()

    return (
        <button
            onClick={redirectToPortal}
            disabled={isLoading}
            className="text-xs text-slate-400 flex items-center gap-1 mt-1 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
        >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            <span>View invoices & payment history</span>
            <ArrowUpRight className="w-3 h-3" />
        </button>
    )
}
