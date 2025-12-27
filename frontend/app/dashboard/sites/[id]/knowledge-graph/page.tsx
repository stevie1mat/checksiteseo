import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KnowledgeGraphView } from '@/components/dashboard/views/KnowledgeGraphView'

export default async function KnowledgeGraphPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/signin')
    }

    const { data: site } = await supabase.from('sites').select('*').eq('id', params.id).single()
    if (!site) redirect('/dashboard')

    const { data: pages } = await supabase.from('pages').select('*').eq('site_id', site.id).order('last_scanned_at', { ascending: false }).limit(1)
    const latestScan = pages && pages[0];
    const breakdown = latestScan?.checklist || {};

    // Get backend native structure or root structure
    // The View handles transformation, just pass closest object
    const initialKg = breakdown.knowledgeGraph || breakdown.authority?.knowledge_graph?.data || null;

    return (
        <KnowledgeGraphView
            siteId={site.id}
            domain={site.url}
            initialData={initialKg}
        />
    )
}
