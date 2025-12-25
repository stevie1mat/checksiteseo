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

        // 2. Update status to analyzing
        await supabase.from('sites').update({ status: 'analyzing' }).eq('id', siteId)

        // 3. Call Python Backend (FastAPI)
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        try {
            const apiResponse = await fetch(`${BACKEND_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url }),
                signal: AbortSignal.timeout(60000) // 60s timeout
            });

            if (!apiResponse.ok) {
                throw new Error(`Python Backend returned ${apiResponse.status}`);
            }

            const data = await apiResponse.json();

            // 4. Save FULL result (Technical, Content, Authority) to checklist column
            const fullBreakdown = data.breakdown || {};
            const basicSeo = fullBreakdown.content?.basic_seo?.data || {};

            // We store the ENTIRE breakdown in 'checklist' so page.tsx can access deep details
            // We also merge the flat flags for backward compatibility if needed by other components
            const checklist = {
                ...fullBreakdown,
                has_h1: basicSeo.has_h1 || false,
                has_schema: fullBreakdown.technical?.schema?.score > 0,
                has_meta_desc: basicSeo.has_meta_desc || false,
                meta_desc_length: basicSeo.meta_desc_length || 0,
                has_og: basicSeo.has_og || false,
            };

            const pageRecord = {
                site_id: siteId,
                url: data.url || url,
                aeo_score: data.total_score || 0,
                checklist: checklist,
                status: 'completed',
                last_scanned_at: new Date().toISOString()
            };

            // 5. Insert into Supabase
            const { error: insertError } = await supabase.from('pages').insert([pageRecord]);
            if (insertError) throw insertError;

            // 6. Update Site Status
            await supabase.from('sites').update({ status: 'completed' }).eq('id', siteId);

            return NextResponse.json({ success: true, data: pageRecord });

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

            competitors: {
                yourShare: 12, // Mocked for now
                others: 60
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
