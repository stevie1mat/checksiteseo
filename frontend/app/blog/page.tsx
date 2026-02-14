import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "AEO Blog: Answer Engine Optimization Insights",
    description: "Read practical guides, experiments, and case studies on Answer Engine Optimization and AI search visibility.",
    path: "/blog",
    keywords: ["AEO blog", "answer engine optimization guide", "AI search SEO"],
});

const blogPosts = [
    {
        slug: 'why-i-stopped-worrying-about-google-rankings',
        title: 'Why I Stopped Worrying About Google Rankings (And You Should Too)',
        excerpt: 'Last month, I noticed something weird. My site was ranking #3 for a keyword I\'d been targeting for years, but traffic was actually down. Here\'s what I learned.',
        category: 'Trends',
        readTime: '6 min read',
        date: 'January 16, 2026',
        author: 'Sarah Chen',
    },
    {
        slug: 'the-time-chatgpt-cited-my-competitor-instead-of-me',
        title: 'The Time ChatGPT Cited My Competitor Instead of Me (And What I Learned)',
        excerpt: 'I asked ChatGPT about my own industry, and it cited three of my competitors. None of them ranked higher than me. Here\'s what I discovered.',
        category: 'Case Study',
        readTime: '7 min read',
        date: 'January 11, 2026',
        author: 'Marcus Rodriguez',
    },
    {
        slug: 'i-audited-50-sites-for-aeo-heres-what-i-found',
        title: 'I Audited 50 Sites for AEO. Here\'s What I Found',
        excerpt: 'Over the past month, I ran AEO audits on 50 different websites. The results surprised me. Here\'s what actually matters.',
        category: 'Education',
        readTime: '8 min read',
        date: 'January 4, 2026',
        author: 'Alex Kim',
    },
];

export default function BlogPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "CheckSiteAEO Blog",
        "description": "Insights on AEO and AI Search",
        "url": "https://checksiteaeo.com/blog"
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />

            <section className="bg-[#224034] text-white pt-32 pb-20 px-6 text-center">
                <h1 className="font-serif text-5xl mb-6">The AEO Blog</h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    Insights, guides, and news about the future of search.
                </p>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Link 
                            href={`/blog/${post.slug}`} 
                            key={post.slug} 
                            className="group bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col h-full"
                        >
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-semibold text-[#8cd9b8] uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                    <span className="flex items-center text-xs text-slate-400 gap-1">
                                        <Clock className="w-3 h-3" /> {post.readTime}
                                    </span>
                                </div>
                                <h3 className="font-serif text-2xl text-[#224034] mb-3 group-hover:text-[#8cd9b8] transition-colors">
                                    {post.title}
                                </h3>
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
