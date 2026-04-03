import { PricingSection } from "@/components/PricingSection";
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from "@/components/ui/card";
import { BillingPortalLink } from "@/components/dashboard/BillingPortalLink";
import { PaymentSuccessHandler } from "@/components/dashboard/PaymentSuccessHandler";
import { Coins, Sparkles } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let tokenBalance = 0
    let totalPurchased = 0
    let totalUsed = 0
    let hasBillingHistory = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('token_balance, total_tokens_purchased, total_tokens_used, stripe_customer_id')
            .eq('id', user.id)
            .single()

        tokenBalance = profile?.token_balance || 0
        totalPurchased = profile?.total_tokens_purchased || 0
        totalUsed = profile?.total_tokens_used || 0
        hasBillingHistory = !!profile?.stripe_customer_id
    }

    const dailyFreeTokens = Number(process.env.NEXT_PUBLIC_DAILY_FREE_TOKENS || 1000)
    return (
        <div className="space-y-8 w-full p-6 pb-20">
            <PaymentSuccessHandler />
            <div className="relative overflow-hidden rounded-[28px] border border-[#d9e8df] bg-white/70 backdrop-blur-sm shadow-[0_24px_70px_rgba(30,64,48,0.10)] px-6 md:px-8 py-7 md:py-8">
                <div className="pointer-events-none absolute -left-20 top-8 h-44 w-44 rounded-full bg-[#d5ebe0] blur-3xl" />
                <div className="pointer-events-none absolute -right-16 top-0 h-52 w-52 rounded-full bg-[#dff1e8] blur-3xl" />
                <h1 className="font-serif text-3xl text-[#224034]">TOP UP</h1>
                <p className="text-slate-500 mt-1">Add tokens anytime.</p>
            </div>

            <div className="space-y-12">
                <section>
                    <h2 className="text-lg font-medium text-[#224034] mb-4">Current Token Balance</h2>

                    <div className="relative overflow-hidden rounded-2xl border border-[#d9e8df] bg-white/75 backdrop-blur-sm shadow-[0_14px_46px_rgba(30,64,48,0.08)] hover:shadow-[0_18px_56px_rgba(30,64,48,0.10)] transition-shadow duration-300">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-gradient-to-br from-[#8cd9b8]/10 to-emerald-500/0 blur-3xl pointer-events-none" />

                        <div className="relative p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-slate-200 bg-slate-50/60 shadow-none">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">
                                            <Coins className="h-4 w-4" />
                                            Available
                                        </div>
                                        <p className="font-serif text-3xl text-[#224034]">{tokenBalance.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 mt-1">tokens ready to use</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 bg-slate-50/60 shadow-none">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">
                                            <Sparkles className="h-4 w-4" />
                                            Daily Free
                                        </div>
                                        <p className="font-serif text-3xl text-[#224034]">{dailyFreeTokens}</p>
                                        <p className="text-xs text-slate-500 mt-1">tokens added per day</p>
                                    </CardContent>
                                </Card>

                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span>Total purchased: <span className="font-semibold text-slate-700">{totalPurchased.toLocaleString()}</span></span>
                                <span>•</span>
                                <span>Total used: <span className="font-semibold text-slate-700">{totalUsed.toLocaleString()}</span></span>
                            </div>

                            {hasBillingHistory && (
                                <div className="mt-3">
                                    <BillingPortalLink />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-[#224034]">Buy More Tokens</h2>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur-sm shadow-sm">
                        <PricingSection
                            currentPlan="token"
                            hideHeader={true}
                            userEmail={user?.email}
                            userId={user?.id}
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}
