import { FileCode, BrainCircuit, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HowItWorksSection() {
    return (
        <section className="py-24 bg-[#224034] border-t border-white/5 relative overflow-hidden" id="how-it-works">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#224034] via-transparent to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold tracking-[0.2em] uppercase mb-4 border border-white/20">
                        The Logic
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
                        From Chaos to <span className="text-emerald-400 italic">Clarity</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto font-light">
                        We don't just read words. We simulate how LLMs parse, tokenize, and reconstruct your authority.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {/* STEP 1: The Input */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl">
                            <FileCode className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-serif text-xl mb-3">Deep Crawl</h3>
                            <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                                Ingesting raw HTML, assets, and metadata structure.
                            </p>
                        </div>
                    </div>

                    {/* STEP 2: The Process */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl">
                            <BrainCircuit className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-serif text-xl mb-3">LLM Simulation</h3>
                            <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                                Reconstructing content through the "eyes" of an AI agent.
                            </p>
                        </div>
                    </div>

                    {/* STEP 3: The Output */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl">
                            <Share2 className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-serif text-xl mb-3">Approve & Sync</h3>
                            <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                                Review Al-generated fixes. One click syncs updates directly to your store.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center relative z-10">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-medium hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                        Analyze Your Site
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
