import { Target, BarChart3, FileCheck, Zap, HeadphonesIcon, RefreshCw } from "lucide-react";

export function BenefitsSection() {
    const benefits = [
        {
            icon: Target,
            title: "AI-Powered Analysis",
            description: "Advanced machine learning models analyze your content for E-E-A-T signals and AEO readiness.",
            metric: "95% Accuracy"
        },
        {
            icon: BarChart3,
            title: "Real-time Monitoring",
            description: "Track your AEO score changes as you update content and technical configurations.",
            metric: "Live Updates"
        },
        {
            icon: FileCheck,
            title: "AEO & GEO Reporting",
            description: "Detailed breakdowns of technical AEO readiness alongside Generative Engine textual formatting metrics.",
            metric: "50+ Checks"
        },
        {
            icon: Zap,
            title: "Easy Integration",
            description: "Simple API integration with your existing CMS or workflow tools.",
            metric: "5 Min Setup"
        },
        {
            icon: HeadphonesIcon,
            title: "Expert Support",
            description: "Dedicated AEO specialists available to help optimize your strategy.",
            metric: "24/7 Available"
        },
        {
            icon: RefreshCw,
            title: "Continuous Updates",
            description: "Stay ahead with automatic updates as AI models and algorithms evolve.",
            metric: "Weekly Updates"
        }
    ];

    return (
        <section className="py-24 bg-[#F9FBFA]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1 rounded-full border border-emerald-200 text-xs font-bold tracking-widest uppercase text-emerald-700 mb-6 bg-emerald-50">
                        Why Choose Us
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#224034] max-w-2xl mx-auto leading-tight">
                        Everything you need to dominate Answer Engines.
                    </h2>
                    <p className="text-slate-500 mt-6 max-w-xl mx-auto text-lg">
                        Built for teams who want to stay ahead in the AI-powered search era.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#8cd9b8] hover:shadow-xl hover:shadow-[#8cd9b8]/10 transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-[#8cd9b8] transition-colors">
                                    <benefit.icon className="w-6 h-6 text-[#224034]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-serif text-xl text-[#224034] mb-2">{benefit.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-3">
                                        {benefit.description}
                                    </p>
                                    <div className="inline-block px-3 py-1 bg-[#224034] text-white text-xs font-bold rounded-full">
                                        {benefit.metric}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
