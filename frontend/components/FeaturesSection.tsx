import { Share2, FileText, Zap, ShieldCheck, Search, Database, ArrowRight } from "lucide-react";
import Link from "next/link";

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">Why CheckSite AEO?</p>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#224034] max-w-3xl mx-auto leading-tight mb-6">
                        Complete AEO readiness management powered by advanced AI.
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        From technical crawlability to content optimization and authority signals, we analyze every factor that determines how AI models understand, trust, and cite your content.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-12 h-12 flex items-center justify-center text-[#224034]">
                            {/* Custom minimal SVG icons or Lucide */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-serif text-2xl text-[#224034] mb-3">More Visibility</h3>
                            <p className="text-slate-500 leading-relaxed text-sm max-w-xs mx-auto">
                                Get your content approved by AI agents the first time, protecting brand authority and reducing hallucinations.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-12 h-12 flex items-center justify-center text-[#224034]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-serif text-2xl text-[#224034] mb-3">Faster Indexing</h3>
                            <p className="text-slate-500 leading-relaxed text-sm max-w-xs mx-auto">
                                Shorten the gap between publication and citation with schema optimizations that crawlers love.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-12 h-12 flex items-center justify-center text-[#224034]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-serif text-2xl text-[#224034] mb-3">Less Guesswork</h3>
                            <p className="text-slate-500 leading-relaxed text-sm max-w-xs mx-auto">
                                Cut down on technical debt so your team can focus on content, not chasing algorithm updates.
                            </p>
                        </div>
                    </div>

                    {/* Feature 4: Entity Validation */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-12 h-12 flex items-center justify-center text-[#224034]">
                            <ShieldCheck className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="font-serif text-2xl text-[#224034] mb-3">Entity Validation</h3>
                            <p className="text-slate-500 leading-relaxed text-sm max-w-xs mx-auto">
                                Verify your brand's presence in the Knowledge Graph to ensure authoritative citations.
                            </p>
                        </div>
                    </div>

                    {/* Feature 5: Content Gap Analysis */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-12 h-12 flex items-center justify-center text-[#224034]">
                            <Search className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="font-serif text-2xl text-[#224034] mb-3">Content Gap Analysis</h3>
                            <p className="text-slate-500 leading-relaxed text-sm max-w-xs mx-auto">
                                Identify missing topics that prevent your site from being the single source of truth.
                            </p>
                        </div>
                    </div>

                    {/* Feature 6: Smart Schema */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-12 h-12 flex items-center justify-center text-[#224034]">
                            <Database className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="font-serif text-2xl text-[#224034] mb-3">Smart Schema</h3>
                            <p className="text-slate-500 leading-relaxed text-sm max-w-xs mx-auto">
                                Auto-generate JSON-LD structured data that feeds AI models the exact context they need.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#224034] text-white rounded-full font-medium hover:bg-[#1a3329] transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                        Start Free Scan
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
