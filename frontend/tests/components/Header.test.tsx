import { render, screen } from '@testing-library/react'
import { DashboardHeader } from '../../components/dashboard/Header'
import { describe, it, expect, vi } from 'vitest'

// Mock sub-components/icons to simplify test
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal<any>()
    return {
        ...actual,
        Bell: () => <span data-testid="bell-icon">Bell</span>,
        Search: () => <span data-testid="search-icon">Search</span>,
        Menu: () => <span data-testid="menu-icon">Menu</span>,
    }
})

vi.mock('@/components/dashboard/Sidebar', () => ({
    SidebarContent: () => <div data-testid="sidebar-content">Sidebar</div>
}))

describe('DashboardHeader', () => {
    it('renders correctly', () => {
        render(<DashboardHeader />)
        expect(screen.getByPlaceholderText(/search sites/i)).toBeInTheDocument()
        expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
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
