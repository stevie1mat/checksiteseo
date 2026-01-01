"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Lock, Mail, Headphones } from "lucide-react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const supabase = createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/auth/update-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSubmitted(true);
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen grid lg:grid-cols-2">
                {/* Left Column: Success Message */}
                <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-[#1a3028] text-white">
                    <div className="w-full max-w-sm text-center">
                        <div className="flex justify-center mb-6">
                            <span className="font-serif text-2xl font-medium text-white">CheckSite<span className="text-[#8cd9b8]">AEO</span></span>
                        </div>
                        <h2 className="font-serif text-2xl text-white mb-4">Check your email</h2>
                        <p className="text-white/80 mb-8">
                            If an account exists for {email}, we have sent a password reset link.
                        </p>
                        <Link href="/signin" className="text-[#8cd9b8] hover:text-[#7bcfa7] font-medium block">
                            Return to Sign In
                        </Link>
                    </div>
                </div>
                {/* Right Column: Visuals */}
                <div className="hidden lg:flex relative bg-[#224034] items-center justify-center p-12 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

                    <div className="relative z-10 max-w-lg">
                        <div className="text-center mb-12">
                            <h2 className="font-serif text-4xl text-white mb-6">Secure Account Recovery</h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                We take your account security seriously. Get back to optimizing in seconds.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <Lock className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                                <div>
                                    <h3 className="text-white font-serif text-lg mb-1">Secure Reset</h3>
                                    <p className="text-white/50 leading-relaxed">Encrypted links ensure only you can access your account.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Mail className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                                <div>
                                    <h3 className="text-white font-serif text-lg mb-1">Instant Delivery</h3>
                                    <p className="text-white/50 leading-relaxed">Receive your recovery instructions immediately.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Headphones className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                                <div>
                                    <h3 className="text-white font-serif text-lg mb-1">Support Team</h3>
                                    <p className="text-white/50 leading-relaxed">Having trouble? Our support team is here to help.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                        <h1 className="font-serif text-3xl font-medium tracking-tight">Forgot password?</h1>
                        <p className="text-white/60 mt-2">Enter your email address to reset your password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-11"
                            />
                        </div>
                        <Button disabled={loading} className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11 text-lg mt-6">
                            {loading ? "Sending link..." : "Send Reset Link"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-white/40">
                        Remember your password?{" "}
                        <Link href="/signin" className="text-[#8cd9b8] hover:text-[#7bcfa7] transition-colors font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="hidden lg:flex relative bg-[#224034] items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

                <div className="relative z-10 max-w-lg">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-4xl text-white mb-6">Secure Account Recovery</h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            We take your account security seriously. Get back to optimizing in seconds.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <Lock className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">Secure Reset</h3>
                                <p className="text-white/50 leading-relaxed">Encrypted links ensure only you can access your account.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Mail className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">Instant Delivery</h3>
                                <p className="text-white/50 leading-relaxed">Receive your recovery instructions immediately.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Headphones className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">Support Team</h3>
                                <p className="text-white/50 leading-relaxed">Having trouble? Our support team is here to help.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
