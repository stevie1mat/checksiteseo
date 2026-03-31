import { CheckCircle2, Target, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export function FeaturesSection() {
    const differentiators = [
        {
            icon: CheckCircle2,
            title: "Fixes, Not Just Scores",
            description:
                "Get prioritized actions with clear next steps, so your team improves citation potential instead of staring at vanity metrics.",
        },
        {
            icon: Target,
            title: "AEO & GEO Optimization",
            description:
                "Optimize for answer engines (AEO) to be found, and use Generative Engine Optimization (GEO) formatting so AI models effortlessly extract your citations.",
        },
        {
            icon: TrendingUp,
            title: "One-Click Store Sync",
            description:
                "Integrate directly with WordPress and Shopify. Get notified of AI ranking drops and apply our suggested fixes to your store with a single click after review.",
        },
    ];

    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">Why CheckSite AEO?</p>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#224034] max-w-3xl mx-auto leading-tight mb-6">
                        Why teams choose this AEO checker tool.
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        We focus on the levers that move real outcomes in AI search visibility: actionable fixes, citation readiness, and measurable improvement over time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {differentiators.map((item) => (
                        <div key={item.title} className="rounded-2xl border border-slate-100 p-8 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#224034] flex items-center justify-center mb-5">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-serif text-2xl text-[#224034] mb-3">{item.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{item.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <Link
                        href="/aeo-checker-tool"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#224034] text-white rounded-full font-medium hover:bg-[#1a3329] transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                        See How It Works
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
