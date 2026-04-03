import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteModelChatView } from '@/components/dashboard/views/SiteModelChatView'

export default async function SiteChatPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const { data: site } = await supabase
    .from('sites')
    .select('id, url, name')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!site) {
    redirect('/dashboard/sites')
  }

  return (
    <div className="space-y-6 w-full p-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/sites/${site.id}`}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif text-[#224034]">Site AI Chat</h1>
          <p className="text-slate-500 text-sm">{site.name || site.url}</p>
        </div>
      </div>

      <SiteModelChatView siteId={site.id} domain={site.url} />
    </div>
  )
}
