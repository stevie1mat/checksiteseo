import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        const { data: { session } } = await supabase.auth.getSession()

        if (authError || !user || !session?.access_token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
        const usageResponse = await fetch(`${backendUrl}/token-usage`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!usageResponse.ok) {
            const errorData = await usageResponse.json().catch(() => ({}))
            const message = errorData?.detail || `Backend returned ${usageResponse.status}`
            return NextResponse.json({ error: message }, { status: usageResponse.status })
        }

        const usageData = await usageResponse.json()

        const tokenBalance = usageData.token_balance ?? 0
        const dailyFreeTokens = usageData.daily_free_tokens ?? 0
        const canClaimDailyFree = Boolean(usageData.can_claim_daily_free)
        const effectiveRemainingTokens = tokenBalance + (canClaimDailyFree ? dailyFreeTokens : 0)
        const tokensPerDiamond = usageData.tokens_per_diamond ?? 100
        const remainingDiamonds = usageData.remaining_diamonds ?? (effectiveRemainingTokens / Math.max(Number(tokensPerDiamond || 1), 1))

        return NextResponse.json({
            tokenBalance,
            remainingTokens: effectiveRemainingTokens,
            dailyFreeTokens,
            canClaimDailyFree,
            tokensPerScan: usageData.tokens_per_scan ?? 1,
            tokensPerInitialScan: usageData.tokens_per_initial_scan ?? usageData.tokens_per_scan ?? 1,
            tokensPerChat: usageData.tokens_per_chat ?? 1,
            tokensPerAmbiguityScan: usageData.tokens_per_ambiguity_scan ?? usageData.tokens_per_chat ?? 1,
            tokensPerDiamond,
            diamondBalance: usageData.diamond_balance ?? 0,
            remainingDiamonds,
            dailyFreeDiamonds: usageData.daily_free_diamonds ?? 0,
            diamondsPerScan: usageData.diamonds_per_scan ?? 0,
            diamondsPerInitialScan: usageData.diamonds_per_initial_scan ?? usageData.diamonds_per_scan ?? 0,
            diamondsPerChat: usageData.diamonds_per_chat ?? 0,
            diamondsPerAmbiguityScan: usageData.diamonds_per_ambiguity_scan ?? usageData.diamonds_per_chat ?? 0,
            totalDiamondsUsed: usageData.total_diamonds_used ?? 0,
            totalDiamondsPurchased: usageData.total_diamonds_purchased ?? 0,
            totalTokensUsed: usageData.total_tokens_used ?? 0,
            totalTokensPurchased: usageData.total_tokens_purchased ?? 0,
            lastDailyGrantAt: usageData.daily_free_tokens_last_granted_at ?? null,
        })

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        console.error('[Usage API] Error:', error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
