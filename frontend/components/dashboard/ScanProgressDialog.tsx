"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, AlertCircle, Search, FileText, Database, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ScanProgressDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    siteUrl: string
    status: 'idle' | 'scanning' | 'complete' | 'error'
    message?: string
    title?: string // Optional custom title
    steps?: { label: string, icon: any, threshold: number }[] // Optional custom steps
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#0c1814] border-[#1f362d] text-white p-0 overflow-hidden shadow-2xl">

                {/* Header Section */}
                <div className="bg-[#13231d] p-6 border-b border-[#1f362d] relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#224034]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="flex flex-col gap-3 font-serif">
                            <span className="text-slate-400 text-xs uppercase tracking-wider font-sans font-medium">
                                {title || "AEO Analysis in Progress"}
                            </span>
                            <div className="flex items-center gap-3 text-2xl text-white">
                                {status === 'scanning' && <Loader2 className="w-6 h-6 animate-spin text-[#8cd9b8]" />}
                                {status === 'complete' && <CheckCircle2 className="w-6 h-6 text-[#8cd9b8]" />}
                                {status === 'error' && <AlertCircle className="w-6 h-6 text-red-400" />}

                                <span className={cn(
                                    "transition-colors duration-300",
                                    status === 'error' ? "text-red-100" : "text-white"
                                )}>
                                    {status === 'complete' ? 'Analysis Complete' : status === 'error' ? 'Analysis Failed' : 'Scanning Target'}
                                </span>
                            </div>
                        </DialogTitle>
                        <p className="text-slate-400 text-sm mt-1 truncate">
                            {status === 'scanning' ? `Gathering data for ${displayUrl}...` :
                                status === 'complete' ? `Report ready for ${displayUrl}` :
                                    message || 'An unexpected error occurred.'}
                        </p>
                    </DialogHeader>
                </div>

                {/* Progress Visuals */}
                <div className="p-8 space-y-8 bg-[#0c1814]">

                    {/* Main Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                            <span>Processing</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress
                            value={progress}
                            className="h-2 bg-[#1f362d]"
                            indicatorClassName={cn(
                                "bg-[#8cd9b8] transition-all duration-300",
                                status === 'error' && "bg-red-500"
                            )}
                        />
                    </div>

                    {/* Steps Timeline */}
                    <div className="grid grid-cols-4 gap-2 relative">
                        {/* Connecting Line (Behind) */}
                        <div className="absolute top-4 left-0 w-full h-[1px] bg-[#1f362d] -z-10" />

                        {actualSteps.map((step, index) => {
                            const isActive = index === activeStep
                            const isCompleted = index < activeStep || status === 'complete'
                            const Icon = step.icon

                            return (
                                <div key={step.label} className="flex flex-col items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 bg-[#0c1814]",
                                        isActive ? "border-[#8cd9b8] text-[#8cd9b8] scale-110 shadow-[0_0_15px_rgba(140,217,184,0.3)]" :
                                            isCompleted ? "border-[#224034] bg-[#224034] text-white border-transparent" :
                                                "border-[#1f362d] text-slate-600"
                                    )}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] uppercase tracking-wide font-medium transition-colors duration-300 text-center",
                                        isActive ? "text-[#8cd9b8]" :
                                            isCompleted ? "text-slate-300" :
                                                "text-slate-600"
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
