"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, AlertCircle, Search, FileText, Database, BarChart3 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ScanProgressDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    siteUrl: string
    status: 'idle' | 'scanning' | 'complete' | 'error'
    message?: string
    title?: string // Optional custom title
    steps?: { label: string, icon: LucideIcon, threshold: number }[] // Optional custom steps
}

const DEFAULT_STEPS = [
    { label: "Initializing", icon: Search, threshold: 0 },
    { label: "Crawling", icon: FileText, threshold: 25 },
    { label: "Analyzing", icon: Database, threshold: 50 },
    { label: "Finalizing", icon: BarChart3, threshold: 85 },
]

export function ScanProgressDialog({ open, onOpenChange, siteUrl, status, message, title, steps }: ScanProgressDialogProps) {
    const [progress, setProgress] = useState(0)
    const [activeStep, setActiveStep] = useState(0)

    // Use provided steps or default
    const actualSteps = steps || DEFAULT_STEPS

    // Simulate progress when scanning
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (status === 'scanning') {
            setProgress(0)
            setActiveStep(0)

            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 92) return prev // Hold near end

                    // Variable speed
                    const increment = Math.random() * (prev < 40 ? 4 : prev < 70 ? 2 : 0.5)
                    const next = prev + increment

                    // Update active step based on progress thresholds dynamically
                    let currentStepIndex = 0;
                    for (let i = actualSteps.length - 1; i >= 0; i--) {
                        if (next > actualSteps[i].threshold) {
                            currentStepIndex = i;
                            break;
                        }
                    }
                    setActiveStep(currentStepIndex)

                    return next
                })
            }, 600)

        } else if (status === 'complete') {
            setProgress(100)
            setActiveStep(actualSteps.length - 1)
        } else if (status === 'error') {
            setProgress(0)
            setActiveStep(0)
        }

        return () => clearInterval(interval)
    }, [status, actualSteps])

    // Clean URL for display
    const displayUrl = siteUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    const isError = status === 'error'
    const isComplete = status === 'complete'
    const statusLabel = isComplete ? 'Analysis Complete' : isError ? 'Analysis Failed' : 'Scanning Target'
    const statusDetail = status === 'scanning'
        ? (message || `Gathering data for ${displayUrl}...`)
        : isComplete
            ? `Report ready for ${displayUrl}`
            : message || 'An unexpected error occurred.'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] bg-white border border-[#d9e8df] text-[#1f2f2a] p-0 overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(30,64,48,0.2)] backdrop-blur-xl [&>[data-slot=dialog-close]]:top-5 [&>[data-slot=dialog-close]]:right-5 [&>[data-slot=dialog-close]]:h-8 [&>[data-slot=dialog-close]]:w-8 [&>[data-slot=dialog-close]]:rounded-full [&>[data-slot=dialog-close]]:!border [&>[data-slot=dialog-close]]:!border-[#cfe1d7] [&>[data-slot=dialog-close]]:!bg-white/95 [&>[data-slot=dialog-close]]:!text-[#4f6a5f] [&>[data-slot=dialog-close]]:opacity-100 [&>[data-slot=dialog-close]]:shadow-sm [&>[data-slot=dialog-close]]:hover:!bg-[#edf8f2] [&>[data-slot=dialog-close]]:hover:!text-[#224034]">
                <div className="relative overflow-hidden border-b border-[#e1ede6] bg-[linear-gradient(145deg,#ffffff_0%,#f5fbf8_45%,#edf8f2_100%)] p-6 sm:p-7">
                    <div className="absolute -top-24 -right-20 h-56 w-56 rounded-full bg-[#8cd9b8]/20 blur-3xl" />
                    <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#cbeadb]/35 blur-3xl" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="flex flex-col gap-4">
                            <span className="w-fit rounded-full border border-[#d2e4da] bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#5b746a] shadow-sm">
                                {title || "AEO Analysis in Progress"}
                            </span>
                            <div className="flex items-center gap-3 text-2xl">
                                <div className={cn(
                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm transition-colors",
                                    isError ? "border-red-200 text-red-500" : "border-[#d2e4da] text-[#2d8a63]"
                                )}>
                                    {status === 'scanning' && <Loader2 className="w-6 h-6 animate-spin" />}
                                    {isComplete && <CheckCircle2 className="w-6 h-6" />}
                                    {isError && <AlertCircle className="w-6 h-6" />}
                                </div>
                                <span className={cn(
                                    "transition-colors duration-300 font-serif text-[clamp(1.6rem,2.6vw,2.05rem)]",
                                    isError ? "text-red-700" : "text-[#1b2f28]"
                                )}>
                                    {statusLabel}
                                </span>
                            </div>
                        </DialogTitle>
                        <p className={cn(
                            "text-sm mt-1 truncate",
                            isError ? "text-red-500" : "text-[#5e7469]"
                        )}>
                            {statusDetail}
                        </p>
                    </DialogHeader>
                </div>

                <div className="p-6 sm:p-8 space-y-7 bg-white">
                    <div className="space-y-3 rounded-2xl border border-[#e3efe8] bg-[linear-gradient(180deg,#ffffff_0%,#f8fcfa_100%)] p-4 sm:p-5">
                        <div className="flex justify-between text-xs font-semibold text-[#5f7569]">
                            <span>Processing</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress
                            value={progress}
                            className="h-2.5 bg-[#d8e8df]"
                            indicatorClassName={cn(
                                "bg-gradient-to-r from-[#76cea8] via-[#57bb90] to-[#2f9368] transition-all duration-300",
                                isError && "bg-gradient-to-r from-red-400 via-red-500 to-red-600"
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-2 sm:gap-3 relative">
                        <div className="absolute top-[1.15rem] left-0 w-full h-[2px] bg-[#deebe4] -z-10 rounded-full" />
                        <div
                            className={cn(
                                "absolute top-[1.15rem] left-0 h-[2px] -z-10 rounded-full transition-all duration-500",
                                isError ? "bg-red-300" : "bg-[#7fcea8]"
                            )}
                            style={{ width: `${Math.max(progress, 8)}%` }}
                        />
                        {actualSteps.map((step, index) => {
                            const isActive = index === activeStep
                            const isCompleted = !isError && (index < activeStep || isComplete)
                            const isStepError = isError && isActive
                            const Icon = step.icon

                            return (
                                <div key={step.label} className="flex flex-col items-center gap-3">
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 bg-white",
                                        isStepError ? "border-red-300 bg-red-50 text-red-500 scale-105 shadow-[0_0_0_5px_rgba(239,68,68,0.12)]" :
                                            isActive ? "border-[#6bc69f] text-[#2f9368] scale-105 shadow-[0_0_0_6px_rgba(126,211,169,0.24)]" :
                                                isCompleted ? "border-[#2f9368] bg-[#2f9368] text-white" :
                                                    "border-[#d2e4da] text-[#87a094]"
                                    )}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] uppercase tracking-[0.11em] font-semibold transition-colors duration-300 text-center",
                                        isStepError ? "text-red-500" :
                                            isActive ? "text-[#2f9368]" :
                                                isCompleted ? "text-[#4a6459]" :
                                                    "text-[#93a79d]"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
