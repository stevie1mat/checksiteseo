"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initGA, trackPageView, isAnalyticsEnabled } from '@/lib/analytics'

/**
 * Analytics Component
 * 
 * This component:
 * 1. Initializes Google Analytics on mount
 * 2. Tracks page views on route changes
 * 
 * Add this component to your root layout.
 */
export function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize GA on mount
    if (!isAnalyticsEnabled()) {
      initGA()
    }
  }, [])

  useEffect(() => {
    // Track page views on route changes
    if (isAnalyticsEnabled() && pathname) {
      trackPageView(pathname)
    }
  }, [pathname])

  // Only render the GA script if measurement ID is configured
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      {/* Google Analytics Script */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
