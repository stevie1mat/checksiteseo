import { Globe, Cpu, FileBarChart } from "lucide-react";

export function HowItWorksSection() {
    const steps = [
        {
            number: "1",
            icon: Globe,
            title: "Enter Your URL",
            description: "Simply paste your website URL into our analyzer. No installation, no complex setup required.",
            details: "Our system immediately begins crawling your site to gather all necessary data including robots.txt, sitemap, schema markup, and page content."
        },
        {
            number: "2",
            icon: Cpu,
            title: "AI Analysis",
            description: "Our advanced AI models analyze your content across 50+ technical and content factors.",
            details: "We check technical readiness (robots.txt, HTTPS, schema), content structure (readability, questions, freshness), and authority signals (E-E-A-T indicators) in real-time."
        },
        {
            number: "3",
            icon: FileBarChart,
            title: "Get Actionable Report",
            description: "Review your comprehensive AEO readiness score with detailed breakdowns and recommendations.",
            details: "See exactly what's working, what needs improvement, and get AI-powered suggestions to fill content gaps and boost your answer engine visibility."
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-[#F9FBFA]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1 rounded-full border border-slate-200 text-xs font-bold tracking-widest uppercase text-slate-500 mb-6 bg-white">
                        Process
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#224034] mb-4">How It Works</h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Get comprehensive AEO insights in three simple steps. Takes less than 60 seconds.
                    </p>
                </div>

                {/* Process Steps - No connecting line */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            {/* Icon Circle */}
                            <div className="relative mb-6">
                                <div className="w-20 h-20 rounded-full bg-[#224034] text-white flex items-center justify-center shadow-xl shadow-[#224034]/20 border-4 border-[#F9FBFA] group-hover:scale-110 transition-transform">
                                    <step.icon className="w-9 h-9" />
                                </div>
                                {/* Step Number Badge */}
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#8cd9b8] text-[#224034] flex items-center justify-center font-bold text-sm shadow-lg">
                                    {step.number}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <h3 className="font-serif text-2xl text-[#224034] mb-2">{step.title}</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {step.description}
                                </p>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {step.details}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
