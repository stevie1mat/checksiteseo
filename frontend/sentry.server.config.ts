/**
 * Sentry Server Configuration
 * 
 * This file configures Sentry for server-side error tracking.
 * It runs in Node.js and captures errors from API routes, server components, etc.
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

// Only initialize if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    
    // Adjust this value in production
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Filter out localhost errors in production
      if (ENVIRONMENT === "production" && event.request?.url?.includes("localhost")) {
        return null;
      }
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      // Network errors that are expected
      "ECONNREFUSED",
      "ETIMEDOUT",
      "ENOTFOUND",
      // Sentry internal errors
      "Object [object Object] has no method 'updateFrom'",
    ],
  });
} else if (ENVIRONMENT === "development") {
  console.warn("⚠️ Sentry DSN not configured. Server-side error tracking disabled.");
}
