import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/Header'
import type { Metadata } from "next"

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    },
}

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

    return (
        <div className="flex h-screen bg-[#e9f4ee] text-[#223f33]">
            <DashboardSidebar />
            <div className="relative flex-1 flex flex-col overflow-hidden w-full">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-[#7dc9a7]/12 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-[560px] h-[560px] bg-[#8cd9b8]/12 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#6d7f7514_1px,transparent_1px),linear-gradient(to_bottom,#6d7f7514_1px,transparent_1px)] bg-[size:38px_38px]" />
                </div>
                <DashboardHeader userEmail={user.email} />
                <main className="relative flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
