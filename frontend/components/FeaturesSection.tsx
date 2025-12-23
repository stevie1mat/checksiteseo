import { Share2, FileText, Zap } from "lucide-react";

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">Introducing our audit module...</p>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#224034] max-w-2xl mx-auto leading-tight">
                        AI-powered technical readiness management.
                    </h2>
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
                </div>
            </div>
        </section>
    );
}
