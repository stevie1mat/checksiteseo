import Link from "next/link";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="absolute top-0 w-full z-50 py-6 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    {/* Simple Text Logo per Reap style */}
                    <Bot className="w-5 h-5 text-white/90" />
                    <span className="font-serif text-2xl font-medium text-white tracking-wide">
                        CheckSite AEO
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-10">
                    <Link href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                        How it works
                    </Link>
                    <Link href="https://github.com/stevie1mat/checksiteseo" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                        Docs
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="#" className="text-sm font-medium text-white hover:opacity-80 transition-opacity">
                        Sign in
                    </Link>
                    <Button className="bg-white text-[#224034] hover:bg-white/90 font-medium rounded-lg px-6">
                        Book a demo
                    </Button>
                </div>
            </div>
        </nav>
    );
}
