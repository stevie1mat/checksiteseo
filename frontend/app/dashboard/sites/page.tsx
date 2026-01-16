import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { AddSiteDialog } from "@/components/dashboard/AddSiteDialog"
import { SiteHealthGrid } from "@/components/dashboard/views/SiteHealthGrid"

export const dynamic = 'force-dynamic'

export default async function SitesPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in to view your sites.</div>
    }

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
        .eq('user_id', user.id) // Explicitly filter by user_id just in case, though RLS should handle it
        .order('created_at', { ascending: false })
        .order('created_at', { referencedTable: 'site_history', ascending: false })
        .limit(30, { referencedTable: 'site_history' })

    // Fetch user profile for subscription status
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

    const tier = profile?.subscription_tier || 'free'
    const isFreePlan = tier === 'free'
    const siteCount = sites?.length || 0

    let MAX_SITES = 3
    if (tier === 'plus') MAX_SITES = 50
    if (tier === 'pro') MAX_SITES = 10000 // Unlimited

    return (
        <div className="space-y-8 w-full p-6">
            {/* Header Section with Background */}
            <div className="bg-slate-50 border-b border-slate-200 -mt-4 -mx-4 px-8 py-8 mb-8">
                <div className="flex items-center justify-between px-4">
                    <div>
                        <h1 className="font-serif text-3xl text-[#224034]">My Sites</h1>
                        <p className="text-slate-500 mt-1">Manage and monitor all your websites.</p>
                    </div>
                    <AddSiteDialog currentSiteCount={siteCount} maxSites={MAX_SITES} />
                </div>
            </div>

            <div className="px-4 space-y-8">
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
