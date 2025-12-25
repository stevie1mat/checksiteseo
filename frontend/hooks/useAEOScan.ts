'use client';

import { useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr'; // Import useSWRConfig for global mutate if needed, or just unbound mutate
import { AEOReport } from '@/types/aeo';
import { createClient } from '@/lib/supabase/client';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAEOScan(domain: string, siteId?: string) {
    const supabase = createClient();

    // Standard Polling / Fetching
    const { data, error, isLoading, mutate } = useSWR<AEOReport>(
        domain ? `/api/scan?domain=${domain}` : null,
        fetcher,
        {
            // Keep polling as backup, but reduce frequency if we rely on realtime
            refreshInterval: (data) => (data?.status === 'processing' ? 4000 : 0),
        }
    );

    // Realtime Subscription
    useEffect(() => {
        if (!siteId) return;

        const channel = supabase
            .channel(`site-updates-${siteId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // UPDATE (status) or INSERT (new page)
                    schema: 'public',
                    table: 'sites',
                    filter: `id=eq.${siteId}`
                },
                (payload) => {
                    console.log('[Realtime] Site update received:', payload);
                    mutate(); // Re-fetch API
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // New page scan result added
                    schema: 'public',
                    table: 'pages',
                    filter: `site_id=eq.${siteId}`
                },
                (payload) => {
                    console.log('[Realtime] New page scan result:', payload);
                    mutate(); // Re-fetch API
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [siteId, mutate, supabase]);

    return {
        report: data,
        isLoading,
        isProcessing: data?.status === 'processing',
        isError: error,
    };
}
