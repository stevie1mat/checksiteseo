import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/Header'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/signin')
    }

    // Fetch user profile for subscription status
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

    const subscriptionTier = profile?.subscription_tier || 'free'

    return (
        <div className="flex h-screen bg-slate-50">
            <DashboardSidebar subscriptionTier={subscriptionTier} />
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <DashboardHeader userEmail={user.email} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
