"use client"

import { useAEOScan } from "@/hooks/useAEOScan"
import { AEOReport } from "@/types/aeo"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface RealtimeMetricViewProps<T> {
    siteId: string
    domain: string
    initialData: T
    transform: (report: AEOReport) => T
    children: (data: T) => React.ReactNode
}

export function RealtimeMetricView<T>({ siteId, domain, initialData, transform, children }: RealtimeMetricViewProps<T>) {
    const { report } = useAEOScan(domain, siteId)

    // If live report exists, transform it to get live metric data. Else use initial.
    // We safeguard against report being null or transform failing.
    let activeData = initialData;
    if (report) {
        try {
            // Note: The AEOReport type in useAEOScan uses camelCase keys (technical, content, authority)
            // But the raw Supabase 'checklist' often has different structure if not mapped correctly in API endpoint.
            // Our useAEOScan hook uses the API `/api/scan` which returns the CLEAN mapped AEOReport. 
            // So we can rely on standard AEOReport structure here.
            activeData = transform(report);
        } catch (e) {
            console.error("Error transforming live data", e);
        }
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-24 px-6 pt-6 animate-in fade-in duration-500">
            <Link href={`/dashboard/sites/${siteId}`} className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                <ArrowLeft className="w-4 h-4" />
                Back to Report
            </Link>

            {children(activeData)}
        </div>
    )
}
