import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle, FileText, XCircle } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AEOReport } from "@/types/aeo"

interface ContentTabProps {
    activeReport: AEOReport
}

export function ContentTab({ activeReport }: ContentTabProps) {
    // Helper Accessors (Safeguarded)
    const failedQueries = activeReport.content?.missingAnswers || []

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-serif text-[#224034] mb-4">Content Breakdown</h2>

            <div className="grid grid-cols-1 gap-8">
                {/* Standard Content Checks */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                    {/* Questions */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                        <div>
                            <p className="font-semibold text-slate-700 text-base">Question Targeting</p>
                            <p className="text-sm text-slate-500 mt-0.5">Headers asking questions</p>
                        </div>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">{activeReport.content.questionTargetingScore} / 5</Badge>
                    </div>
                    {/* Readability */}
                    <div className="pb-4 border-b border-gray-50">
                        <div className="flex justify-between items-center mb-1">
                            <div>
                                <p className="font-semibold text-slate-700 text-base">Readability</p>
                                <p className="text-sm text-slate-500 mt-0.5">Flesch-Kincaid Grade</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`
                                    ${activeReport.content.readabilityGrade > 12 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                                `}>
                                    Grade {activeReport.content.readabilityGrade}
                                </Badge>
                                {activeReport.content.readabilityGrade > 12 &&
                                    <button className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded">Simplify</button>
                                }
                            </div>
                        </div>
                        {/* Rewrite Suggestion (Legacy Array Support) */}
                        {activeReport.content.readabilityDetails?.find((d: string) => d.startsWith("Suggestion:")) && (
                            <div className="mt-3 bg-orange-50 rounded-xl p-4 border border-orange-100">
                                <span className="font-bold text-orange-700 block mb-1 text-sm uppercase tracking-wide">✨ AI Rewrite Suggestion</span>
                                <span className="text-slate-700 text-base leading-relaxed">"{activeReport.content.readabilityDetails.find((d: string) => d.startsWith("Suggestion:"))?.replace("Suggestion:", "").trim()}"</span>
                            </div>
                        )}
                    </div>
                    {/* Visual Context */}
                    <div className=" pb-4 border-b border-gray-50">
                        <div className="flex justify-between mb-2">
                            <p className="font-semibold text-slate-700 text-base">Visual Context</p>
                            <p className="text-sm font-medium text-slate-600">{activeReport.content.visualContextScore || 0}%</p>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: (activeReport.content.visualContextScore || 0) + '%' }}></div>
                        </div>
                    </div>
                    {/* Freshness */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                        <div>
                            <p className="font-semibold text-slate-700 text-base">Content Freshness</p>
                            <p className="text-sm text-slate-500 mt-0.5">Dates validated</p>
                        </div>
                        {(activeReport.content.freshnessScore || 0) > 0 ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                    </div>
                </div>

                {/* The Missing Answer (Green Card) */}
                {failedQueries.length > 0 && (
                    <div className="bg-[#224034] rounded-xl overflow-hidden shadow-lg relative group">
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />

                        <div className="p-8 relative z-10">
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
                                <div className="text-center md:text-left shrink-0">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <FileText className="w-5 h-5 text-emerald-400" />
                                        <p className="text-emerald-200/80 font-medium uppercase tracking-widest text-sm">The Missing Answer</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-5xl md:text-6xl font-serif text-white tracking-tighter leading-none">
                                            {Math.round((failedQueries.filter((q: any) => q.status === 'Explicitly Stated').length / Math.max(failedQueries.length, 1)) * 100)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-lg text-emerald-100/60 font-light">/ 100</div>
                                            <div className="text-sm font-bold bg-white/10 px-2 py-0.5 rounded text-emerald-100 shadow-sm border border-white/5">
                                                AI Confidence
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-emerald-100/60 text-base mt-3 max-w-[200px] leading-relaxed">
                                        We simulated real user questions to see if your site provides the answers.
                                    </p>
                                </div>

                                {/* Table Section */}
                                <div className="grow w-full bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                                    <Table>
                                        <TableHeader className="bg-black/20 border-b border-white/10">
                                            <TableRow className="hover:bg-transparent border-white/10">
                                                <TableHead className="text-emerald-100/80 w-[40%]">Simulated User Query</TableHead>
                                                <TableHead className="text-emerald-100/80 w-[15%]">Status</TableHead>
                                                <TableHead className="text-emerald-100/80 w-[15%] text-right">Optimization</TableHead>
                                                <TableHead className="text-emerald-100/80 text-right">Result</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {failedQueries.map((query: any, i: number) => (
                                                <TableRow key={i} className="hover:bg-white/5 border-white/5 group/row transition-colors">
                                                    <TableCell className="font-medium text-emerald-50 py-4 align-top">
                                                        "{query.question}"
                                                    </TableCell>
                                                    <TableCell className="py-4 align-top">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset
                                                        ${query.status === 'Explicitly Stated' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20' :
                                                                query.status === 'Implied' ? 'bg-amber-500/10 text-amber-300 ring-amber-400/20' :
                                                                    'bg-red-500/10 text-red-300 ring-red-400/20'}`}>
                                                            {query.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right py-4 align-top">
                                                        {query.status !== 'Explicitly Stated' && query.draft_answer && (
                                                            <div className="group/btn relative inline-block">
                                                                <button className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded transition-colors">
                                                                    View Draft
                                                                </button>
                                                                {/* Tooltip implementation for draft answer */}
                                                                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all z-50">
                                                                    <p className="font-bold text-emerald-400 mb-1">Use this Answer:</p>
                                                                    <p className="italic">"{query.draft_answer}"</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right py-4 align-top">
                                                        {query.status === 'Explicitly Stated' ?
                                                            <div className="flex items-center justify-end gap-2 text-emerald-400 text-base font-medium"><Check className="w-4 h-4" /> Found</div> :
                                                            <div className="flex items-center justify-end gap-2 text-red-300/80 text-base"><XCircle className="w-4 h-4" /> Failed</div>
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
