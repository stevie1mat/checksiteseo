import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { siteId, url } = body
        const supabase = createClient()

        console.log(`[Scan API] Proxying scan to Python Backend for: ${url}`)

        // 1. Verify user owns the site
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Rate Limit Check
        // Fetch current site data
        const { data: currentSite } = await supabase
            .from('sites')
            .select('last_scanned_at')
            .eq('id', siteId)
            .single()

        const ENABLE_RATE_LIMIT = process.env.ENABLE_RATE_LIMIT === 'true';

        if (ENABLE_RATE_LIMIT && currentSite?.last_scanned_at) {
            const lastScan = new Date(currentSite.last_scanned_at)
            const now = new Date()
            const diffHours = (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60)

            if (diffHours < 24) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded: 1 scan per 24h allowed.' },
                    { status: 429 }
                )
            }
        }

        // 3. Update status to analyzing
        await supabase.from('sites').update({ status: 'analyzing' }).eq('id', siteId)

        // 3. Call Python Backend (FastAPI)
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        try {
            const apiResponse = await fetch(`${BACKEND_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url, site_id: siteId }),
                signal: AbortSignal.timeout(60000) // 60s timeout
            });

            if (!apiResponse.ok) {
                throw new Error(`Python Backend returned ${apiResponse.status}`);
            }

            const data = await apiResponse.json();

            // 4. Return Success (Data is now persisted by Backend)
            return NextResponse.json({ success: true });

        } catch (backendError: any) {
            console.error("[Scan API] Backend Proxy Error:", backendError);
            throw new Error(`Backend Analysis Failed: ${backendError.message}`);
        }

    } catch (error: any) {
        console.error('[Scan API] Fatal error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const domain = searchParams.get('domain')

        if (!domain) {
            return NextResponse.json({ error: 'Domain required' }, { status: 400 })
        }

        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get Site Status
        const { data: site } = await supabase
            .from('sites')
            .select('*')
            .eq('url', domain) // Assuming exact match for now
            .eq('user_id', user.id)
            .single()

        if (!site) {
            return NextResponse.json({ error: 'Site not found' }, { status: 404 })
        }

        if (site.status === 'analyzing' || site.status === 'pending') {
            return NextResponse.json({
                domain: site.url,
                scannedAt: new Date().toISOString(),
                status: 'processing'
            })
        }

        // 2. Fetch Latest Scan Data
        const { data: pages } = await supabase
            .from('pages')
            .select('*')
            .eq('site_id', site.id)
            .order('last_scanned_at', { ascending: false })
            .limit(1)

        const latestPage = pages?.[0];

        if (!latestPage) {
            return NextResponse.json({
                domain: site.url,
                scannedAt: new Date().toISOString(),
                status: 'failed' // Or 'processing' if we want to wait
            })
        }

        const breakdown = latestPage.checklist || {};

        // Helper to safe-guard against missing scores
        const calculateTechnicalScore = (tech: any) => {
            if (tech?.score) return tech.score;
            let score = 0;
            if (tech?.robots?.status === 'valid') score += 25;
            if (tech?.llms?.status === 'valid') score += 25;
            if (tech?.sitemap?.url) score += 25;
            if (tech?.schema?.types?.length > 0) score += 25;
            return score === 0 ? 30 : score; // Min score 30 if data exists but no checks passed
        };

        const calculateContentScore = (content: any) => {
            if (content?.score) return content.score;
            let score = 50; // Base score
            if (content?.readability?.grade && content.readability.grade < 12) score += 20;
            if (content?.gap?.data?.length > 0) {
                const answered = content.gap.data.filter((q: any) => q.status === 'Explicitly Stated').length;
                const total = content.gap.data.length;
                if (total > 0 && (answered / total) > 0.5) score += 30;
            }
            return score;
        };

        // 3. Map to AEOReport Interface
        const report = {
            domain: site.url,
            scannedAt: latestPage.last_scanned_at,
            status: site.status === 'error' ? 'failed' : 'completed',

            scores: {
                overall: latestPage.aeo_score || 0,
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

            competitors: breakdown.competitors || {
                yourShare: 0,
                others: 100,
                top_competitors: []
            },
            // DEBUG FIELDS - Keeping for one more verify cycle
            _debug_keys: Object.keys(breakdown),
            _debug_tech_keys: breakdown.technical ? Object.keys(breakdown.technical) : 'MISSING_TECHNICAL',
            _debug_content_keys: breakdown.content ? Object.keys(breakdown.content) : 'MISSING_CONTENT'
        };

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('[Scan API GET] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
