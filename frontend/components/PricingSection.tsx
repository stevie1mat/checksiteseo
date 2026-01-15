"use client"

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PricingSection({
    currentPlan = "free",
    redirectTo,
    hideHeader = false,
    userEmail,
    userId
}: {
    currentPlan?: string,
    redirectTo?: string,
    hideHeader?: boolean,
    userEmail?: string,
    userId?: string
}) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            description: "Perfect for trying out AEO",
            features: [
                "3 sites included",
                "5 URL scans per month",
                "Basic technical checks",
                "Content readability score",
                "Email support",
                "Public roadmap access"
            ],
            cta: "Start Free",
            buttonVariant: "outline",
            popular: false,
            id: "free"
        },
        {
            name: "Plus",
            price: "$15",
            period: "per month",
            description: "For serious content creators",
            features: [
                "50 sites included",
                "50 URL scans per month",
                "Full AEO analysis suite",
                "AI content gap detection",
                "Priority email support",
                "Weekly reports",
                "Content optimization tools"
            ],
            cta: "Subscribe to Plus",
            buttonVariant: "primary",
            popular: true,
            id: "plus"
        },
        {
            name: "Pro",
            price: "$25",
            period: "per month",
            description: "For agencies and businesses",
            features: [
                "Unlimited sites",
                "Unlimited URL scans",
                "Everything in Plus",
                "E-E-A-T authority scoring",
                "API access",
                "Competitor analysis",
                "Custom integrations"
            ],
            cta: "Subscribe to Pro",
            buttonVariant: "outline",
            popular: false,
            id: "pro"
        }
    ];

    const handleSubscribe = async (planId: string) => {
        // If we want to redirect (e.g. from public page to dashboard), do that first
        if (redirectTo) {
            router.push(redirectTo);
            return;
        }

        if (planId === "free") {
            router.push("/dashboard");
            return;
        }

        try {
            setLoading(planId);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan: planId,
                    email: userEmail,
                    user_id: userId
                }),
            });

            if (!response.ok) {
                console.error("Checkout failed");
                return;
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(null);
        }
    };

    // Helper to determine button state
    const getButtonText = (planId: string, defaultCta: string) => {
        if (planId === currentPlan) return "Current Plan";
        return defaultCta;
    }

    const isCurrentPlan = (planId: string) => planId === currentPlan;

    return (
        <section id="pricing" className={`bg-[#F9FBFA] ${hideHeader ? 'py-0' : 'py-24'}`}>
            <div className="max-w-7xl mx-auto px-6">
                {!hideHeader && (
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1 rounded-full border border-emerald-200 text-xs font-bold tracking-widest uppercase text-emerald-700 mb-6 bg-white">
                            Pricing
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl text-[#224034] max-w-2xl mx-auto leading-tight">
                            Simple, transparent pricing.
                        </h2>
                        <p className="text-slate-500 mt-6 max-w-xl mx-auto text-lg">
                            Choose the plan that fits your needs.
                            <span className="block mt-1 text-emerald-600 font-medium">No hidden fees. Check out instantly.</span>
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => {
                        const isCurrent = isCurrentPlan(plan.id);
                        return (
                            <div
                                key={index}
                                className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 ${plan.popular
                                    ? 'border-[#8cd9b8] shadow-xl shadow-[#8cd9b8]/20 scale-105 z-10'
                                    : 'border-gray-100 hover:border-[#8cd9b8]/50 hover:shadow-lg'
                                    } ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
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
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={!!loading || isCurrent}
                                    className={`w-full h-12 text-base font-semibold ${isCurrent
                                        ? 'bg-slate-100 text-slate-500 cursor-default border-2 border-slate-200 hover:bg-slate-100 hover:text-slate-500' // Current Plan Style
                                        : plan.popular
                                            ? 'bg-[#224034] hover:bg-[#1a3329] text-white shadow-lg'
                                            : 'bg-white hover:bg-[#224034] text-[#224034] hover:text-white border-2 border-[#224034]'
                                        }`}
                                >
                                    {loading === plan.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        getButtonText(plan.id, plan.cta)
                                    )}
                                </Button>
                            </div>
                        )
                    })}
                </div>

                <p className="text-center text-slate-400 text-sm mt-12">
                    Prices in USD. Cancel anytime in your dashboard.
                </p>
            </div>
        </section>
    );
}
