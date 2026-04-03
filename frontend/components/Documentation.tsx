"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Book, Terminal, Zap, BarChart3, Search, ShieldCheck, Code } from "lucide-react";

export function Documentation() {
    const [activeSection, setActiveSection] = useState("intro");

    const documents = [
        {
            id: "intro",
            title: "Introduction",
            icon: Book,
            content: (
                <div className="space-y-6">
                    <h1 className="text-4xl font-serif text-[#224034] mb-6">Introduction to CheckSite AEO</h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Welcome to the official documentation for CheckSite AEO. Our platform is designed to help you optimize your content for the next generation of search: <strong>Answer Engines</strong>.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Unlike traditional SEO, which focuses on ranking for keywords, AEO (Answer Engine Optimization) focuses on becoming the <em>referenced authority</em> for AI models like ChatGPT, Perplexity, and Google Gemini.
                    </p>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 my-8">
                        <h3 className="font-semibold text-[#224034] mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#8cd9b8]" />
                            Why AEO Matters
                        </h3>
                        <p className="text-slate-600">
                            By 2026, it is estimated that over 50% of search queries will be answered directly by AI agents without a click-through. Optimizing for AEO is not just a strategy—it's survival.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "quick-start",
            title: "Quick Start",
            icon: Terminal,
            content: (
                <div className="space-y-6">
                    <h2 className="text-3xl font-serif text-[#224034] mb-6">Quick Start Guide</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Get up and running with CheckSite AEO in less than 5 minutes. Follow these steps to perform your first audit.
                    </p>

                    <div className="space-y-8 mt-8">
                        <div className="relative pl-8 border-l-2 border-emerald-100">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                            <h3 className="text-xl font-semibold text-[#224034] mb-2">1. Create an Account</h3>
                            <p className="text-slate-600 mb-4">
                                Sign up for a free account. No credit card is required, and you receive free scan tokens daily.
                            </p>
                            <Link href="/signup" className="text-emerald-600 font-medium hover:underline">
                                Create Account &rarr;
                            </Link>
                        </div>

                        <div className="relative pl-8 border-l-2 border-emerald-100">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-200 border-4 border-white shadow-sm"></div>
                            <h3 className="text-xl font-semibold text-[#224034] mb-2">2. Enter your URL</h3>
                            <p className="text-slate-600 mb-4">
                                Paste the URL of the page you want to analyze into the dashboard. We support blogs, landing pages, and documentation sites.
                            </p>
                        </div>

                        <div className="relative pl-8 border-l-2 border-emerald-100">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-100 border-4 border-white shadow-sm"></div>
                            <h3 className="text-xl font-semibold text-[#224034] mb-2">3. Review Your Score</h3>
                            <p className="text-slate-600">
                                Our AI will generate a detailed report breaking down your Technical Readiness, Content Structure, and Authority Signals.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "interpreting-results",
            title: "Interpreting Results",
            icon: BarChart3,
            content: (
                <div className="space-y-8">
                    <h2 className="text-3xl font-serif text-[#224034] mb-6">Interpreting Your Scan Results</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        After running a scan, you will be presented with a comprehensive report. Understanding each metric is key to improving your AEO performance.
                    </p>

                    <div className="space-y-8">
                        {/* Technical Score */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Code className="w-6 h-6 text-[#224034]" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#224034]">Technical Readiness</h3>
                            </div>
                            <p className="text-slate-600 mb-4">
                                This score evaluates your site's ability to be crawled and understood by AI bots.
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
                                <li><strong>Robots.txt & LLMs.txt:</strong> Ensures you aren't accidentally blocking AI crawlers.</li>
                                <li><strong>Schema Markup:</strong> Verifies the presence of structured data that helps bots parse your content.</li>
                                <li><strong>Security:</strong> Checks for HTTPS and other basic security signals.</li>
                            </ul>
                        </div>

                        {/* Content Score */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Search className="w-6 h-6 text-[#224034]" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#224034]">Content Structure</h3>
                            </div>
                            <p className="text-slate-600 mb-4">
                                Analyzes how well your content directly answers user queries.
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
                                <li><strong>Question Targeting:</strong> Do you have clear H2/H3s that mirror common user questions?</li>
                                <li><strong>Answer Conciseness:</strong> Are your answers direct and to the point (under 50 words)?</li>
                                <li><strong>Visual Context:</strong> Do you use images with descriptive alt text to support your answers?</li>
                            </ul>
                        </div>

                        {/* Authority Score */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <ShieldCheck className="w-6 h-6 text-[#224034]" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#224034]">Authority Signals (E-E-A-T)</h3>
                            </div>
                            <p className="text-slate-600 mb-4">
                                Measures your site's credibility, a crucial factor for AI citations.
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
                                <li><strong>Author Expertise:</strong> Do articles have clear bylines with author bios?</li>
                                <li><strong>Citations:</strong> Do you link to reputable external sources?</li>
                                <li><strong>Brand Mentions:</strong> How often is your brand referenced in a positive context?</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "features",
            title: "Core Features",
            icon: Code,
            content: (
                <div className="space-y-8">
                    <h2 className="text-3xl font-serif text-[#224034] mb-6">Core Features</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                            <h3 className="font-semibold text-xl text-[#224034] mb-3">Content Gap Analysis</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Identify exactly what topics and questions your content is missing compared to the sources that AI models currently cite.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                            <h3 className="font-semibold text-xl text-[#224034] mb-3">E-E-A-T Scoring</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Analysis of your Experience, Expertise, Authoritativeness, and Trustworthiness signals that LLMs prioritize.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                            <h3 className="font-semibold text-xl text-[#224034] mb-3">Schema Generator</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Automatically generate JSON-LD schema markup optimized for bot readability and rich snippet eligibility.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                            <h3 className="font-semibold text-xl text-[#224034] mb-3">Competitor Benchmarking</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                See how your content stacks up against the current top-cited sources for your target keywords.
                            </p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Header */}
            <section className="bg-[#224034] text-white pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">Documentation</span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl">Documentation</h1>
                    <p className="text-xl text-white/80 max-w-2xl mt-4">
                        Everything you need to master AEO and use our platform effectively.
                    </p>
                </div>
            </section>

            <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="sticky top-24 space-y-1">
                            {documents.map((doc) => {
                                const Icon = doc.icon;
                                const isActive = activeSection === doc.id;
                                return (
                                    <button
                                        key={doc.id}
                                        onClick={() => setActiveSection(doc.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${isActive
                                            ? "bg-emerald-50 text-[#224034] shadow-sm ring-1 ring-emerald-100"
                                            : "text-slate-600 hover:bg-white hover:text-[#224034]"
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? "text-[#8cd9b8]" : "text-slate-400"}`} />
                                        {doc.title}
                                    </button>
                                );
                            })}

                            <div className="pt-6 mt-6 border-t border-slate-200">
                                <h4 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Support
                                </h4>
                                <Link
                                    href="/contact"
                                    className="block px-4 py-2 text-sm text-slate-600 hover:text-[#224034] hover:bg-white rounded-lg transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
                            {documents.map((doc) => (
                                <div key={doc.id} className={activeSection === doc.id ? "block animate-in fade-in duration-300" : "hidden"}>
                                    {doc.content}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
