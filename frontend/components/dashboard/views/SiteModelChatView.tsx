"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, MessageSquare, ShieldCheck, Target, FileText, Lightbulb, UserRound, Bot } from 'lucide-react'
import { formatDiamonds } from '@/lib/diamonds'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
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
    diamondBalance: number
    remainingDiamonds: number
    dailyFreeDiamonds: number
    remainingTokens: number
    canClaimDailyFree?: boolean
    tokensPerChat: number
    diamondsPerChat: number
  } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `You can ask me anything about AEO, SEO, and GEO for ${domain}.`,
      createdAt: new Date().toISOString(),
    },
  ])
  const [lastTokenUsage, setLastTokenUsage] = useState<{
    held_tokens?: number
    billed_tokens?: number
    additional_tokens?: number
    refund_tokens?: number
    usage_total_tokens?: number
  } | null>(null)
  const [input, setInput] = useState('')
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingReply, setLoadingReply] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const quickPrompts = useMemo(
    () => [
      `What are the top 3 AEO fixes for ${domain} this week?`,
      `Rewrite my homepage intro to improve answer extraction for AI engines.`,
      `What questions should I add as H2s to improve citations for ${domain}?`,
      `Give me a 7-day GEO content plan focused on ${domain}.`,
    ],
    [domain]
  )

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
          diamondBalance: Number(data.diamondBalance || 0),
          remainingDiamonds: Number(data.remainingDiamonds || 0),
          dailyFreeDiamonds: Number(data.dailyFreeDiamonds || 0),
          remainingTokens: Number(data.remainingTokens || 0),
          canClaimDailyFree: Boolean(data.canClaimDailyFree),
          tokensPerChat: Number(data.tokensPerChat || 1),
          diamondsPerChat: Number(data.diamondsPerChat || 0.5),
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

  const formatMessageTime = (isoTime: string) => {
    const date = new Date(isoTime)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const handleSend = async () => {
    if (!canSend) return

    const userMessage: ChatMessage = { role: 'user', content: input.trim(), createdAt: new Date().toISOString() }
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
      setMessages((current) => [...current, { role: 'assistant', content: reply, createdAt: new Date().toISOString() }])
      setLastTokenUsage(data?.token_usage || null)
      const usageResponse = await fetch('/api/usage', { cache: 'no-store' })
      const usageData = await usageResponse.json().catch(() => ({}))
      if (usageResponse.ok) {
        setUsage({
          diamondBalance: Number(usageData.diamondBalance || 0),
          remainingDiamonds: Number(usageData.remainingDiamonds || 0),
          dailyFreeDiamonds: Number(usageData.dailyFreeDiamonds || 0),
          remainingTokens: Number(usageData.remainingTokens || 0),
          canClaimDailyFree: Boolean(usageData.canClaimDailyFree),
          tokensPerChat: Number(usageData.tokensPerChat || 1),
          diamondsPerChat: Number(usageData.diamondsPerChat || 0.5),
        })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chat request failed')
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'I could not complete that request. Please try again in a moment.',
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setLoadingReply(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="h-2.5 w-full bg-emerald-400" />
        <div className="p-6 md:p-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest">
            Site Optimization Assistant
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl lg:text-4xl font-serif text-[#224034] leading-tight flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                    Site AI Chat
                  </h2>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Live
                  </span>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">
                  This is a domain-scoped strategy chat for <span className="font-semibold text-slate-800">{domain}</span>. It helps you plan
                  and execute practical AEO, SEO, and GEO improvements that increase AI discoverability, understanding, and citation likelihood.
                </p>
                <p className="text-sm text-slate-500">
                  Keep prompts focused on this site to get the most accurate and implementation-ready guidance.
                </p>
              </div>

              <div className="rounded-2xl bg-[#0b1a3a] border border-slate-800 p-5 shadow-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em] mb-3">What This Chat Is For</p>
                <div className="space-y-2 text-sm text-slate-200">
                  <p>1. Prioritize your highest-impact technical and content fixes.</p>
                  <p>2. Generate rewrite-ready suggestions for pages and sections.</p>
                  <p>3. Build prompt-targeted structures that AI engines can cite.</p>
                  <p>4. Turn audit findings into a clear weekly execution plan.</p>
                </div>
              </div>

              {usage && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  {usage.canClaimDailyFree
                    ? `${formatDiamonds(usage.diamondBalance)} paid + ${formatDiamonds(usage.dailyFreeDiamonds)} free today (${formatDiamonds(usage.remainingDiamonds)} available) • approx ${formatDiamonds(usage.diamondsPerChat)} diamonds per chat`
                    : `${formatDiamonds(usage.remainingDiamonds)} diamonds available • approx ${formatDiamonds(usage.diamondsPerChat)} diamonds per chat`}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 inline-flex items-center gap-1">
                    <Target className="h-3.5 w-3.5" />
                    What This Is
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    A guided chat to diagnose issues and produce concrete AEO/SEO/GEO actions for this specific site.
                  </p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 inline-flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    What You Get
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    Prioritized fixes, rewritten copy suggestions, schema ideas, and prompt-ready content recommendations.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Boundaries
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    Answers stay focused on search optimization for this domain and avoid unrelated off-topic requests.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:p-5">
              {lastTokenUsage && (
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                  Last message billed {formatDiamonds(usage?.diamondsPerChat || 0.5)} diamonds
                  {Number(lastTokenUsage.refund_tokens || 0) > 0 ? ", with partial refund applied" : ""}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3 inline-flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Quick Start Prompts
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="text-xs md:text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-slate-500">AI Model</label>
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

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 w-fit">
                <ShieldCheck className="h-3.5 w-3.5" />
                Grounded in latest site scan context
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 max-h-[430px] overflow-y-auto">
                {messages.map((message, idx) => (
                  <div
                    key={`${message.role}-${idx}`}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-[#224034] text-white shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className={`mb-1 flex items-center gap-1.5 text-[11px] ${message.role === 'user' ? 'text-emerald-100/90' : 'text-slate-500'}`}>
                        {message.role === 'user' ? <UserRound className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        <span className="font-semibold">{message.role === 'user' ? 'You' : 'Site Strategist AI'}</span>
                        <span>•</span>
                        <span>{formatMessageTime(message.createdAt)}</span>
                      </div>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (canSend) handleSend()
                    }
                  }}
                  placeholder={`Ask for specific fixes, rewrites, or strategy for ${domain}...`}
                  className="min-h-[110px] bg-white border-slate-200"
                  disabled={loadingReply}
                />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Best results come from specific prompts with page URLs, issue context, and desired outcome.
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
