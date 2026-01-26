import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import {
  renderWithProviders,
  seedFullAppState,
  seedAuthState,
  seedDogState,
  seedOnboardingState,
  seedUsageState,
  TEST_USER,
  TEST_DOG,
} from '../test/test-utils'

vi.mock('framer-motion', async () => {
  return await import('../test/mocks/framer-motion.jsx')
})

import Dashboard from './Dashboard'

describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders dashboard with user greeting', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      // User name should appear somewhere
      expect(screen.getByText(TEST_USER.name)).toBeInTheDocument()
    })
  })

  it('shows active dog name', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      // Dog name should appear
      expect(screen.getAllByText(TEST_DOG.name).length).toBeGreaterThan(0)
    })
  })

  it('shows dog breed info', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getAllByText(/Golden Retriever/).length).toBeGreaterThan(0)
    })
  })

  it('shows Start Health Check CTA', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getByText('Start Health Check')).toBeInTheDocument()
    })
  })

  it('shows Scan Photo action card', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getByText('Scan Photo')).toBeInTheDocument()
    })
  })

  it('shows Emergency action card', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getByText('Emergency')).toBeInTheDocument()
    })
  })

  it('shows quick links', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getAllByText('First Aid Guides').length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Toxic Food/).length).toBeGreaterThan(0)
    })
  })

  it('shows Pet Parent as fallback when no user name', async () => {
    const userNoName = { ...TEST_USER, name: undefined }
    seedAuthState(userNoName)
    seedDogState()
    seedUsageState()
    seedOnboardingState()

    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getAllByText('Pet Parent').length).toBeGreaterThan(0)
    })
  })

  it('renders bottom nav', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getAllByRole('navigation').length).toBeGreaterThanOrEqual(1)
    })
  })
})
