import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import {
  renderWithProviders,
  seedFullAppState,
  TEST_USER,
  TEST_DOG,
} from '../../test/test-utils'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import PhotoGallery from './PhotoGallery'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeAnalysis(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    is_dog: true,
    urgency_level: 'moderate',
    confidence: 'high',
    possible_conditions: ['Minor irritation'],
    visible_symptoms: ['Slight redness'],
    recommended_actions: ['Keep clean'],
    should_see_vet: false,
    summary: 'Based on the photo, this appears minor.',
    bodyArea: 'Skin/Coat',
    body_area: 'Skin/Coat',
    description: 'Red bump on side',
    createdAt: '2025-01-25T10:00:00.000Z',
    ...overrides,
  }
}

function seedPremium() {
  localStorage.setItem(
    `pawsy_${TEST_USER.id}_premium_status`,
    'true'
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PhotoGallery', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── Empty state ──────────────────────────────────────────────────────────

  it('shows empty state when there are no analyses', () => {
    seedFullAppState()

    renderWithProviders(
      <PhotoGallery analyses={[]} onSelect={onSelect} />
    )

    expect(
      screen.getByText('No photo analyses yet. Take your first photo to get started!')
    ).toBeInTheDocument()
  })

  // ── Rendering analyses ───────────────────────────────────────────────────

  it('renders analysis summary text', () => {
    seedFullAppState()

    const analyses = [makeAnalysis({ summary: 'Looks like a minor rash.' })]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    expect(screen.getByText('Looks like a minor rash.')).toBeInTheDocument()
  })

  it('renders body area for each analysis', () => {
    seedFullAppState()

    const analyses = [
      makeAnalysis({ bodyArea: 'Ear', body_area: 'Ear' }),
      makeAnalysis({ bodyArea: 'Paw/Leg', body_area: 'Paw/Leg' }),
    ]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    expect(screen.getByText('Ear')).toBeInTheDocument()
    expect(screen.getByText('Paw/Leg')).toBeInTheDocument()
  })

  it('renders formatted date for each analysis', () => {
    seedFullAppState()

    const analyses = [
      makeAnalysis({ createdAt: '2025-01-25T10:00:00.000Z' }),
    ]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    // Should show a nicely formatted date — e.g. "Jan 25, 2025"
    expect(screen.getByText(/Jan 25, 2025/)).toBeInTheDocument()
  })

  // ── Urgency badges ──────────────────────────────────────────────────────

  it('renders emergency urgency badge with correct colors', () => {
    seedFullAppState()

    const analyses = [makeAnalysis({ urgency_level: 'emergency' })]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    const matches = screen.getAllByText('Emergency')
    const badge = matches.find((el) => el.className.includes('bg-red-100'))
    expect(badge).toBeDefined()
    expect(badge.className).toContain('text-red-700')
  })

  it('renders urgent urgency badge with correct colors', () => {
    seedFullAppState()

    const analyses = [makeAnalysis({ urgency_level: 'urgent' })]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    const matches = screen.getAllByText('Urgent')
    const badge = matches.find((el) => el.className.includes('bg-orange-100'))
    expect(badge).toBeDefined()
    expect(badge.className).toContain('text-orange-700')
  })

  it('renders moderate urgency badge with correct colors', () => {
    seedFullAppState()

    const analyses = [makeAnalysis({ urgency_level: 'moderate' })]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    const matches = screen.getAllByText('Moderate')
    const badge = matches.find((el) => el.className.includes('bg-yellow-100'))
    expect(badge).toBeDefined()
    expect(badge.className).toContain('text-yellow-700')
  })

  it('renders low urgency badge with correct colors', () => {
    seedFullAppState()

    const analyses = [makeAnalysis({ urgency_level: 'low' })]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    const matches = screen.getAllByText('Low')
    const badge = matches.find((el) => el.className.includes('bg-green-100'))
    expect(badge).toBeDefined()
    expect(badge.className).toContain('text-green-700')
  })

  // ── Click / onSelect ────────────────────────────────────────────────────

  it('calls onSelect with the analysis when clicked', async () => {
    seedFullAppState()

    const analysis = makeAnalysis({ summary: 'Click me analysis' })
    const analyses = [analysis]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    fireEvent.click(screen.getByText('Click me analysis'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(analysis)
  })

  // ── Free user gating ────────────────────────────────────────────────────

  it('shows only 3 analyses for free users, rest behind PremiumGate', () => {
    seedFullAppState()

    const analyses = [
      makeAnalysis({ summary: 'Analysis one', createdAt: '2025-01-25T10:00:00.000Z' }),
      makeAnalysis({ summary: 'Analysis two', createdAt: '2025-01-24T10:00:00.000Z' }),
      makeAnalysis({ summary: 'Analysis three', createdAt: '2025-01-23T10:00:00.000Z' }),
      makeAnalysis({ summary: 'Analysis four', createdAt: '2025-01-22T10:00:00.000Z' }),
      makeAnalysis({ summary: 'Analysis five', createdAt: '2025-01-21T10:00:00.000Z' }),
    ]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    // First 3 should be visible as normal text
    expect(screen.getByText('Analysis one')).toBeInTheDocument()
    expect(screen.getByText('Analysis two')).toBeInTheDocument()
    expect(screen.getByText('Analysis three')).toBeInTheDocument()

    // The remaining 2 should be behind PremiumGate (overlay variant blurs them)
    // PremiumGate renders an "Upgrade to Premium" button
    expect(screen.getByText(/Upgrade to Premium/)).toBeInTheDocument()
  })

  // ── Premium user full access ────────────────────────────────────────────

  it('shows all analyses for premium users', () => {
    seedFullAppState()
    seedPremium()

    const analyses = [
      makeAnalysis({ summary: 'Premium one', createdAt: '2025-01-25T10:00:00.000Z' }),
      makeAnalysis({ summary: 'Premium two', createdAt: '2025-01-24T10:00:00.000Z' }),
      makeAnalysis({ summary: 'Premium three', createdAt: '2025-01-23T10:00:00.000Z' }),
      makeAnalysis({ summary: 'Premium four', createdAt: '2025-01-22T10:00:00.000Z' }),
      makeAnalysis({ summary: 'Premium five', createdAt: '2025-01-21T10:00:00.000Z' }),
    ]

    renderWithProviders(
      <PhotoGallery analyses={analyses} onSelect={onSelect} />
    )

    expect(screen.getByText('Premium one')).toBeInTheDocument()
    expect(screen.getByText('Premium two')).toBeInTheDocument()
    expect(screen.getByText('Premium three')).toBeInTheDocument()
    expect(screen.getByText('Premium four')).toBeInTheDocument()
    expect(screen.getByText('Premium five')).toBeInTheDocument()

    // No PremiumGate CTA
    expect(screen.queryByText(/Upgrade to Premium/)).not.toBeInTheDocument()
  })

  // ── Heading ─────────────────────────────────────────────────────────────

  it('renders a "Past Analyses" heading', () => {
    seedFullAppState()

    renderWithProviders(
      <PhotoGallery analyses={[makeAnalysis()]} onSelect={onSelect} />
    )

    expect(screen.getByText('Past Analyses')).toBeInTheDocument()
  })
})
