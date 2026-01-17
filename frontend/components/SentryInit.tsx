"use client"

import { useEffect } from 'react'

/**
 * Sentry Client Initialization Component
 * 
 * This component ensures Sentry client config is loaded only in the browser.
 * It should be added to the root layout.
 */
export function SentryInit() {
  useEffect(() => {
    // Import and initialize Sentry only on client side
    import("../sentry.client.config").catch((error) => {
      console.error("Failed to load Sentry client config:", error);
    });
  }, []);
  
  return null;
}
