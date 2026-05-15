"use client"

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { analytics } from "@/lib/analytics";
import { formatDiamonds } from "@/lib/diamonds";

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
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const dailyFreeDiamonds = Number(process.env.NEXT_PUBLIC_DAILY_FREE_DIAMONDS || 10);
    const starterPackDiamonds = Number(process.env.NEXT_PUBLIC_TOKEN_PACK_STARTER_DIAMONDS || 100);
    const growthPackDiamonds = Number(process.env.NEXT_PUBLIC_TOKEN_PACK_GROWTH_DIAMONDS || 500);
    const scalePackDiamonds = Number(process.env.NEXT_PUBLIC_TOKEN_PACK_SCALE_DIAMONDS || 2000);
    const featureDiamondLabel = (diamonds: number) => `${formatDiamonds(diamonds)} diamonds (usage credits)`;
    const dailyRefillLabel = `Daily free refill (e.g. ${formatDiamonds(dailyFreeDiamonds)}/day)`;

    const packs = [
        {
            id: "starter",
            name: "Starter Pack",
            price: "$19",
            period: "one-time",
            description: "Great for personal projects and light monitoring",
            features: [
                featureDiamondLabel(starterPackDiamonds),
                dailyRefillLabel,
                "Use diamonds anytime",
                "One-time payment (no subscription)"
            ],
            cta: "Get Starter",
            popular: false,
        },
        {
            id: "growth",
            name: "Growth Pack",
            price: "$79",
            period: "one-time",
            description: "Best value for active websites and agencies",
            features: [
                featureDiamondLabel(growthPackDiamonds),
                dailyRefillLabel,
                "Priority support",
                "One-time payment (no recurring billing)"
            ],
            cta: "Get Growth",
            popular: true,
        },
        {
            id: "scale",
            name: "Scale Pack",
            price: "$249",
            period: "one-time",
            description: "High-volume diamond bundle for teams",
            features: [
                featureDiamondLabel(scalePackDiamonds),
                dailyRefillLabel,
                "Team usage support",
                "Priority queue + fastest top-up handling",
                "One-time payment (no monthly commitment)"
            ],
            cta: "Get Scale",
            popular: false,
        }
    ];

    const handlePurchase = async (packId: string) => {
        if (redirectTo) {
            router.push(redirectTo);
            return;
        }

        if (!userId) {
            router.push("/signin");
            return;
        }

        analytics.trackUpgradePlanStarted(`token_pack_${packId}`);
        setLoading(packId);
        setCheckoutError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pack_id: packId,
                    email: userEmail,
                    user_id: userId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Diamond checkout failed:", errorData);
                setCheckoutError(errorData?.detail || "Checkout failed. Please try again.");
                return;
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error(error);
            setCheckoutError("Checkout failed. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <section
            id="pricing"
            className={`bg-white ${hideHeader ? 'pt-14 pb-8 rounded-2xl border border-slate-200 shadow-sm' : 'py-24'}`}
        >
            <div className="max-w-7xl mx-auto px-6">
                {!hideHeader && (
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1 rounded-full border border-emerald-200 text-xs font-bold tracking-widest uppercase text-emerald-700 mb-6 bg-white">
                            Diamond Packs
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl text-[#224034] max-w-2xl mx-auto leading-tight">
                            Buy diamonds only when you need them.
                        </h2>
                        <p className="text-slate-500 mt-6 max-w-xl mx-auto text-lg">
                            Diamonds are usage credits for scans and AI chat.
                            <span className="block mt-1 text-emerald-600 font-medium">One-time top-up + daily free refill.</span>
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {packs.map((pack, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 ${pack.popular
                                ? 'border-[#8cd9b8] shadow-xl shadow-[#8cd9b8]/20 scale-105 z-10'
                                : 'border-gray-100 hover:border-[#8cd9b8]/50 hover:shadow-lg'}`}
                        >
                            {pack.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="bg-[#8cd9b8] text-[#224034] text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="font-serif text-2xl text-[#224034] mb-2">{pack.name}</h3>
                                <p className="text-slate-500 text-sm mb-6">{pack.description}</p>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl font-serif text-[#224034]">{pack.price}</span>
                                    <span className="text-slate-500 text-sm">/ {pack.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {pack.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 shrink-0 mt-0.5 text-[#8cd9b8]" />
                                        <span className="text-sm leading-relaxed text-slate-600">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handlePurchase(pack.id)}
                                disabled={!!loading}
                                className={`w-full h-12 text-base font-semibold transition-all duration-200 ${pack.popular
                                    ? 'bg-[#224034] hover:bg-[#1a3329] text-white shadow-lg'
                                    : 'bg-white hover:bg-[#224034] text-[#224034] hover:text-white border-2 border-[#224034]'}`}
                            >
                                {loading === pack.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    pack.cta
                                )}
                            </Button>
                        </div>
                    ))}
                </div>

                <p className="text-center text-slate-400 text-sm mt-12">
                    Credits never expire. Daily bonus added automatically.
                </p>
                {checkoutError && (
                    <p className="text-center text-sm text-rose-600 mt-3">{checkoutError}</p>
                )}
            </div>
        </section>
    );
}
