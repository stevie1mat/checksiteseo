"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutDashboard, Settings, CreditCard, LogOut, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const sidebarItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "My Sites", href: "/dashboard/sites", icon: LayoutDashboard },
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
    const planName = (subscriptionTier || 'free').toUpperCase()
    const isPro = subscriptionTier === 'pro'
    const isPlus = subscriptionTier === 'plus'

    return (
        <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#1A4036] to-[#122e26] text-white">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 group mb-6">
                    <span className="font-serif text-2xl font-medium tracking-wide">
                        &nbsp;CheckSite<span className="text-[#8cd9b8]">AEO</span>
                    </span>
                </Link>

                {/* Plan Badge */}
                <div className={cn(
                    "relative overflow-hidden rounded-xl border p-4 transition-all hover:bg-white/5",
                    isPro ? "border-purple-500/30 bg-purple-500/10" :
                        isPlus ? "border-emerald-500/30 bg-emerald-500/10" :
                            "border-slate-500/30 bg-slate-500/10"
                )}>
                    <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                            "text-sm font-bold tracking-widest",
                            isPro ? "text-purple-200" :
                                isPlus ? "text-emerald-200" :
                                    "text-slate-300"
                        )}>
                            {planName} PLAN
                        </span>
                        {isPro && <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />}
                    </div>
                    <div className="text-xs text-white/60 font-medium">
                        {isPro ? "Unlimited Access" : isPlus ? "Increased Limits" : "Basic Access"}
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1.5 mt-2">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden",
                                isActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#8cd9b8] rounded-r-full shadow-[0_0_10px_rgba(140,217,184,0.5)]" />
                            )}
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-[#8cd9b8]" : "text-white/50 group-hover:text-white"
                            )} />
                            <span className="relative z-10">{item.name}</span>
                            {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#8cd9b8] opacity-50" />}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/5 bg-black/10">
                <button
                    onClick={handleSignOut}
                    className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-rose-500/10 hover:text-rose-200 transition-all"
                >
                    <LogOut className="w-5 h-5 group-hover:text-rose-400 transition-colors" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    )
}

export function DashboardSidebar({ subscriptionTier }: { subscriptionTier?: string }) {
    return (
        <div className="hidden md:block md:w-72 h-full sticky top-0 overflow-y-auto border-r border-[#2a4e40] bg-[#1A4036]">
            <SidebarContent subscriptionTier={subscriptionTier} />
        </div>
    )
}
