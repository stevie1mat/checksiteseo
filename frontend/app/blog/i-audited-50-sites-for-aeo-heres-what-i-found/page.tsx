import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "I Audited 50 Sites for AEO. Here's What I Found | CheckSiteAEO",
    description: "Over the past month, I ran AEO audits on 50 different websites. The results surprised me. Here's what actually matters.",
    openGraph: {
        title: "I Audited 50 Sites for AEO. Here's What I Found | CheckSiteAEO",
        description: "Real insights from auditing 50 websites for AEO readiness. What actually matters for AI citations.",
        type: "article",
        publishedTime: "2026-01-04",
    },
    twitter: {
        card: "summary",
        title: "I Audited 50 Sites for AEO. Here's What I Found | CheckSiteAEO",
        description: "Real insights from auditing 50 websites for AEO readiness.",
    },
};

export default function BlogPostPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "I Audited 50 Sites for AEO. Here's What I Found",
        "description": "Over the past month, I ran AEO audits on 50 different websites. The results surprised me. Here's what actually matters.",
        "author": {
            "@type": "Person",
            "name": "Alex Kim"
        },
        "datePublished": "2026-01-04",
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />

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
                            Education
                        </span>
                        <span className="flex items-center text-sm text-white/70 gap-1.5">
                            <Clock className="w-4 h-4" /> 8 min read
                        </span>
                        <span className="flex items-center text-sm text-white/70 gap-1.5">
                            <Calendar className="w-4 h-4" /> January 4, 2026
                        </span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl mb-6 leading-tight">
                        I Audited 50 Sites for AEO. Here's What I Found
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed">
                        Over the past month, I ran AEO audits on 50 different websites. The results surprised me. Here's what actually matters.
                    </p>
                </div>
            </section>

            <section className="px-6 pb-20 pt-12">
                <article className="max-w-4xl mx-auto">
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
                            <p>Last month, I decided to do something a little crazy: I audited 50 websites for AEO readiness. Not for a client. Not for research. Just because I was curious.</p>

                            <p>I wanted to know: what do sites that get cited by AI actually have in common? Is it domain authority? Content length? Schema markup? Something else entirely?</p>

                            <p>So I picked 50 sites across different industries – SaaS companies, blogs, e-commerce stores, news sites. Some I knew got cited frequently. Others I'd never heard of. I ran them all through our AEO audit tool and took notes.</p>

                            <p>Here's what I found.</p>
                            <br/>
                            <h2>The Surprising Truth About Domain Authority</h2>

                            <p>I expected domain authority to be the biggest factor. It wasn't.</p>

                            <p>Sure, big brands like Wikipedia and major news sites get cited a lot. But I also found a bunch of smaller sites – blogs with maybe 10,000 monthly visitors – that were getting cited just as often.</p>

                            <p>The difference? Their content was just... better. Clearer. More comprehensive.</p>

                            <p>One site I audited was a personal blog about gardening. Domain authority: 23. Monthly traffic: maybe 5,000 visitors. But when I asked ChatGPT about "how to grow tomatoes in containers," that blog was the first citation.</p>

                            <p>Why? Because the author had written a genuinely comprehensive guide. Clear headings. Step-by-step instructions. Real photos. Updated regularly. It wasn't trying to rank – it was trying to help.</p>
                            <br/>
                            <h2>Content Structure Matters Way More Than I Thought</h2>

                            <p>This was the biggest surprise. Sites with clear, logical structure got cited way more often than sites with "optimized" structure.</p>

                            <p>I found sites with perfect keyword optimization that AI never cited. And I found sites with terrible SEO but crystal-clear structure that AI cited constantly.</p>

                            <p>The pattern? Sites that used headings that actually described their content (like "How to Choose the Right Tool" instead of "Best Tools 2025 Guide") performed better. Sites with clear sections. Sites that answered questions directly.</p>

                            <p>It's like AI models are reading your content and thinking "does this actually make sense?" And if the answer is no, they move on.</p>
                            <br/>
                            <h2>Schema Markup: The Secret Weapon</h2>

                            <p>Okay, this one I expected. But the difference was even bigger than I thought.</p>

                            <p>Sites with proper schema markup got cited 3x more often than sites without it. And it wasn't just having schema – it was having the RIGHT schema.</p>

                            <p>FAQ schema? Huge impact. HowTo schema? Massive. Article schema with proper author info? Also big.</p>

                            <p>But here's the thing: the sites that had schema but bad content still didn't get cited. Schema helps, but it doesn't replace good writing.</p>
                            <br/>
                            <h2>The Freshness Factor</h2>

                            <p>I noticed something interesting: sites that updated their content regularly got cited more often. Even for evergreen topics.</p>

                            <p>One site I audited had a "last updated" date from 2023. Another had the same content but updated it last month. The updated one got cited. The old one didn't.</p>

                            <p>It makes sense: AI models want to cite current information. Even if the topic doesn't change much, showing that you maintain your content signals that it's reliable.</p>
                            <br/>
                            <h2>What Didn't Matter (Much)</h2>

                            <p>Here's what surprised me by how little it mattered:</p>

                            <ul>
                                <li><strong>Backlinks:</strong> Sites with tons of backlinks didn't necessarily get cited more</li>
                                <li><strong>Social shares:</strong> Basically irrelevant</li>
                                <li><strong>Page speed:</strong> Important for users, but AI doesn't seem to care much</li>
                                <li><strong>Mobile optimization:</strong> Again, important for users, but not a citation factor</li>
                                <li><strong>Content length:</strong> Longer wasn't always better. Comprehensive was better.</li>
                            </ul>
                            <br/>
                            <h2>The Common Thread</h2>

                            <p>After auditing all 50 sites, I noticed one thing that every well-cited site had in common:</p>

                            <p>They wrote for humans first.</p>

                            <p>Not for search engines. Not for AI. For actual people who had questions.</p>

                            <p>Their content was clear. It was helpful. It answered questions directly. It was well-structured. It was maintained.</p>

                            <p>And because of that, both humans and AI found it useful.</p>
                            <br/>
                            <h2>What This Means for You</h2>

                            <p>If you want to get cited by AI, stop trying to optimize for AI. Start trying to write better content.</p>

                            <p>Use clear headings. Answer questions directly. Add schema markup. Update your content regularly. Structure it logically.</p>

                            <p>But most importantly: write like you're explaining something to a friend. Because that's what works. For humans. For AI. For everyone.</p>

                            <p>I know, I know. It sounds too simple. But after auditing 50 sites, I can tell you: it's true.</p>

                            <p>The sites that get cited aren't the ones with the best SEO. They're the ones with the clearest, most helpful content.</p>

                            <p>So go audit your own site. Be honest about it. Is your content clear? Does it answer questions? Is it structured well?</p>

                            <p>If not, fix it. Not for rankings. Not for AI. For the people who are actually reading it.</p>

                            <p>Everything else will follow.</p>
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className="bg-white rounded-xl rounded-t-none p-6 mt-0 shadow-sm border border-slate-100 border-t-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#8cd9b8]/20 flex items-center justify-center">
                                <span className="text-[#224034] font-semibold text-lg">A</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[#224034]">Alex Kim</p>
                                <p className="text-sm text-slate-500">January 4, 2026</p>
                            </div>
                        </div>
                    </div>
                </article>
            </section>

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
