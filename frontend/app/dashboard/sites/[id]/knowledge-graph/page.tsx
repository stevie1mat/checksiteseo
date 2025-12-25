import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MetricDetailLayout } from '@/components/dashboard/MetricDetailLayout'

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

    const kg = breakdown.authority?.knowledge_graph?.data || { primary_entity: 'Not found', relationships: {}, missing_critical: [] };
    const missing = kg.missing_critical || [];

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-24 px-6 pt-6">
            <Link href={`/dashboard/sites/${params.id}`} className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                <ArrowLeft className="w-4 h-4" />
                Back to Report
            </Link>

            <MetricDetailLayout
                title="Knowledge Graph Analysis"
                status={kg.primary_entity && missing.length === 0 ? 'pass' : kg.primary_entity ? 'warning' : 'critical'}
                impact={kg.primary_entity ? `${kg.primary_entity} Found` : 'No Entity Found'}
                rawDiagnostic={JSON.stringify(kg, null, 2)}
                whatAndWhyContent={
                    <div className="space-y-4 text-slate-600">
                        <p>
                            <strong>What is a Knowledge Graph?</strong><br />
                            A Knowledge Graph is a network of real-world entities (people, places, things) and their relationships. Google uses this to understand "who" you are, not just "what keywords" you use.
                        </p>
                        <p>
                            <strong>Why it matters:</strong><br />
                            Being firmly established in the Knowledge Graph is critical for modern SEO and is the foundation of "Authority" for AI agents.
                        </p>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <h3 className="font-medium text-[#224034] mb-4">Entity Health Check</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded border border-slate-200">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Primary Entity</span>
                                <div className="text-lg font-bold text-[#224034] mt-1">{kg.primary_entity || 'Unknown'}</div>
                            </div>

                            {missing.length > 0 && (
                                <div className="bg-red-50 p-4 rounded border border-red-200">
                                    <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Missing Attributes</span>
                                    <ul className="text-sm text-red-700 mt-2 list-disc pl-4">
                                        {missing.map((m: string, i: number) => <li key={i}>{m}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </MetricDetailLayout>
        </div>
    )
}
