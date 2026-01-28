import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import {
  renderWithProviders,
  seedFullAppState,
  TEST_USER,
  TEST_DOG,
} from '../../test/test-utils'
import PostUpgradeChecklist from './PostUpgradeChecklist'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

describe('PostUpgradeChecklist', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders checklist items', () => {
    seedFullAppState()
    // Set premium
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    renderWithProviders(<PostUpgradeChecklist />, { route: '/dashboard' })

    expect(screen.getByText('Start a health chat')).toBeInTheDocument()
    expect(screen.getByText('Add medications')).toBeInTheDocument()
    expect(screen.getByText('Review breed health risks')).toBeInTheDocument()
    expect(screen.getByText('Check health alerts')).toBeInTheDocument()
  })

  it('links navigate to correct routes', () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    renderWithProviders(<PostUpgradeChecklist />, { route: '/dashboard' })

    const chatLink = screen.getByText('Start a health chat').closest('a')
    expect(chatLink).toHaveAttribute('href', '/chat')

    const settingsLink = screen.getByText('Add medications').closest('a')
    expect(settingsLink).toHaveAttribute('href', '/settings')

    const breedLink = screen.getByText('Review breed health risks').closest('a')
    expect(breedLink).toHaveAttribute('href', '/breed-info')

    const alertsLink = screen.getByText('Check health alerts').closest('a')
    expect(alertsLink).toHaveAttribute('href', '/alerts')
  })

  it('shows checkmarks for completed items (breed set)', () => {
    seedFullAppState() // TEST_DOG has breed: 'Golden Retriever'
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    renderWithProviders(<PostUpgradeChecklist />, { route: '/dashboard' })

    // The breed item should show as completed since TEST_DOG has a breed
    const breedText = screen.getByText('Review breed health risks')
    expect(breedText).toHaveClass('line-through')
  })

  it('dismiss button hides checklist', () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    renderWithProviders(<PostUpgradeChecklist />, { route: '/dashboard' })

    expect(screen.getByText('Welcome to Premium!')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Dismiss checklist'))

    expect(screen.queryByText('Welcome to Premium!')).not.toBeInTheDocument()
  })

  it('not shown after dismissed (persisted)', () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    localStorage.setItem(
      `pawsy_${TEST_USER.id}_post_upgrade_checklist_dismissed`,
      'true',
    )
    renderWithProviders(<PostUpgradeChecklist />, { route: '/dashboard' })

    expect(screen.queryByText('Welcome to Premium!')).not.toBeInTheDocument()
  })

  it('shows progress count', () => {
    seedFullAppState() // breed is set, so 1 item completed
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    renderWithProviders(<PostUpgradeChecklist />, { route: '/dashboard' })

    // Should show "1/4 complete" since breed is set
    expect(screen.getByText(/1\/4 complete/)).toBeInTheDocument()
  })
})
