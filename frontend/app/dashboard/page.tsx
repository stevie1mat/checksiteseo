import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MoveUpRight, ArrowUpRight, Globe, BarChart3, Clock } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl text-[#224034]">Overview</h1>
                    <p className="text-slate-500 mt-1">Track your AEO performance across all sites.</p>
                </div>
                <Button className="bg-[#224034] hover:bg-[#1a332a] text-white gap-2 h-11 px-6">
                    <Plus className="w-4 h-4" />
                    Add New Site
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Sites</CardTitle>
                        <Globe className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#224034]">0</div>
                        <p className="text-xs text-slate-500 mt-1">Active projects</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Average AEO Score</CardTitle>
                        <BarChart3 className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#224034]">-</div>
                        <p className="text-xs text-slate-500 mt-1">No data available</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Scans This Month</CardTitle>
                        <Clock className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#224034]">0</div>
                        <p className="text-xs text-slate-500 mt-1">0 credits remaining</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity / Empty State */}
            <Card className="border-slate-200 shadow-xs min-h-[400px]">
                <CardHeader>
                    <CardTitle className="text-[#224034] font-serif">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="font-medium text-slate-900 mb-1">No sites added yet</h3>
                        <p className="text-slate-500 max-w-sm mb-6">
                            Start by adding your first website to analyze its Answer Engine Optimization score.
                        </p>
                        <Button variant="outline" className="gap-2">
                            Add a Site
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
