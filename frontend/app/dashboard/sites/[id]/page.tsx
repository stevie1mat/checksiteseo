import { createClient } from '@/lib/supabase/server'
import { RescanButton } from "@/components/RescanButton"
import { SiteReportView } from "@/components/dashboard/SiteReportView"
import { ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { OverviewModeToggle } from "@/components/dashboard/OverviewModeToggle"

const extractReadabilityGrade = (readability: any): number => {
    const directGrade = Number(readability?.grade)
    if (Number.isFinite(directGrade) && directGrade > 0) {
        return directGrade
    }

    const firstDetail = readability?.details?.[0]
    if (typeof firstDetail === "string") {
        const match = firstDetail.match(/Grade\s+([0-9]+(?:\.[0-9]+)?)/i)
        if (match?.[1]) {
            const parsed = Number(match[1])
            if (Number.isFinite(parsed) && parsed > 0) return parsed
        }
    }

    return 0
}

const extractQuestionTargetingScore = (questions: any): number => {
    const detail = questions?.details?.[0]
    if (typeof detail === "string") {
        const detailMatch = detail.match(/([0-9]+)\s*\/\s*5/i)
        if (detailMatch?.[1]) {
            const parsed = Number(detailMatch[1])
            if (Number.isFinite(parsed)) return Math.max(0, Math.min(5, parsed))
        }
    }

    const score = Number(questions?.score)
    if (Number.isFinite(score) && score > 0) {
        return Math.max(0, Math.min(5, Math.round(score / 20)))
    }

    return 0
}

export default async function SiteDetailsPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
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

    const tier = 'pro'

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

    const tab = searchParams?.tab || 'overview'
    const isOverview = tab === 'overview'

    return (
        <div className="space-y-6 w-full p-6">

            {/* @ts-ignore */}
            <SiteReportView siteId={site.id} domain={site.url} tier={tier} initialReport={{
                domain: site.url,
                scannedAt: latestScan?.last_scanned_at || null,
                status: site.status === 'analyzing' ? 'processing' : (site.status === 'error' ? 'failed' : 'completed'),

                scores: {
                    overall: latestScan?.aeo_score || breakdown?.aeo_score || 0,
                    technical: breakdown?.technical_score || 0,
                    content: breakdown?.content_score || 0,
                    authority: breakdown?.authority_score || breakdown?.authority?.eeat?.score || 0
                },
                engineScores: breakdown?.engine_scores || {},

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
                    readabilityGrade: extractReadabilityGrade(breakdown?.content?.readability),
                    questionTargetingScore: extractQuestionTargetingScore(breakdown?.content?.questions),
                    missingAnswers: (breakdown?.content?.gap?.data || breakdown?.content?.gap || []).map((q: any) => ({
                        query: q.query || q.question || q.prompt || q.user_query || "",
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
                    others: site.competitors?.others || 100,
                    top_competitors:
                        breakdown?.competitors?.top_competitors ||
                        site.competitors?.top_competitors ||
                        []
                }
            }} />
        </div>
    )
}
