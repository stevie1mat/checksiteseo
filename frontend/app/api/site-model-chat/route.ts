import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

const siteModelChatSchema = z.object({
  siteId: z.string().uuid(),
  model: z.string().min(3).max(120),
  messages: z.array(messageSchema).min(1).max(30),
  temperature: z.number().min(0).max(1).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()

    if (authError || !user || !session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = siteModelChatSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${backendUrl}/site-model-chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_id: validation.data.siteId,
        model: validation.data.model,
        messages: validation.data.messages,
        temperature: validation.data.temperature ?? 0.2,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json({ error: data?.detail || 'Failed to chat with model' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
