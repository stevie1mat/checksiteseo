import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MetricDetailLayout } from '@/components/dashboard/MetricDetailLayout'

export default async function HallucinationRiskPage({ params }: { params: { id: string } }) {
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

    const risk = breakdown.authority?.eeat?.hallucination_risk || { level: 'Low', reason: 'No notable contradictions found.', fix: 'Maintain current citation standards.' };
    const signals = breakdown.authority?.eeat?.signals || [];

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-24 px-6 pt-6">
            <Link href={`/dashboard/sites/${params.id}`} className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                <ArrowLeft className="w-4 h-4" />
                Back to Report
            </Link>

            <MetricDetailLayout
                title="Hallucination Risk Analysis"
                status={risk.level === 'High' ? 'critical' : risk.level === 'Medium' ? 'warning' : 'pass'}
                impact={`${risk.level} Risk`}
                rawDiagnostic={JSON.stringify(risk, null, 2)}
                whatAndWhyContent={
                    <div className="space-y-4 text-slate-600">
                        <p>
                            <strong>What is Hallucination Risk?</strong><br />
                            This metric measures the probability that an AI model will generate false or "hallucinated" information about your brand due to conflicting or ambiguous data sources.
                        </p>
                        <p>
                            <strong>Why it matters:</strong><br />
                            Consistent, authoritative data across the web reduces the chance of AI misrepresentation.
                        </p>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className={`p-6 rounded-lg ${risk.level === 'High' ? 'bg-red-50 border border-red-200' :
                            risk.level === 'Medium' ? 'bg-yellow-50 border border-yellow-200' :
                                'bg-green-50 border border-green-200'
                        }`}>
                        <h4 className="font-bold text-lg mb-2 text-[#224034]">Assessment: {risk.reason}</h4>
                        <p className="text-slate-700">{risk.fix}</p>
                    </div>
                </div>
            </MetricDetailLayout>
        </div>
    )
}
