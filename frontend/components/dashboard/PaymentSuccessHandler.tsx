"use client"

import { useEffect, Suspense, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

type PaymentDialogState = "idle" | "processing" | "success" | "already" | "error"

function PaymentSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const hasProcessed = useRef(false)
    const [dialogState, setDialogState] = useState<PaymentDialogState>("idle")
    const [dialogMessage, setDialogMessage] = useState("")
    const [sessionId, setSessionId] = useState<string | null>(null)

    const clearPaymentParams = () => {
        const newUrl = window.location.pathname
        window.history.replaceState({}, "", newUrl)
    }

    const closeDialog = () => {
        if (dialogState === "processing") return
        setDialogState("idle")
        setDialogMessage("")
    }

    const confirmCheckout = async (currentSessionId: string) => {
        setDialogState("processing")
        setDialogMessage("Confirming your Stripe payment and updating your diamonds...")

        let isConfirmed = false
        try {
            const response = await fetch('/api/confirm-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: currentSessionId }),
            })
            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                throw new Error(data?.error || 'Failed to confirm checkout')
            }
            isConfirmed = true

            const creditedTokens = Number(data?.credited_tokens || 0)
            const alreadyProcessed = Boolean(data?.already_processed)
            if (alreadyProcessed && creditedTokens <= 0) {
                setDialogState("already")
                setDialogMessage("This payment was already processed earlier. Your balance has been refreshed.")
            } else if (creditedTokens <= 0) {
                throw new Error('Checkout confirmed but no credit amount was applied')
            } else {
                setDialogState("success")
                setDialogMessage("Your Stripe payment is complete and your diamonds were added successfully.")
            }

            window.dispatchEvent(new Event("diamonds-updated"))
            router.refresh()
            setTimeout(() => router.refresh(), 500)
            setTimeout(() => {
                router.replace(window.location.pathname)
            }, 900)
            clearPaymentParams()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Checkout confirmation failed'
            setDialogState("error")
            setDialogMessage(`${message}. Please try confirming again.`)
            hasProcessed.current = false
        }

        if (!isConfirmed) {
            router.refresh()
        }
    }

    useEffect(() => {
        if (searchParams.get("payment") !== "success" || hasProcessed.current) return
        hasProcessed.current = true

        const returnedSessionId = searchParams.get("session_id")
        if (!returnedSessionId) {
            setDialogState("error")
            setDialogMessage("Stripe returned successfully, but no checkout session id was found. Please refresh and try again.")
            router.refresh()
            clearPaymentParams()
            return
        }

        setSessionId(returnedSessionId)
        void confirmCheckout(returnedSessionId)
    }, [searchParams, router])

    const open = dialogState !== "idle"
    const isProcessing = dialogState === "processing"
    const isSuccessState = dialogState === "success" || dialogState === "already"
    const statusLabel = isProcessing ? "Syncing Payment" : isSuccessState ? "Completed" : "Action Required"

    const title =
        dialogState === "processing"
            ? "Payment Processing"
            : dialogState === "success"
                ? "Diamonds Added"
                : dialogState === "already"
                    ? "Payment Confirmed"
                    : "Payment Confirmation Needed"

    const statusPanelClass = isProcessing
        ? "border-[#cfe4d8] bg-gradient-to-br from-emerald-50 to-white"
        : isSuccessState
            ? "border-[#bfe5cf] bg-gradient-to-br from-[#ebf9f1] to-white"
            : "border-[#f3d8af] bg-gradient-to-br from-amber-50 to-white"

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) closeDialog()
            }}
        >
            <DialogContent
                showCloseButton={!isProcessing}
                className="sm:max-w-[560px] p-0 overflow-hidden border-[#d6e7de] bg-white shadow-[0_30px_80px_rgba(20,56,44,0.22)] rounded-2xl [&>[data-slot=dialog-close]]:top-4 [&>[data-slot=dialog-close]]:right-4 [&>[data-slot=dialog-close]]:h-8 [&>[data-slot=dialog-close]]:w-8 [&>[data-slot=dialog-close]]:rounded-full [&>[data-slot=dialog-close]]:border [&>[data-slot=dialog-close]]:border-[#cfe1d7] [&>[data-slot=dialog-close]]:bg-white/95 [&>[data-slot=dialog-close]]:text-[#4f6a5f] [&>[data-slot=dialog-close]]:opacity-100 [&>[data-slot=dialog-close]]:hover:bg-[#edf8f2] [&>[data-slot=dialog-close]]:hover:text-[#224034]"
                onInteractOutside={(event) => {
                    if (isProcessing) event.preventDefault()
                }}
                onEscapeKeyDown={(event) => {
                    if (isProcessing) event.preventDefault()
                }}
            >
                <div className="relative px-6 py-5 border-b border-[#e3eee8] bg-gradient-to-r from-[#f2fbf6] via-white to-[#edf7f3]">
                    <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#9ae2c3]/35 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#d7f4e7]/55 blur-3xl" />
                    <div className="relative flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#5a7a6e]">Stripe Checkout</p>
                            <DialogTitle className="text-[#224034] font-serif text-[30px] leading-none">{title}</DialogTitle>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#bfe1d2] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#2c5848] shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            {statusLabel}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <DialogDescription className="text-[15px] leading-relaxed text-slate-600">
                        {dialogMessage}
                    </DialogDescription>

                    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${statusPanelClass}`}>
                        <div className="relative">
                            {dialogState === "processing" ? (
                                <>
                                    <div className="absolute inset-0 rounded-full bg-emerald-300/30 blur-sm animate-pulse" />
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-emerald-200 shadow-sm">
                                        <Loader2 className="h-5 w-5 text-[#224034] animate-spin" />
                                    </div>
                                </>
                            ) : isSuccessState ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-emerald-200 shadow-sm">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-amber-200 shadow-sm">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#27473b]">
                                {isProcessing
                                    ? "Verifying payment and posting credits"
                                    : isSuccessState
                                        ? "Balance sync completed"
                                        : "Automatic confirmation did not finish"}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                                {isProcessing
                                    ? "Please keep this window open for a moment."
                                    : isSuccessState
                                        ? "Your latest diamond balance should now appear across the dashboard."
                                        : "You can retry confirmation below without making a second payment."}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-600">
                        Secure checkout powered by Stripe. Credits are applied idempotently to prevent duplicate charges.
                    </div>
                </div>

                {!isProcessing && (
                    <DialogFooter className="gap-2 sm:justify-end px-6 pb-6">
                        {dialogState === "error" && sessionId && (
                            <Button
                                variant="outline"
                                className="h-10 border-[#224034] text-[#224034] hover:bg-[#224034] hover:text-white"
                                onClick={() => {
                                    hasProcessed.current = true
                                    void confirmCheckout(sessionId)
                                }}
                            >
                                Retry Confirmation
                            </Button>
                        )}
                        <Button className="h-10 bg-[#224034] hover:bg-[#1a3329] text-white px-6" onClick={closeDialog}>
                            OK
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}

export function PaymentSuccessHandler() {
    return (
        <Suspense fallback={null}>
            <PaymentSuccessContent />
        </Suspense>
    )
}
