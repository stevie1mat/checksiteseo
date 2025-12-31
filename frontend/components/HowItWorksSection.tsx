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

                <div className="w-full max-w-5xl mx-auto">
                    {/* Responsive Container: Vertical on Mobile, Horizontal on Desktop */}
                    <div className="flex flex-col md:flex-row justify-between items-center relative gap-16 md:gap-0">

                        {/* Connecting Lines (Background Pipe) */}
                        {/* Desktop Horizontal Pipe */}
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full" />

                        {/* Mobile Vertical Pipe */}
                        <div className="md:hidden absolute top-0 bottom-0 left-1/2 w-1 bg-white/10 -translate-x-1/2 z-0 rounded-full" />

                        {/* Animated Data Stream */}
                        {/* Desktop Horizontal Stream */}
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent w-1/2 animate-flow-h" />
                        </div>

                        {/* Mobile Vertical Stream */}
                        <div className="md:hidden absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 z-0 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent h-1/2 animate-flow-v" />
                        </div>

                        {/* STEP 1: The Input */}
                        <div className="relative z-10 flex flex-col items-center group cursor-default">
                            <div className="w-24 h-24 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center mb-14 shadow-xl relative overflow-hidden group-hover:border-emerald-400/50 group-hover:bg-white/10 transition-all duration-500">
                                {/* Code Rain Effect inside Card */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                                <div className="absolute inset-0 flex flex-col text-[8px] font-mono text-emerald-300/30 p-2 overflow-hidden leading-tight animate-marquee">
                                    <span>{'<html><body><div id="app">...'}</span>
                                    <span>{'<script>console.log("init")'}</span>
                                    <span>{'const data = await fetch('}</span>
                                    <span>{'<meta name="robots" content"'}</span>
                                    <span>{'<div class="chaos-mode">'}</span>
                                </div>
                                <FileCode className="w-10 h-10 text-white/50 group-hover:text-emerald-400 transition-colors duration-300 relative z-10" />
                            </div>
                            <h3 className="text-white font-serif text-xl mb-2">Deep Crawl</h3>
                            <p className="text-white/50 text-sm text-center max-w-[200px] md:max-w-[180px]">Ingesting raw HTML, assets, and metadata structure.</p>
                        </div>

                        {/* STEP 2: The Process (Center Brain) */}
                        <div className="relative z-10 flex flex-col items-center group cursor-default">
                            {/* Pulse Effect for Brain */}
                            <div className="absolute top-[3.5rem] md:top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />

                            <div className="relative mb-14">
                                {/* PING Animation Ring */}
                                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping duration-[3000ms]" />

                                {/* Stable Icon */}
                                <div className="w-28 h-28 rounded-full bg-[#1a3329] border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] relative z-10">
                                    <BrainCircuit className="w-12 h-12 text-emerald-400" />
                                </div>
                            </div>
                            <h3 className="text-white font-serif text-xl mb-2">LLM Simulation</h3>
                            <p className="text-white/50 text-sm text-center max-w-[200px] md:max-w-[180px]">Reconstructing content through the "eyes" of an AI agent.</p>
                        </div>

                        {/* STEP 3: The Output */}
                        <div className="relative z-10 flex flex-col items-center group cursor-default">
                            <div className="w-24 h-24 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center mb-14 shadow-xl relative overflow-hidden group-hover:border-emerald-400/50 group-hover:bg-white/10 transition-all duration-500">
                                {/* Graph Nodes Background */}
                                <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                                    <div className="w-16 h-16 border border-emerald-400/30 rounded-full flex items-center justify-center">
                                        <div className="w-8 h-8 border border-emerald-400/30 rounded-full" />
                                    </div>
                                </div>
                                <Share2 className="w-10 h-10 text-white/50 group-hover:text-emerald-400 transition-colors duration-300 relative z-10" />
                            </div>
                            <h3 className="text-white font-serif text-xl mb-2">Entity Strategy</h3>
                            <p className="text-white/50 text-sm text-center max-w-[200px] md:max-w-[180px]">Structured knowledge graph ready for citation.</p>
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
            </div>
        </section>
    );
}
