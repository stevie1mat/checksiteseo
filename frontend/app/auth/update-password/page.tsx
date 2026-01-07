"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Error updating password",
                    description: error.message
                })
                setLoading(false)
            } else {
                setSuccess(true)
                toast({
                    title: "Success",
                    description: "Your password has been updated. Redirecting..."
                })
                setTimeout(() => {
                    router.push('/dashboard')
                }, 2000)
            }
        } catch (error) {
            console.error('Error:', error)
            toast({
                variant: "destructive",
                title: "Unexpected error",
                description: "Something went wrong. Please try again."
            })
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen grid lg:grid-cols-2">
                {/* Left Column: Success Message */}
                <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-[#1a3028] text-white">
                    <div className="w-full max-w-sm text-center">
                        <div className="flex justify-center mb-6">
                            <span className="font-serif text-2xl font-medium text-white">CheckSite<span className="text-[#8cd9b8]">AEO</span></span>
                        </div>
                        <div className="w-16 h-16 bg-[#8cd9b8]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-[#8cd9b8]" />
                        </div>
                        <h2 className="font-serif text-3xl text-white mb-4">Password Updated</h2>
                        <p className="text-white/80 mb-8 max-w-xs mx-auto">
                            Your password has been changed successfully. You will be redirected to the dashboard shortly.
                        </p>
                        <Button
                            onClick={() => router.push('/dashboard')}
                            className="bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11 px-8"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
                {/* Right Column: Visuals */}
                <div className="hidden lg:flex relative bg-[#224034] items-center justify-center p-12 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Column: Form */}
            <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-[#1a3028] text-white">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-8">
                            <span className="font-serif text-2xl font-medium">CheckSite<span className="text-[#8cd9b8]">AEO</span></span>
                        </Link>
                        <h1 className="font-serif text-3xl font-medium tracking-tight">Set new password</h1>
                        <p className="text-white/60 mt-2">Create a secure password to access your account</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                required
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-11"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11 text-lg mt-6"
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="hidden lg:flex relative bg-[#224034] items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

                <div className="relative z-10 max-w-lg">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-4xl text-white mb-6">Secure Your Access</h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            A strong password is your first line of defense.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <Lock className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">Passkey Protection</h3>
                                <p className="text-white/50 leading-relaxed">We use industry-standard encryption for all credentials.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
