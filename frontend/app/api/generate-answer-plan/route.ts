import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { site_id, user_domain } = body

        // Note: site_id not strictly needed by backend yet, but user_domain is.
        // We might accept just site_id and fetch domain, but AnswerRateView passes siteId and domain.
        // Let's accept user_domain.

        if (!user_domain) {
            return NextResponse.json({ error: 'Missing user_domain' }, { status: 400 })
        }

        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        console.log(`[Generate Answer Plan API] Proxying to Backend for: ${user_domain}`)

        const apiResponse = await fetch(`${BACKEND_URL}/generate-answer-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_domain }),
            signal: AbortSignal.timeout(60000) // 60s timeout
        });

        if (!apiResponse.ok) {
            throw new Error(`Python Backend returned ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[Generate Answer Plan API] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
