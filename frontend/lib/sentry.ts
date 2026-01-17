/**
 * Sentry Error Tracking Utilities
 * 
 * Helper functions for Sentry error tracking and context management.
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

/**
 * Check if Sentry is enabled
 */
export const isSentryEnabled = (): boolean => {
  return !!SENTRY_DSN;
};

/**
 * Capture an exception
 */
export const captureException = (
  error: Error,
  context?: Record<string, any>
): void => {
  if (!isSentryEnabled()) {
    console.error("Sentry not configured. Error:", error, context);
    return;
  }
  
  Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  });
};

/**
 * Capture a message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>
): void => {
  if (!isSentryEnabled()) {
    console.log(`Sentry not configured. Message: ${message}`, context);
    return;
  }
  
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context || {},
    },
  });
};

/**
 * Set user context
 */
export const setUserContext = (user: {
  id: string;
  email?: string;
  username?: string;
  [key: string]: any;
}): void => {
  if (!isSentryEnabled()) return;
  
  Sentry.setUser({
    ...user,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = (): void => {
  if (!isSentryEnabled()) return;
  
  Sentry.setUser(null);
};

/**
 * Add breadcrumb
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel,
  data?: Record<string, any>
): void => {
  if (!isSentryEnabled()) return;
  
  Sentry.addBreadcrumb({
    message,
    category,
    level: level || "info",
    data,
  });
};

/**
 * Set context
 */
export const setContext = (
  name: string,
  context: Record<string, any>
): void => {
  if (!isSentryEnabled()) return;
  
  Sentry.setContext(name, context);
};

/**
 * Start a transaction (for performance monitoring)
 * Note: In Sentry v8+, transactions are handled automatically via instrumentation
 * Use Sentry.startSpan() directly if needed for custom transactions
 */
export const startTransaction = (
  name: string,
  op: string = "navigation"
): any => {
  if (!isSentryEnabled()) return null;
  
  // In Sentry v8+, use startSpan for custom transactions
  // Automatic instrumentation handles most transactions
  try {
    if (typeof (Sentry as any).startSpan === 'function') {
      return (Sentry as any).startSpan({ name, op }, () => {});
    }
  } catch (e) {
    // Silently fail if not available
  }
  
  return null;
};

// Export Sentry for advanced usage
export { Sentry };
