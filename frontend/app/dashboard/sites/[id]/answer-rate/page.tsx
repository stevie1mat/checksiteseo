import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MetricDetailLayout } from '@/components/dashboard/MetricDetailLayout'

export default async function AnswerRatePage({ params }: { params: { id: string } }) {
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

    const questions = breakdown.content?.gap?.data || breakdown.content?.gap || [];
    const answerRateScore = (() => {
        // Reusing calculation logic
        if (questions.length === 0) return 0;
        const answered = questions.filter((q: any) => q.status === 'Explicitly Stated').length;
        return Math.round((answered / questions.length) * 100);
    })();

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-24 px-6 pt-6">
            <Link href={`/dashboard/sites/${params.id}`} className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                <ArrowLeft className="w-4 h-4" />
                Back to Report
            </Link>

            <MetricDetailLayout
                title="Answer Rate Analysis"
                status={answerRateScore < 50 ? 'critical' : answerRateScore < 80 ? 'warning' : 'pass'}
                impact={`${answerRateScore}% Questions Answered`}
                rawDiagnostic={JSON.stringify(questions, null, 2)}
                whatAndWhyContent={
                    <div className="space-y-4 text-slate-600">
                        <p>
                            <strong>What is Answer Rate?</strong><br />
                            Answer Rate refers to the percentage of core user questions (informational queries) that your content explicitly answers.
                        </p>
                        <p>
                            <strong>Why it matters:</strong><br />
                            Search engines and AI agents prioritize content that directly answers user intent. High answer rates translate to featured snippets and AI citations.
                        </p>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-slate-200">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="p-4">User Question</th>
                                    <th className="p-4 w-32">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {questions.map((q: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50/50">
                                        <td className="p-4 text-slate-800 font-medium">{q.query}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${q.status === 'Explicitly Stated' ? 'bg-green-100 text-green-700' :
                                                    q.status === 'Implied' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {q.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {questions.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="p-4 text-center text-slate-400">No questions analyzed yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </MetricDetailLayout>
        </div>
    )
}
