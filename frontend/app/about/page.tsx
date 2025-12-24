import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Bot, Target, Users, Globe } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-[#224034] text-white pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="font-serif text-5xl md:text-6xl mb-6">Pioneering AEO</h1>
                    <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                        We're on a mission to help content creators and businesses adapt to the new era of Answer Engine Optimization.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="font-serif text-3xl md:text-4xl text-[#224034] mb-6">Our Mission</h2>
                        <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                            Search is changing. Traditional SEO is evolving into something more complex and conversational. We built CheckSite AEO to give you the tools you need to understand how AI sees your content.
                        </p>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            By providing deep insights into structure, relevance, and authority, we empower you to optimize for the future of search, ensuring your voice is heard by both humans and machines.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <Target className="w-10 h-10 text-[#8cd9b8] mb-4" />
                            <h3 className="font-medium text-lg text-[#224034] mb-2">Precision</h3>
                            <p className="text-slate-500">Data-driven insights for accurate optimization.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <Users className="w-10 h-10 text-[#8cd9b8] mb-4" />
                            <h3 className="font-medium text-lg text-[#224034] mb-2">Community</h3>
                            <p className="text-slate-500">Built for creators, publishers, and brands.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <Globe className="w-10 h-10 text-[#8cd9b8] mb-4" />
                            <h3 className="font-medium text-lg text-[#224034] mb-2">Global</h3>
                            <p className="text-slate-500">Understanding search trends worldwide.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <Bot className="w-10 h-10 text-[#8cd9b8] mb-4" />
                            <h3 className="font-medium text-lg text-[#224034] mb-2">AI-Native</h3>
                            <p className="text-slate-500">Designed specifically for the AI era.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats/Team placeholder */}
            <section className="bg-[#f0f9f4] py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="font-serif text-3xl md:text-4xl text-[#224034] mb-12">Built for the future</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm">
                            <div className="text-4xl font-serif text-[#224034] mb-2">10M+</div>
                            <div className="text-slate-500">Pages Analyzed</div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm">
                            <div className="text-4xl font-serif text-[#224034] mb-2">500+</div>
                            <div className="text-slate-500">Enterprise Clients</div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm">
                            <div className="text-4xl font-serif text-[#224034] mb-2">98%</div>
                            <div className="text-slate-500">Customer Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
