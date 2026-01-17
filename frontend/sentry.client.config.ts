/**
 * Sentry Client Configuration
 * 
 * This file configures Sentry for client-side error tracking.
 * It runs in the browser and captures errors, unhandled promise rejections, etc.
 */

import * as Sentry from "@sentry/nextjs";

// Check if replay integration is available
// In some Sentry versions, it might not be available or have a different API
let replayIntegration: any = null;
let enableReplay = false;

try {
  if (typeof Sentry.replayIntegration === 'function') {
    replayIntegration = Sentry.replayIntegration;
    enableReplay = true;
  } else if ((Sentry as any).Replay) {
    // Fallback for older API
    replayIntegration = (Sentry as any).Replay;
    enableReplay = true;
  }
} catch (e) {
  // Replay not available - will disable replay features
  if (typeof window !== "undefined" && ENVIRONMENT === "development") {
    console.warn("⚠️ Sentry replay integration not available. Session replay disabled.");
  }
}

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

// Only initialize if DSN is provided
// This file runs in the browser, so window is always available
if (SENTRY_DSN) {
  if (typeof window !== "undefined") {
    console.log("🔧 Initializing Sentry client...");
  }
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    
    // Set sample rate for profiling
    profilesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    
    // Enable session replay (only if DSN is configured and integration is available)
    ...(enableReplay ? {
      replaysSessionSampleRate: ENVIRONMENT === "production" ? 0.1 : 0.5,
      replaysOnErrorSampleRate: 1.0,
    } : {}),
  
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
    // Browser tracing integration
    Sentry.browserTracingIntegration({
      // Disable automatic instrumentation to avoid conflicts
      enableInp: false,
    }),
    // Session replay integration (only if available)
    ...(replayIntegration ? [
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ] : []),
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
  
  console.log("✅ Sentry client initialized successfully");
} else if (typeof window !== "undefined" && ENVIRONMENT === "development") {
  console.warn("⚠️ Sentry DSN not configured. Error tracking disabled.");
  console.warn("⚠️ DSN value:", SENTRY_DSN ? "Present" : "Missing");
}
