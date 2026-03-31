import { NextResponse } from 'next/server'
import { planSchema } from '@/lib/validations';
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validation
        const validation = planSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { user_domain, competitor_domain } = validation.data

        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        console.log(`[Generate Plan API] Proxying to Backend for: ${user_domain} vs ${competitor_domain}`)

        const apiResponse = await fetch(`${BACKEND_URL}/generate-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_domain, competitor_domain }),
            signal: AbortSignal.timeout(60000) // 60s timeout
        });

        if (!apiResponse.ok) {
            throw new Error(`Python Backend returned ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        console.error('[Generate Plan API] Error:', error)
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
