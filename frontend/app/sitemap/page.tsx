import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Home, Shield, Box, BookOpen, Layers, Users } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sitemap | CheckSiteAEO",
    description: "Complete overview of all pages available on CheckSiteAEO. Find your way around our tools and resources.",
    openGraph: {
        title: "Sitemap | CheckSiteAEO",
        description: "Complete overview of all pages available on CheckSiteAEO.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sitemap | CheckSiteAEO",
        description: "Find your way around CheckSiteAEO.",
    }
};

export default function SitemapPage() {
    const sections = [
        {
            title: "Main",
            icon: Home,
            description: "Core navigation and account access.",
            links: [
                { name: "Home", href: "/", description: "The landing page and overview of CheckSite AEO." },
                { name: "Sign In", href: "/signin", description: "Access your account dashboard." },
                { name: "Sign Up", href: "/signup", description: "Create a new account to start auditing." },
            ]
        },
        {
            title: "Product",
            icon: Box,
            description: "Explore our features and plans.",
            links: [
                { name: "Features", href: "/#features", description: "Detailed breakdown of our AI analysis capabilities." },
                { name: "Free Plan", href: "/pricing", description: "View current access limits and scan policy." },
                { name: "Integrations", href: "/integrations", description: "Connect with CMS and other tools." },
                { name: "Changelog", href: "/changelog", description: "See what's new and what we've improved." },
            ]
        },
        {
            title: "Resources",
            icon: BookOpen,
            description: "Learn and grow with our guides.",
            links: [
                { name: "AEO Checker Tool", href: "/aeo-checker-tool", description: "Run a free AEO checker tool audit for your website." },
                { name: "Free AEO Audit", href: "/aeo-audit", description: "Review the AEO audit checklist and run a free website audit." },
                { name: "AEO Readiness", href: "/aeo-readiness", description: "Understand and improve your AEO readiness score." },
                { name: "AEO Monitoring", href: "/aeo-monitoring", description: "Track AEO performance changes over time." },
                { name: "Documentation", href: "/documentation", description: "Comprehensive guides and tutorials." },
                { name: "Blog", href: "/blog", description: "Latest insights on AEO and search trends." },
                { name: "FAQ", href: "/#faq", description: "Answers to common questions." },
                { name: "AEO Guide", href: "/aeo-guide", description: "Deep dive into Answer Engine Optimization." },
            ]
        },
        {
            title: "Company",
            icon: Users,
            description: "Who we are and how to reach us.",
            links: [
                { name: "About Us", href: "/about", description: "Our mission and the team behind the tool." },
                { name: "Careers", href: "/careers", description: "Join us in building the future of search." },
                { name: "Contact", href: "/contact", description: "Get in touch with our support team." },
            ]
        },
        {
            title: "Legal",
            icon: Shield,
            description: "Terms, privacy, and policies.",
            links: [
                { name: "Privacy Policy", href: "/privacy", description: "How we handle your data." },
                { name: "Terms of Service", href: "/terms", description: "The rules for using our platform." },
                { name: "Cookie Policy", href: "/cookies", description: "Information about cookies." },
            ]
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-[#224034] text-white pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Layers className="w-8 h-8 text-[#8cd9b8]" />
                        </div>
                        <h1 className="font-serif text-5xl">Sitemap</h1>
                    </div>
                    <p className="text-xl text-white/80 max-w-2xl">
                        A detailed directory of every page on CheckSite AEO. Find exactly what you are looking for.
                    </p>
                </div>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto space-y-16">
                    {sections.map((section, i) => {
                        const Icon = section.icon;
                        return (
                            <div key={i} className="scroll-mt-24" id={section.title.toLowerCase()}>
                                <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                                    <Icon className="w-6 h-6 text-[#224034]" />
                                    <div>
                                        <h2 className="text-2xl font-serif text-[#224034]">{section.title}</h2>
                                        <p className="text-slate-500 text-sm">{section.description}</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {section.links.map((link, l) => (
                                        <Link
                                            key={l}
                                            href={link.href}
                                            className="group block bg-white border border-slate-100 rounded-xl p-6 hover:border-[#8cd9b8] hover:shadow-md transition-all duration-200"
                                        >
                                            <h3 className="font-semibold text-[#224034] mb-2 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                                                {link.name}
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8cd9b8] transform group-hover:translate-x-1 duration-200">
                                                    →
                                                </span>
                                            </h3>
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                {link.description}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <Footer />
        </main>
    );
}
