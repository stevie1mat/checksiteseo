import { createClient } from '@/lib/supabase/server'
import isAuth from '@/lib/supabase/middleware' // Using middleware logic implicitly via server client usually, but let's stick to page pattern
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MetricDetailLayout } from '@/components/dashboard/MetricDetailLayout'

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

    // Mock Comp Data or Extract
    const competitors = breakdown.competitors || {
        yourShare: 12,
        others: 88,
        top_competitors: ["Competitor A", "Competitor B"]
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-24 px-6 pt-6">
            <Link href={`/dashboard/sites/${params.id}`} className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                <ArrowLeft className="w-4 h-4" />
                Back to Report
            </Link>

            <MetricDetailLayout
                title="Share of Voice Analysis"
                status={competitors.yourShare < 20 ? 'critical' : 'pass'}
                impact={`${competitors.yourShare}% Market Share`}
                rawDiagnostic={JSON.stringify(competitors, null, 2)}
                whatAndWhyContent={
                    <div className="space-y-4 text-slate-600">
                        <p>
                            <strong>What is Share of Voice?</strong><br />
                            Share of Voice (SOV) measures how much of the conversation in your industry is dominated by your brand versus competitors. In the era of AEO, this translates to how often AI agents cite your brand as the primary source.
                        </p>
                        <p>
                            <strong>Why it matters:</strong><br />
                            If AI models don't know you, they can't recommend you. High SOV ensures you are the "Top of Mind" recommendation for generic queries.
                        </p>
                    </div>
                }
            >
                {/* Action Workbench Content */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-serif text-[#224034] mb-4">Competitor Gap Analysis</h3>
                        <p className="text-slate-600 mb-4">
                            These domains are currently outpacing you in AI citations for your target keywords.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700">
                            {competitors.top_competitors?.map((comp: string, i: number) => (
                                <li key={i}>{comp}</li>
                            )) || <li>No competitors detected.</li>}
                        </ul>
                    </div>
                </div>
            </MetricDetailLayout>
        </div>
    )
}
