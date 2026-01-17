import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/Analytics"
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler"
import { ErrorBoundary } from "@/components/ErrorBoundary"

// Import Sentry client config to ensure it's loaded
// This is required for client-side error tracking
import "../sentry.client.config"

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });
const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AEO Readiness Auditor | CheckSiteAEO",
    template: "%s | CheckSiteAEO"
  },
  description: "Analyze your site for LLM readability, citation readiness, and AEO optimization. Get actionable insights to improve your visibility in AI search results.",
  keywords: ["AEO", "AI Search", "LLM Optimization", "SEO", "Site Audit", "Citation Readiness"],
  authors: [{ name: "CheckSiteAEO Team" }],
  creator: "CheckSiteAEO",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "AEO Readiness Auditor | Optimize for AI Search",
    description: "Analyze your site for LLM readability and citation readiness. detailed reports and scoring for the era of AI search.",
    siteName: "CheckSiteAEO",
    images: [
      {
        url: "/og-image.png", // Ensure this exists or replace with a valid path
        width: 1200,
        height: 630,
        alt: "CheckSiteAEO Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AEO Readiness Auditor | Optimize for AI Search",
    description: "Is your site ready for AI search engine optimization? Run a free audit now.",
    images: ["/og-image.png"],
    creator: "@checksiteaeo", // Replace with actual handle if available
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CheckSiteAEO",
    "applicationCategory": "SEO Tool",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "A tool to analyze websites for Answer Engine Optimization (AEO) and LLM readability readiness.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "120"
    }
  };

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-slate-900 bg-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ErrorBoundary>
          {children}
          <Toaster />
          <Analytics />
          <GlobalErrorHandler />
        </ErrorBoundary>
      </body>
    </html>
  );
}
