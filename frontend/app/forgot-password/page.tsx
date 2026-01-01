"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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
            setSuccess(true);
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="relative min-h-screen bg-[#224034] flex flex-col items-center justify-center p-4 overflow-hidden">
                {/* Background Details */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

                <div className="w-full max-w-md bg-[#2a4e40]/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 text-center relative z-10">
                    <div className="flex justify-center mb-6">
                        <CheckCircle2 className="w-16 h-16 text-[#8cd9b8]" />
                    </div>
                    <h2 className="font-serif text-2xl text-white mb-4">Check your email</h2>
                    <p className="text-white/80 mb-8">
                        We've sent you a password reset link. Please check your email to reset your password.
                    </p>
                    <Button asChild className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11">
                        <Link href="/signin">Return to Sign In</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#224034] flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Details */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8cd9b8]/5 rounded-full blur-[100px] pointer-events-none -z-0" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

            <div className="w-full max-w-md bg-[#2a4e40]/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 relative z-10">
                <div className="mb-8">
                    <Link href="/signin" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sign In
                    </Link>
                    <h1 className="font-serif text-3xl text-white mb-2">Reset Password</h1>
                    <p className="text-white/60">Enter your email to receive reset instructions</p>
                </div>

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

                    <Button disabled={loading} className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11 text-lg mt-6">
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
