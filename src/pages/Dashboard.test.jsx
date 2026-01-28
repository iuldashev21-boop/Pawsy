import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import {
  renderWithProviders,
  seedFullAppState,
  TEST_DOG,
  TEST_USER,
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

  it('shows active dog name', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
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

  it('shows chat launcher widget for free users', async () => {
    seedFullAppState()
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getByLabelText('Start chat with Pawsy')).toBeInTheDocument()
    })
  })

  it('renders premium quick actions for premium users', async () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    renderWithProviders(<Dashboard />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getByText('Health Hub')).toBeInTheDocument()
    })
  })
})
