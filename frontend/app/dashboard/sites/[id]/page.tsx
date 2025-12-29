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

    // Helper functions for scoring
    const calculateTechnicalScore = (tech: any) => {
        if (tech?.score) return tech.score;
        let score = 0;
        if (tech?.robots?.status === 'valid') score += 25;
        if (tech?.llms?.status === 'valid') score += 25;
        if (tech?.sitemap?.url) score += 25;
        if (tech?.schema?.types?.length > 0) score += 25;
        return score === 0 ? 30 : score;
    };

    const calculateContentScore = (content: any) => {
        if (content?.score) return content.score;
        let score = 50;
        if (content?.readability?.grade && content.readability.grade < 12) score += 20;
        if (content?.gap?.data?.length > 0) {
            const answered = content.gap.data.filter((q: any) => q.status === 'Explicitly Stated').length;
            const total = content.gap.data.length;
            if (total > 0 && (answered / total) > 0.5) score += 30;
        }
        return score;
    };

    return (
        <div className="space-y-8 w-full pb-24">
            {/* Header / Nav */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard" className="text-slate-500 hover:text-[#224034] transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-full bg-[#224034]/5 flex items-center justify-center text-[#224034]">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h1 className="font-serif text-3xl text-[#224034]">{site.name || site.url}</h1>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 ml-1">
                            <span className={`px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${site.status === 'completed' ? 'bg-green-100 text-green-700' :
                                site.status === 'analyzing' ? 'bg-blue-100 text-blue-700' :
                                    site.status === 'error' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                                {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Added {new Date(site.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    {/* Rescan Button */}
                    <RescanButton siteId={site.id} url={site.url} />
                </div>
            </div>

            {/* If no scan or analyzing */}
            {!latestScan || !breakdown ? (
                <div className="p-12 text-center bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-500">
                        {site.status === 'analyzing' ? 'Analysis in progress... please wait.' : 'No detailed scan data available. Please click Rescan.'}
                    </p>
                    {/* If analyzing, we still pass domain to view to trigger polling via hook, but maybe we want to show loading specifically in View */}
                    {site.status === 'analyzing' && (
                        <div className="mt-8">
                            <SiteReportView domain={site.url} />
                        </div>
                    )}
                </div>
            ) : (
                // Construct Initial Report (Server Side) to hydration matches
                // @ts-ignore
                <SiteReportView siteId={site.id} domain={site.url} initialReport={{
                    domain: site.url,
                    scannedAt: latestScan.last_scanned_at,
                    status: site.status === 'error' ? 'failed' : 'completed',

                    scores: {
                        overall: latestScan.aeo_score || 0,
                        technical: calculateTechnicalScore(breakdown?.technical),
                        content: calculateContentScore(breakdown?.content),
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
            )}
        </div>
    )
}
