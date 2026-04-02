"use client"

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type NavbarProps = {
    variant?: "default" | "light-pill";
}

export function Navbar({ variant = "default" }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isLightPill = variant === "light-pill";

    return (
        <nav className={`absolute top-0 w-full z-50 px-6 ${isLightPill ? "py-8" : "py-6"}`}>
            <div className={`max-w-7xl mx-auto flex items-center justify-between ${isLightPill ? "rounded-full border border-[#d9e8df] bg-white/90 backdrop-blur-md px-4 md:px-6 py-3 shadow-[0_12px_40px_rgba(28,56,44,0.12)]" : ""}`}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <span className={`font-serif text-2xl font-medium tracking-wide ${isLightPill ? "text-[#223f33]" : "text-white"}`}>
                        CheckSite<span className={isLightPill ? "text-[#2f6651]" : "text-[#8cd9b8]"}>AEO</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className={`text-sm font-medium transition-colors ${isLightPill ? "text-slate-600 hover:text-[#223f33]" : "text-white/80 hover:text-white"}`}>
                        Features
                    </Link>
                    <Link href="#how-it-works" className={`text-sm font-medium transition-colors ${isLightPill ? "text-slate-600 hover:text-[#223f33]" : "text-white/80 hover:text-white"}`}>
                        How It Works
                    </Link>
                    <Link href="#pricing" className={`text-sm font-medium transition-colors ${isLightPill ? "text-slate-600 hover:text-[#223f33]" : "text-white/80 hover:text-white"}`}>
                        Pricing
                    </Link>
                    <Link href="/blog" className={`text-sm font-medium transition-colors ${isLightPill ? "text-slate-600 hover:text-[#223f33]" : "text-white/80 hover:text-white"}`}>
                        Blog
                    </Link>
                    <Link href="/aeo-guide" className={`text-sm font-medium transition-colors ${isLightPill ? "text-slate-600 hover:text-[#223f33]" : "text-white/80 hover:text-white"}`}>
                        AEO Guide
                    </Link>
                    <Link href="#faq" className={`text-sm font-medium transition-colors ${isLightPill ? "text-slate-600 hover:text-[#223f33]" : "text-white/80 hover:text-white"}`}>
                        FAQ
                    </Link>

                </div>


                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Link href="/signin" className={`text-sm font-medium transition-opacity px-4 py-2 ${isLightPill ? "text-slate-600 hover:text-[#223f33]" : "text-white hover:text-white/80"}`}>
                        Sign In
                    </Link>
                    <Link href="/signup">
                        <Button className={isLightPill
                            ? "bg-[#224034] text-white hover:bg-[#1b332a] font-semibold rounded-full px-6 shadow-lg shadow-[#224034]/20 transition-all"
                            : "bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold rounded-lg px-6 shadow-lg shadow-[#8cd9b8]/30 transition-all"}>
                            Get Started
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={`md:hidden ${isLightPill ? "text-[#223f33]" : "text-white"}`}
                    aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-nav-menu"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div id="mobile-nav-menu" className={`md:hidden mt-6 rounded-xl p-6 space-y-4 ${isLightPill ? "bg-white border border-[#d9e8df] shadow-xl" : "bg-white/10 backdrop-blur-lg"}`}>
                    <Link onClick={() => setMobileMenuOpen(false)} href="#features" className={`block text-sm font-medium transition-colors ${isLightPill ? "text-slate-700 hover:text-[#223f33]" : "text-white hover:text-white/80"}`}>
                        Features
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="#how-it-works" className={`block text-sm font-medium transition-colors ${isLightPill ? "text-slate-700 hover:text-[#223f33]" : "text-white hover:text-white/80"}`}>
                        How It Works
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="#pricing" className={`block text-sm font-medium transition-colors ${isLightPill ? "text-slate-700 hover:text-[#223f33]" : "text-white hover:text-white/80"}`}>
                        Pricing
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="/blog" className={`block text-sm font-medium transition-colors ${isLightPill ? "text-slate-700 hover:text-[#223f33]" : "text-white hover:text-white/80"}`}>
                        Blog
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="/aeo-guide" className={`block text-sm font-medium transition-colors ${isLightPill ? "text-slate-700 hover:text-[#223f33]" : "text-white hover:text-white/80"}`}>
                        AEO Guide
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="#faq" className={`block text-sm font-medium transition-colors ${isLightPill ? "text-slate-700 hover:text-[#223f33]" : "text-white hover:text-white/80"}`}>
                        FAQ
                    </Link>

                    <div className={`pt-4 space-y-3 ${isLightPill ? "border-t border-slate-200" : "border-t border-white/20"}`}>
                        <Link onClick={() => setMobileMenuOpen(false)} href="/signin" className={`block w-full text-left text-sm font-medium px-2 py-2 ${isLightPill ? "text-slate-700" : "text-white"}`}>
                            Sign In
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} href="/signup" className="block w-full">
                            <Button className={isLightPill
                                ? "w-full bg-[#224034] text-white hover:bg-[#1b332a] font-semibold rounded-lg"
                                : "w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold rounded-lg"}>
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
