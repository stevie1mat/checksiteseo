"use client"

import { useEffect, useRef } from 'react'

/**
 * KeepAlivePinger Component
 * 
 * Pings the backend every 12 minutes to prevent Render from sleeping.
 * This is especially important for free tier Render services that spin down after inactivity.
 * 
 * The component:
 * - Only runs in the browser (client-side)
 * - Pings the /health endpoint every 12 minutes (720000ms)
 * - Handles errors gracefully
 * - Cleans up the interval on unmount
 */
export function KeepAlivePinger() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const PING_INTERVAL = 12 * 60 * 1000 // 12 minutes in milliseconds

    /**
     * Ping the backend health endpoint
     */
    const pingBackend = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Don't wait too long - just need to wake up the service
          signal: AbortSignal.timeout(5000), // 5 second timeout
        })

        if (response.ok) {
          const data = await response.json()
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Backend ping successful:', data)
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Backend ping returned non-OK status:', response.status)
          }
        }
      } catch (error: any) {
        // Silently handle errors - don't spam console in production
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Backend ping failed (this is OK if backend is sleeping):', error.message)
        }
      }
    }

    // Ping immediately on mount (wake up if sleeping)
    pingBackend()

    // Then ping every 12 minutes
    intervalRef.current = setInterval(pingBackend, PING_INTERVAL)

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 KeepAlivePinger started - will ping backend every 12 minutes`)
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        if (process.env.NODE_ENV === 'development') {
          console.log('🛑 KeepAlivePinger stopped')
        }
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}
