"use client"

import Link from "next/link";
import { ChevronLeft, Brain, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { analytics } from "@/lib/analytics";

export function SignInForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // MFA State
    const [mfaRequired, setMfaRequired] = useState(false);
    const [factorId, setFactorId] = useState<string>("");
    const [challengeId, setChallengeId] = useState<string>("");
    const [verifyCode, setVerifyCode] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        // Track signin started
        analytics.trackSigninStarted();

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const supabase = createClient();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check if MFA is required
            const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (aalError) throw aalError;

            if (aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
                // MFA Required - Prepare Challenge
                const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
                if (factorsError) throw factorsError;

                const totpFactor = factors.all.find(f => f.factor_type === 'totp' && f.status === 'verified');

                if (!totpFactor) {
                    // Start AAL2 flow but no verified factor found? 
                    // Should theoretically not happen if nextLevel is aal2, but handle gracefully
                    throw new Error("MFA required but no verified factor found.");
                }

                const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
                if (challengeError) throw challengeError;

                setFactorId(totpFactor.id);
                setChallengeId(challengeData.id);
                setMfaRequired(true);
                setLoading(false); // Stop loading to show input
                return;
            }

            // No MFA required, proceed
            analytics.trackSigninCompleted('email');
            router.push("/dashboard");
            router.refresh();

        } catch (error: any) {
            setError(error.message);
            analytics.trackSigninFailed(error.message);
            setLoading(false);
        }
    }

    async function handleVerifyMFA(event: React.FormEvent) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const supabase = createClient();

        try {
            const { data, error } = await supabase.auth.mfa.verify({
                factorId,
                challengeId,
                code: verifyCode
            });

            if (error) throw error;

            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Column: Auth Form */}
            <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-[#1a3028] text-white">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-8">
                            <span className="font-serif text-2xl font-medium">CheckSite<span className="text-[#8cd9b8]">AEO</span></span>
                        </Link>
                        <h1 className="font-serif text-3xl font-medium tracking-tight">
                            {mfaRequired ? "Two-Factor Authentication" : "Welcome back"}
                        </h1>
                        <p className="text-white/60 mt-2">
                            {mfaRequired ? "Enter the code from your authenticator app" : "Enter your details to sign in to your account"}
                        </p>
                    </div>

                    {!mfaRequired ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm">
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-white">Password</Label>
                                    <Link href="/forgot-password" className="text-xs text-white/50 hover:text-white transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-black/20 border-white/10 text-white h-11"
                                />
                            </div>
                            <Button disabled={loading} className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11 text-lg">
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyMFA} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-white">Verification Code</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    type="text"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value)}
                                    placeholder="123456"
                                    required
                                    maxLength={6}
                                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-11 text-center tracking-widest text-lg"
                                    autoFocus
                                />
                            </div>
                            <Button disabled={loading} className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11 text-lg">
                                {loading ? "Verifying..." : "Verify Code"}
                            </Button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMfaRequired(false);
                                        setVerifyCode("");
                                        setError(null);
                                    }}
                                    className="text-sm text-white/40 hover:text-white transition-colors"
                                >
                                    Back to login
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="text-center text-sm text-white/40">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-[#8cd9b8] hover:text-[#7bcfa7] transition-colors font-medium">
                            Get Started
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
                        <h2 className="font-serif text-4xl text-white mb-6">The future of search visibility</h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            Track, analyze, and optimize your presence across AI search engines. Join leading brands mastering AEO today.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <Brain className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">AI-Powered Analysis</h3>
                                <p className="text-white/50 leading-relaxed">Deep dive into how Perplexity, ChatGPT, and Gemini see your brand.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Target className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">Competitive Intelligence</h3>
                                <p className="text-white/50 leading-relaxed">Benchmark against industry leaders and identify your content gaps.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <TrendingUp className="w-8 h-8 text-[#8cd9b8] shrink-0" />
                            <div>
                                <h3 className="text-white font-serif text-lg mb-1">Actionable Insights</h3>
                                <p className="text-white/50 leading-relaxed">Clear roadmap to dominate Answer Engine Optimization.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
