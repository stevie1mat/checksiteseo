import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from "zod";
import { urlSchema, uuidSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic'

const routeScanSchema = z.object({
    url: urlSchema,
    siteId: uuidSchema.optional().nullable(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validation
        const validation = routeScanSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { siteId, url } = validation.data
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

        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        if (!token) {
            throw new Error("No active session token found");
        }

        try {
            const apiResponse = await fetch(`${BACKEND_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url: url, site_id: siteId }),
                signal: AbortSignal.timeout(60000) // 60s timeout
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json().catch(() => ({}));
                return NextResponse.json(
                    { error: errorData.detail || `Backend returned ${apiResponse.status}` },
                    { status: apiResponse.status }
                );
            }

            const data = await apiResponse.json();

            // 4. Return Success (Data is now persisted by Backend)
            return NextResponse.json({ success: true });

        } catch (backendError: any) {
            console.error("[Scan API] Backend Proxy Error:", backendError);
            // Update DB to error
            const supabase = createClient()
            await supabase.from('sites').update({ status: 'error' }).eq('id', siteId)
            throw new Error(`Backend Analysis Failed: ${backendError.message}`);
        }

    } catch (error: any) {
        console.error('[Scan API] Fatal error:', error)
        // Attempt to update DB if siteId is available in scope (it is)
        try {
            const body = await request.clone().json().catch(() => ({}))
            if (body.siteId) {
                const supabase = createClient()
                await supabase.from('sites').update({ status: 'error' }).eq('id', body.siteId)
            }
        } catch (e) { }

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

        const validation = urlSchema.safeParse(domain);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid domain format", details: validation.error.flatten().fieldErrors }, { status: 400 });
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
        const siteCompetitors = site.competitors || {};
        const breakdownCompetitors = breakdown.competitors || {};

        // 3. Map to AEOReport Interface
        const report = {
            domain: site.url,
            scannedAt: latestPage.last_scanned_at,
            status: site.status === 'error' ? 'failed' : 'completed',

            scores: {
                overall: latestPage.aeo_score || breakdown?.aeo_score || 0,
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
                        primary_entity: breakdown?.authority?.knowledge_graph?.data?.primary_entity || null,
                        relationships: breakdown?.authority?.knowledge_graph?.data?.relationships || {}
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
                yourShare: breakdownCompetitors?.yourShare ?? siteCompetitors?.yourShare ?? 0,
                others: breakdownCompetitors?.others ?? siteCompetitors?.others ?? 100,
                top_competitors:
                    breakdownCompetitors?.top_competitors ??
                    siteCompetitors?.top_competitors ??
                    []
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
