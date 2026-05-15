import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TechnicalFixDetailCard } from "@/components/dashboard/TechnicalFixDetailCard"
import { getFixStatusFromChecklist, isTechnicalFixKey } from "@/lib/technical-fix-guides"

interface TechnicalFixPageProps {
  params: { id: string; fixKey: string }
  searchParams?: { mode?: string | string[] }
}

export default async function TechnicalFixPage({ params, searchParams }: TechnicalFixPageProps) {
  if (!isTechnicalFixKey(params.fixKey)) {
    notFound()
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id, url")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!site) {
    notFound()
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("checklist")
    .eq("site_id", site.id)
    .order("last_scanned_at", { ascending: false })
    .limit(1)

  const checklist = pages?.[0]?.checklist || {}
  const initialFixed = getFixStatusFromChecklist(params.fixKey, checklist)
  const modeParam = searchParams?.mode
  const mode = (Array.isArray(modeParam) ? modeParam[0] : modeParam) === "advanced" ? "advanced" : "simple"

  return (
    <TechnicalFixDetailCard
      siteId={site.id}
      siteUrl={site.url}
      fixKey={params.fixKey}
      initialFixed={initialFixed}
      mode={mode}
    />
  )
}
