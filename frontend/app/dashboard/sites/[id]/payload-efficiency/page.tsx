import { createClient } from '@/lib/supabase/server'
import { PayloadEfficiencyView } from "@/components/dashboard/views/PayloadEfficiencyView"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function PayloadEfficiencyPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch site details
    const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!site) {
        notFound()
    }

    // Fetch pages for this site (latest scan)
    const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('site_id', site.id)
        .order('last_scanned_at', { ascending: false })
        .limit(1)

    const latestScan = pages && pages[0];
    const breakdown = latestScan?.checklist;

    // Construct the Report Object
    const initialReport = {
        domain: site.url,
        scannedAt: latestScan?.last_scanned_at,
        status: site.status === 'error' ? 'failed' : 'completed',
        scores: {
            overall: latestScan?.aeo_score || 0,
            technical: 0,
            content: 0,
            authority: 0
        },
        technical: {},
        agentEconomics: {
            totalTokens: breakdown?.technical?.agent_economics?.total_tokens || 0,
            indexCost: breakdown?.technical?.agent_economics?.estimated_cost || 0,
            codeToTextRatio: breakdown?.technical?.agent_economics?.html_ratio || 0,
            bloatStatus: breakdown?.technical?.agent_economics?.code_bloat_score || 'Unknown',
            boilerplate_ratio: breakdown?.technical?.agent_economics?.boilerplate_ratio || 0
        },
        content: {},
        authority: {},
        knowledgeGraph: {},
        competitors: {}
    };

    return (
        <div className="space-y-6 w-full pb-24">
            <div className="flex flex-col gap-4">
                <Link href={`/dashboard/sites/${params.id}`} className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Overview
                </Link>
            </div>

            <PayloadEfficiencyView
                siteId={params.id}
                domain={site.url}
                initialData={initialReport}
            />
        </div>
    )
}
