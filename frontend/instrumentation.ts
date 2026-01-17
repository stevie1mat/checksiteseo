/**
 * Sentry Instrumentation
 * 
 * This file is required for Sentry to work with Next.js.
 * It enables automatic instrumentation for API routes, server components, etc.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    await import('./sentry.edge.config');
  }
}
