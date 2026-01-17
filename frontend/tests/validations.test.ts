import { describe, it, expect } from 'vitest'
import {
    urlSchema,
    emailSchema,
    uuidSchema,
    scanSchema,
    scheduleScanSchema,
    contactSchema
} from '../lib/validations'

describe('Zod Schemas', () => {
    describe('urlSchema', () => {
        it('validates correct URLs', () => {
            expect(urlSchema.safeParse('https://example.com').success).toBe(true)
            expect(urlSchema.safeParse('http://localhost:3000').success).toBe(true)
        })

        it('rejects invalid URLs', () => {
            expect(urlSchema.safeParse('not-a-url').success).toBe(false)
            expect(urlSchema.safeParse('ftp://example.com').success).toBe(false)
        })
    })

    describe('emailSchema', () => {
        it('validates correct emails', () => {
            expect(emailSchema.safeParse('test@example.com').success).toBe(true)
        })

        it('rejects invalid emails', () => {
            expect(emailSchema.safeParse('invalid-email').success).toBe(false)
        })
    })

    describe('uuidSchema', () => {
        it('validates correct UUIDs', () => {
            expect(uuidSchema.safeParse('123e4567-e89b-12d3-a456-426614174000').success).toBe(true)
        })

        it('rejects invalid UUIDs', () => {
            expect(uuidSchema.safeParse('123').success).toBe(false)
        })
    })

    describe('scanSchema', () => {
        it('validates valid scan request', () => {
            const data = { url: 'https://example.com', site_id: null }
            expect(scanSchema.safeParse(data).success).toBe(true)
        })
    })

    describe('scheduleScanSchema', () => {
        it('validates valid schedule request', () => {
            const data = {
                url: 'https://example.com',
                site_id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'test@example.com',
                delay_hours: 24
            }
            expect(scheduleScanSchema.safeParse(data).success).toBe(true)
        })
    })

    describe('contactSchema', () => {
        it('validates valid contact form', () => {
            const data = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                message: 'Hello world'
            }
            expect(contactSchema.safeParse(data).success).toBe(true)
        })
    })
})
