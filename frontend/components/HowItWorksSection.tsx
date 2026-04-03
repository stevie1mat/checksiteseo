import { FileCode, BrainCircuit, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HowItWorksSection() {
    return (
        <section className="py-24 bg-white" id="how-it-works">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1 rounded-full border border-emerald-200 text-xs font-bold tracking-widest uppercase text-emerald-700 mb-6 bg-emerald-50">
                        The Logic
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif text-[#224034] mb-6">
                        From Chaos to <span className="text-emerald-600 italic">Clarity</span>
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        We don't just read words. We simulate how LLMs parse, tokenize, and reconstruct your authority.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* STEP 1: The Input */}
                    <div className="group rounded-2xl border border-slate-100 bg-white p-8 hover:border-[#8cd9b8] hover:shadow-lg transition-all duration-300 text-center">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#224034] flex items-center justify-center mx-auto mb-5 group-hover:bg-[#8cd9b8]/30 transition-colors">
                            <FileCode className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-[#224034] font-serif text-2xl mb-3">Deep Crawl</h3>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
                                Ingesting raw HTML, assets, and metadata structure.
                            </p>
                        </div>
                    </div>

                    {/* STEP 2: The Process */}
                    <div className="group rounded-2xl border border-slate-100 bg-white p-8 hover:border-[#8cd9b8] hover:shadow-lg transition-all duration-300 text-center">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#224034] flex items-center justify-center mx-auto mb-5 group-hover:bg-[#8cd9b8]/30 transition-colors">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-[#224034] font-serif text-2xl mb-3">LLM Simulation</h3>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
                                Reconstructing content through the "eyes" of an AI agent.
                            </p>
                        </div>
                    </div>

                    {/* STEP 3: The Output */}
                    <div className="group rounded-2xl border border-slate-100 bg-white p-8 hover:border-[#8cd9b8] hover:shadow-lg transition-all duration-300 text-center">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#224034] flex items-center justify-center mx-auto mb-5 group-hover:bg-[#8cd9b8]/30 transition-colors">
                            <Share2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-[#224034] font-serif text-2xl mb-3">Approve & Sync</h3>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
                                Review AI-generated fixes. One click syncs updates directly to your store.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-14 text-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#224034] text-white rounded-full font-medium hover:bg-[#1a3329] transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                        Analyze Your Site
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
