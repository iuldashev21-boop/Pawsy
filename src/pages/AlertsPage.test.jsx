import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  screen,
  waitFor,
  renderWithProviders,
  seedFullAppState,
  TEST_USER,
  TEST_DOG,
} from '../test/test-utils'

vi.mock('framer-motion', async () => await import('../test/mocks/framer-motion.jsx'))

// Mock PawsyMascot to avoid video element issues in test
vi.mock('../components/mascot/PawsyMascot.jsx', () => ({
  default: function MockPawsyMascot() {
    return <div data-testid="pawsy-mascot" />
  },
}))

import AlertsPage from './AlertsPage'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePremium() {
  localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
}

function seedAlerts(alerts) {
  localStorage.setItem(
    `pawsy_alerts_${TEST_DOG.id}`,
    JSON.stringify(alerts)
  )
}

const MOCK_ALERTS = [
  {
    id: 'alert-1',
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
    },
  },
  {
    id: 'alert-2',
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
      daysUntil: 5,
    },
  },
  {
    id: 'alert-3',
    dogId: TEST_DOG.id,
    type: 'symptom_pattern',
    title: 'Recurring: vomiting',
    message: '"vomiting" has occurred 4 times recently.',
    priority: 'medium',
    status: 'snoozed',
    snoozeUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    metadata: {
      key: 'symptom_pattern:vomiting',
      tag: 'vomiting',
      count: 4,
    },
  },
  {
    id: 'alert-4',
    dogId: TEST_DOG.id,
    type: 'weight_trend',
    title: 'Significant Weight Gain',
    message: 'Buddy has shown a 12.5% weight gain.',
    priority: 'medium',
    status: 'dismissed',
    dismissedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    metadata: {
      key: 'weight_trend:gain',
      direction: 'gain',
      percentChange: 12.5,
    },
  },
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AlertsPage', () => {
  beforeEach(() => {
    seedFullAppState()
  })

  it('renders the page header with "Health Alerts" title', async () => {
    makePremium()
    seedAlerts(MOCK_ALERTS)

    renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      expect(screen.getByText('Health Alerts')).toBeInTheDocument()
    })
  })

  it('renders a back button that links to dashboard', async () => {
    makePremium()
    seedAlerts(MOCK_ALERTS)

    renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      const backLink = screen.getByLabelText(/back to dashboard/i)
      expect(backLink).toBeInTheDocument()
      expect(backLink.closest('a')).toHaveAttribute('href', '/dashboard')
    })
  })

  it('renders main content area', async () => {
    makePremium()
    seedAlerts([])

    renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      // BottomNav is now rendered by AppShell, not individual pages
      expect(screen.getByText('Health Alerts')).toBeInTheDocument()
    })
  })

  it('shows empty state when there are no alerts', async () => {
    makePremium()
    seedAlerts([])

    renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      expect(screen.getByText('No alerts yet')).toBeInTheDocument()
    })
  })

  it('groups alerts by status (active, snoozed, dismissed)', async () => {
    makePremium()
    seedAlerts(MOCK_ALERTS)

    renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      expect(screen.getByText('Hip Dysplasia Risk')).toBeInTheDocument()
      expect(screen.getByText('Rabies Due')).toBeInTheDocument()
      expect(screen.getByText(/Recurring: vomiting/)).toBeInTheDocument()
      expect(screen.getByText('Significant Weight Gain')).toBeInTheDocument()
    })

    // Verify group labels from AlertHistory
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Snoozed')).toBeInTheDocument()
    expect(screen.getByText('Dismissed')).toBeInTheDocument()
  })

  it('dismisses an alert when the dismiss button is clicked', async () => {
    makePremium()
    seedAlerts([MOCK_ALERTS[0]])

    const { user } = renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      expect(screen.getByText('Hip Dysplasia Risk')).toBeInTheDocument()
    })

    const dismissBtn = screen.getByLabelText(/dismiss hip dysplasia risk alert/i)
    await user.click(dismissBtn)

    // After dismissal, the alert should move to dismissed group
    await waitFor(() => {
      expect(screen.getByText('Dismissed')).toBeInTheDocument()
    })

    // Check localStorage was updated
    const storedAlerts = JSON.parse(
      localStorage.getItem(`pawsy_alerts_${TEST_DOG.id}`)
    )
    const dismissedAlert = storedAlerts.find((a) => a.id === 'alert-1')
    expect(dismissedAlert.status).toBe('dismissed')
  })

  it('snoozes an alert when the snooze button is clicked', async () => {
    makePremium()
    seedAlerts([MOCK_ALERTS[0]])

    const { user } = renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      expect(screen.getByText('Hip Dysplasia Risk')).toBeInTheDocument()
    })

    const snoozeBtn = screen.getByLabelText(/snooze hip dysplasia risk alert/i)
    await user.click(snoozeBtn)

    // After snoozing, alert should move to snoozed group
    await waitFor(() => {
      expect(screen.getByText('Snoozed')).toBeInTheDocument()
    })

    // Check localStorage was updated
    const storedAlerts = JSON.parse(
      localStorage.getItem(`pawsy_alerts_${TEST_DOG.id}`)
    )
    const snoozedAlert = storedAlerts.find((a) => a.id === 'alert-1')
    expect(snoozedAlert.status).toBe('snoozed')
    expect(snoozedAlert.snoozeUntil).toBeDefined()
  })

  it('shows PremiumGate overlay for free users', async () => {
    // Do NOT call makePremium — free user
    seedAlerts(MOCK_ALERTS)

    renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      // Page header h1 and PremiumGate h3 both say "Health Alerts"
      const headings = screen.getAllByText('Health Alerts')
      expect(headings.length).toBeGreaterThanOrEqual(1)
    })

    // PremiumGate overlay should show the upgrade CTA
    expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument()
  })

  it('opens alert detail modal when alert Details button is clicked', async () => {
    makePremium()
    seedAlerts([MOCK_ALERTS[0]])

    const { user } = renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      expect(screen.getByText('Hip Dysplasia Risk')).toBeInTheDocument()
    })

    const detailsBtn = screen.getByLabelText(/view details for hip dysplasia risk/i)
    await user.click(detailsBtn)

    await waitFor(() => {
      expect(screen.getByTestId('alert-detail-modal')).toBeInTheDocument()
    })
  })

  it('closes detail modal on close button click', async () => {
    makePremium()
    seedAlerts([MOCK_ALERTS[0]])

    const { user } = renderWithProviders(<AlertsPage />, { route: '/alerts' })

    await waitFor(() => {
      expect(screen.getByText('Hip Dysplasia Risk')).toBeInTheDocument()
    })

    // Open modal
    const detailsBtn = screen.getByLabelText(/view details for hip dysplasia risk/i)
    await user.click(detailsBtn)

    await waitFor(() => {
      expect(screen.getByTestId('alert-detail-modal')).toBeInTheDocument()
    })

    // Close modal
    const closeBtn = screen.getByLabelText(/close/i)
    await user.click(closeBtn)

    await waitFor(() => {
      expect(screen.queryByTestId('alert-detail-modal')).not.toBeInTheDocument()
    })
  })
})
