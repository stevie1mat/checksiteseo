import Link from "next/link";
import { Bot, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#224034] text-white py-20">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">

                <div className="max-w-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="font-serif text-2xl font-medium">CheckSite AEO</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-8">
                        Empowering content creators with the technical tools to thrive in the age of artificial intelligence and answer engines.
                    </p>
                    <p className="text-xs text-white/40">© {new Date().getFullYear()} CheckSite AEO Inc.</p>
                </div>

                <div className="flex gap-16">
                    <div>
                        <h4 className="font-medium mb-4 text-white">Platform</h4>
                        <ul className="space-y-3 text-sm text-white/60">
                            <li><Link href="#" className="hover:text-white">Audit Tool</Link></li>
                            <li><Link href="#" className="hover:text-white">API</Link></li>
                            <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4 text-white">Company</h4>
                        <ul className="space-y-3 text-sm text-white/60">
                            <li><Link href="#" className="hover:text-white">About</Link></li>
                            <li><Link href="#" className="hover:text-white">Blog</Link></li>
                            <li><Link href="#" className="hover:text-white">Careers</Link></li>
                        </ul>
                    </div>
                </div>

            </div>
        </footer>
    );
}
