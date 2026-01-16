import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing | CheckSiteAEO",
    description: "Simple, transparent pricing for AEO audits. Start for free and upgrade as you grow.",
    openGraph: {
        title: "Pricing | CheckSiteAEO",
        description: "Simple, transparent pricing for AEO audits. Start for free and upgrade as you grow.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Pricing | CheckSiteAEO",
        description: "Flexible plans for every stage of your AEO journey.",
    },
};

export default function PricingPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "CheckSiteAEO Pro",
        "description": "Advanced AEO auditing and monitoring tools.",
        "offers": {
            "@type": "Offer",
            "price": "29.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        }
    };

    return (
        <main className="min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />
            <div className="pt-20">
                <PricingSection redirectTo="/dashboard/billing" />
            </div>
            <Footer />
        </main>
    )
}
