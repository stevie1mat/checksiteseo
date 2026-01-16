import { NextResponse } from 'next/server'
import { scheduleScanSchema } from '@/lib/validations';

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validation
        const validation = scheduleScanSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { site_id, url, email, delay_hours, scan_type } = validation.data

        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        console.log(`[Schedule Scan API] Proxying to Backend for: ${url} (Type: ${scan_type || 'full'})`)

        const apiResponse = await fetch(`${BACKEND_URL}/schedule-scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site_id, url, email, delay_hours, scan_type }),
            signal: AbortSignal.timeout(60000) // 60s timeout
        });

        // Forward the response status and body from the backend
        const data = await apiResponse.json();
        return NextResponse.json(data, { status: apiResponse.status });

    } catch (error: any) {
        console.error('[Schedule Scan API] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
