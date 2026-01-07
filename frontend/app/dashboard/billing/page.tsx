import { PricingSection } from "@/components/PricingSection";
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-[#224034] font-serif">Available Plans</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6 pt-0">
                        {/* We don't pass redirectTo here, so it executes the checkout */}
                        <PricingSection currentPlan={currentPlan} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
