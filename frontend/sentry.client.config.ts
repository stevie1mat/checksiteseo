/**
 * Sentry Client Configuration
 * 
 * This file configures Sentry for client-side error tracking.
 * It runs in the browser and captures errors, unhandled promise rejections, etc.
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

// Only initialize if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    
    // Set sample rate for profiling
    profilesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    
    // Enable session replay (only if DSN is configured)
    replaysSessionSampleRate: ENVIRONMENT === "production" ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0,
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events if DSN is not configured
    if (!SENTRY_DSN) {
      return null;
    }
    
    // Filter out localhost errors in production
    if (ENVIRONMENT === "production" && event.request?.url?.includes("localhost")) {
      return null;
    }
    
    return event;
  },
  
  // Integrations
  integrations: [
    // Only enable replay if DSN is configured
    ...(SENTRY_DSN ? [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ] : []),
    Sentry.browserTracingIntegration({
      // Disable automatic instrumentation to avoid conflicts
      enableInp: false,
    }),
  ],
  
  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "atomicFindClose",
    // Network errors that are expected
    "NetworkError",
    "Failed to fetch",
    "Network request failed",
    // Third-party scripts
    "fb_xd_fragment",
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
  ],
  
    // Don't send errors from browser extensions
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ],
  });
} else if (typeof window !== "undefined" && ENVIRONMENT === "development") {
  console.warn("⚠️ Sentry DSN not configured. Error tracking disabled.");
}
