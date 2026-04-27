import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'

// Mock supabase client
vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn()
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: vi.fn()
        })
      })
    })
  }
}))

import { supabase } from '../../utils/supabase'

// Mock standard routing behavior
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

describe('Login Component', () => {
  it('renders login form elements', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    
    // Verify inputs render
    expect(screen.getByPlaceholderText(/you@college.edu/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('attempts to call supabase signIn function on submit', async () => {
    // Override default validation mock resolving to fail or success
    supabase.auth.signInWithPassword.mockResolvedValueOnce({ 
      data: { user: { id: '123' } }, error: null 
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText(/you@college.edu/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitBtn = screen.getByRole('button', { name: /sign in/i })

    // Simulate user typing
    fireEvent.change(emailInput, { target: { value: 'test@samriddhi.edu.np' } })
    fireEvent.change(passwordInput, { target: { value: 'securepassword123' } })
    
    // Simulate form submission
    fireEvent.click(submitBtn)

    // Ensure our mock supabase handles the credentials
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@samriddhi.edu.np',
        password: 'securepassword123'
      })
    })
  })
})
