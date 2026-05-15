import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { DeleteSiteCard } from "@/components/dashboard/DeleteSiteCard"

export default async function DeleteSitePage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

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

    return <DeleteSiteCard siteId={site.id} siteUrl={site.url} />
}
