import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import {
  renderWithProviders,
  seedFullAppState,
  seedAuthState,
  seedUsageState,
  seedOnboardingState,
  TEST_USER,
  TEST_DOG,
} from '../../test/test-utils'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import HealthSnapshot from './HealthSnapshot'

const sampleFacts = [
  {
    id: 'fact-1',
    category: 'symptom',
    text: 'Buddy was limping on his left leg',
    createdAt: '2025-06-15T10:00:00.000Z',
    updatedAt: '2025-06-15T10:00:00.000Z',
  },
  {
    id: 'fact-2',
    category: 'digestive',
    text: 'Vomited after eating grass',
    createdAt: '2025-06-14T08:00:00.000Z',
    updatedAt: '2025-06-14T08:00:00.000Z',
  },
  {
    id: 'fact-3',
    category: 'health',
    text: 'Weight is within normal range',
    createdAt: '2025-06-13T12:00:00.000Z',
    updatedAt: '2025-06-13T12:00:00.000Z',
  },
  {
    id: 'fact-4',
    category: 'allergy',
    text: 'Possible reaction to chicken',
    createdAt: '2025-06-12T09:00:00.000Z',
    updatedAt: '2025-06-12T09:00:00.000Z',
  },
]

function seedFacts(facts = sampleFacts) {
  localStorage.setItem(
    `pawsy_facts_${TEST_DOG.id}`,
    JSON.stringify(facts)
  )
}

describe('HealthSnapshot', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders section heading', () => {
    seedFullAppState()
    renderWithProviders(<HealthSnapshot />, { route: '/dashboard' })
    expect(screen.getByText('Health Snapshot')).toBeInTheDocument()
  })

  it('shows count of health events tracked', () => {
    seedFullAppState()
    seedFacts()
    renderWithProviders(<HealthSnapshot />, { route: '/dashboard' })
    expect(screen.getByText('4 health events tracked')).toBeInTheDocument()
  })

  it('shows top 3 recent facts', () => {
    seedFullAppState()
    seedFacts()
    renderWithProviders(<HealthSnapshot />, { route: '/dashboard' })

    // The three most recent facts should appear
    expect(screen.getByText(/limping on his left leg/)).toBeInTheDocument()
    expect(screen.getByText(/Vomited after eating grass/)).toBeInTheDocument()
    expect(screen.getByText(/Weight is within normal range/)).toBeInTheDocument()

    // The 4th fact should NOT appear (only top 3)
    expect(screen.queryByText(/Possible reaction to chicken/)).not.toBeInTheDocument()
  })

  it('shows empty state when no facts exist', () => {
    seedFullAppState()
    renderWithProviders(<HealthSnapshot />, { route: '/dashboard' })
    expect(
      screen.getByText('Chat with Pawsy to start building your health profile')
    ).toBeInTheDocument()
  })

  it('shows CTA link to chat in empty state', () => {
    seedFullAppState()
    renderWithProviders(<HealthSnapshot />, { route: '/dashboard' })
    const ctaLink = screen.getByRole('link', { name: /start chatting/i })
    expect(ctaLink).toHaveAttribute('href', '/chat')
  })

  it('shows "View timeline" link when facts exist', () => {
    seedFullAppState()
    seedFacts()
    renderWithProviders(<HealthSnapshot />, { route: '/dashboard' })
    const timelineLink = screen.getByRole('link', { name: /view timeline/i })
    expect(timelineLink).toHaveAttribute('href', '/health-timeline')
  })

  it('does not show "View timeline" link in empty state', () => {
    seedFullAppState()
    renderWithProviders(<HealthSnapshot />, { route: '/dashboard' })
    expect(screen.queryByRole('link', { name: /view timeline/i })).not.toBeInTheDocument()
  })

  it('shows singular "1 health event tracked" when only one fact', () => {
    seedFullAppState()
    seedFacts([sampleFacts[0]])
    renderWithProviders(<HealthSnapshot />, { route: '/dashboard' })
    expect(screen.getByText('1 health event tracked')).toBeInTheDocument()
  })

  it('renders without crashing when no active dog', () => {
    // Seed auth but no dog state
    seedAuthState()
    seedUsageState()
    seedOnboardingState({ welcomeSeen: true, hasDog: false, firstChat: false, firstPhoto: false, checkedFood: false, viewedGuides: false })

    // Should not throw — component returns null when no active dog
    renderWithProviders(<HealthSnapshot />, { route: '/dashboard' })
    // No Health Snapshot heading should appear
    expect(screen.queryByText('Health Snapshot')).not.toBeInTheDocument()
  })
})
