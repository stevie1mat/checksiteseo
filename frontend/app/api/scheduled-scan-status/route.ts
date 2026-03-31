import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const siteId = searchParams.get('site_id')
        if (!siteId) {
            return NextResponse.json({ error: 'site_id is required' }, { status: 400 })
        }

        const { data: site } = await supabase
            .from('sites')
            .select('id')
            .eq('id', siteId)
            .eq('user_id', user.id)
            .single()

        if (!site) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { data: scan } = await supabase
            .from('scheduled_scans')
            .select('id,status,scheduled_for')
            .eq('site_id', siteId)
            .in('status', ['pending', 'processing'])
            .order('scheduled_for', { ascending: true })
            .limit(1)
            .maybeSingle()

        return NextResponse.json({
            hasPendingScan: !!scan,
            scan: scan || null
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        console.error('[Scheduled Scan Status API] Error:', error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
