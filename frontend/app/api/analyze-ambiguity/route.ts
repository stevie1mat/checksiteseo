import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from "zod";

const analyzeAmbiguitySchema = z.object({
    user_domain: z.string().min(1, "Domain is required"),
});

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
        const validation = analyzeAmbiguitySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { user_domain } = validation.data
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        const apiResponse = await fetch(`${BACKEND_URL}/analyze-ambiguity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_domain }),
            signal: AbortSignal.timeout(60000)
        });

        const data = await apiResponse.json().catch(() => ({}))
        return NextResponse.json(data, { status: apiResponse.status });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        console.error('[Analyze Ambiguity API] Error:', error)
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
