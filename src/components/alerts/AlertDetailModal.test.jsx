import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  screen,
  renderWithProviders,
  seedFullAppState,
  TEST_DOG,
} from '../../test/test-utils'

vi.mock('framer-motion', async () => await import('../../test/mocks/framer-motion.jsx'))

import AlertDetailModal from './AlertDetailModal'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BREED_RISK_ALERT = {
  id: 'alert-breed-1',
  dogId: TEST_DOG.id,
  type: 'breed_risk',
  title: 'Hip Dysplasia Risk',
  message: 'Golden Retriever dogs are at risk for hip dysplasia.',
  priority: 'high',
  status: 'active',
  createdAt: new Date().toISOString(),
  metadata: {
    key: 'breed_risk:Hip Dysplasia',
    conditionName: 'Hip Dysplasia',
    breed: 'Golden Retriever',
    severity: 'high',
    ageRange: { min: 1, max: 8 },
  },
}

const SYMPTOM_PATTERN_ALERT = {
  id: 'alert-symptom-1',
  dogId: TEST_DOG.id,
  type: 'symptom_pattern',
  title: 'Recurring: vomiting',
  message: '"vomiting" has occurred 4 times recently.',
  priority: 'medium',
  status: 'active',
  createdAt: new Date().toISOString(),
  metadata: {
    key: 'symptom_pattern:vomiting',
    tag: 'vomiting',
    count: 4,
    severity: 'moderate',
    firstSeen: '2026-01-01T00:00:00.000Z',
    lastSeen: '2026-01-25T00:00:00.000Z',
    factIds: ['fact-1', 'fact-2', 'fact-3', 'fact-4'],
  },
}

const VACCINATION_ALERT = {
  id: 'alert-vax-1',
  dogId: TEST_DOG.id,
  type: 'vaccination_due',
  title: 'Rabies Due',
  message: 'Rabies vaccination is due in 5 days.',
  priority: 'high',
  status: 'active',
  createdAt: new Date().toISOString(),
  metadata: {
    key: 'vaccination_due:Rabies',
    vaccinationName: 'Rabies',
    nextDueDate: '2026-02-01',
    daysUntil: 5,
  },
}

const WEIGHT_TREND_ALERT = {
  id: 'alert-weight-1',
  dogId: TEST_DOG.id,
  type: 'weight_trend',
  title: 'Significant Weight Gain',
  message: 'Buddy has shown a 12.5% weight gain over the last 90 days.',
  priority: 'medium',
  status: 'active',
  createdAt: new Date().toISOString(),
  metadata: {
    key: 'weight_trend:gain',
    direction: 'gain',
    percentChange: 12.5,
    earliestWeight: 58,
    latestWeight: 65,
    earliestDate: '2025-10-28T00:00:00.000Z',
    latestDate: '2026-01-25T00:00:00.000Z',
  },
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AlertDetailModal', () => {
  beforeEach(() => {
    seedFullAppState()
  })

  it('does not render when alert is null', () => {
    renderWithProviders(
      <AlertDetailModal alert={null} onClose={vi.fn()} />,
      { route: '/alerts' }
    )

    expect(screen.queryByTestId('alert-detail-modal')).not.toBeInTheDocument()
  })

  it('renders modal with close button', async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <AlertDetailModal alert={BREED_RISK_ALERT} onClose={onClose} />,
      { route: '/alerts' }
    )

    expect(screen.getByTestId('alert-detail-modal')).toBeInTheDocument()
    expect(screen.getByLabelText(/close/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const { user } = renderWithProviders(
      <AlertDetailModal alert={BREED_RISK_ALERT} onClose={onClose} />,
      { route: '/alerts' }
    )

    await user.click(screen.getByLabelText(/close/i))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // -- Breed Risk Detail View --
  describe('breed_risk alert type', () => {
    it('shows breed name and condition', () => {
      renderWithProviders(
        <AlertDetailModal alert={BREED_RISK_ALERT} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      expect(screen.getByText('Hip Dysplasia Risk')).toBeInTheDocument()
      // Breed appears in the detail row value
      expect(screen.getAllByText(/Golden Retriever/).length).toBeGreaterThanOrEqual(1)
      // Condition appears in both title and detail row
      expect(screen.getAllByText(/Hip Dysplasia/).length).toBeGreaterThanOrEqual(1)
    })

    it('shows breed risk label', () => {
      renderWithProviders(
        <AlertDetailModal alert={BREED_RISK_ALERT} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      expect(screen.getByText('Breed Risk')).toBeInTheDocument()
    })

    it('shows recommended screenings section', () => {
      renderWithProviders(
        <AlertDetailModal alert={BREED_RISK_ALERT} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      expect(screen.getByText(/recommended/i)).toBeInTheDocument()
    })
  })

  // -- Symptom Pattern Detail View --
  describe('symptom_pattern alert type', () => {
    it('shows symptom tag and occurrence count', () => {
      renderWithProviders(
        <AlertDetailModal alert={SYMPTOM_PATTERN_ALERT} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      // vomiting appears in title + message + detail row
      expect(screen.getAllByText(/vomiting/i).length).toBeGreaterThanOrEqual(1)
      // "4" appears in the occurrences detail row value and in the message
      expect(screen.getAllByText(/4/).length).toBeGreaterThanOrEqual(1)
    })

    it('shows date range', () => {
      renderWithProviders(
        <AlertDetailModal alert={SYMPTOM_PATTERN_ALERT} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      // Should show the firstSeen and lastSeen dates (both are in January)
      expect(screen.getAllByText(/jan/i).length).toBeGreaterThanOrEqual(1)
    })
  })

  // -- Vaccination Due Detail View --
  describe('vaccination_due alert type', () => {
    it('shows vaccine name and due date info', () => {
      renderWithProviders(
        <AlertDetailModal alert={VACCINATION_ALERT} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      expect(screen.getByText('Rabies Due')).toBeInTheDocument()
      // Rabies appears in title, message, and detail row
      expect(screen.getAllByText(/Rabies/).length).toBeGreaterThanOrEqual(2)
      // 5 days appears in detail and message
      expect(screen.getAllByText(/5 days/i).length).toBeGreaterThanOrEqual(1)
    })
  })

  // -- Weight Trend Detail View --
  describe('weight_trend alert type', () => {
    it('shows trend direction and weight values', () => {
      renderWithProviders(
        <AlertDetailModal alert={WEIGHT_TREND_ALERT} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      expect(screen.getByText('Significant Weight Gain')).toBeInTheDocument()
      // 12.5% appears in detail row and message
      expect(screen.getAllByText(/12\.5%/).length).toBeGreaterThanOrEqual(1)
      // Weight values in detail rows: "58 lbs" and "65 lbs"
      expect(screen.getByText(/58 lbs/)).toBeInTheDocument()
      expect(screen.getByText(/65 lbs/)).toBeInTheDocument()
    })
  })

  // -- CTA Buttons --
  describe('CTA buttons', () => {
    it('shows "Chat about this" button', () => {
      renderWithProviders(
        <AlertDetailModal alert={BREED_RISK_ALERT} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      const chatBtn = screen.getByRole('link', { name: /chat about this/i })
      expect(chatBtn).toBeInTheDocument()
      expect(chatBtn).toHaveAttribute('href', '/chat')
    })

    it('shows "Find vet" button for high-priority alerts', () => {
      renderWithProviders(
        <AlertDetailModal alert={BREED_RISK_ALERT} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      const vetBtn = screen.getByRole('link', { name: /find vet/i })
      expect(vetBtn).toBeInTheDocument()
      expect(vetBtn).toHaveAttribute('href', '/emergency-vet')
    })

    it('does not show "Find vet" for low-priority alerts', () => {
      const lowPriorityAlert = {
        ...BREED_RISK_ALERT,
        priority: 'low',
      }

      renderWithProviders(
        <AlertDetailModal alert={lowPriorityAlert} onClose={vi.fn()} />,
        { route: '/alerts' }
      )

      expect(
        screen.queryByRole('link', { name: /find vet/i })
      ).not.toBeInTheDocument()
    })
  })
})
