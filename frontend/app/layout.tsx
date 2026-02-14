import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/Analytics"
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { SentryInit } from "@/components/SentryInit"
import { KeepAlivePinger } from "@/components/KeepAlivePinger"
import { SITE_URL, OG_IMAGE, SITE_NAME, TWITTER_HANDLE } from "@/lib/seo"

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });
const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AEO Checker & Answer Engine Optimization Tool | CheckSiteAEO",
    template: "%s | CheckSiteAEO",
  },
  description:
    "Analyze your website with a free AEO checker to improve AI search visibility, citation readiness, and answer engine performance.",
  keywords: [
    "AEO checker",
    "answer engine optimization",
    "AI search optimization",
    "LLM optimization",
    "site audit",
    "citation readiness",
  ],
  authors: [{ name: "CheckSiteAEO Team" }],
  creator: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "AEO Checker & Answer Engine Optimization Tool",
    description:
      "Analyze your website for AI search visibility and citation readiness with detailed technical, content, and authority scoring.",
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "CheckSiteAEO AEO checker dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AEO Checker & Answer Engine Optimization Tool",
    description: "Run a free AEO checker audit and improve visibility in AI-generated answers.",
    images: [OG_IMAGE],
    creator: TWITTER_HANDLE,
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
    "name": SITE_NAME,
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
          <SentryInit />
          <KeepAlivePinger />
          {children}
          <Toaster />
          <Analytics />
          <GlobalErrorHandler />
        </ErrorBoundary>
      </body>
    </html>
  );
}
