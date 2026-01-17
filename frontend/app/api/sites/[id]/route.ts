import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validations';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const siteId = params.id

        // Validation
        const validation = uuidSchema.safeParse(siteId);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid Site ID" }, { status: 400 });
        }

        const supabase = createClient()

        // 1. Verify Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Verify Ownership (Security Check)
        const { data: site } = await supabase
            .from('sites')
            .select('user_id')
            .eq('id', siteId)
            .single()

        if (!site) {
            return NextResponse.json({ error: 'Site not found' }, { status: 404 })
        }

        if (site.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 3. Proxy to Python Backend
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        console.log(`[Delete Proxy] Deleting site ${siteId} via backend...`);

        const apiResponse = await fetch(`${BACKEND_URL}/sites/${siteId}`, {
            method: 'DELETE',
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`Backend delete failed: ${apiResponse.status} ${errorText}`);
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('[Delete API] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
