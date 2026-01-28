import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import {
  renderWithProviders,
  seedFullAppState,
  TEST_USER,
} from '../../test/test-utils'

vi.mock('framer-motion', async () => await import('../../test/mocks/framer-motion.jsx'))

import AppSidebar from './AppSidebar'

function makePremium() {
  localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
}

describe('AppSidebar', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders all navigation sections', async () => {
    seedFullAppState()
    renderWithProviders(<AppSidebar />, { route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getByText('Main')).toBeInTheDocument()
      expect(screen.getByText('Health')).toBeInTheDocument()
      expect(screen.getByText('Safety')).toBeInTheDocument()
      expect(screen.getByText('Account')).toBeInTheDocument()
    })
  })

  it('renders free nav items as links', async () => {
    seedFullAppState()
    renderWithProviders(<AppSidebar />, { route: '/dashboard' })

    await waitFor(() => {
      const homeLink = screen.getByRole('link', { name: 'Home' })
      expect(homeLink).toHaveAttribute('href', '/dashboard')

      const chatLink = screen.getByRole('link', { name: 'Chat' })
      expect(chatLink).toHaveAttribute('href', '/chat')

      const toxicLink = screen.getByRole('link', { name: 'Toxic Checker' })
      expect(toxicLink).toHaveAttribute('href', '/toxic-checker')
    })
  })

  it('renders premium items as locked buttons for free users', async () => {
    seedFullAppState()
    renderWithProviders(<AppSidebar />, { route: '/dashboard' })

    await waitFor(() => {
      const chatHistoryBtn = screen.getByLabelText(/Chat History.*Premium/)
      expect(chatHistoryBtn.tagName).toBe('BUTTON')

      const photoHistoryBtn = screen.getByLabelText(/Photo History.*Premium/)
      expect(photoHistoryBtn.tagName).toBe('BUTTON')

      const healthHubBtn = screen.getByLabelText(/Health Hub.*Premium/)
      expect(healthHubBtn.tagName).toBe('BUTTON')
    })
  })

  it('renders premium items as links for premium users', async () => {
    seedFullAppState()
    makePremium()
    renderWithProviders(<AppSidebar />, { route: '/dashboard' })

    await waitFor(() => {
      const chatHistoryLink = screen.getByRole('link', { name: 'Chat History' })
      expect(chatHistoryLink).toHaveAttribute('href', '/chat-history')

      const healthHubLink = screen.getByRole('link', { name: 'Health Hub' })
      expect(healthHubLink).toHaveAttribute('href', '/health-hub')
    })
  })


  it('dispatches feature modal event when locked premium item is clicked', async () => {
    seedFullAppState()
    const { user } = renderWithProviders(<AppSidebar />, { route: '/dashboard' })

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    await waitFor(() => {
      expect(screen.getByLabelText(/Chat History.*Premium/)).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText(/Chat History.*Premium/))

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'pawsy:openFeatureModal' })
    )

    dispatchSpy.mockRestore()
  })
})
