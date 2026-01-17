"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function SignUpForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        // Track signup started
        analytics.trackSignupStarted();

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            analytics.trackSignupFailed(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            analytics.trackSignupCompleted('email');
            setLoading(false);
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
                        <h2 className="font-serif text-2xl text-white mb-4">Check your email</h2>
                        <p className="text-white/80 mb-8">
                            We've sent you a confirmation link. Please check your email to activate your account.
                        </p>
                        <Link href="/signin" className="text-[#8cd9b8] hover:text-[#7bcfa7] font-medium block">
                            Return to Sign In
                        </Link>
                    </div>
                </div>

                {/* Right Column: Visuals */}
                <div className="hidden lg:flex relative bg-[#224034] items-center justify-center p-12 overflow-hidden">
                    {/* Background Details */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

                    <div className="relative z-10 max-w-lg">
                        <div className="text-center mb-12">
                            <h2 className="font-serif text-4xl text-white mb-6">Start your AEO journey</h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Join thousands of marketers optimizing for the AI era. Your competitive edge starts here.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <Rocket className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                                <div>
                                    <h3 className="text-white font-serif text-lg mb-1">Instant Setup</h3>
                                    <p className="text-white/50 leading-relaxed">Get your first AI search audit in under 60 seconds.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <ShieldCheck className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                                <div>
                                    <h3 className="text-white font-serif text-lg mb-1">Enterprise Grade</h3>
                                    <p className="text-white/50 leading-relaxed">Secure, reliable, and built for scale from day one.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Sparkles className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                                <div>
                                    <h3 className="text-white font-serif text-lg mb-1">Continuous Updates</h3>
                                    <p className="text-white/50 leading-relaxed">Stay ahead with algorithms updated for the latest AI models.</p>
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
            {/* Left Column: Auth Form */}
            <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-[#1a3028] text-white">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <span className="font-serif text-2xl font-medium text-white mb-8 block">CheckSite<span className="text-[#8cd9b8]">AEO</span></span>
                        <h1 className="font-serif text-3xl font-medium tracking-tight">Create an account</h1>
                        <p className="text-white/60 mt-2">Enter your details to get started with CheckSite AEO</p>
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
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-black/20 border-white/10 text-white h-11"
                            />
                        </div>
                        <Button disabled={loading} className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11 text-lg mt-6">
                            {loading ? "Creating account..." : "Sign Up"}
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#1a3028] px-2 text-white/40">Or continue with</span>
                            </div>
                        </div>

                        <GoogleSignInButton mode="signup" />
                    </form>

                    <div className="text-center text-sm text-white/40">
                        Already have an account?{" "}
                        <Link href="/signin" className="text-[#8cd9b8] hover:text-[#7bcfa7] transition-colors font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Column: Visuals (Hidden on Mobile) */}
            <div className="hidden lg:flex relative bg-[#224034] items-center justify-center p-12 overflow-hidden">
                {/* Background Details */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

                <div className="relative z-10 max-w-lg">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-4xl text-white mb-6">Start your AEO journey</h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            Join thousands of marketers optimizing for the AI era. Your competitive edge starts here.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <Rocket className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">Instant Setup</h3>
                                <p className="text-white/50 leading-relaxed">Get your first AI search audit in under 60 seconds.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <ShieldCheck className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">Enterprise Grade</h3>
                                <p className="text-white/50 leading-relaxed">Secure, reliable, and built for scale from day one.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Sparkles className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">Continuous Updates</h3>
                                <p className="text-white/50 leading-relaxed">Stay ahead with algorithms updated for the latest AI models.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
