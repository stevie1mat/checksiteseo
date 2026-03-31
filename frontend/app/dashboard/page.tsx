import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, BarChart3, Clock, Plus, ExternalLink, ArrowRight } from "lucide-react"
import { AddSiteDialog } from "@/components/dashboard/AddSiteDialog"
import Link from "next/link"
import { RescanButton } from "@/components/RescanButton"
import { SiteHealthGrid } from "@/components/dashboard/views/SiteHealthGrid"
import { DashboardStats } from "@/components/dashboard/views/DashboardStats"
import { DashboardTracker } from "@/components/dashboard/DashboardTracker"
import { PaymentSuccessHandler } from "@/components/dashboard/PaymentSuccessHandler"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser() // User is guaranteed by layout but good to have safety

    // Fetch user sites with history
    const { data: sites } = await supabase
        .from('sites')
        .select(`
            *,
            site_history (
                id,
                aeo_score,
                created_at
            )
        `)
        .order('created_at', { ascending: false })
        .order('created_at', { referencedTable: 'site_history', ascending: false })
        .limit(30, { referencedTable: 'site_history' }) // Last 30 points per site

    const siteCount = sites?.length || 0
    // Fetch user profile for subscription tier
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user?.id)
        .single()

    const tier = profile?.subscription_tier || 'free'
    const isFreePlan = tier === 'free'

    let maxSites = 3
    if (tier === 'plus') maxSites = 50
    if (tier === 'pro') maxSites = 100000

    return (
        <div className="space-y-8 w-full p-6">
            <DashboardTracker />
            <PaymentSuccessHandler />
            {/* Header Section with Background */}
            <div className="bg-slate-50 border-b border-slate-200 -mt-4 -mx-4 px-8 py-8 mb-8">
                <div className="flex items-center justify-between px-4">
                    <div>
                        <h1 className="font-serif text-3xl text-[#224034]">Overview</h1>
                        <p className="text-slate-500 mt-1">Track your AEO performance across all sites.</p>
                    </div>
                    <AddSiteDialog currentSiteCount={siteCount} maxSites={maxSites} />
                </div>
            </div>

            <div className="px-4 space-y-8">
                {/* Active Top Cards */}
                <DashboardStats siteCount={siteCount} maxSites={maxSites} sites={sites || []} />

                {/* Site Health Grid */}
                {sites && sites.length > 0 ? (
                    <SiteHealthGrid sites={sites} isFreePlan={isFreePlan} />
                ) : (
                    <Card className="border-slate-200 shadow-xs min-h-[400px]">
                        <CardHeader>
                            <CardTitle className="text-[#224034] font-serif">Site Health Grid</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Plus className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="font-medium text-slate-900 mb-1">No sites added yet</h3>
                                <p className="text-slate-500 max-w-sm mb-6">
                                    Start by adding your first website to analyze its Answer Engine Optimization score.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
