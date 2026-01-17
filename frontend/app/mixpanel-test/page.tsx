"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Send } from 'lucide-react'
import { trackMixpanelEvent, isMixpanelEnabled, mixpanel } from '@/lib/mixpanel'
import { analytics } from '@/lib/analytics'

export default function MixpanelTestPage() {
  const [status, setStatus] = useState<string>('Checking...')
  const [eventsSent, setEventsSent] = useState(0)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Check if Mixpanel is enabled
    const enabled = isMixpanelEnabled()
    setIsEnabled(enabled)
    
    if (enabled) {
      setStatus('✅ Mixpanel is enabled and initialized')
      
      // Send a test event on page load
      trackMixpanelEvent('Mixpanel Test Page Viewed', {
        timestamp: new Date().toISOString(),
        test: true
      })
      setEventsSent(1)
    } else {
      setStatus('❌ Mixpanel is not enabled. Check NEXT_PUBLIC_MIXPANEL_TOKEN in .env.local')
    }
  }, [])

  const sendTestEvent = () => {
    if (!isEnabled) return
    
    // Send test event
    trackMixpanelEvent('Test Event from Mixpanel Test Page', {
      button_clicked: true,
      timestamp: new Date().toISOString(),
      test: true
    })
    
    // Also use the analytics helper
    analytics.trackDashboardViewed()
    
    setEventsSent(prev => prev + 1)
  }

  const sendPageView = () => {
    if (!isEnabled) return
    
    // Track page view
    mixpanel.track('Page Viewed', {
      page_name: '/mixpanel-test',
      page_url: window.location.href,
      test: true
    })
    
    setEventsSent(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <CardTitle>Mixpanel Integration Test</CardTitle>
            </div>
            <CardDescription>
              Test Mixpanel event tracking and verify data is being sent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <p className="text-sm font-medium mb-1">Status:</p>
              <p className={`text-sm ${isEnabled ? 'text-green-700' : 'text-red-700'}`}>
                {status}
              </p>
            </div>

            {isEnabled && (
              <>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Events Sent: {eventsSent}
                  </p>
                  <p className="text-xs text-blue-700">
                    Check your Mixpanel dashboard to see if events appear. It may take a few seconds.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={sendTestEvent}
                    className="w-full"
                    variant="default"
                  >
                    Send Test Event
                  </Button>
                  <p className="text-sm text-slate-600">
                    This will send a custom test event to Mixpanel.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={sendPageView}
                    className="w-full"
                    variant="outline"
                  >
                    Send Page View Event
                  </Button>
                  <p className="text-sm text-slate-600">
                    This will send a "Page Viewed" event to Mixpanel.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                  <h3 className="font-medium mb-2">How to verify:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                    <li>Click the buttons above to send test events</li>
                    <li>Go to your Mixpanel dashboard</li>
                    <li>Navigate to: Events → Live View (or Events → Overview)</li>
                    <li>You should see events appear within a few seconds</li>
                    <li>Look for: "Mixpanel Test Page Viewed", "Test Event from Mixpanel Test Page", "Page Viewed", "Dashboard Viewed"</li>
                  </ol>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Troubleshooting:</p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1 list-disc list-inside">
                        <li>Make sure <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_MIXPANEL_TOKEN</code> is set in <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
                        <li>Restart your dev server after adding the token</li>
                        <li>Check browser console for any Mixpanel errors</li>
                        <li>Verify the token matches your Mixpanel project</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!isEnabled && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Mixpanel Not Configured</p>
                    <p className="text-sm text-red-700 mt-1">
                      Add <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_MIXPANEL_TOKEN=your-token</code> to your <code className="bg-red-100 px-1 rounded">.env.local</code> file and restart the dev server.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
