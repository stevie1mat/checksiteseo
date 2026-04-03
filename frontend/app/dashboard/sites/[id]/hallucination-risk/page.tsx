import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HallucinationRiskView } from '@/components/dashboard/views/HallucinationRiskView'

export default async function HallucinationRiskPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/signin')
    }

    const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()
    if (!site) redirect('/dashboard')

    const { data: pages } = await supabase.from('pages').select('*').eq('site_id', site.id).order('last_scanned_at', { ascending: false }).limit(1)
    const latestScan = pages && pages[0];
    const breakdown = latestScan?.checklist || {};

    const initialRisk = breakdown.authority?.eeat?.hallucination_risk || { level: 'Low', reason: 'No notable contradictions found.', fix: 'Maintain current citation standards.' };

    return (
        <HallucinationRiskView
            siteId={site.id}
            domain={site.url}
            initialData={initialRisk}
        />
    )
}
