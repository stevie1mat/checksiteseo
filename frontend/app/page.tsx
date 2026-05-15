import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HomeResourceLinksSection } from "@/components/HomeResourceLinksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { AuthRedirectHandler } from "@/components/AuthRedirectHandler";
import { HOME_FAQ_ITEMS } from "@/lib/home-faq";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free AEO Checker Tool & AI Search Visibility Audit",
  description:
    "Run a free AEO checker to audit your site for ChatGPT, Gemini, Claude, and Perplexity visibility. Find technical, content, and trust issues blocking AI citations.",
  path: "/",
  keywords: [
    "AEO checker",
    "AEO checking tool",
    "AEO audit",
    "answer engine optimization tool",
    "ChatGPT SEO",
    "Claude SEO",
    "Perplexity Optimization",
    "Gemini SEO checker",
    "AI search visibility",
    "LLM SEO",
    "AI citation audit",
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
    "name": "Free AEO Checker Tool & AI Search Visibility Audit",
    "url": absoluteUrl("/"),
    "description":
      "Run a free AEO checker to improve AI search visibility in ChatGPT, Perplexity, Claude, and Gemini.",
    "inLanguage": "en-US",
  };

  return (
    <main className="min-h-screen font-sans selection:bg-pink-500/30 landing-headings">
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
      <Navbar variant="light-pill" />
      <HeroSection analyzeMode="redirect" />
      <HomeResourceLinksSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
