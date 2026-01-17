import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAEOScan } from '../../hooks/useAEOScan'

// Mock dependencies using vi.hoisted to ensure they are initialized before vi.mock
const { mockMutate, mockUseSWR, mockCreateClient, mockChannel, mockRemoveChannel } = vi.hoisted(() => {
    const mockMutate = vi.fn()
    const mockChannel = {
        on: vi.fn(),
        subscribe: vi.fn()
    }
    mockChannel.on.mockReturnValue(mockChannel) // Chainable

    return {
        mockMutate,
        mockUseSWR: vi.fn(),
        mockCreateClient: vi.fn(),
        mockChannel,
        mockRemoveChannel: vi.fn()
    }
})

vi.mock('swr', async () => {
    return {
        default: (key: any, fetcher: any, config: any) => mockUseSWR(key, fetcher, config),
        useSWRConfig: () => ({ mutate: mockMutate })
    }
})

vi.mock('@/lib/supabase/client', () => ({
    createClient: mockCreateClient
}))

describe('useAEOScan', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // Default mock implementations
        mockUseSWR.mockReturnValue({
            data: { status: 'completed' },
            error: undefined,
            isLoading: false,
            mutate: mockMutate
        })

        mockCreateClient.mockReturnValue({
            channel: vi.fn().mockReturnValue(mockChannel),
            removeChannel: mockRemoveChannel
        })
    })

    it('fetches data correctly', () => {
        const { result } = renderHook(() => useAEOScan('example.com'))

        expect(result.current.report).toEqual({ status: 'completed' })
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBeUndefined()
    })

    it('handles loading state', () => {
        mockUseSWR.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: true,
            mutate: mockMutate
        })

        const { result } = renderHook(() => useAEOScan('example.com'))
        expect(result.current.isLoading).toBe(true)
    })

    it('sets up realtime subscription when siteId is provided', () => {
        renderHook(() => useAEOScan('example.com', 'site-123'))

        expect(mockCreateClient).toHaveBeenCalled()
        // Check if channel was created
        expect(mockCreateClient().channel).toHaveBeenCalledWith('site-updates-site-123')
        // Check if subscription was called
        expect(mockChannel.subscribe).toHaveBeenCalled()
    })

    it('does not set up realtime subscription when siteId is missing', () => {
        renderHook(() => useAEOScan('example.com'))

        expect(mockCreateClient().channel).not.toHaveBeenCalled()
    })
})
