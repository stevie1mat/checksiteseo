"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScanProgressDialog } from "@/components/dashboard/ScanProgressDialog"
import { formatDiamonds } from "@/lib/diamonds"
import { TECHNICAL_FIX_GUIDES, TechnicalFixKey, getFixStatusFromReport } from "@/lib/technical-fix-guides"

interface TechnicalFixDetailCardProps {
  siteId: string
  siteUrl: string
  fixKey: TechnicalFixKey
  initialFixed: boolean
  mode?: "simple" | "advanced"
}

interface UsageData {
  remainingDiamonds: number
  dailyFreeDiamonds: number
  diamondBalance: number
  remainingTokens: number
  tokensPerScan: number
  diamondsPerScan: number
  canClaimDailyFree?: boolean
}

export function TechnicalFixDetailCard({
  siteId,
  siteUrl,
  fixKey,
  initialFixed,
  mode = "simple",
}: TechnicalFixDetailCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const guide = TECHNICAL_FIX_GUIDES[fixKey]
  const [isFixed, setIsFixed] = useState(initialFixed)
  const [isRecrawling, setIsRecrawling] = useState(false)
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "complete" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [usage, setUsage] = useState<UsageData | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/usage", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active || data.remainingTokens === undefined) return
        setUsage(data as UsageData)
      })
      .catch(() => {
        setUsage(null)
      })
    return () => {
      active = false
    }
  }, [])

  const usageHint = useMemo(() => {
    if (!usage) return ""
    if (usage.canClaimDailyFree) {
      return `${formatDiamonds(usage.diamondBalance)} paid + ${formatDiamonds(usage.dailyFreeDiamonds)} free today (${formatDiamonds(usage.remainingDiamonds)} available) • ${formatDiamonds(usage.diamondsPerScan)} diamonds per scan`
    }
    return `${formatDiamonds(usage.remainingDiamonds)} diamonds available • ${formatDiamonds(usage.diamondsPerScan)} diamonds per scan`
  }, [usage])

  const canRunScan = !isRecrawling && (!usage || usage.remainingTokens >= (usage.tokensPerScan || 1))
  const normalizedSiteUrl = siteUrl.startsWith("http://") || siteUrl.startsWith("https://")
    ? siteUrl.replace(/\/$/, "")
    : `https://${siteUrl.replace(/\/$/, "")}`

  const copySnippet = async () => {
    if (!guide.snippet) return
    try {
      await navigator.clipboard.writeText(guide.snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  const runFixValidationScan = async () => {
    if (!canRunScan) return
    setIsRecrawling(true)
    setScanDialogOpen(true)
    setScanStatus("scanning")
    setStatusMessage(null)

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, url: siteUrl }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Could not start validation scan.")

      let attempts = 0
      const maxAttempts = 60

      while (attempts < maxAttempts) {
        const { data: site } = await supabase
          .from("sites")
          .select("status")
          .eq("id", siteId)
          .single()

        if (site?.status === "completed") {
          const reportRes = await fetch(`/api/scan?domain=${encodeURIComponent(siteUrl)}`, { cache: "no-store" })
          const reportData = await reportRes.json().catch(() => ({}))
          if (reportRes.ok && reportData) {
            const newStatus = getFixStatusFromReport(fixKey, reportData)
            setIsFixed(newStatus)
            setStatusMessage(newStatus ? "Great! This fix now looks resolved in the latest scan." : "Still not fixed yet. Apply the steps below and scan again.")
          } else {
            setStatusMessage("Scan completed. Refreshing view to check latest status.")
          }

          setScanStatus("complete")
          window.dispatchEvent(new Event("diamonds-updated"))
          fetch("/api/usage", { cache: "no-store" })
            .then((res) => res.json())
            .then((next) => {
              if (next.remainingTokens !== undefined) setUsage(next as UsageData)
            })
            .catch(() => {})

          setTimeout(() => {
            setScanDialogOpen(false)
            router.refresh()
          }, 1400)
          return
        }

        if (site?.status === "error") {
          throw new Error("Scan failed. Please try again.")
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))
        attempts += 1
      }

      throw new Error("Scan timed out. Please refresh and try again.")
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatusMessage(error.message)
      } else {
        setStatusMessage("Could not run scan.")
      }
      setScanStatus("error")
    } finally {
      setIsRecrawling(false)
    }
  }

  return (
    <div className="space-y-6 w-full p-6">
      <ScanProgressDialog
        open={scanDialogOpen}
        onOpenChange={(open) => {
          if (!open && scanStatus === "scanning") return
          setScanDialogOpen(open)
        }}
        siteUrl={siteUrl}
        status={scanStatus}
        title="Validating Technical Fix"
      />

      <div className="rounded-2xl border border-[#d9e8df] bg-white/90 shadow-[0_14px_46px_rgba(30,64,48,0.08)] p-7">
        {fixKey === "robots" && (
          <div
            className={`mb-6 relative overflow-hidden rounded-2xl border px-5 py-4 shadow-sm ${
              isFixed
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-50 to-teal-50 text-emerald-900 shadow-emerald-100/70"
                : "border-rose-200 bg-gradient-to-r from-rose-50 via-rose-50 to-amber-50 text-rose-900 shadow-rose-100/70"
            }`}
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/50 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">Robots Fix Status</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <p className="text-lg font-semibold leading-none">
                    {isFixed ? "Fixed" : "Not Fixed Yet"}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                  isFixed
                    ? "border-emerald-300/80 bg-white/70 text-emerald-800"
                    : "border-rose-300/80 bg-white/70 text-rose-800"
                }`}
              >
                {isFixed ? "Healthy" : "Action Needed"}
              </span>
            </div>
            <p className="relative mt-2.5 text-sm">
              {isFixed
                ? "Great. This site currently passes the robots.txt agent access check."
                : "This site is still failing robots.txt agent access. Apply the steps below, then run Scan This Fix Again."}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div className="space-y-2">
            <Button asChild variant="ghost" className="px-2 text-slate-600 hover:text-slate-900">
              <Link href={`/dashboard/sites/${siteId}?tab=technical&mode=${mode}`}>
                Back to Technical
              </Link>
            </Button>
            <h1 className="font-serif text-3xl text-[#224034]">{guide.title}</h1>
            <p className="text-slate-600 max-w-3xl">{mode === "advanced" ? guide.technicalSummary : guide.simpleSummary}</p>
          </div>
          <Badge
            variant="outline"
            className={isFixed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}
          >
            {isFixed ? "Done" : "Needs Work"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">Why This Matters</h2>
              <p className="text-sm text-slate-700">{guide.whyItMatters}</p>
            </div>

            {fixKey === "canonical" && (
              <div className="rounded-xl border border-slate-200 bg-emerald-50/40 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">What To Do On Your Site</h2>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>Add a canonical tag in your site layout/head so every page declares its preferred URL.</p>
                  <p>
                    For this site, canonicals should use:
                    {" "}
                    <code className="rounded bg-white px-1 py-0.5">{normalizedSiteUrl}</code>
                    {" "}
                    as the base domain (HTTPS only).
                  </p>
                  <p>Then make sure your sitemap only contains canonical HTTPS URLs from the same domain.</p>
                  <p>If you have both with/without trailing slash versions, pick one format and keep it consistent in canonical and sitemap.</p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-3">How To Fix</h2>
              <ol className="space-y-2">
                {guide.fixSteps.map((step, index) => (
                  <li key={step} className="text-sm text-slate-700 flex gap-2">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {guide.snippet && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Copy Snippet</h2>
                  <Button variant="ghost" size="sm" onClick={copySnippet} className="text-slate-600 hover:text-slate-900">
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <p className="font-semibold text-slate-800">What is this?</p>
                  <p className="mt-1">This is ready-to-use code you can paste into your site to fix this issue faster.</p>
                  <p className="mt-2 font-semibold text-slate-800">How to use it</p>
                  <ol className="mt-1 list-decimal pl-4 space-y-0.5">
                    <li>Click Copy.</li>
                    <li>Paste it into the relevant site file/template.</li>
                    <li>Deploy your site update.</li>
                    <li>Run Scan This Fix Again to confirm it is fixed.</li>
                  </ol>
                </div>
                <pre className="rounded-lg bg-slate-900 p-3 text-[12px] leading-relaxed text-emerald-300 overflow-x-auto">
                  {guide.snippet}
                </pre>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-3">Validate Fix</h3>
              <ol className="space-y-2 mb-4">
                {guide.validationSteps.map((step, index) => (
                  <li key={step} className="text-sm text-slate-700 flex gap-2">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <Button
                onClick={runFixValidationScan}
                disabled={!canRunScan}
                title={usageHint || "Run scan to validate this fix"}
                className="w-full bg-[#224034] hover:bg-[#1a3027] text-white"
              >
                {isRecrawling ? (
                  "Scanning..."
                ) : (
                  "Scan This Fix Again"
                )}
              </Button>

              <p className="text-xs text-slate-500 mt-2">
                This uses your normal scan credits ({formatDiamonds(usage?.diamondsPerScan || 0)} diamonds per scan).
              </p>
            </div>

            {statusMessage && (
              <div
                className={`rounded-xl border p-3 text-sm ${
                  isFixed ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                <p>{statusMessage}</p>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-3">Helpful Docs</h3>
              <div className="space-y-2">
                {guide.docs.map((doc) => (
                  <a
                    key={doc.href}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-emerald-700 hover:underline"
                  >
                    {doc.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
