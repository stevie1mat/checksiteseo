"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, MessageSquare } from 'lucide-react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ModelOption = {
  id: string
  label: string
}

interface SiteModelChatViewProps {
  siteId: string
  domain: string
}

export function SiteModelChatView({ siteId, domain }: SiteModelChatViewProps) {
  const [models, setModels] = useState<ModelOption[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [usage, setUsage] = useState<{
    tokenBalance: number
    remainingTokens: number
    dailyFreeTokens: number
    canClaimDailyFree?: boolean
    tokensPerChat: number
  } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `You can ask me anything about AEO, SEO, and GEO for ${domain}.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingReply, setLoadingReply] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadModels = async () => {
      setLoadingModels(true)
      setError(null)
      try {
        const response = await fetch('/api/eden-models', { cache: 'no-store' })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load models')
        }
        const fetchedModels: ModelOption[] = Array.isArray(data.models)
          ? data.models
              .map((item: unknown) => {
                if (typeof item === 'string') {
                  return { id: item, label: item }
                }
                if (
                  item &&
                  typeof item === 'object' &&
                  typeof (item as { id?: unknown }).id === 'string'
                ) {
                  const id = (item as { id: string }).id
                  const labelValue = (item as { label?: unknown }).label
                  return { id, label: typeof labelValue === 'string' ? labelValue : id }
                }
                return null
              })
              .filter((item: ModelOption | null): item is ModelOption => item !== null)
          : []
        if (isMounted) {
          setModels(fetchedModels)
          if (fetchedModels.length > 0) {
            setSelectedModel((current) => current || fetchedModels[0].id)
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load Eden models')
        }
      } finally {
        if (isMounted) setLoadingModels(false)
      }
    }

    loadModels()
    const loadUsage = async () => {
      try {
        const response = await fetch('/api/usage', { cache: 'no-store' })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !isMounted) return
        setUsage({
          tokenBalance: Number(data.tokenBalance || 0),
          remainingTokens: Number(data.remainingTokens || 0),
          dailyFreeTokens: Number(data.dailyFreeTokens || 0),
          canClaimDailyFree: Boolean(data.canClaimDailyFree),
          tokensPerChat: Number(data.tokensPerChat || 1),
        })
      } catch {
        // Ignore usage errors in chat view
      }
    }
    loadUsage()
    return () => {
      isMounted = false
    }
  }, [])

  const canSend = useMemo(() => {
    const hasEnoughTokens = usage ? usage.remainingTokens >= usage.tokensPerChat : true
    return input.trim().length > 0 && selectedModel.length > 0 && !loadingReply && hasEnoughTokens
  }, [input, selectedModel, loadingReply, usage])

  const handleSend = async () => {
    if (!canSend) return

    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setLoadingReply(true)
    setError(null)

    try {
      const response = await fetch('/api/site-model-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          model: selectedModel,
          messages: nextMessages,
          temperature: 0.2,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Chat request failed')
      }

      const reply: string = data?.reply || 'No response returned.'
      setMessages((current) => [...current, { role: 'assistant', content: reply }])
      const usageResponse = await fetch('/api/usage', { cache: 'no-store' })
      const usageData = await usageResponse.json().catch(() => ({}))
      if (usageResponse.ok) {
        setUsage({
          tokenBalance: Number(usageData.tokenBalance || 0),
          remainingTokens: Number(usageData.remainingTokens || 0),
          dailyFreeTokens: Number(usageData.dailyFreeTokens || 0),
          canClaimDailyFree: Boolean(usageData.canClaimDailyFree),
          tokensPerChat: Number(usageData.tokensPerChat || 1),
        })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chat request failed')
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'I could not complete that request. Please try again in a moment.',
        },
      ])
    } finally {
      setLoadingReply(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#224034] font-serif flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Site AI Chat
          </CardTitle>
          <p className="text-sm text-slate-500">
            Chat is restricted to AEO, SEO, and GEO topics for <span className="font-medium text-slate-700">{domain}</span>.
          </p>
          {usage && (
            <p className="text-xs text-slate-500">
              {usage.canClaimDailyFree
                ? `${usage.tokenBalance} paid + ${usage.dailyFreeTokens} free today (${usage.remainingTokens} available) • approx ${usage.tokensPerChat} token hold per chat request`
                : `${usage.remainingTokens} tokens available • approx ${usage.tokensPerChat} token hold per chat request`}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-500">Eden Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              disabled={loadingModels || models.length === 0}
            >
              {loadingModels && <option>Loading models...</option>}
              {!loadingModels && models.length === 0 && <option>No models available</option>}
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 max-h-[420px] overflow-y-auto">
            {messages.map((message, idx) => (
              <div
                key={`${message.role}-${idx}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-[#224034] text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loadingReply && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this site's AEO, SEO, or GEO strategy..."
              className="min-h-[100px] bg-white border-slate-200"
              disabled={loadingReply}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                Keep prompts focused on this site's search optimization.
              </p>
              <Button
                onClick={handleSend}
                disabled={!canSend}
                className="bg-[#224034] hover:bg-[#1a3027] text-white"
              >
                {loadingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
