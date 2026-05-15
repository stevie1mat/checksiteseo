import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="space-y-8 w-full p-6 pb-20">
            <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8">
                <h1 className="font-serif text-3xl text-[#224034]">Free Plan</h1>
                <p className="text-slate-600 mt-3">
                    Pricing, paid plans, and top-ups are hidden for this app version.
                </p>
                <p className="text-slate-600 mt-2">
                    Each account is limited to one scan every 24 hours.
                </p>
                {user?.email && (
                    <p className="text-slate-500 text-sm mt-6">Signed in as {user.email}</p>
                )}
            </section>
        </div>
    )
}
