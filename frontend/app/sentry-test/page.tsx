"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Bug } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

export default function SentryTestPage() {
  const [errorTriggered, setErrorTriggered] = useState(false)
  const [sentryStatus, setSentryStatus] = useState<string>('Checking...')

  useEffect(() => {
    // Check if Sentry is initialized
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (dsn) {
      setSentryStatus(`✅ Sentry DSN configured: ${dsn.substring(0, 30)}...`)
    } else {
      setSentryStatus('❌ Sentry DSN not found in environment variables')
    }
  }, [])

  const triggerError = () => {
    setErrorTriggered(true)
    try {
      // Manually capture first
      Sentry.captureException(new Error('Test JavaScript Error from Sentry test page - Button 1'), {
        tags: { test_type: 'javascript_error', button: '1' },
        extra: { timestamp: new Date().toISOString() }
      })
      // Then throw to trigger automatic capture
      // @ts-ignore - intentionally causing an error
      const undefinedFunction = window.nonExistentFunction()
      undefinedFunction.someProperty
    } catch (error) {
      // This catch won't prevent Sentry from capturing
      console.error('Error triggered:', error)
    }
  }

  const triggerAsyncError = async () => {
    setErrorTriggered(true)
    // Manually capture first
    Sentry.captureException(new Error('Test Async Error from Sentry test page - Button 2'), {
      tags: { test_type: 'async_error', button: '2' },
      extra: { timestamp: new Date().toISOString() }
    })
    
    // Also trigger unhandled promise rejection
    setTimeout(() => {
      Promise.reject(new Error('Unhandled promise rejection test from Sentry test page'))
    }, 100)
  }

  const triggerManualError = () => {
    setErrorTriggered(true)
    // Direct Sentry capture
    Sentry.captureException(new Error('Manual test error from Sentry test page - Button 3'), {
      tags: {
        test_type: 'manual_capture',
        button: '3',
        source: 'sentry-test-page'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-red-600" />
              <CardTitle>Sentry Error Testing</CardTitle>
            </div>
            <CardDescription>
              Test Sentry error tracking by triggering different types of errors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <p className="text-sm font-medium mb-1">Sentry Status:</p>
              <p className="text-xs text-slate-600">{sentryStatus}</p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={triggerError}
                variant="destructive"
                className="w-full"
              >
                Trigger JavaScript Error
              </Button>
              <p className="text-sm text-slate-600">
                This will trigger an unhandled JavaScript error that Sentry should automatically capture.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={triggerAsyncError}
                variant="destructive"
                className="w-full"
              >
                Trigger Async Error (Promise Rejection)
              </Button>
              <p className="text-sm text-slate-600">
                This will trigger an unhandled promise rejection.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={triggerManualError}
                variant="outline"
                className="w-full"
              >
                Manually Capture Error
              </Button>
              <p className="text-sm text-slate-600">
                This will manually send an error to Sentry using the captureException method.
              </p>
            </div>

            {errorTriggered && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Error Triggered!</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Check your Sentry dashboard at{' '}
                      <a 
                        href="https://sentry.io/organizations/checksiteaeo/issues/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        sentry.io
                      </a>
                      {' '}to see if the error was captured.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">How to verify:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                <li>Click one of the error buttons above</li>
                <li>Go to your Sentry dashboard</li>
                <li>Navigate to: Issues → Your Project</li>
                <li>You should see the error appear within a few seconds</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
