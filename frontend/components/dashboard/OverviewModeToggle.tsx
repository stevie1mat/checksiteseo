"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"

export function OverviewModeToggle() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const activeTab = searchParams.get('tab') || 'overview'

    const viewMode = searchParams.get('mode') || 'simple'

    if (activeTab === "content" || activeTab === "authority") {
        return null
    }

    const setMode = (mode: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('mode', mode)
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="bg-slate-100 p-1 rounded-lg inline-flex shadow-inner">
            <button
                onClick={() => setMode('simple')}
                className={`px-5 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'simple' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Simple
            </button>
            <button
                onClick={() => setMode('advanced')}
                className={`px-5 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'advanced' ? 'bg-white text-[#224034] shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Advanced
            </button>
        </div>
    )
}
