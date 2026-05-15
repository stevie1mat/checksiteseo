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

    const siteCount = sites?.length || 0
    const MAX_SITES = Number(process.env.NEXT_PUBLIC_MAX_SITES_PER_USER || 25)

    return (
        <div className="space-y-8 w-full p-6 pb-10">
            <div className="relative overflow-hidden rounded-[28px] border border-[#d9e8df] bg-white/70 backdrop-blur-sm shadow-[0_24px_70px_rgba(30,64,48,0.10)] px-6 md:px-8 py-7 md:py-8">
                <div className="pointer-events-none absolute -left-20 top-8 h-44 w-44 rounded-full bg-[#d5ebe0] blur-3xl" />
                <div className="pointer-events-none absolute -right-16 top-0 h-52 w-52 rounded-full bg-[#dff1e8] blur-3xl" />
                <div className="relative flex items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl text-[#224034]">My Sites</h1>
                        <p className="text-slate-500 mt-1">Manage and monitor all your websites.</p>
                    </div>
                    <AddSiteDialog currentSiteCount={siteCount} maxSites={MAX_SITES} />
                </div>
            </div>

            <div className="space-y-8">
                {sites && sites.length > 0 ? (
                    <SiteHealthGrid sites={sites} isFreePlan={false} />
                ) : (
                    <Card className="min-h-[400px] border-[#d9e8df] bg-white/75 backdrop-blur-sm shadow-[0_12px_40px_rgba(30,64,48,0.08)]">
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
