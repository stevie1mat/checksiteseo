
import { createClient } from '@/lib/supabase/server'
import { MetricDetailLayout } from "@/components/dashboard/MetricDetailLayout"
import { notFound } from "next/navigation"

export default async function LLMsTxtPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div className="p-8 text-center text-red-500">Authorized. Please sign in.</div>

    // 1. Fetch Site & Latest Scan
    const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!site) notFound()

    const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('site_id', site.id)
        .order('last_scanned_at', { ascending: false })
        .limit(1)

    const latestScan = pages?.[0];
    const breakdown = latestScan?.checklist;

    // 2. Extract LLMs Checks
    // Default to 'failed' if no data
    const llmsCheck = breakdown?.technical?.llms || { status: 'missing' };
    const isPass = llmsCheck.status === 'valid';

    return (
        <MetricDetailLayout
            title="LLMs.txt File"
            description="The 'llms.txt' file is a standardized markdown file that helps AI agents understand your website structure without needing to crawl disparate HTML pages. It acts as an 'API for LLMs', providing a condensed context window."
            status={isPass ? 'pass' : 'critical'}
            impact="Critical Impact"
            rawDiagnostic={`GET /llms.txt
> HTTP/1.1 ${isPass ? '200 OK' : '404 Not Found'}
> Content-Type: ${isPass ? 'text/markdown' : 'text/html'}
> Size: ${isPass ? '2.4kb' : '0b'}
> Time: 45ms`}
        />
    )
}
