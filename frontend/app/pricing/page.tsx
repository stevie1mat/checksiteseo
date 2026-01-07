import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";

export default function PricingPage() {
    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="pt-20">
                <PricingSection redirectTo="/dashboard/billing" />
            </div>
            <Footer />
        </main>
    )
}
