import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
    const posts = [
        {
            title: "Understanding Answer Engine Optimization (AEO)",
            excerpt: "Why traditional SEO isn't enough anymore, and how to optimize for AI chat responses.",
            date: "Dec 24, 2025",
            readTime: "5 min read",
            category: "Education"
        },
        {
            title: "How ChatGPT Selects Sources",
            excerpt: "A deep dive into the citation mechanisms of large language models.",
            date: "Dec 18, 2025",
            readTime: "8 min read",
            category: "Technical"
        },
        {
            title: "The Future of Search is Conversational",
            excerpt: "Predictions for 2026 and beyond: What every marketer needs to know.",
            date: "Dec 10, 2025",
            readTime: "6 min read",
            category: "Trends"
        },
        {
            title: "Schema Markup for AI Agents",
            excerpt: "Technical implementation guide for structured data that bots love.",
            date: "Nov 30, 2025",
            readTime: "12 min read",
            category: "Technical"
        },
        {
            title: "Case Study: increasing visibility by 300%",
            excerpt: "How one SaaS company dominated Perplexity results in 3 months.",
            date: "Nov 15, 2025",
            readTime: "7 min read",
            category: "Case Study"
        },
        {
            title: "Voice Search vs. AI Chat Search",
            excerpt: "Clarifying the differences and similarities between these two mediums.",
            date: "Nov 01, 2025",
            readTime: "5 min read",
            category: "Education"
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-[#224034] text-white pt-32 pb-20 px-6 text-center">
                <h1 className="font-serif text-5xl mb-6">The AEO Blog</h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    Insights, guides, and news about the future of search.
                </p>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, i) => (
                        <Link href="#" key={i} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col h-full">
                            <div className="bg-slate-200 h-48 w-full group-hover:scale-105 transition-transform duration-500">
                                {/* Placeholder for image */}
                                <div className="w-full h-full bg-[#f0f9f4] flex items-center justify-center text-[#8cd9b8]/40">
                                    <span className="font-serif text-4xl">Aa</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-semibold text-[#8cd9b8] uppercase tracking-wider">{post.category}</span>
                                    <span className="flex items-center text-xs text-slate-400 gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                </div>
                                <h3 className="font-serif text-2xl text-[#224034] mb-3 group-hover:text-[#8cd9b8] transition-colors">{post.title}</h3>
                                <p className="text-slate-500 mb-6 flex-1">{post.excerpt}</p>
                                <div className="flex items-center text-[#224034] font-medium mt-auto group-hover:translate-x-2 transition-transform">
                                    Read Article <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
