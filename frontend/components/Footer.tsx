"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";

export function Footer() {
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newsletterStatus, setNewsletterStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const email = newsletterEmail.trim().toLowerCase();
        if (!email) {
            setNewsletterStatus({ type: "error", message: "Enter a valid email address." });
            return;
        }

        setIsSubmitting(true);
        setNewsletterStatus(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: "Newsletter",
                    last_name: "Subscriber",
                    email,
                    message: "Please add this email to the CheckSite AEO newsletter."
                }),
            });

            if (!response.ok) {
                throw new Error("Subscription failed");
            }

            trackEvent("newsletter_subscribed", { email_domain: email.split("@")[1] || "unknown" });
            setNewsletterStatus({ type: "success", message: "Subscribed successfully. Check your inbox soon." });
            setNewsletterEmail("");
        } catch {
            setNewsletterStatus({ type: "error", message: "Could not subscribe right now. Please try again later." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="bg-[#224034] text-white">
            {/* Newsletter Section */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="font-serif text-3xl text-white mb-2">Stay ahead of AEO trends</h3>
                            <p className="text-white/60 text-sm max-w-md">
                                Get weekly insights, algorithm updates, and best practices delivered to your inbox.
                            </p>
                        </div>
                        <form className="w-full md:w-auto" onSubmit={handleNewsletterSubmit}>
                            <div className="flex gap-3 w-full md:w-auto">
                                <Input
                                    type="email"
                                    required
                                    value={newsletterEmail}
                                    onChange={(event) => setNewsletterEmail(event.target.value)}
                                    placeholder="Enter your email"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 min-w-[280px]"
                                />
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-12 px-6 whitespace-nowrap"
                                >
                                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                                </Button>
                            </div>
                            {newsletterStatus && (
                                <p
                                    role="status"
                                    aria-live="polite"
                                    className={`mt-3 text-sm ${newsletterStatus.type === "success" ? "text-emerald-200" : "text-red-200"}`}
                                >
                                    {newsletterStatus.message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="font-serif text-2xl font-medium">CheckSite<span className="text-[#8cd9b8]">AEO</span></span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed mb-6">
                            Empowering content creators and SEO professionals with AI-powered tools to dominate answer engines and maximize visibility in the age of AI search.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4">



                            <Link href="mailto:hello@checksiteaeo.com" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <Mail className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Platform Column */}
                    <div>
                        <h4 className="font-semibold mb-4 text-white">Platform</h4>
                        <ul className="space-y-3 text-sm text-white/60">
                            <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                            <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h4 className="font-semibold mb-4 text-white">Resources</h4>
                        <ul className="space-y-3 text-sm text-white/60">
                            <li><Link href="/aeo-checker-tool" className="hover:text-white transition-colors">AEO Checker Tool</Link></li>
                            <li><Link href="/aeo-checking-tool" className="hover:text-white transition-colors">AEO Checking Tool</Link></li>
                            <li><Link href="/aeo-readiness" className="hover:text-white transition-colors">AEO Readiness</Link></li>
                            <li><Link href="/aeo-monitoring" className="hover:text-white transition-colors">AEO Monitoring</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                            <li><Link href="/aeo-guide" className="hover:text-white transition-colors">AEO Guide</Link></li>
                            <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="font-semibold mb-4 text-white">Company</h4>
                        <ul className="space-y-3 text-sm text-white/60">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/changelog" className="hover:text-white transition-colors">Public Roadmap</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/40">
                        © {new Date().getFullYear()} CheckSite AEO. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-white/40">
                        <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
                        <Link href="/cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
                        <Link href="/sitemap" className="hover:text-white/60 transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
