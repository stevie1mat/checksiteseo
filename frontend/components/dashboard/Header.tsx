"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bell, Menu, LogOut, Settings, User, CreditCard } from "lucide-react"
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

export function DashboardHeader({ userEmail }: { userEmail?: string }) {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    return (
        <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between z-40 relative">
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
                    <span className="font-serif text-xl font-medium tracking-wide text-[#1A4036]">
                        CheckSite<span className="text-[#8cd9b8]">AEO</span>
                    </span>
                </div>            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
                            <Bell className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="p-4 text-center text-sm text-slate-500">
                            No new notifications
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                            <div className="h-8 w-8 rounded-full bg-[#224034] text-white flex items-center justify-center text-xs font-medium">
                                {userEmail?.[0]?.toUpperCase()}
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        {userEmail && (
                            <div className="px-2 py-1.5 text-xs text-slate-500 truncate">
                                {userEmail}
                            </div>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
