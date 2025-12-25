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
