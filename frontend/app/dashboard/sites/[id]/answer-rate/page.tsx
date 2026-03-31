import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnswerRateView } from '@/components/dashboard/views/AnswerRateView'

export default async function AnswerRatePage({ params }: { params: { id: string } }) {
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

    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()
    const tier = profile?.subscription_tier || 'free'
    if (tier === 'free') {
        redirect('/dashboard/billing?upgrade=plus')
    }

    const { data: pages } = await supabase.from('pages').select('*').eq('site_id', site.id).order('last_scanned_at', { ascending: false }).limit(1)
    const latestScan = pages && pages[0];
    const breakdown = latestScan?.checklist || {};

    // Extract questions data
    const questions = breakdown.content?.gap?.data || breakdown.content?.gap || [];

    // Calculate answer rate
    const answered = questions.filter((q: any) => q.status === 'Explicitly Stated').length;
    const total = questions.length;
    const rate = total > 0 ? Math.round((answered / total) * 100) : 0;

    const answerRateData = {
        rate,
        answered,
        total,
        questions
    };

    return (
        <AnswerRateView
            siteId={site.id}
            domain={site.url}
            initialData={answerRateData}
        />
    )
}
