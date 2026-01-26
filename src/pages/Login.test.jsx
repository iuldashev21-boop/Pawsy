import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithProviders, seedAuthState } from '../test/test-utils'

vi.mock('framer-motion', async () => {
  return await import('../test/mocks/framer-motion.jsx')
})

import Login from './Login'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    renderWithProviders(<Login />, { route: '/login' })

    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('shows error when email is empty', async () => {
    const { user } = renderWithProviders(<Login />, { route: '/login' })

    await user.click(screen.getByText('Sign In'))

    expect(screen.getByText('Please enter your email')).toBeInTheDocument()
  })

  it('shows error for non-existent user', async () => {
    vi.useFakeTimers()
    renderWithProviders(<Login />, { route: '/login' })

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'unknown@test.com' },
    })
    fireEvent.click(screen.getByText('Sign In'))

    // Advance past the 500ms artificial delay in handleAuth
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(screen.getByText(/No account found/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('successful login navigates to dashboard', async () => {
    vi.useFakeTimers()
    seedAuthState()
    renderWithProviders(<Login />, { route: '/login' })

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByText('Sign In'))

    // Advance past the 500ms artificial delay in handleAuth
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    vi.useRealTimers()
  })

  it('has social login buttons', () => {
    renderWithProviders(<Login />, { route: '/login' })

    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument()
  })

  it('has link to signup page', () => {
    renderWithProviders(<Login />, { route: '/login' })

    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })
})
