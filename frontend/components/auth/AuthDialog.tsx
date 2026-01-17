"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { analytics } from "@/lib/analytics"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface AuthDialogProps {
    defaultView?: "signin" | "signup"
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AuthDialog({ defaultView = "signin", trigger, open, onOpenChange }: AuthDialogProps) {
    const [view, setView] = useState<"signin" | "signup">(defaultView)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const router = useRouter()

    // Reset state when view changes
    const toggleView = () => {
        setView(view === "signin" ? "signup" : "signin")
        setError(null)
        setSuccessMsg(null)
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMsg(null)

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const supabase = createClient()

        if (view === "signup") {
            analytics.trackSignupStarted()
            
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            })

            if (error) {
                analytics.trackSignupFailed(error.message)
                setError(error.message)
            } else {
                analytics.trackSignupCompleted('email')
                setSuccessMsg("Account created! Please check your email to confirm.")
            }
        } else {
            analytics.trackSigninStarted()
            
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                analytics.trackSigninFailed(error.message)
                setError(error.message)
            } else {
                analytics.trackSigninCompleted('email')
                router.push("/dashboard")
                router.refresh()
                if (onOpenChange) onOpenChange(false)
            }
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-md bg-[#1d332b] border-[#2a4e40] text-white">
                <div className="flex flex-col items-center justify-center pt-4">
                    <span className="font-serif text-2xl font-medium text-white tracking-wide">
                        CheckSite<span className="text-[#8cd9b8]">AEO</span>
                    </span>
                </div>
                <DialogHeader className="text-center sm:text-center">
                    <DialogTitle className="text-2xl font-serif text-white">
                        {view === "signin" ? "Welcome back" : "Create an account"}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {view === "signin"
                            ? "Enter your details to sign in to your account"
                            : "Enter your details to get started with CheckSite AEO"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-500/10 text-green-400 text-sm p-3 rounded-md">
                            {successMsg}
                        </div>
                    )}

                    {!successMsg && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-white">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-white">Password</Label>
                                    {view === "signin" && (
                                        <Link href="/forgot-password" onClick={() => onOpenChange && onOpenChange(false)} className="text-xs text-white/50 hover:text-white hover:underline transition-colors">
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold">
                                {loading
                                    ? "Loading..."
                                    : view === "signin" ? "Sign In" : "Sign Up"
                                }
                            </Button>
                        </form>
                    )}

                    <div className="text-center text-sm text-white/40 mt-2">
                        {view === "signin" ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={toggleView}
                            className="text-[#8cd9b8] font-medium hover:text-[#7bcfa7] hover:underline focus:outline-none transition-colors"
                        >
                            {view === "signin" ? "Sign Up" : "Sign In"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
