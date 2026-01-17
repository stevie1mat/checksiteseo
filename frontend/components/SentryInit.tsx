"use client"

/**
 * Sentry Client Initialization Component
 * 
 * This component ensures Sentry client config is loaded only in the browser.
 * It should be added to the root layout.
 */
export function SentryInit() {
  // Import and initialize Sentry only on client side
  if (typeof window !== "undefined") {
    import("../sentry.client.config").catch((error) => {
      console.error("Failed to load Sentry client config:", error);
    });
  }
  
  return null;
}
