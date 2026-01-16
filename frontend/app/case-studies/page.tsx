import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Case Studies | CheckSiteAEO",
    description: "See how leading brands use CheckSiteAEO to dominate AI search results and grow their organic traffic.",
    openGraph: {
        title: "Case Studies | CheckSiteAEO",
        description: "Success stories of brands thriving in the age of answer engines.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Case Studies | CheckSiteAEO",
        description: "Real results from real companies using CheckSiteAEO.",
    },
};

export default function CaseStudiesPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-[#224034] text-white pt-32 pb-20 px-6 text-center">
                <h1 className="font-serif text-5xl md:text-6xl mb-6">Customer Stories</h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    See how leading brands are using CheckSite AEO to dominate the new search landscape.
                </p>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto space-y-20">
                    {/* Featured Case Study */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-[#224034] rounded-2xl h-[400px] flex items-center justify-center p-8">
                            {/* Placeholder for chart image */}
                            <div className="text-center">
                                <TrendingUp className="w-24 h-24 text-[#8cd9b8] mx-auto mb-4" />
                                <div className="text-white text-2xl font-bold">+450% Traffic</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-[#8cd9b8] font-bold tracking-widest uppercase mb-4">SaaS Platform</div>
                            <h2 className="font-serif text-4xl text-[#224034] mb-6">How TechFlow increased organic traffic by optimizing for AI</h2>
                            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                TechFlow was struggling to rank for competitive keywords. By using CheckSite AEO to restructure their help center and blog, they became the primary citation source for ChatGPT in their niche.
                            </p>
                            <div className="grid grid-cols-3 gap-8 mb-8 border-t border-b border-slate-200 py-6">
                                <div>
                                    <div className="font-bold text-3xl text-[#224034]">3x</div>
                                    <div className="text-sm text-slate-500">Share of Answer</div>
                                </div>
                                <div>
                                    <div className="font-bold text-3xl text-[#224034]">450%</div>
                                    <div className="text-sm text-slate-500">Traffic Growth</div>
                                </div>
                                <div>
                                    <div className="font-bold text-3xl text-[#224034]">$2M</div>
                                    <div className="text-sm text-slate-500">Added Pipeline</div>
                                </div>
                            </div>
                            <Button className="bg-[#224034] text-white">Read Full Story</Button>
                        </div>
                    </div>

                    {/* Other Case Studies */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg mb-6"></div>
                                <h3 className="font-serif text-xl text-[#224034] mb-3 group-hover:text-[#8cd9b8] transition-colors">E-commerce giant automates schema markup</h3>
                                <p className="text-slate-500 mb-6">Learn how they saved 1000+ developer hours.</p>
                                <div className="flex items-center text-[#224034] font-medium text-sm">
                                    Read Story <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
