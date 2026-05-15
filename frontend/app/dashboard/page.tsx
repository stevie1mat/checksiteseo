import { createClient } from '@/lib/supabase/server'
import { AddSiteDialog } from "@/components/dashboard/AddSiteDialog"
import { DashboardStats } from "@/components/dashboard/views/DashboardStats"
import { DashboardTracker } from "@/components/dashboard/DashboardTracker"
import { OverviewAnalyticsPanel } from "@/components/dashboard/views/OverviewAnalyticsPanel"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div>Please log in to view your dashboard.</div>
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .order('created_at', { referencedTable: 'site_history', ascending: false })
        .limit(30, { referencedTable: 'site_history' }) // Last 30 points per site

    const { data: profile } = await supabase
        .from('profiles')
        .select('token_balance, total_tokens_used, total_tokens_purchased, daily_free_tokens_last_granted_at')
        .eq('id', user.id)
        .single()

    const { data: tokenTransactions } = await supabase
        .from('token_transactions')
        .select('created_at, tokens, transaction_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(500)

    const safeSites = sites || []
    const siteCount = safeSites.length
    const maxSites = Number(process.env.NEXT_PUBLIC_MAX_SITES_PER_USER || 25)
    const tokensPerDiamond = Number(process.env.NEXT_PUBLIC_TOKENS_PER_DIAMOND || 100)
    const diamondsPerScan = Number(process.env.NEXT_PUBLIC_DIAMONDS_PER_SCAN || 10)
    const diamondsPerChat = Number(process.env.NEXT_PUBLIC_DIAMONDS_PER_CHAT || 0.5)
    const dailyFreeDiamonds = Number(process.env.NEXT_PUBLIC_DAILY_FREE_DIAMONDS || 10)
    const dailyFreeTokens = Math.max(0, Math.round(dailyFreeDiamonds * tokensPerDiamond))
    const tokensPerScan = Math.max(1, Math.round(diamondsPerScan * tokensPerDiamond))
    const tokensPerChat = Math.max(1, Math.round(diamondsPerChat * tokensPerDiamond))
    const tokenBalance = Number(profile?.token_balance || 0)
    const totalTokensUsed = Number(profile?.total_tokens_used || 0)
    const totalTokensPurchased = Number(profile?.total_tokens_purchased || 0)
    const todayUtc = new Date().toISOString().slice(0, 10)
    const canClaimDailyFree = profile?.daily_free_tokens_last_granted_at !== todayUtc

    return (
        <div className="space-y-8 w-full p-6 pb-10 animate-in fade-in duration-500 slide-in-from-bottom-2">
            <DashboardTracker />

            {/* Stunning Hero Banner */}
            <div className="relative overflow-hidden rounded-[28px] border border-[#2a5040] bg-gradient-to-br from-[#12261e] via-[#1a382c] to-[#142d23] shadow-[0_24px_50px_rgba(20,40,30,0.3)] px-8 md:px-12 py-10 md:py-12">
                {/* Glowing Orbs */}
                <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#34d399]/20 blur-[80px]" />
                <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#10b981]/10 blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="font-serif text-4xl tracking-tight text-white mb-2">Overview</h1>
                        <p className="text-[#a7d1bd] text-lg font-medium">Track your AI visibility and portfolio health across all sites.</p>
                    </div>
                    <div className="flex-shrink-0">
                        <AddSiteDialog currentSiteCount={siteCount} maxSites={maxSites} />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <DashboardStats siteCount={siteCount} maxSites={maxSites} sites={safeSites} />
                <OverviewAnalyticsPanel
                    tokenBalance={tokenBalance}
                    totalTokensUsed={totalTokensUsed}
                    totalTokensPurchased={totalTokensPurchased}
                    dailyFreeTokens={dailyFreeTokens}
                    tokensPerScan={tokensPerScan}
                    tokensPerChat={tokensPerChat}
                    tokensPerDiamond={tokensPerDiamond}
                    canClaimDailyFree={canClaimDailyFree}
                    sites={safeSites}
                    tokenTransactions={tokenTransactions || []}
                />
            </div>
        </div>
    )
}
