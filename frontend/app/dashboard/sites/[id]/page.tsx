import { createClient } from '@/lib/supabase/server'
import { RescanButton } from "@/components/RescanButton"
import { SiteReportView } from "@/components/dashboard/SiteReportView"
import { ArrowLeft, Globe, Calendar } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function SiteDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="p-8 text-center text-red-500">
                Unauthorized. Please sign in.
            </div>
        )
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

    // Fetch pages for this site
    // For now we assume the first page scanned is the homepage/main audit we want to show details for
    const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('site_id', site.id)
        .order('last_scanned_at', { ascending: false }) // Get latest scan
        .limit(1)

    const latestScan = pages && pages[0];
    const breakdown = latestScan?.checklist;

    console.log('[SiteDetailsPage] breakdown.content:', breakdown?.content);
    console.log('[SiteDetailsPage] breakdown.content.gap:', breakdown?.content?.gap);

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard/sites" className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif text-[#224034]">{site.name || site.url}</h1>
                    <p className="text-slate-500 text-sm">{site.url}</p>
                </div>
                <div className="ml-auto">
                    <RescanButton siteId={site.id} status={site.status} />
                </div>
            </div>

            {/* @ts-ignore */}
            <SiteReportView siteId={site.id} domain={site.url} initialReport={{
                domain: site.url,
                scannedAt: latestScan?.last_scanned_at || null,
                status: site.status === 'analyzing' ? 'processing' : (site.status === 'error' ? 'failed' : 'completed'),

                scores: {
                    overall: latestScan?.aeo_score || breakdown?.aeo_score || 0,
                    technical: breakdown?.technical_score || 0,
                    content: breakdown?.content_score || 0,
                    authority: 'Analysis'
                },

                technical: {
                    robotsTxt: breakdown?.technical?.robots?.status === 'valid',
                    llmsTxt: breakdown?.technical?.llms?.status === 'valid',
                    sitemap: breakdown?.technical?.sitemap?.url || null,
                    schema: breakdown?.technical?.schema?.types || [],
                    https: true
                },

                agentEconomics: {
                    totalTokens: breakdown?.technical?.agent_economics?.total_tokens || 0,
                    indexCost: breakdown?.technical?.agent_economics?.estimated_cost || 0,
                    codeToTextRatio: breakdown?.technical?.agent_economics?.html_ratio || 0,
                    bloatStatus: breakdown?.technical?.agent_economics?.code_bloat_score || 'Unknown',
                    boilerplate_ratio: breakdown?.technical?.agent_economics?.boilerplate_ratio || 0
                },

                content: {
                    readabilityGrade: breakdown?.content?.readability?.grade || 0,
                    questionTargetingScore: 0,
                    missingAnswers: (breakdown?.content?.gap?.data || breakdown?.content?.gap || []).map((q: any) => ({
                        query: q.query,
                        status: q.status,
                        draftAnswer: q.draft_answer
                    })),
                    readabilityDetails: breakdown?.content?.readability?.details || [],
                    visualContextScore: breakdown?.content?.visual?.score || 0,
                    freshnessScore: breakdown?.content?.freshness?.score || 0
                },

                authority: {
                    eeat: {
                        hallucination_risk: {
                            level: breakdown?.authority?.eeat?.hallucination_risk?.level || 'Low',
                            reason: breakdown?.authority?.eeat?.hallucination_risk?.reason || '',
                            fix: breakdown?.authority?.eeat?.hallucination_risk?.fix || ''
                        },
                        signals: breakdown?.authority?.eeat?.signals || []
                    },
                    knowledge_graph: {
                        data: {
                            primary_entity: breakdown?.authority?.knowledge_graph?.data?.primary_entity || null
                        }
                    }
                },

                knowledgeGraph: {
                    primaryEntity: breakdown?.authority?.knowledge_graph?.data?.primary_entity || null,
                    type: 'Organization',
                    nodes: [],
                    relationships: breakdown?.authority?.knowledge_graph?.data?.relationships || {},
                    missing_critical: breakdown?.authority?.knowledge_graph?.data?.missing_critical || []
                },

                competitors: {
                    yourShare: site.competitors?.yourShare || 0,
                    others: site.competitors?.others || 100
                }
            }} />
        </div>
    )
}
