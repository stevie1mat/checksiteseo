"use client"

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

/**
 * Client component to track dashboard views
 * Use this in server components that need analytics tracking
 */
export function DashboardTracker() {
    useEffect(() => {
        analytics.trackDashboardViewed()
    }, [])

    return null
}
