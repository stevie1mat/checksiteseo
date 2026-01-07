import { PricingSection } from "@/components/PricingSection";
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let currentPlan = "free"

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single()
        if (profile?.subscription_tier) {
            currentPlan = profile.subscription_tier
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl text-[#224034]">Billing & Plans</h1>
                    <p className="text-slate-500 mt-1">Manage your subscription and billing details.</p>
                </div>
            </div>
            {/* Premium Current Plan Card */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md mb-8">
                {/* Decorative Background Gradients */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#8cd9b8]/20 to-emerald-500/0 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-gradient-to-tr from-[#224034]/5 to-transparent blur-3xl" />

                <div className="relative p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-serif font-medium text-[#224034]">Current Plan</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${currentPlan === 'pro' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        currentPlan === 'plus' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                                </span>
                            </div>

                            <p className="text-slate-600 max-w-lg">
                                {currentPlan === 'free'
                                    ? 'You are currently on the Free plan. Upgrade to unlock full analysis capabilities.'
                                    : currentPlan === 'plus'
                                        ? 'You have access to advanced scanning for up to 300 pages and premium support.'
                                        : 'You have full access to all Pro features with unlimited scans and priority support.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Placeholder for future customer portal link */}
                            {currentPlan !== 'free' && (
                                <button className="px-4 py-2 text-sm font-medium text-[#224034] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                                    Manage Subscription
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status Footer */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                        <div className={`w-2 h-2 rounded-full ${currentPlan === 'free' ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                        <span>Status: <span className="font-medium text-slate-900">Active</span></span>
                        <span className="mx-2">•</span>
                        <span>Next billing date: <span className="font-medium text-slate-900">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></span>
                    </div>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    <div className="p-6">
                        {/* We don't pass redirectTo here, so it executes the checkout */}
                        <PricingSection
                            currentPlan={currentPlan}
                            hideHeader={true}
                            userEmail={user?.email}
                            userId={user?.id}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
