import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "CheckSiteAEO Free Plan",
    description: "CheckSiteAEO currently runs on a free plan with one scan per day.",
    path: "/pricing",
    keywords: ["AEO free plan", "AEO checker free", "AI SEO tool"],
});

export default function PricingPage() {
    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="pt-28 pb-16 px-6">
                <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <h1 className="font-serif text-3xl text-[#224034]">Free Plan</h1>
                    <p className="text-slate-600 mt-3">All paid pricing and top-ups are hidden. Each account can run one scan every 24 hours.</p>
                </div>
            </div>
            <Footer />
        </main>
    )
}
