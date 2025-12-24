import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookOpen, Search, Code, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AeoGuidePage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-[#224034] text-white pt-32 pb-20 px-6 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-[#8cd9b8]/20 text-[#8cd9b8] text-sm font-semibold mb-6">The Ultimate Resource</span>
                <h1 className="font-serif text-5xl md:text-6xl mb-6">The AEO Guide</h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    Everything you need to know about Answer Engine Optimization. From basic concepts to advanced technical implementation.
                </p>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-full bg-[#8cd9b8] flex items-center justify-center shrink-0 text-[#224034]">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl text-[#224034] mb-2">Chapter 1: Fundamentals</h3>
                                    <p className="text-slate-600 mb-4">What is AEO? How does it differ from SEO? Understanding the shift from "ten blue links" to direct answers.</p>
                                    <Button variant="link" className="p-0 text-[#224034] font-semibold">Start Reading</Button>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#8cd9b8] flex items-center justify-center shrink-0 text-[#224034]">
                                    <Search className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl text-[#224034] mb-2">Chapter 2: Intent & Content</h3>
                                    <p className="text-slate-600 mb-4">Optimizing for conversational intent. Formatting content for direct extraction by LLMs.</p>
                                    <Button variant="link" className="p-0 text-[#224034] font-semibold">Start Reading</Button>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#8cd9b8] flex items-center justify-center shrink-0 text-[#224034]">
                                    <Code className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl text-[#224034] mb-2">Chapter 3: Technical AEO</h3>
                                    <p className="text-slate-600 mb-4">Schema markup, structured data, and semantic HTML. Giving the bots exactly what they need.</p>
                                    <Button variant="link" className="p-0 text-[#224034] font-semibold">Start Reading</Button>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#8cd9b8] flex items-center justify-center shrink-0 text-[#224034]">
                                    <BarChart className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl text-[#224034] mb-2">Chapter 4: Measurement</h3>
                                    <p className="text-slate-600 mb-4">How to measure success when there are no clicks? Understanding "Share of Answer".</p>
                                    <Button variant="link" className="p-0 text-[#224034] font-semibold">Start Reading</Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#f0f9f4] p-8 rounded-2xl">
                            <h3 className="font-serif text-2xl text-[#224034] mb-4">Get the PDF Version</h3>
                            <p className="text-slate-600 mb-6">Download the complete guide to share with your team or read offline.</p>
                            <form className="space-y-4">
                                <input className="w-full p-3 rounded-lg border border-slate-200" placeholder="Enter your email" />
                                <Button className="w-full bg-[#224034] text-white">Download Guide</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
