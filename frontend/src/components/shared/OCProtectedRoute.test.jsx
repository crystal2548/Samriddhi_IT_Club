import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import OCProtectedRoute from './OCProtectedRoute'

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  Outlet: () => <div data-testid="outlet" />
}))

// Mock AuthContext
const mockUseAuth = vi.fn()
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock Spinner
vi.mock('../ui/Spinner', () => ({
  default: () => <div data-testid="spinner" />
}))

describe('OCProtectedRoute', () => {
  it('renders spinner when loading', () => {
    mockUseAuth.mockReturnValue({ loading: true })
    render(<OCProtectedRoute />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('redirects to /login if user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ loading: false, user: null })
    render(<OCProtectedRoute />)
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toBeInTheDocument()
    expect(navigate).toHaveAttribute('data-to', '/login')
  })

  it('redirects to /dashboard if user is authenticated but not OC role', () => {
    mockUseAuth.mockReturnValue({ 
      loading: false, 
      user: { id: '1' },
      profile: { role: 'member' }
    })
    render(<OCProtectedRoute />)
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toBeInTheDocument()
    expect(navigate).toHaveAttribute('data-to', '/dashboard')
  })

  it('renders Outlet if user is authenticated AND has OC role', () => {
    mockUseAuth.mockReturnValue({ 
      loading: false, 
      user: { id: '1' },
      profile: { role: 'oc' }
    })
    render(<OCProtectedRoute />)
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})
