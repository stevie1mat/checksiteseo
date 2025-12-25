"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/dashboard/Sidebar"

export function DashboardHeader({ userEmail }: { userEmail?: string }) {
    return (
        <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:text-slate-700 -ml-2">
                            <Menu className="w-5 h-5" />
                            <span className="sr-only">Open sidebar</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r-0 bg-[#1A4036] text-white">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
                <div className="flex items-center gap-4 w-full max-w-sm md:w-96">
                    <div className="relative w-full hidden md:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search sites..."
                            className="pl-9 bg-slate-50 border-slate-200"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
                    <Bell className="w-5 h-5" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-[#224034] text-white flex items-center justify-center text-xs font-medium">
                    {userEmail?.[0].toUpperCase()}
                </div>
            </div>
        </header>
    )
}
