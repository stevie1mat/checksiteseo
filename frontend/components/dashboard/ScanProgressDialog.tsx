"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface ScanProgressDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    siteUrl: string
    status: 'idle' | 'scanning' | 'complete' | 'error'
    message?: string
}

export function ScanProgressDialog({ open, onOpenChange, siteUrl, status, message }: ScanProgressDialogProps) {
    const [progress, setProgress] = useState(0)

    // Simulate progress when scanning
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (status === 'scanning') {
            setProgress(0)
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev // Hold at 90%
                    // Slower progress as it gets higher
                    return prev + (Math.random() * (prev < 50 ? 5 : 2))
                })
            }, 800)
        } else if (status === 'complete') {
            setProgress(100)
        } else if (status === 'error') {
            setProgress(0)
        }

        return () => clearInterval(interval)
    }, [status])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white border-slate-200">
                <DialogHeader className="space-y-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-serif text-[#224034]">
                        {status === 'complete' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : status === 'error' ? (
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        ) : (
                            <Loader2 className="w-6 h-6 text-[#224034] animate-spin" />
                        )}
                        {status === 'complete' ? 'Scan Completed' : status === 'error' ? 'Scan Failed' : 'Scanning Site'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        {status === 'scanning' ? `Analyzing ${siteUrl} for AEO optimization...` :
                            status === 'complete' ? `Successfully analyzed ${siteUrl}.` :
                                message || 'An error occurred during the scan.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Status Steps Visualization */}
                    <div className="space-y-4">
                        <Progress value={progress} className="h-2" />

                        <div className="flex justify-between text-xs text-slate-400 px-1">
                            <span>Initializing</span>
                            <span className={progress > 30 ? "text-[#224034] font-medium transition-colors duration-500" : ""}>Crawling</span>
                            <span className={progress > 60 ? "text-[#224034] font-medium transition-colors duration-500" : ""}>Analyzing</span>
                            <span className={progress > 90 ? "text-[#224034] font-medium transition-colors duration-500" : ""}>Finalizing</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
