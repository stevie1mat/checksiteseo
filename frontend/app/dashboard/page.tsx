import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, BarChart3, Clock, Plus, ExternalLink, ArrowRight } from "lucide-react"
import { AddSiteDialog } from "@/components/dashboard/AddSiteDialog"
import Link from "next/link"
import { RescanButton } from "@/components/dashboard/RescanButton"

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser() // User is guaranteed by layout but good to have safety

    // Fetch user sites
    const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false })

    const siteCount = sites?.length || 0
    const FREE_PLAN_LIMIT = 1 // 1 site for free plan

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl text-[#224034]">Overview</h1>
                    <p className="text-slate-500 mt-1">Track your AEO performance across all sites.</p>
                </div>
                <AddSiteDialog currentSiteCount={siteCount} maxSites={FREE_PLAN_LIMIT} />
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Sites</CardTitle>
                        <Globe className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#224034]">{siteCount}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            {siteCount >= FREE_PLAN_LIMIT ? 'Limit reached' : `${FREE_PLAN_LIMIT - siteCount} remaining`} (Free Plan)
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Average AEO Score</CardTitle>
                        <BarChart3 className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#224034]">-</div>
                        <p className="text-xs text-slate-500 mt-1">No data available</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Scans This Month</CardTitle>
                        <Clock className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#224034]">0</div>
                        <p className="text-xs text-slate-500 mt-1">0 credits remaining</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sites List or Empty State */}
            <Card className="border-slate-200 shadow-xs min-h-[400px]">
                <CardHeader>
                    <CardTitle className="text-[#224034] font-serif">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {sites && sites.length > 0 ? (
                        <div className="space-y-4">
                            {sites.map((site) => (
                                <div key={site.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-[#224034]/5 flex items-center justify-center text-[#224034]">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-[#224034]">{site.url}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${site.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    site.status === 'analyzing' ? 'bg-blue-100 text-blue-700' :
                                                        site.status === 'error' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700' // pending
                                                    }`}>
                                                    {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    Added {new Date(site.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {site.status !== 'completed' && (
                                            <RescanButton siteId={site.id} url={site.url} />
                                        )}
                                        <Link href={`/dashboard/sites/${site.id}`} className="text-sm font-medium text-[#224034] hover:text-[#8cd9b8] transition-colors flex items-center gap-2">
                                            View Report <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="font-medium text-slate-900 mb-1">No sites added yet</h3>
                            <p className="text-slate-500 max-w-sm mb-6">
                                Start by adding your first website to analyze its Answer Engine Optimization score.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
