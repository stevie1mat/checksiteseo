export interface Site {
    id: string
    user_id: string
    url: string
    name?: string
    status: 'pending' | 'analyzing' | 'completed' | 'error'
    created_at: string
    aeo_score: number
    health_status: {
        robots: 'healthy' | 'warning' | 'critical' | 'neutral'
        schema: 'healthy' | 'warning' | 'critical' | 'neutral'
        content: 'healthy' | 'warning' | 'critical' | 'neutral'
    }
    competitors: {
        yourShare: number
        others: number
        top_competitors: string[]
    }
    last_scanned_at?: string
    // Virtual field for frontend (joined)
    site_history?: SiteHistory[]
}

export interface SiteHistory {
    id: string
    site_id: string
    aeo_score: number
    created_at: string
}

export interface AnalysisBreakdown {
    technical: any
    content: any
    authority: any
    competitors: any
}
