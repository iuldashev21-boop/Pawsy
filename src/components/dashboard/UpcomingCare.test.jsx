import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
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

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import UpcomingCare from './UpcomingCare'

function seedPremium() {
  localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
}

function seedDogWithCare(overrides = {}) {
  const dogWithCare = {
    ...TEST_DOG,
    ...overrides,
  }
  seedDogState(dogWithCare)
}

describe('UpcomingCare', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders section heading for premium users', () => {
    seedFullAppState()
    seedPremium()
    renderWithProviders(<UpcomingCare />, { route: '/dashboard' })
    expect(screen.getByText('Upcoming Care')).toBeInTheDocument()
  })

  it('shows next vaccination due date with countdown', () => {
    seedAuthState()
    seedDogWithCare({
      vaccinations: [
        { name: 'Rabies', dueDate: '2025-06-25T00:00:00.000Z' },
        { name: 'Distemper', dueDate: '2025-07-10T00:00:00.000Z' },
      ],
    })
    seedUsageState()
    seedOnboardingState()
    seedPremium()

    renderWithProviders(<UpcomingCare />, { route: '/dashboard' })

    expect(screen.getByText('Rabies')).toBeInTheDocument()
    expect(screen.getByText(/due in 10 days/i)).toBeInTheDocument()
  })

  it('shows active medication count', () => {
    seedAuthState()
    seedDogWithCare({
      medications: [
        { name: 'Heartgard', frequency: 'monthly', active: true },
        { name: 'NexGard', frequency: 'monthly', active: true },
        { name: 'Old med', frequency: 'daily', active: false },
      ],
    })
    seedUsageState()
    seedOnboardingState()
    seedPremium()

    renderWithProviders(<UpcomingCare />, { route: '/dashboard' })
    expect(screen.getByText('2 active medications')).toBeInTheDocument()
  })

  it('shows empty state when no medications or vaccinations', () => {
    seedFullAppState()
    seedPremium()
    renderWithProviders(<UpcomingCare />, { route: '/dashboard' })
    expect(screen.getByText('No care schedule yet')).toBeInTheDocument()
  })

  it('shows PremiumGate for free users', () => {
    seedFullAppState()
    // No seedPremium() — free user
    renderWithProviders(<UpcomingCare />, { route: '/dashboard' })
    expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument()
  })

  it('shows overdue vaccination as "overdue"', () => {
    seedAuthState()
    seedDogWithCare({
      vaccinations: [
        { name: 'Rabies', dueDate: '2025-06-10T00:00:00.000Z' },
      ],
    })
    seedUsageState()
    seedOnboardingState()
    seedPremium()

    renderWithProviders(<UpcomingCare />, { route: '/dashboard' })
    expect(screen.getByText(/overdue/i)).toBeInTheDocument()
  })

  it('shows "due today" for vaccination due today', () => {
    seedAuthState()
    seedDogWithCare({
      vaccinations: [
        { name: 'Rabies', dueDate: '2025-06-15T00:00:00.000Z' },
      ],
    })
    seedUsageState()
    seedOnboardingState()
    seedPremium()

    renderWithProviders(<UpcomingCare />, { route: '/dashboard' })
    expect(screen.getByText(/due today/i)).toBeInTheDocument()
  })

  it('shows singular "1 active medication" when only one', () => {
    seedAuthState()
    seedDogWithCare({
      medications: [
        { name: 'Heartgard', frequency: 'monthly', active: true },
      ],
    })
    seedUsageState()
    seedOnboardingState()
    seedPremium()

    renderWithProviders(<UpcomingCare />, { route: '/dashboard' })
    expect(screen.getByText('1 active medication')).toBeInTheDocument()
  })

  it('renders section heading even for free users', () => {
    seedFullAppState()
    // Free user
    renderWithProviders(<UpcomingCare />, { route: '/dashboard' })
    expect(screen.getByText('Upcoming Care')).toBeInTheDocument()
  })
})
