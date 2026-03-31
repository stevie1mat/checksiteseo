import { PricingSection } from "@/components/PricingSection";
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ManageSubscriptionButton } from "@/components/dashboard/ManageSubscriptionButton";
import { BillingPortalLink } from "@/components/dashboard/BillingPortalLink";
import { CreditCard, CheckCircle2, ArrowUpRight } from "lucide-react";

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

    const isPaidPlan = currentPlan !== 'free';

    return (
        <div className="space-y-8 w-full p-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="font-serif text-3xl text-[#224034]">Billing & Subscription</h1>
                <p className="text-slate-500 mt-1">Manage your plan, billing details, and invoices.</p>
            </div>

            <div className="space-y-12">
                {/* Current Plan Section */}
                <section>
                    <h2 className="text-lg font-medium text-[#224034] mb-4">Current Subscription</h2>

                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        {/* Decorative Background Gradients */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-gradient-to-br from-[#8cd9b8]/10 to-emerald-500/0 blur-3xl pointer-events-none" />

                        <div className="relative p-6 md:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">

                                {/* Plan Details Column */}
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isPaidPlan ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-serif text-2xl text-[#224034] capitalize">
                                                    {currentPlan} Plan
                                                </h3>
                                                {isPaidPlan && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 text-sm mt-0.5">
                                                {isPaidPlan ? "Renews automatically" : "Upgrade to unlock more features"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Features / Description */}
                                    <p className="text-slate-600 max-w-xl leading-relaxed">
                                        {currentPlan === 'free'
                                            ? 'You are currently on the Free plan. Upgrade to unlock full analysis capabilities, more scans, and premium support.'
                                            : currentPlan === 'plus'
                                                ? 'You have access to advanced scanning for up to 300 pages, AI content gap detection, and premium support.'
                                                : 'You have full access to all Pro features including unlimited scans, E-E-A-T scoring, and priority support.'}
                                    </p>
                                </div>

                                {/* Status & Actions Column */}
                                <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end min-w-[200px]">

                                    {/* Status Indicator */}
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 w-fit">
                                        <span className="relative flex h-2.5 w-2.5 mr-1">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaidPlan ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPaidPlan ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                                        </span>
                                        {isPaidPlan ? (
                                            <span>Renews: <span className="font-medium text-slate-900">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></span>
                                        ) : (
                                            <span>Status: <span className="font-medium text-slate-900">Active</span></span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                                        {isPaidPlan && (
                                            <>
                                                <ManageSubscriptionButton />
                                                <BillingPortalLink />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Upgrade / Plans Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-[#224034]">
                            {isPaidPlan ? "Change Your Plan" : "Upgrade Your Plan"}
                        </h2>
                    </div>

                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            {/* We don't pass redirectTo here, so it executes the checkout */}
                            <PricingSection
                                currentPlan={currentPlan}
                                hideHeader={true}
                                userEmail={user?.email}
                                userId={user?.id}
                            />
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    )
}
