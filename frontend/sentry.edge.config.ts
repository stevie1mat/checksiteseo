/**
 * Sentry Edge Configuration
 * 
 * This file configures Sentry for edge runtime (middleware, edge functions).
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

// Only initialize if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    
    beforeSend(event, hint) {
      return event;
    },
    
    // Ignore Sentry internal errors
    ignoreErrors: [
      "Object [object Object] has no method 'updateFrom'",
    ],
  });
}
