"use client"

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen bg-[#224034] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#2a4e40] rounded-2xl p-8 shadow-2xl border border-white/5">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-6">
                        <span className="font-serif text-2xl font-medium">CheckSite AEO<span className="text-[#8cd9b8]">.</span></span>
                    </Link>
                    <h1 className="font-serif text-3xl text-white mb-2">Welcome back</h1>
                    <p className="text-white/60">Sign in to your account</p>
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
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            <Link href="#" className="text-xs text-white/50 hover:text-white transition-colors">
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
                    <Button disabled={loading} className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11 text-lg mt-6">
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-white/40">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-[#8cd9b8] hover:text-[#7bcfa7] transition-colors font-medium">
                        Get Started
                    </Link>
                </div>
            </div>
        </div>
    );
}
