import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const confirmCheckoutSchema = z.object({
  sessionId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()

    if (authError || !user || !session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const validation = confirmCheckoutSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid checkout session id' }, { status: 400 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${backendUrl}/confirm-checkout-session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: validation.data.sessionId,
      }),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json({ error: data?.detail || data?.error || 'Failed to confirm checkout' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
