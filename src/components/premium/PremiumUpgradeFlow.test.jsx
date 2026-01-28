import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  screen,
  seedFullAppState,
  renderWithProviders,
  TEST_USER,
  TEST_DOG,
} from '../../test/test-utils'
import userEvent from '@testing-library/user-event'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import PremiumUpgradeFlow from './PremiumUpgradeFlow'

function renderFlow(props = {}) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    dogName: 'Buddy',
    ...props,
  }

  return {
    ...renderWithProviders(<PremiumUpgradeFlow {...defaultProps} />),
    props: defaultProps,
  }
}

/** Helper: navigate from step 1 to a given step by clicking Continue */
async function navigateToStep(user, targetStep) {
  for (let i = 1; i < targetStep; i++) {
    await user.click(screen.getByRole('button', { name: /continue/i }))
  }
}

describe('PremiumUpgradeFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    seedFullAppState()
  })

  // ── Rendering ──

  it('renders nothing when isOpen is false', () => {
    renderFlow({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the modal when isOpen is true', () => {
    renderFlow()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows step indicator dots', () => {
    renderFlow()
    const dots = screen.getAllByTestId('step-dot')
    expect(dots.length).toBe(5)
  })

  it('shows close button', () => {
    renderFlow()
    expect(screen.getByLabelText(/close/i)).toBeInTheDocument()
  })

  // ── Step 1: Value Preview ──

  it('starts on Value Preview step', () => {
    renderFlow()
    // Step 1 shows the PremiumValuePreview with "Full Health Potential" heading
    expect(screen.getByText(/Full Health Potential/i)).toBeInTheDocument()
  })

  it('shows dog name in value preview', () => {
    renderFlow({ dogName: 'Buddy' })
    expect(screen.getByText(/Unlock Buddy's Full Health Potential/)).toBeInTheDocument()
  })

  // ── Step 2: Feature Comparison ──

  it('advances to Feature Comparison on Continue click', async () => {
    const user = userEvent.setup()
    renderFlow()

    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByText('Feature Comparison')).toBeInTheDocument()
    // Table header columns
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('shows feature comparison table with correct features', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 2)

    expect(screen.getByText(/AI Health Chat/i)).toBeInTheDocument()
    expect(screen.getByText(/Photo Analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/Health Facts Memory/i)).toBeInTheDocument()
    expect(screen.getByText(/Chat History/i)).toBeInTheDocument()
    expect(screen.getByText(/Medications Tracking/i)).toBeInTheDocument()
    expect(screen.getByText(/Breed Health Risks/i)).toBeInTheDocument()
    expect(screen.getByText(/Health Alerts/i)).toBeInTheDocument()
    expect(screen.getByText(/Photo Gallery/i)).toBeInTheDocument()
  })

  it('shows free vs premium limits in comparison', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 2)

    expect(screen.getByText('3/day')).toBeInTheDocument()
    expect(screen.getByText('2/day')).toBeInTheDocument()
    expect(screen.getAllByText(/unlimited/i).length).toBeGreaterThanOrEqual(2)
  })

  // ── Step 3: Pricing ──

  it('advances to Pricing step', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 3)

    expect(screen.getByText(/\$4\.99/)).toBeInTheDocument()
    expect(screen.getByText(/\$39\.99/)).toBeInTheDocument()
  })

  it('shows monthly and annual pricing options', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 3)

    // Use exact text for plan labels to avoid ambiguity
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Annual')).toBeInTheDocument()
  })

  it('shows save 33% on annual plan', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 3)

    expect(screen.getByText(/save 33%/i)).toBeInTheDocument()
  })

  it('highlights annual plan as Best Value', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 3)

    expect(screen.getByText(/best value/i)).toBeInTheDocument()
  })

  // ── Step 4: Purchase ──

  it('advances to Purchase step', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 4)

    expect(screen.getByRole('button', { name: /start premium/i })).toBeInTheDocument()
  })

  it('clicking purchase sets premium status', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 4)

    // Click purchase
    await user.click(screen.getByRole('button', { name: /start premium/i }))

    // Verify premium was set
    expect(
      localStorage.getItem(`pawsy_${TEST_USER.id}_premium_status`)
    ).toBe('true')
  })

  // ── Step 5: Celebration ──

  it('shows celebration after purchase', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 4)

    // Click purchase
    await user.click(screen.getByRole('button', { name: /start premium/i }))

    // Should see celebration
    expect(screen.getByText(/welcome to premium/i)).toBeInTheDocument()
  })

  it('celebration step shows success message with dog name', async () => {
    const user = userEvent.setup()
    renderFlow()

    await navigateToStep(user, 4)
    await user.click(screen.getByRole('button', { name: /start premium/i }))

    expect(screen.getByText(/Buddy now has access/)).toBeInTheDocument()
  })

  // ── Navigation ──

  it('back button goes to previous step', async () => {
    const user = userEvent.setup()
    renderFlow()

    // Go to step 2
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByText('Feature Comparison')).toBeInTheDocument()

    // Go back to step 1
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText(/Full Health Potential/i)).toBeInTheDocument()
  })

  it('close button calls onClose', async () => {
    const user = userEvent.setup()
    const { props } = renderFlow()

    await user.click(screen.getByLabelText(/close/i))
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  // ── Full Flow Integration ──

  it('completes full flow from start to celebration', async () => {
    const user = userEvent.setup()
    renderFlow()

    // Step 1 -> Step 2
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByText('Feature Comparison')).toBeInTheDocument()

    // Step 2 -> Step 3
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByText(/\$4\.99/)).toBeInTheDocument()

    // Step 3 -> Step 4
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByRole('button', { name: /start premium/i })).toBeInTheDocument()

    // Step 4: Purchase
    await user.click(screen.getByRole('button', { name: /start premium/i }))

    // Step 5: Celebration
    expect(screen.getByText(/welcome to premium/i)).toBeInTheDocument()
    expect(localStorage.getItem(`pawsy_${TEST_USER.id}_premium_status`)).toBe('true')
  })

  // ── Personalized Data ──

  it('shows personalized facts count from localStorage', async () => {
    const facts = [
      { id: '1', text: 'Allergy to chicken', category: 'allergy', createdAt: new Date().toISOString() },
      { id: '2', text: 'Hip surgery 2023', category: 'medical', createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('pawsy_facts_test-dog-456', JSON.stringify(facts))

    renderFlow({ dogName: TEST_DOG.name })

    expect(screen.getByText(/2 health facts/i)).toBeInTheDocument()
  })
})
