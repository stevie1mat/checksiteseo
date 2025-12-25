import { createClient } from '@/lib/supabase/server'
import { RescanButton } from "@/components/RescanButton"
import { SiteReportView } from "@/components/dashboard/SiteReportView"
import { ArrowLeft, Globe, Calendar } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function SiteDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="p-8 text-center text-red-500">
                Unauthorized. Please sign in.
            </div>
        )
    }

    // Fetch site details
    const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!site) {
        notFound()
    }

    // Fetch pages for this site
    // For now we assume the first page scanned is the homepage/main audit we want to show details for
    const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('site_id', site.id)
        .order('last_scanned_at', { ascending: false }) // Get latest scan
        .limit(1)

    const latestScan = pages && pages[0];
    const breakdown = latestScan?.checklist;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-24">
            {/* Header / Nav */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard" className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-full bg-[#224034]/5 flex items-center justify-center text-[#224034]">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h1 className="font-serif text-3xl text-[#224034]">{site.url}</h1>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 ml-1">
                            <span className={`px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${site.status === 'completed' ? 'bg-green-100 text-green-700' :
                                site.status === 'analyzing' ? 'bg-blue-100 text-blue-700' :
                                    site.status === 'error' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                                {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Added {new Date(site.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    {/* Rescan Button */}
                    <RescanButton siteId={site.id} url={site.url} />
                </div>
            </div>

            {/* If no scan or analyzing */}
            {!latestScan || !breakdown ? (
                <div className="p-12 text-center bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-500">
                        {site.status === 'analyzing' ? 'Analysis in progress... please wait.' : 'No detailed scan data available. Please click Rescan.'}
                    </p>
                </div>
            ) : (
                // Render the interactive summary view
                <SiteReportView breakdown={breakdown} aeoScore={latestScan.aeo_score || 0} />
            )}
        </div>
    )
}
