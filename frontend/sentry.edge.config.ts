/**
 * Sentry Edge Configuration
 * 
 * This file configures Sentry for edge runtime (middleware, edge functions).
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,
  tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
  
  beforeSend(event, hint) {
    if (!SENTRY_DSN) {
      return null;
    }
    return event;
  },
});
