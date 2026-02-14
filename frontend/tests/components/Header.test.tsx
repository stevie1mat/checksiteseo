import { render, screen } from '@testing-library/react'
import { DashboardHeader } from '../../components/dashboard/Header'
import { describe, it, expect, vi } from 'vitest'

const push = vi.fn()
const refresh = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push,
        refresh,
    }),
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            signOut: vi.fn(),
        },
    }),
}))

// Mock sub-components/icons to simplify test
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('lucide-react')>()
    return {
        ...actual,
        Bell: () => <span data-testid="bell-icon">Bell</span>,
        Menu: () => <span data-testid="menu-icon">Menu</span>,
    }
})

vi.mock('@/components/dashboard/Sidebar', () => ({
    SidebarContent: () => <div data-testid="sidebar-content">Sidebar</div>
}))

describe('DashboardHeader', () => {
    it('renders correctly', () => {
        render(<DashboardHeader />)
        expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
        expect(screen.getByText(/checksite/i)).toBeInTheDocument()
    })

    it('displays user initial when email is provided', () => {
        render(<DashboardHeader userEmail="test@example.com" />)
        expect(screen.getByText('T')).toBeInTheDocument()
    })

    it('renders menu button on mobile', () => {
        render(<DashboardHeader />)
        expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })
})
