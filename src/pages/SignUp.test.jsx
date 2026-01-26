import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithProviders, seedAuthState } from '../test/test-utils'

vi.mock('framer-motion', async () => {
  return await import('../test/mocks/framer-motion.jsx')
})

import SignUp from './SignUp'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('SignUp', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders signup form', () => {
    renderWithProviders(<SignUp />, { route: '/signup' })

    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText('Create Account')).toBeInTheDocument()
  })

  it('shows error when name or email is empty', async () => {
    const { user } = renderWithProviders(<SignUp />, { route: '/signup' })

    await user.click(screen.getByText('Create Account'))

    expect(screen.getByText('Please fill in name and email')).toBeInTheDocument()
  })

  it('shows error when only name provided', async () => {
    const { user } = renderWithProviders(<SignUp />, { route: '/signup' })

    await user.type(screen.getByLabelText('Your name'), 'Test User')
    await user.click(screen.getByText('Create Account'))

    expect(screen.getByText('Please fill in name and email')).toBeInTheDocument()
  })

  it('creates account and redirects to /add-dog', async () => {
    vi.useFakeTimers()
    renderWithProviders(<SignUp />, { route: '/signup' })

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'new@test.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByText('Create Account'))

    // Advance past the 500ms artificial delay in handleAuth
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/add-dog')
    vi.useRealTimers()
  })

  it('shows error for duplicate email', async () => {
    vi.useFakeTimers()
    seedAuthState()
    renderWithProviders(<SignUp />, { route: '/signup' })

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Another User' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByText('Create Account'))

    // Advance past the 500ms artificial delay in handleAuth
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(screen.getByText(/already registered/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('has social signup buttons', () => {
    renderWithProviders(<SignUp />, { route: '/signup' })

    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument()
  })

  it('has link to login page', () => {
    renderWithProviders(<SignUp />, { route: '/signup' })

    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })
})
