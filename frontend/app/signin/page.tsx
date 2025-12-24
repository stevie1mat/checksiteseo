import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-[#224034] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#2a4e40] rounded-2xl p-8 shadow-2xl border border-white/5">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-6">
                        <Bot className="w-8 h-8" />
                        <span className="font-serif text-2xl font-medium">CheckSite AEO</span>
                    </Link>
                    <h1 className="font-serif text-3xl text-white mb-2">Welcome back</h1>
                    <p className="text-white/60">Sign in to your account to continue</p>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            <Link href="#" className="text-xs text-[#8cd9b8] hover:text-[#7bcfa7] transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            className="bg-black/20 border-white/10 text-white h-11"
                        />
                    </div>
                    <Button className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-11 text-lg mt-6">
                        Sign In
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-white/40">
                    Don't have an account?{" "}
                    <Link href="#" className="text-[#8cd9b8] hover:text-[#7bcfa7] transition-colors font-medium">
                        Start Free Trial
                    </Link>
                </div>
            </div>
        </div>
    );
}
