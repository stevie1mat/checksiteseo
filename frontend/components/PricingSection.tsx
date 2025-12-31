import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingSection() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            description: "Perfect for trying out AEO",
            features: [
                "5 URL scans per month",
                "Basic technical checks",
                "Content readability score",
                "Email support",
                "Public roadmap access"
            ],
            cta: "Start Free",
            popular: false
        },
        {
            name: "Plus",
            price: "$15",
            period: "per month",
            description: "For serious content creators",
            features: [
                "50 URL scans per month",
                "Full AEO analysis suite",
                "AI content gap detection",
                "Priority email support",
                "Weekly reports",
                "Content optimization tools"
            ],
            cta: "Start 14-Day Trial",
            popular: true
        },
        {
            name: "Pro",
            price: "$25",
            period: "per month",
            description: "For agencies and businesses",
            features: [
                "Unlimited URL scans",
                "Everything in Plus",
                "E-E-A-T authority scoring",
                "API access",
                "Competitor analysis",
                "Custom integrations"
            ],
            cta: "Start 14-Day Trial",
            popular: false
        }
    ];

    return (
        <section id="pricing" className="py-24 bg-[#F9FBFA]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1 rounded-full border border-emerald-200 text-xs font-bold tracking-widest uppercase text-emerald-700 mb-6 bg-white">
                        Pricing
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#224034] max-w-2xl mx-auto leading-tight">
                        Simple, transparent pricing.
                    </h2>
                    <p className="text-slate-500 mt-6 max-w-xl mx-auto text-lg">
                        Choose the plan that fits your needs. All plans include 14-day free trial.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 ${plan.popular
                                ? 'border-[#8cd9b8] shadow-xl shadow-[#8cd9b8]/20 scale-105'
                                : 'border-gray-100 hover:border-[#8cd9b8]/50 hover:shadow-lg'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="bg-[#8cd9b8] text-[#224034] text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="font-serif text-2xl text-[#224034] mb-2">{plan.name}</h3>
                                <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl font-serif text-[#224034]">{plan.price}</span>
                                    <span className="text-slate-500 text-sm">/ {plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-[#8cd9b8] shrink-0 mt-0.5" />
                                        <span className="text-slate-600 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full h-12 text-base font-semibold ${plan.popular
                                    ? 'bg-[#224034] hover:bg-[#1a3329] text-white shadow-lg'
                                    : 'bg-white hover:bg-[#224034] text-[#224034] hover:text-white border-2 border-[#224034]'
                                    }`}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>

                <p className="text-center text-slate-400 text-sm mt-12">
                    All prices in USD. Cancel anytime. No credit card required for trial.
                </p>
            </div>
        </section>
    );
}
