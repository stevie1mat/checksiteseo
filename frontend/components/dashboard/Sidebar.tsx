"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, LayoutDashboard, Settings, LogOut, ChevronRight, BookOpen, LifeBuoy, ArrowLeft, BarChart3, Code, AlignLeft, Sparkles, MessageSquare, Trash2, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDiamonds } from "@/lib/diamonds"

const sidebarItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "My Sites", href: "/dashboard/sites", icon: LayoutDashboard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Guide", href: "/aeo-guide", icon: BookOpen },
    { name: "Support", href: "/contact", icon: LifeBuoy }
]

export function SidebarContent({ collapsed = false }: { collapsed?: boolean }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [availableDiamonds, setAvailableDiamonds] = useState<number>(0)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    useEffect(() => {
        let isMounted = true

        const loadUsage = async () => {
            try {
                const response = await fetch("/api/usage", { cache: "no-store" })
                const data = await response.json().catch(() => ({}))
                if (!response.ok || !isMounted) return
                setAvailableDiamonds(Number(data.remainingDiamonds || 0))
            } catch {
                // Ignore sidebar balance fetch errors
            }
        }

        loadUsage()
        const interval = setInterval(loadUsage, 10000)
        const onFocus = () => loadUsage()
        const onDiamondsUpdated = () => loadUsage()
        window.addEventListener("focus", onFocus)
        window.addEventListener("diamonds-updated", onDiamondsUpdated)

        return () => {
            isMounted = false
            clearInterval(interval)
            window.removeEventListener("focus", onFocus)
            window.removeEventListener("diamonds-updated", onDiamondsUpdated)
        }
    }, [])

    return (
        <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#1A4036] to-[#122e26] text-white">
            <div className={cn("p-6", collapsed && "px-3 py-5")}>
                <Link
                    href="/"
                    className={cn("flex items-center group mb-6", collapsed ? "justify-center" : "gap-2")}
                    title="Go to home"
                >
                    <span className={cn("font-serif font-medium tracking-wide", collapsed ? "text-xl" : "text-2xl")}>
                        {collapsed ? "CS" : <>&nbsp;CheckSite<span className="text-[#8cd9b8]">AEO</span></>}
                    </span>
                </Link>
            </div>

            <nav className={cn("flex-1 space-y-1.5 mt-2", collapsed ? "px-2" : "px-3")}>
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.name : undefined}
                            className={cn(
                                "group flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden",
                                collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5",
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
                            {!collapsed && <span className="relative z-10">{item.name}</span>}
                            {!collapsed && isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#8cd9b8] opacity-50" />}
                        </Link>
                    )
                })}
            </nav>

            <div className={cn("pb-3", collapsed ? "px-2" : "px-4")}>
                <div className="relative overflow-hidden rounded-2xl border border-emerald-300/25 bg-white/5 px-3.5 py-3 shadow-[0_8px_24px_rgba(8,20,16,0.35)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(140,217,184,0.2),transparent_60%)]" />
                    <div className={cn("relative flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
                        <div className="h-7 px-2 rounded-full border border-emerald-300/50 bg-emerald-200/15 flex items-center justify-center shadow-sm">
                            <span className="text-[10px] font-bold tracking-wider text-[#b8f5dd]">LIVE</span>
                        </div>
                        {!collapsed && (
                            <div className="leading-tight">
                                <p className="text-[10px] font-bold tracking-[0.18em] text-[#d7fff0] uppercase">Diamonds</p>
                                <p className="text-sm font-semibold text-white">{formatDiamonds(availableDiamonds)} available</p>
                            </div>
                        )}
                    </div>
                    <div className="pointer-events-none absolute left-2 right-2 -bottom-px h-[3px] overflow-hidden rounded-full">
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-[pulse_1.8s_ease-in-out_infinite]" />
                    </div>
                </div>
            </div>

            <div className={cn("border-t border-white/5 bg-black/10", collapsed ? "p-2" : "p-4")}>
                <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className={cn(
                        "group flex w-full items-center rounded-lg text-sm font-medium text-white/70 hover:bg-rose-500/10 hover:text-rose-200 transition-all",
                        collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"
                    )}
                >
                    <LogOut className="w-5 h-5 group-hover:text-rose-400 transition-colors" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    )
}

export function SiteSidebarContent({ siteId, collapsed = false }: { siteId: string; collapsed?: boolean }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const activeTab = searchParams.get('tab') || 'overview'
    const [availableDiamonds, setAvailableDiamonds] = useState<number>(0)

    useEffect(() => {
        let isMounted = true

        const loadUsage = async () => {
            try {
                const response = await fetch("/api/usage", { cache: "no-store" })
                const data = await response.json().catch(() => ({}))
                if (!response.ok || !isMounted) return
                setAvailableDiamonds(Number(data.remainingDiamonds || 0))
            } catch {
                // Ignore sidebar balance fetch errors
            }
        }

        loadUsage()
        const interval = setInterval(loadUsage, 10000)
        const onFocus = () => loadUsage()
        const onDiamondsUpdated = () => loadUsage()
        window.addEventListener("focus", onFocus)
        window.addEventListener("diamonds-updated", onDiamondsUpdated)

        return () => {
            isMounted = false
            clearInterval(interval)
            window.removeEventListener("focus", onFocus)
            window.removeEventListener("diamonds-updated", onDiamondsUpdated)
        }
    }, [])

    const siteSidebarItems = [
        { name: "Overview", href: `/dashboard/sites/${siteId}?tab=overview`, icon: BarChart3, id: 'overview' },
        { name: "Technical", href: `/dashboard/sites/${siteId}?tab=technical`, icon: Code, id: 'technical' },
        { name: "Content", href: `/dashboard/sites/${siteId}?tab=content`, icon: AlignLeft, id: 'content' },
        { name: "Authority", href: `/dashboard/sites/${siteId}?tab=authority`, icon: Sparkles, id: 'authority' },
        { name: "AI Chat", href: `/dashboard/sites/${siteId}/chat`, icon: MessageSquare, id: 'chat', isExactRoute: true },
        { name: "Delete Site", href: `/dashboard/sites/${siteId}/delete`, icon: Trash2, id: 'delete', isExactRoute: true },
    ]

    return (
        <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#1A4036] to-[#122e26] text-white">
            <div className={cn("p-6 pb-2", collapsed && "px-2 py-5")}>
                <Link
                    href="/dashboard/sites"
                    title="Back to Sites"
                    className={cn(
                        "text-[#8cd9b8] hover:text-white transition-colors mb-6 text-sm font-medium",
                        collapsed ? "flex justify-center" : "flex items-center gap-2"
                    )}
                >
                    <ArrowLeft className="w-4 h-4" />
                    {!collapsed && "Back to Sites"}
                </Link>
                {!collapsed && (
                    <div className="flex items-center gap-2 group mb-2">
                        <span className="font-serif text-xl font-medium tracking-wide">
                            Site Analysis
                        </span>
                    </div>
                )}
            </div>

            <nav className={cn("flex-1 space-y-1.5 mt-2", collapsed ? "px-2" : "px-3")}>
                {siteSidebarItems.map((item) => {
                    const isTechnicalSubRoute = item.id === "technical" && pathname.startsWith(`/dashboard/sites/${siteId}/technical`)
                    const isActive = item.isExactRoute
                        ? pathname === item.href
                        : isTechnicalSubRoute || (activeTab === item.id && pathname === `/dashboard/sites/${siteId}`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.name : undefined}
                            className={cn(
                                "group flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden",
                                collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5",
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
                            {!collapsed && <span className="relative z-10">{item.name}</span>}
                            {!collapsed && isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#8cd9b8] opacity-50" />}
                        </Link>
                    )
                })}
            </nav>

            <div className={cn("pb-16", collapsed ? "px-2" : "px-4")}>
                <div className="relative overflow-hidden rounded-2xl border border-emerald-300/25 bg-white/5 px-3.5 py-3 shadow-[0_8px_24px_rgba(8,20,16,0.35)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(140,217,184,0.2),transparent_60%)]" />
                    <div className={cn("relative flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
                        <div className="h-7 px-2 rounded-full border border-emerald-300/50 bg-emerald-200/15 flex items-center justify-center shadow-sm">
                            <span className="text-[10px] font-bold tracking-wider text-[#b8f5dd]">LIVE</span>
                        </div>
                        {!collapsed && (
                            <div className="leading-tight">
                                <p className="text-[10px] font-bold tracking-[0.18em] text-[#d7fff0] uppercase">Diamonds</p>
                                <p className="text-sm font-semibold text-white">{formatDiamonds(availableDiamonds)} available</p>
                            </div>
                        )}
                    </div>
                    <div className="pointer-events-none absolute left-2 right-2 -bottom-px h-[3px] overflow-hidden rounded-full">
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-[pulse_1.8s_ease-in-out_infinite]" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function DashboardSidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        const stored = window.localStorage.getItem("dashboard_sidebar_collapsed")
        if (stored === "1") {
            setCollapsed(true)
        }
    }, [])

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev
            window.localStorage.setItem("dashboard_sidebar_collapsed", next ? "1" : "0")
            return next
        })
    }
    
    // Check if we are in a site-specific route: /dashboard/sites/[id]
    const siteRouteMatch = pathname.match(/^\/dashboard\/sites\/([^/]+)/)
    const siteId = siteRouteMatch ? siteRouteMatch[1] : null
    
    // Determine if we should show the site sidebar (only if there's an ID, so not on /dashboard/sites itself)
    const showSiteSidebar = siteId && pathname !== '/dashboard/sites'

    return (
        <div
            className={cn(
                "hidden md:block h-full sticky top-0 overflow-y-auto border-r border-[#2a4e40] bg-[#1A4036] transition-[width] duration-300",
                collapsed ? "md:w-20" : "md:w-72"
            )}
        >
            <button
                onClick={toggleCollapsed}
                className="absolute bottom-5 left-3 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2a4e40] bg-[#133329] text-[#9fceb8] shadow-sm hover:text-white hover:bg-[#1f4a3c] transition-colors"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
            {showSiteSidebar ? <SiteSidebarContent siteId={siteId} collapsed={collapsed} /> : <SidebarContent collapsed={collapsed} />}
        </div>
    )
}
