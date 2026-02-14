"use client"

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";


export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="absolute top-0 w-full z-50 py-6 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <span className="font-serif text-2xl font-medium text-white tracking-wide">
                        CheckSite<span className="text-[#8cd9b8]">AEO</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                        How It Works
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                        Pricing
                    </Link>
                    <Link href="/blog" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                        Blog
                    </Link>
                    <Link href="/aeo-guide" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                        AEO Guide
                    </Link>
                    <Link href="#faq" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                        FAQ
                    </Link>

                </div>


                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Link href="/signin" className="text-sm font-medium text-white hover:text-white/80 transition-opacity px-4 py-2">
                        Sign In
                    </Link>
                    <Link href="/signup">
                        <Button className="bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold rounded-lg px-6 shadow-lg shadow-[#8cd9b8]/30 transition-all">
                            Get Started
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
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
                <div id="mobile-nav-menu" className="md:hidden mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 space-y-4">
                    <Link onClick={() => setMobileMenuOpen(false)} href="#features" className="block text-sm font-medium text-white hover:text-white/80 transition-colors">
                        Features
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="#how-it-works" className="block text-sm font-medium text-white hover:text-white/80 transition-colors">
                        How It Works
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="#pricing" className="block text-sm font-medium text-white hover:text-white/80 transition-colors">
                        Pricing
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="/blog" className="block text-sm font-medium text-white hover:text-white/80 transition-colors">
                        Blog
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="/aeo-guide" className="block text-sm font-medium text-white hover:text-white/80 transition-colors">
                        AEO Guide
                    </Link>
                    <Link onClick={() => setMobileMenuOpen(false)} href="#faq" className="block text-sm font-medium text-white hover:text-white/80 transition-colors">
                        FAQ
                    </Link>

                    <div className="pt-4 border-t border-white/20 space-y-3">
                        <Link onClick={() => setMobileMenuOpen(false)} href="/signin" className="block w-full text-left text-sm font-medium text-white px-2 py-2">
                            Sign In
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} href="/signup" className="block w-full">
                            <Button className="w-full bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold rounded-lg">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
