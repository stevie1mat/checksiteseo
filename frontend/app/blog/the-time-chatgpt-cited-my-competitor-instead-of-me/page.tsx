import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "The Time ChatGPT Cited My Competitor Instead of Me | CheckSiteAEO",
    description: "I asked ChatGPT about my own industry, and it cited three of my competitors. None of them ranked higher than me. Here's what I discovered.",
    openGraph: {
        title: "The Time ChatGPT Cited My Competitor Instead of Me | CheckSiteAEO",
        description: "A real story about discovering why AI cites some sites over others, even when they rank lower.",
        type: "article",
        publishedTime: "2026-01-11",
    },
    twitter: {
        card: "summary",
        title: "The Time ChatGPT Cited My Competitor Instead of Me | CheckSiteAEO",
        description: "A real story about discovering why AI cites some sites over others.",
    },
};

export default function BlogPostPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "The Time ChatGPT Cited My Competitor Instead of Me (And What I Learned)",
        "description": "I asked ChatGPT about my own industry, and it cited three of my competitors. None of them ranked higher than me. Here's what I discovered.",
        "author": {
            "@type": "Person",
            "name": "Marcus Rodriguez"
        },
        "datePublished": "2026-01-11",
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
                            Case Study
                        </span>
                        <span className="flex items-center text-sm text-white/70 gap-1.5">
                            <Clock className="w-4 h-4" /> 7 min read
                        </span>
                        <span className="flex items-center text-sm text-white/70 gap-1.5">
                            <Calendar className="w-4 h-4" /> January 11, 2026
                        </span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl mb-6 leading-tight">
                        The Time ChatGPT Cited My Competitor Instead of Me (And What I Learned)
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed">
                        I asked ChatGPT about my own industry, and it cited three of my competitors. None of them ranked higher than me. Here's what I discovered.
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
                            <p>This is embarrassing, but I'm going to tell you anyway.</p>

                            <p>Last month, I was doing some research for a client presentation. I asked ChatGPT: "What are the best tools for SEO auditing?"</p>

                            <p>ChatGPT gave me a nice answer, and then it cited three sources. One of them was a tool I'd never heard of. One was a direct competitor. And the third? Also a competitor.</p>

                            <p>My tool wasn't mentioned at all.</p>

                            <p>Here's the kicker: I checked. All three of those sites ranked lower than mine for that exact query. One of them wasn't even on the first page of Google results.</p>

                            <p>So I did what any reasonable person would do: I spent the next three hours trying to figure out why.</p>
                            <br/>
                            <h2>The Investigation</h2>

                            <p>I pulled up each of those competitor sites and started reading. And I noticed something immediately: their content was structured differently.</p>

                            <p>My site had the typical SEO-optimized structure: keyword-rich headings, meta descriptions, all that stuff. Their sites? They just answered questions. Directly. Clearly. Like they were talking to a person.</p>

                            <p>One of them had a section that literally started with "Here's how SEO auditing actually works:" and then just... explained it. No fluff. No keyword stuffing. Just a clear explanation.</p>

                            <p>I realized: ChatGPT wasn't looking at rankings. It was reading the content and deciding which one actually answered the question best.</p>
                            <br/>
                            <h2>What I Found</h2>

                            <p>I did a deeper dive, and here's what those sites had that mine didn't:</p>

                            <ul>
                                <li><strong>Clear structure:</strong> Their headings actually described what was in each section</li>
                                <li><strong>Direct answers:</strong> They answered questions upfront, not buried in paragraphs</li>
                                <li><strong>Schema markup:</strong> They had proper structured data that helped AI understand the content</li>
                                <li><strong>Comprehensive coverage:</strong> They didn't just touch on topics – they covered them thoroughly</li>
                                <li><strong>Recent updates:</strong> Their content was fresh, with dates and "last updated" notices</li>
                            </ul>

                            <p>My content? It was optimized for humans to scan and for search engines to index. But it wasn't optimized for AI to understand and cite.</p>
                            <br/>
                            <h2>The Fix</h2>

                            <p>So I rewrote my main pages. Not to rank better, but to be clearer. More direct. More useful.</p>

                            <p>I added schema markup. I restructured my content with clear headings. I answered questions directly instead of dancing around them. I updated my "last updated" dates. I made sure every section actually explained something instead of just mentioning keywords.</p>

                            <p>It took me a week. And honestly? It was some of the best writing I'd done in years. Because I wasn't trying to game anything – I was just trying to be helpful.</p>
                            <br/>
                            <h2>The Result</h2>

                            <p>Two weeks later, I asked ChatGPT the same question. This time, my site was the second citation.</p>

                            <p>Not first, but second. And honestly? I'll take it. Because I know that when ChatGPT cites my site, it's because my content actually answers the question, not because I tricked an algorithm.</p>

                            <p>More importantly, when people do click through (and they do), they're finding content that actually helps them. My bounce rate dropped. My time on page went up. People are reading more of my content.</p>
                            <br/>
                            <h2>The Lesson</h2>

                            <p>Here's what I learned: ranking high in Google doesn't mean AI will cite you. And getting cited by AI doesn't require ranking high in Google.</p>

                            <p>What it requires is good content. Clear content. Content that actually answers questions.</p>

                            <p>It's that simple. And that hard.</p>

                            <p>Because writing good content is harder than optimizing for keywords. It requires actually understanding your topic. It requires being helpful instead of just being visible.</p>

                            <p>But here's the thing: it's also more sustainable. Because when you write for clarity and usefulness, you're writing for both humans and AI. And that's the future of search.</p>
                            <br/>
                            <h2>Try It Yourself</h2>

                            <p>Go ahead. Ask ChatGPT or Perplexity a question about your industry. See who it cites. Then go read those sites. I bet you'll notice the same things I did.</p>

                            <p>And if your site isn't getting cited? Don't panic. Just make your content better. Clearer. More useful.</p>

                            <p>That's it. That's the whole strategy.</p>

                            <p>Now if you'll excuse me, I have some content to rewrite.</p>
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className="bg-white rounded-xl rounded-t-none p-6 mt-0 shadow-sm border border-slate-100 border-t-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#8cd9b8]/20 flex items-center justify-center">
                                <span className="text-[#224034] font-semibold text-lg">M</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[#224034]">Marcus Rodriguez</p>
                                <p className="text-sm text-slate-500">January 11, 2026</p>
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
