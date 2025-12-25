'use client';

import useSWR from 'swr';
import { AEOReport } from '@/types/aeo';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAEOScan(domain: string) {
    // Poll every 3 seconds if status is 'processing'
    const { data, error, isLoading } = useSWR<AEOReport>(
        domain ? `/api/scan?domain=${domain}` : null,
        fetcher,
        {
            refreshInterval: (data) => (data?.status === 'processing' ? 3000 : 0),
        }
    );

    return {
        report: data,
        isLoading,
        isProcessing: data?.status === 'processing',
        isError: error,
    };
}
