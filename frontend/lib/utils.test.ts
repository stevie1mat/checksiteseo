import { cn } from './utils'
import { describe, it, expect } from 'vitest'

describe('cn utility', () => {
    it('merges class names correctly', () => {
        expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
    })

    it('handles conditional classes', () => {
        const isActive = true
        expect(cn('base', isActive && 'active')).toBe('base active')
        expect(cn('base', !isActive && 'inactive')).toBe('base')
    })

    it('merges tailwind classes using tailwind-merge', () => {
        expect(cn('p-4 p-2')).toBe('p-2')
    })
})
