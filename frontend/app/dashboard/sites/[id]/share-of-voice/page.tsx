import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShareOfVoiceView } from '@/components/dashboard/views/ShareOfVoiceView'

export default async function ShareOfVoicePage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/signin')
    }

    // Fetch site details
    const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!site) {
        redirect('/dashboard')
    }

    // Fetch latest scan
    const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('site_id', site.id)
        .order('last_scanned_at', { ascending: false })
        .limit(1)

    const latestScan = pages && pages[0];
    const breakdown = latestScan?.checklist || {};

    // Extract competitors data from database or use empty structure
    const initialData = breakdown.competitors || {
        yourShare: 0,
        others: 100,
        top_competitors: []
    };

    return (
        <ShareOfVoiceView
            siteId={site.id}
            domain={site.url}
            initialData={initialData}
        />
    )
}
