import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PricingSection } from "@/components/PricingSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { AuthRedirectHandler } from "@/components/AuthRedirectHandler";

export const metadata: Metadata = {
  title: "AEO Readiness Auditor | Free AI Search Optimization Check",
  description: "Get a free Answer Engine Optimization (AEO) audit. See how your site performs with LLMs like ChatGPT, Claude, and Gemini.",
  openGraph: {
    title: "AEO Readiness Auditor | Free AI Search Optimization Check",
    description: "Get a free Answer Engine Optimization (AEO) audit. See how your site performs with LLMs like ChatGPT, Claude, and Gemini.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CheckSiteAEO Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AEO Readiness Auditor | Free AI Search Optimization Check",
    description: "Get a free Answer Engine Optimization (AEO) audit. Optimize your site for AI search.",
    images: ["/og-image.png"],
  }
};

export default function Home() {
  return (
    <main className="min-h-screen font-sans selection:bg-pink-500/30">
      <AuthRedirectHandler />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PricingSection redirectTo="/dashboard/billing" />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
