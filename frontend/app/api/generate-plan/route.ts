import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { user_domain, competitor_domain } = body

        if (!user_domain || !competitor_domain) {
            return NextResponse.json({ error: 'Missing domains' }, { status: 400 })
        }

        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        console.log(`[Generate Plan API] Proxying to Backend for: ${user_domain} vs ${competitor_domain}`)

        const apiResponse = await fetch(`${BACKEND_URL}/generate-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_domain, competitor_domain }),
            signal: AbortSignal.timeout(60000) // 60s timeout
        });

        if (!apiResponse.ok) {
            throw new Error(`Python Backend returned ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[Generate Plan API] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
