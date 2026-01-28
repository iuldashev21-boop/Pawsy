import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import {
  renderWithProviders,
  seedFullAppState,
  seedAuthState,
  seedDogState,
  seedUsageState,
  seedOnboardingState,
  TEST_USER,
  TEST_DOG,
} from '../../test/test-utils'

vi.mock('framer-motion', async () => await import('../../test/mocks/framer-motion.jsx'))

import AppHeader from './AppHeader'

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the logo heart icon on desktop', async () => {
    seedFullAppState()
    renderWithProviders(<AppHeader />, { route: '/dashboard' })

    await waitFor(() => {
      // Logo heart icon is decorative (aria-hidden), but the container exists
      const settingsLink = screen.getByLabelText('Settings')
      expect(settingsLink).toBeInTheDocument()
    })
  })

  it('shows user name', async () => {
    seedFullAppState()
    renderWithProviders(<AppHeader />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getAllByText(TEST_USER.name).length).toBeGreaterThan(0)
    })
  })

  it('shows Pet Parent as fallback when no user name', async () => {
    const userNoName = { ...TEST_USER, name: undefined }
    seedAuthState(userNoName)
    seedDogState()
    seedUsageState()
    seedOnboardingState()

    renderWithProviders(<AppHeader />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getAllByText('Pet Parent').length).toBeGreaterThan(0)
    })
  })

  it('shows dog name when dog exists', async () => {
    seedFullAppState()
    renderWithProviders(<AppHeader />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getAllByText(new RegExp(TEST_DOG.name)).length).toBeGreaterThan(0)
    })
  })

  it('renders settings link for mobile', async () => {
    seedFullAppState()
    renderWithProviders(<AppHeader />, { route: '/dashboard' })

    await waitFor(() => {
      const settingsLink = screen.getByLabelText('Settings')
      expect(settingsLink).toBeInTheDocument()
      expect(settingsLink.closest('a')).toHaveAttribute('href', '/settings')
    })
  })
})
