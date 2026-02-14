import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HomeResourceLinksSection } from "@/components/HomeResourceLinksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PricingSection } from "@/components/PricingSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { AuthRedirectHandler } from "@/components/AuthRedirectHandler";
import { HOME_FAQ_ITEMS } from "@/lib/home-faq";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free AEO Checker Tool & AEO Checking Tool",
  description:
    "Use our free AEO checker tool to audit your site for AI search visibility. This AEO checking tool scores technical readiness, content quality, and authority signals.",
  path: "/",
  keywords: [
    "AEO checker",
    "AEO checker tool",
    "AEO checking tool",
    "AEO checking tools",
    "answer engine optimization",
    "AI search optimization",
    "AEO audit",
    "AEO readiness",
    "AEO monitoring",
    "LLM SEO",
    "ChatGPT citation optimization",
  ],
});

export default function Home() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": HOME_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Free AEO Checker Tool",
    "url": absoluteUrl("/"),
    "description":
      "Run a free AEO checker tool and improve AI search visibility in ChatGPT, Perplexity, Claude, and Gemini.",
    "inLanguage": "en-US",
  };

  return (
    <main className="min-h-screen font-sans selection:bg-pink-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Suspense fallback={null}>
        <AuthRedirectHandler />
      </Suspense>
      <Navbar />
      <HeroSection />
      <HomeResourceLinksSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PricingSection redirectTo="/dashboard/billing" />
      <FAQSection />
      <Footer />
    </main>
  );
}
