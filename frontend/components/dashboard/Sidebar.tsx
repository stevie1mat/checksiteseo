"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Home, LayoutDashboard, Settings, FileText, CreditCard, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const sidebarItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "My Sites", href: "/dashboard/sites", icon: LayoutDashboard },
    // { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings }
]

export function SidebarContent({ subscriptionTier = 'free' }: { subscriptionTier?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    // Normalize tier for display
    const planName = (subscriptionTier || 'free').toUpperCase() + " PLAN"
    const isPro = subscriptionTier === 'pro'
    const isPlus = subscriptionTier === 'plus'

    return (
        <div className="flex h-full w-full flex-col bg-[#1A4036] text-white">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-2">
                    <span className="font-serif text-xl font-medium">CheckSite<span className="text-[#8cd9b8]">AEO</span></span>
                </Link>

                {/* Plan Badge */}
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider ${isPro ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' :
                    isPlus ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' :
                        'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                    }`}>
                    {planName}
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-[#8cd9b8]/10 text-[#8cd9b8]"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-[#2a4e40]">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}

export function DashboardSidebar({ subscriptionTier }: { subscriptionTier?: string }) {
    return (
        <div className="hidden border-r border-[#2a4e40] md:block md:w-64 bg-[#1A4036]">
            <SidebarContent subscriptionTier={subscriptionTier} />
        </div>
    )
}
