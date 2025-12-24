import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Terminal, Copy } from "lucide-react";

export default function ApiAccessPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero */}
            <section className="bg-[#224034] text-white pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="font-serif text-5xl mb-6">Build on CheckSite AEO</h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                        Integrate our powerful AEO analysis engine directly into your CMS, dashboard, or workflow.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button className="bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-12 px-8">
                            Get API Key
                        </Button>
                        <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 h-12 px-8">
                            Read Documentation
                        </Button>
                    </div>
                </div>
            </section>

            {/* Code Example */}
            <section className="py-20 px-6 -mt-12">
                <div className="max-w-5xl mx-auto bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-white/10">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-white/5">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs text-white/40 font-mono">example_request.js</div>
                    </div>
                    <div className="p-8 overflow-x-auto">
                        <pre className="text-sm font-mono leading-relaxed">
                            <code className="text-blue-400">const</code> <code className="text-white">checksite</code> <code className="text-pink-400">=</code> <code className="text-blue-400">require</code><code className="text-yellow-300">('checksite-aeo')</code>;<br /><br />
                            <code className="text-blue-400">const</code> <code className="text-white">analysis</code> <code className="text-pink-400">=</code> <code className="text-pink-400">await</code> <code className="text-white">checksite.</code><code className="text-yellow-300">analyze</code><code className="text-pink-400">(</code><code className="text-green-300">"https://example.com/blog/article"</code><code className="text-pink-400">)</code>;<br /><br />
                            <code className="text-white">console.</code><code className="text-yellow-300">log</code><code className="text-pink-400">(</code><code className="text-white">analysis.score</code><code className="text-pink-400">)</code>; <code className="text-gray-500">// 85</code><br />
                            <code className="text-white">console.</code><code className="text-yellow-300">log</code><code className="text-pink-400">(</code><code className="text-white">analysis.suggestions</code><code className="text-pink-400">)</code>;<br />
                            <code className="text-gray-500">// ["Add schema markup", "Optimize for voice search queries", ...]</code>
                        </pre>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="pb-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                        <Terminal className="w-10 h-10 text-[#224034] mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Restful API</h3>
                        <p className="text-slate-500">Simple, standard REST endpoints that are easy to use with any language.</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 bg-[#224034] rounded-lg flex items-center justify-center text-white font-bold mb-4">99%</div>
                        <h3 className="text-xl font-semibold mb-2">Uptime SLA</h3>
                        <p className="text-slate-500">Enterprise-grade reliability guarantees for mission-critical applications.</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                        <Copy className="w-10 h-10 text-[#224034] mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Unlimited Requests</h3>
                        <p className="text-slate-500">Scale without worry. Our enterprise plans support high-volume usage.</p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
