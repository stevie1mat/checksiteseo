import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "AEO Checker Pricing Plans",
    description: "Compare CheckSiteAEO pricing plans for AEO audits, monitoring, and AI search optimization.",
    path: "/pricing",
    keywords: ["AEO pricing", "AEO checker plans", "AI SEO tool pricing"],
});

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
