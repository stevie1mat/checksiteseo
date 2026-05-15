"use client"

import { useRouter, useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Menu, LogOut, Settings, CreditCard, ArrowLeft, MessageSquare } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/dashboard/Sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { OverviewModeToggle } from "@/components/dashboard/OverviewModeToggle"
import { RescanButton } from "@/components/RescanButton"

export function DashboardHeader({ userEmail }: { userEmail?: string }) {
    const router = useRouter()
    const params = useParams()
    const pathname = usePathname()
    const supabase = createClient()

    const siteId = params?.id as string
    const isSiteRoute = pathname?.includes('/dashboard/sites/') && siteId

    const [site, setSite] = useState<any>(null)

    useEffect(() => {
        if (isSiteRoute && siteId) {
            supabase.from('sites').select('*').eq('id', siteId).single().then(({ data }) => {
                if (data) setSite(data)
            })
        } else {
            setSite(null)
        }
    }, [isSiteRoute, siteId, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    return (
        <header className="h-20 border-b border-[#d3e6dc] bg-white/70 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-40 relative">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:text-slate-700 -ml-2">
                            <Menu className="w-5 h-5" />
                            <span className="sr-only">Open sidebar</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 border-r-0 bg-transparent shadow-none text-white">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
                <div className="md:hidden flex items-center">
                    {!isSiteRoute && (
                        <span className="font-serif text-xl font-medium tracking-wide text-[#1A4036]">
                            CheckSite<span className="text-[#8cd9b8]">AEO</span>
                        </span>
                    )}
                </div>

                {/* Site Header Elements (Desktop) */}
                {isSiteRoute && site && (
                    <div className="hidden md:flex items-center gap-3 ml-2">

                        <div className="flex flex-col justify-center">
                            <h1 className="text-lg font-serif text-[#224034] font-bold leading-tight">{site.name || site.url}</h1>

                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                {/* Site Header Action Buttons */}
                {isSiteRoute && site && (
                    <div className="hidden md:flex items-center gap-2 mr-2">
                        <OverviewModeToggle />
                        <Link
                            href={`/dashboard/sites/${site.id}/chat`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#224034] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <MessageSquare className="h-4 w-4" />
                            AI Chat
                        </Link>
                        <RescanButton siteId={site.id} url={site.url} />
                    </div>
                )}

            </div>
        </header>
    )
}
