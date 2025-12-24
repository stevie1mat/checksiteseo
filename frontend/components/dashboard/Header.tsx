"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function DashboardHeader({ userEmail }: { userEmail?: string }) {
    return (
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search sites..."
                        className="pl-9 bg-slate-50 border-slate-200"
                    />
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
