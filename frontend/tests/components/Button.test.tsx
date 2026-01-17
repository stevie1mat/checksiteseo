import { render, screen } from '@testing-library/react'
import { Button } from '../../components/ui/button'
import { describe, it, expect, vi } from 'vitest'

describe('Button', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>)
        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('bg-primary')
    })

    it('renders disabled state', () => {
        render(<Button disabled>Disabled</Button>)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('renders with variant', () => {
        render(<Button variant="destructive">Delete</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-destructive')
    })

    it('renders as child (Slot)', () => {
        render(
            <Button asChild>
                <a href="/link">Link Button</a>
            </Button>
        )
        const link = screen.getByRole('link', { name: /link button/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveClass('inline-flex') // Button class
    })
})
