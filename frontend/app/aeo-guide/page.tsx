"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, BookOpen, Search, Code, BarChart, Mic, Briefcase, Rocket, CheckCircle } from "lucide-react";

export default function AeoGuidePage() {
    const [activeChapter, setActiveChapter] = useState("fundamentals");

    const chapters = [
        {
            id: "fundamentals",
            title: "Fundamentals",
            icon: BookOpen,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h1 className="text-4xl font-serif text-[#224034] mb-6">Chapter 1: AEO Fundamentals</h1>

                    <div className="prose prose-lg text-slate-600 max-w-none">
                        <p className="lead text-xl text-slate-700 font-medium mb-6">
                            Answer Engine Optimization (AEO) is the practice of optimizing content not just to rank on a results page, but to be cited as the primary source of truth by AI models.
                        </p>

                        <h3 className="text-2xl font-serif text-[#224034] mt-8 mb-4">From "Ten Blue Links" to Direct Answers</h3>
                        <p>
                            For two decades, SEO has been about convincing an algorithm to list your URL on the first page of search results. The user journey was: <em>Search &rarr; Scan Results &rarr; Click &rarr; Read</em>.
                        </p>
                        <p>
                            With the rise of Large Language Models (LLMs) like ChatGPT, Claude, and Gemini, the user journey is shifting: <em>Ask &rarr; Read Answer</em>. The click is disappearing.
                        </p>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 my-8">
                            <h4 className="font-bold text-[#224034] mb-2">Key Difference</h4>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-emerald-700 min-w-[60px]">SEO:</span>
                                    <span>Optimizing for keywords and clicks.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-emerald-700 min-w-[60px]">AEO:</span>
                                    <span>Optimizing for entities, facts, and citations.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "intent",
            title: "Intent & Content",
            icon: Search,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h1 className="text-4xl font-serif text-[#224034] mb-6">Chapter 2: Intent & Content</h1>

                    <div className="prose prose-lg text-slate-600 max-w-none">
                        <p className="text-lg mb-6">
                            To be cited by an AI, your content must be structured in a way that makes extraction easy. LLMs prefer direct, unambiguous answers to specific questions.
                        </p>

                        <h3 className="text-2xl font-serif text-[#224034] mt-8 mb-4">The Q&A Format</h3>
                        <p>
                            Structure your content around specific user questions. Use the question as your H2 or H3, and provide the answer immediately in the following paragraph.
                        </p>

                        <div className="bg-slate-900 rounded-lg p-6 my-6 font-mono text-sm text-slate-300">
                            <div className="text-emerald-400 mb-2">// Bad</div>
                            <div className="mb-4 text-slate-500">
                                &lt;h2&gt;Price Considerations&lt;/h2&gt;<br />
                                &lt;p&gt;When thinking about the cost, there are many factors... eventually you might pay $10.&lt;/p&gt;
                            </div>

                            <div className="text-emerald-400 mb-2">// Good (AEO Optimized)</div>
                            <div className="text-slate-100">
                                &lt;h2&gt;How much does the service cost?&lt;/h2&gt;<br />
                                &lt;p&gt;The service costs $10 per month. This includes...&lt;/p&gt;
                            </div>
                        </div>

                        <h3 className="text-2xl font-serif text-[#224034] mt-8 mb-4">Visual Context</h3>
                        <p>
                            AI models are increasingly multimodal. They can "see" images. Ensure your images have descriptive filenames and alt text that reinforce the answer you are providing in the text.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "technical",
            title: "Technical AEO",
            icon: Code,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h1 className="text-4xl font-serif text-[#224034] mb-6">Chapter 3: Technical AEO</h1>

                    <div className="prose prose-lg text-slate-600 max-w-none">
                        <p className="text-lg mb-6">
                            Beyond content, you need to speak the robot's language. This means using structured data and ensuring your technical infrastructure allows for efficient crawling by AI bots.
                        </p>

                        <h3 className="text-2xl font-serif text-[#224034] mt-8 mb-4">Schema Markup</h3>
                        <p>
                            Schema.org markup is critical. It explicitly tells the AI "This is a Product," "This is a Price," or "This is a FAQ."
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 my-6">
                            <div className="bg-white border border-slate-200 rounded-lg p-4">
                                <h4 className="font-semibold text-[#224034] mb-2">Essential Schemas</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Article / BlogPosting</li>
                                    <li>FAQPage</li>
                                    <li>Product</li>
                                    <li>Organization</li>
                                </ul>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-4">
                                <h4 className="font-semibold text-[#224034] mb-2">LLMs.txt</h4>
                                <p className="text-sm">
                                    A new standard proposal. Create a `/llms.txt` file that provides a simplified, markdown-only version of your site for training data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "measurement",
            title: "Measurement",
            icon: BarChart,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h1 className="text-4xl font-serif text-[#224034] mb-6">Chapter 4: Measurement</h1>

                    <div className="prose prose-lg text-slate-600 max-w-none">
                        <p className="text-lg mb-6">
                            How do you measure success when there are no clicks? The industry is moving towards a new metric: <strong>Share of Answer</strong>.
                        </p>

                        <h3 className="text-2xl font-serif text-[#224034] mt-8 mb-4">Tracking Success</h3>
                        <p>
                            Instead of tracking "Rank #1", you track "cited in response". CheckSite AEO simulates user queries to various models (GPT-4, Claude, Perplexity) and checks if your brand or URL is cited in the response.
                        </p>

                        <div className="bg-[#224034] text-white rounded-xl p-6 my-8">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-[#8cd9b8]" />
                                The Winner Takes All
                            </h4>
                            <p className="text-white/80">
                                In AEO, being #2 is often the same as being invisible. AI models typically provide one definitive answer or cite 1-3 primary sources. First place is more important than ever.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "voice-vs-chat",
            title: "Voice vs. Chat",
            icon: Mic,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h1 className="text-4xl font-serif text-[#224034] mb-6">Chapter 5: Voice vs. Chat</h1>

                    <div className="prose prose-lg text-slate-600 max-w-none">
                        <p className="text-lg mb-6">
                            While both utilize AI, optimizing for Voice Search (Siri, Alexa) differs significantly from optimizing for Chatbots (ChatGPT, Gemini).
                        </p>

                        <h3 className="text-2xl font-serif text-[#224034] mt-8 mb-4">Voice Search: The Informational Quick-Fix</h3>
                        <p>
                            Voice queries are typically short, local, or factual. Users want a single, spoken answer.
                            <br /><br />
                            <strong>Strategy:</strong> Optimize for "Speakable" schema and ultra-concise (&lt; 30 words) answers to "What," "Where," "When" questions.
                        </p>

                        <h3 className="text-2xl font-serif text-[#224034] mt-8 mb-4">Chatbots: The Transactional Conversation</h3>
                        <p>
                            Chat interactions are multi-turn and complex. Users might ask for comparisons, summaries, or code generation.
                            <br /><br />
                            <strong>Strategy:</strong> Create deep, comprehensive content that covers nuances. Use clean markdown formatting so the AI can easily parse and summarize your points.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "industry",
            title: "Industry Strategies",
            icon: Briefcase,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h1 className="text-4xl font-serif text-[#224034] mb-6">Chapter 6: Industry Strategies</h1>

                    <div className="grid gap-8">
                        <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all">
                            <h3 className="text-xl font-bold text-[#224034] mb-2">E-Commerce</h3>
                            <p className="text-slate-600 mb-4">
                                AI agents will soon shop for users. Optimize your <strong>Product Schema</strong> with price, availability, and shipping info. Ensure your return policies are clearly stated in text for bots to find.
                            </p>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all">
                            <h3 className="text-xl font-bold text-[#224034] mb-2">SaaS & B2B</h3>
                            <p className="text-slate-600 mb-4">
                                You want AI to be your Level 1 Support. Make your documentation public and crawlable. Use "How-to" schema for tutorials so troubleshooting steps are extracted directly.
                            </p>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all">
                            <h3 className="text-xl font-bold text-[#224034] mb-2">Local Business</h3>
                            <p className="text-slate-600 mb-4">
                                Consistency is key. Ensure your NAP (Name, Address, Phone) is identical across Google Maps, Yelp, and your site. AI cross-references these to verify legitimacy.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "future",
            title: "Future Outlook",
            icon: Rocket,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h1 className="text-4xl font-serif text-[#224034] mb-6">Chapter 7: The Future of Search</h1>

                    <div className="prose prose-lg text-slate-600 max-w-none">
                        <p className="text-lg mb-6">
                            We are moving towards an <strong>Agentic Web</strong>, where AI agents act on behalf of users to perform tasks, not just retrieve information.
                        </p>

                        <h3 className="text-2xl font-serif text-[#224034] mt-8 mb-4">The "Death of the Website"?</h3>
                        <p>
                            Unlikely. Instead, websites will evolve into <strong>API-first Knowledge Bases</strong>. The human-facing UI might become simpler, while the machine-facing structure (schema, APIs) becomes robust.
                        </p>

                        <h3 className="text-2xl font-serif text-[#224034] mt-8 mb-4">Get Ready</h3>
                        <p>
                            Those who optimize for AEO today are building the infrastructure for the autonomous agents of tomorrow. Welcome to the new era of the internet.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-[#224034] text-white pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">AEO Guide</span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl">The AEO Guide</h1>
                    <p className="text-xl text-white/80 max-w-2xl mt-4">
                        The complete handbook for optimizing for the age of AI.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar */}
                    <aside className="lg:w-72 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-100">
                                    <h3 className="font-semibold text-[#224034]">Table of Contents</h3>
                                </div>
                                <nav className="p-2 space-y-1">
                                    {chapters.map((chapter) => {
                                        const Icon = chapter.icon;
                                        const isActive = activeChapter === chapter.id;
                                        return (
                                            <button
                                                key={chapter.id}
                                                onClick={() => setActiveChapter(chapter.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all ${isActive
                                                    ? "bg-emerald-50 text-[#224034] border border-emerald-100"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-[#224034]"
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-md ${isActive ? "bg-white text-[#8cd9b8]" : "bg-slate-100 text-slate-400"}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                {chapter.title}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="mt-6 bg-[#f0f9f4] rounded-xl p-6 border border-emerald-100">
                                <h4 className="font-semibold text-[#224034] mb-2">Need Help?</h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    Want a professional audit of your site's AEO readiness?
                                </p>
                                <Link
                                    href="/signup"
                                    className="block w-full py-2 px-4 bg-[#224034] text-white text-center text-sm font-semibold rounded-lg hover:bg-[#1a3329] transition-colors"
                                >
                                    Start Free Audit
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm min-h-[600px]">
                            {chapters.map((chapter) => (
                                <div key={chapter.id} className={activeChapter === chapter.id ? "block" : "hidden"}>
                                    {chapter.content}
                                </div>
                            ))}

                            {/* Navigation Footer within content */}
                            <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center">
                                {(() => {
                                    const currentIndex = chapters.findIndex(c => c.id === activeChapter);
                                    const prevChapter = chapters[currentIndex - 1];
                                    const nextChapter = chapters[currentIndex + 1];

                                    return (
                                        <>
                                            <div>
                                                {prevChapter && (
                                                    <button
                                                        onClick={() => setActiveChapter(prevChapter.id)}
                                                        className="group flex items-center gap-2 text-slate-500 hover:text-[#224034] transition-colors"
                                                    >
                                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                                        <div className="text-left">
                                                            <div className="text-xs uppercase tracking-wider font-semibold opacity-50">Previous</div>
                                                            <div className="font-medium">{prevChapter.title}</div>
                                                        </div>
                                                    </button>
                                                )}
                                            </div>
                                            <div>
                                                {nextChapter && (
                                                    <button
                                                        onClick={() => setActiveChapter(nextChapter.id)}
                                                        className="group flex items-center gap-2 text-slate-500 hover:text-[#224034] transition-colors"
                                                    >
                                                        <div className="text-right">
                                                            <div className="text-xs uppercase tracking-wider font-semibold opacity-50">Next</div>
                                                            <div className="font-medium">{nextChapter.title}</div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
