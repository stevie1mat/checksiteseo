import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Why I Stopped Worrying About Google Rankings | CheckSiteAEO",
    description: "Last month, I noticed something weird. My site was ranking #3 for a keyword I'd been targeting for years, but traffic was actually down. Here's what I learned.",
    openGraph: {
        title: "Why I Stopped Worrying About Google Rankings | CheckSiteAEO",
        description: "A real story about shifting from traditional SEO to AEO, and why it changed everything.",
        type: "article",
        publishedTime: "2026-01-16",
    },
    twitter: {
        card: "summary",
        title: "Why I Stopped Worrying About Google Rankings | CheckSiteAEO",
        description: "A real story about shifting from traditional SEO to AEO.",
    },
};

export default function BlogPostPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Why I Stopped Worrying About Google Rankings (And You Should Too)",
        "description": "Last month, I noticed something weird. My site was ranking #3 for a keyword I'd been targeting for years, but traffic was actually down. Here's what I learned.",
        "author": {
            "@type": "Person",
            "name": "Sarah Chen"
        },
        "datePublished": "2026-01-16",
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />

            {/* Hero Section */}
            <section className="bg-[#224034] text-white pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link 
                        href="/blog" 
                        className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Blog
                    </Link>
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <span className="text-xs font-semibold text-[#8cd9b8] uppercase tracking-wider bg-[#8cd9b8]/10 px-3 py-1.5 rounded-full">
                            Trends
                        </span>
                        <span className="flex items-center text-sm text-white/70 gap-1.5">
                            <Clock className="w-4 h-4" /> 6 min read
                        </span>
                        <span className="flex items-center text-sm text-white/70 gap-1.5">
                            <Calendar className="w-4 h-4" /> January 16, 2026
                        </span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl mb-6 leading-tight">
                        Why I Stopped Worrying About Google Rankings (And You Should Too)
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed">
                        Last month, I noticed something weird. My site was ranking #3 for a keyword I'd been targeting for years, but traffic was actually down. Here's what I learned.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="px-6 pb-20 pt-12">
                <article className="max-w-4xl mx-auto">
                    {/* Article Content */}
                    <div className="bg-white rounded-xl rounded-b-none p-8 md:p-12 shadow-sm border border-slate-100 border-b-0">
                        <div 
                            className="prose prose-lg prose-slate max-w-3xl mx-auto
                                prose-headings:font-serif prose-headings:text-[#224034] prose-headings:font-bold
                                prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-16 prose-h1:first:mt-0 prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-4
                                prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:font-bold prose-h2:leading-tight
                                prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:first:mt-0 prose-h3:font-semibold
                                prose-p:text-slate-700 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-base prose-p:first:mt-0
                                prose-a:text-[#8cd9b8] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-all
                                prose-strong:text-[#224034] prose-strong:font-semibold
                                prose-code:text-[#8cd9b8] prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                prose-blockquote:border-l-4 prose-blockquote:border-l-[#8cd9b8] prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-8 prose-blockquote:rounded-r-lg prose-blockquote:italic
                                prose-ul:text-slate-700 prose-ul:my-6 prose-ul:space-y-3
                                prose-ol:text-slate-700 prose-ol:my-6 prose-ol:space-y-3
                                prose-li:mb-2 prose-li:leading-relaxed
                                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                                [&>h2]:relative [&>h2]:pl-4 [&>h2]:before:absolute [&>h2]:before:left-0 [&>h2]:before:top-0 [&>h2]:before:bottom-0 [&>h2]:before:w-1 [&>h2]:before:bg-[#8cd9b8] [&>h2]:before:rounded-full"
                        >
                            <p>Let me tell you about the moment I realized everything I thought I knew about SEO was wrong.</p>

                            <p>It was a Tuesday morning. I'd just checked my Google Search Console, and there it was – my site sitting pretty at position #3 for "best project management software." I should have been celebrating. Instead, I was confused because my traffic had actually dropped 15% compared to last month.</p>

                            <p>That's when it hit me: people aren't clicking through to websites anymore. They're asking ChatGPT, Perplexity, or Claude, and those AI assistants are just... answering. No click needed.</p>
        <br/>
                            <h2>The Numbers Don't Lie</h2>

                            <p>I started digging into my analytics, and the pattern was clear. Over the past year:</p>

                            <ul>
                                <li>Organic search traffic: down 22%</li>
                                <li>Direct answers in ChatGPT: up 340% (I was tracking this manually)</li>
                                <li>Time on site: up 45% (the people who do visit are more engaged)</li>
                                <li>Conversion rate: up 18% (better qualified traffic)</li>
                            </ul>

                            <p>So yeah, my rankings "dropped" but my business actually got better. Weird, right?</p>
                            <br/>
                            <h2>What Changed</h2>

                            <p>I used to spend hours obsessing over keyword density, meta descriptions, and backlink profiles. Now? I write like I'm explaining something to a friend. I answer questions directly. I structure my content so it makes sense, not so it ranks.</p>

                            <p>Here's the thing: AI models don't care about your keyword strategy. They care about whether your content actually answers the question. They're reading your stuff, understanding it, and deciding if it's worth citing.</p>

                            <p>It's like the difference between writing for a search algorithm and writing for a smart person who's actually reading your work. The second one feels way more natural.</p>
                            <br/>
                            <h2>My New Approach</h2>

                            <p>I stopped writing "10 Best Project Management Tools (2025 Guide)" and started writing "How to Choose Project Management Software When Your Team is Scattered Across 3 Time Zones."</p>

                            <p>Instead of keyword-stuffed paragraphs, I write clear explanations. Instead of trying to game the system, I just try to be helpful.</p>

                            <p>And you know what? It works. I'm getting cited in AI responses way more often, and when people do click through, they're actually finding what they need. My bounce rate dropped. My pages per session went up. People are actually reading my stuff.</p>
                            <br/>
                            <h2>The Real Test</h2>

                            <p>Last week, I asked Perplexity "what's the best project management tool for remote teams?" and my site was the first citation. Not because I optimized for it, but because I wrote a genuinely useful article that answered that exact question.</p>

                            <p>That felt better than any #1 ranking ever did.</p>
                            <br/>
                            <h2>What This Means for You</h2>

                            <p>If you're still obsessing over rankings, I get it. Old habits die hard. But maybe it's time to shift your focus.</p>

                            <p>Instead of asking "how do I rank higher?" try asking "how do I write something so useful that AI assistants want to cite it?"</p>

                            <p>The answer is simpler than you think: just write good content. Answer real questions. Be helpful. Structure it clearly. Update it when things change.</p>

                            <p>That's it. That's the whole strategy.</p>
                            <br/>
                            <h2>The Bottom Line</h2>

                            <p>I'm not saying rankings don't matter at all. But they matter a lot less than they used to. What matters now is whether your content is good enough that AI models want to reference it.</p>

                            <p>And honestly? Writing for AI citation is way more fun than writing for search algorithms. It feels more human. More authentic. More like actual writing instead of keyword optimization.</p>

                            <p>So yeah, I stopped worrying about Google rankings. And you know what? My business is doing better than ever.</p>

                            <p>Maybe it's time you tried the same thing.</p>
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className="bg-white rounded-xl rounded-t-none p-6 mt-0 shadow-sm border border-slate-100 border-t-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#8cd9b8]/20 flex items-center justify-center">
                                <span className="text-[#224034] font-semibold text-lg">S</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[#224034]">Sarah Chen</p>
                                <p className="text-sm text-slate-500">January 16, 2026</p>
                            </div>
                        </div>
                    </div>
                </article>
            </section>

            {/* Back to Blog CTA */}
            <section className="px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-[#224034] to-[#1a3328] rounded-xl p-8 md:p-12 border border-slate-200 text-center text-white shadow-lg">
                        <h2 className="font-serif text-3xl text-white mb-4">
                            Enjoyed this article?
                        </h2>
                        <p className="text-white/80 mb-8 text-lg">
                            Check out more insights about AEO and AI search optimization.
                        </p>
                        <Link 
                            href="/blog"
                            className="inline-flex items-center gap-2 bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Browse All Posts
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
