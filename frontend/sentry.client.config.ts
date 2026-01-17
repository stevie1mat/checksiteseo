/**
 * Sentry Client Configuration
 * 
 * This file configures Sentry for client-side error tracking.
 * It runs in the browser and captures errors, unhandled promise rejections, etc.
 * 
 * IMPORTANT: This file should ONLY be imported in client components.
 * Use the SentryInit component in your layout to load this safely.
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

// Only run in browser (client-side)
// This file should only be imported in client components
if (typeof window === "undefined") {
  // Exit early if somehow loaded on server
  // Don't execute any Sentry code on the server
  console.warn("⚠️ sentry.client.config.ts should only be loaded in the browser");
} else {
  // We're in the browser, safe to initialize Sentry
  
  // Check if replay integration is available
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
    // Replay not available
    if (ENVIRONMENT === "development") {
      console.warn("⚠️ Sentry replay integration not available. Session replay disabled.");
    }
  }

  // Check if browserTracingIntegration is available
  let browserTracingIntegration: any = null;
  try {
    if (typeof Sentry.browserTracingIntegration === 'function') {
      browserTracingIntegration = Sentry.browserTracingIntegration;
    } else if ((Sentry as any).BrowserTracing) {
      // Fallback for older API
      browserTracingIntegration = (Sentry as any).BrowserTracing;
    }
  } catch (e) {
    if (ENVIRONMENT === "development") {
      console.warn("⚠️ Sentry browserTracingIntegration not available.");
    }
  }

  // Only initialize if DSN is provided
  if (SENTRY_DSN) {
    console.log("🔧 Initializing Sentry client...");
    
    const integrations: any[] = [];
    
    // Add browser tracing if available
    if (browserTracingIntegration) {
      integrations.push(
        browserTracingIntegration({
          // Disable automatic instrumentation to avoid conflicts
          enableInp: false,
        })
      );
    }
    
    // Add replay integration if available
    if (replayIntegration) {
      integrations.push(
        replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        })
      );
    }
    
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
      
      // Set sample rate for profiling
      profilesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
      
      // Enable session replay (only if integration is available)
      ...(enableReplay ? {
        replaysSessionSampleRate: ENVIRONMENT === "production" ? 0.1 : 0.5,
        replaysOnErrorSampleRate: 1.0,
      } : {}),
    
      // Filter out sensitive data
      beforeSend(event, hint) {
        // Filter out localhost errors in production
        if (ENVIRONMENT === "production" && event.request?.url?.includes("localhost")) {
          return null;
        }
        
        return event;
      },
      
      // Integrations
      integrations,
      
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
        // Sentry internal errors
        "Object [object Object] has no method 'updateFrom'",
      ],
      
      // Don't send errors from browser extensions
      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
      ],
    });
    
    console.log("✅ Sentry client initialized successfully");
  } else if (ENVIRONMENT === "development") {
    console.warn("⚠️ Sentry DSN not configured. Error tracking disabled.");
    console.warn("⚠️ DSN value:", SENTRY_DSN ? "Present" : "Missing");
  }
}
