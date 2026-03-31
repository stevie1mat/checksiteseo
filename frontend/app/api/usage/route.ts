import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get Subscription Tier
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single()

        const tier = profile?.subscription_tier || 'free'

        // 2. Define Limits
        const LIMITS: Record<string, number | null> = {
            "free": 5,
            "plus": 50,
            "pro": null
        }
        const limit = LIMITS[tier] ?? 5

        // 3. Count Scans This Month
        const now = new Date()
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

        // Get user's sites first
        const { data: sites } = await supabase
            .from('sites')
            .select('id')
            .eq('user_id', user.id)

        const siteIds = sites?.map(s => s.id) || []

        let usageCount = 0
        if (siteIds.length > 0) {
            const { count } = await supabase
                .from('pages')
                .select('*', { count: 'exact', head: true })
                .in('site_id', siteIds)
                .gte('last_scanned_at', startOfMonth)

            usageCount = count || 0
        }

        return NextResponse.json({
            count: usageCount,
            limit: limit,
            tier: tier,
            remaining: limit === null ? null : Math.max(0, limit - usageCount)
        })

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        console.error('[Usage API] Error:', error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
