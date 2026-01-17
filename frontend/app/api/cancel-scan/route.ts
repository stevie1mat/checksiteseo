import { NextResponse } from 'next/server'
import { cancelScanSchema } from '@/lib/validations';

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validation
        const validation = cancelScanSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { site_id } = validation.data

        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        console.log(`[Cancel Scan API] Proxying to Backend for Site ID: ${site_id}`)

        const apiResponse = await fetch(`${BACKEND_URL}/cancel-scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site_id }),
            signal: AbortSignal.timeout(60000) // 60s timeout
        });

        const data = await apiResponse.json();
        return NextResponse.json(data, { status: apiResponse.status });

    } catch (error: any) {
        console.error('[Cancel Scan API] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
