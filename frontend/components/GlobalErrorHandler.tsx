"use client"

import { useEffect } from 'react'
import { captureException, captureMessage } from '@/lib/sentry'
import { analytics } from '@/lib/analytics'

/**
 * Global Error Handler Component
 * 
 * This component sets up global error handlers for:
 * - Unhandled JavaScript errors
 * - Unhandled promise rejections
 * 
 * Add this to your root layout.
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message || 'Unknown error')
      
      captureException(error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandled_error',
      })
      
      analytics.trackError(error.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      captureException(error, {
        type: 'unhandled_promise_rejection',
        reason: String(event.reason),
      })
      
      analytics.trackError(error.message, {
        type: 'unhandled_promise_rejection',
        reason: String(event.reason),
      })
    }

    // Attach event listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
