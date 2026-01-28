import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  screen,
  seedFullAppState,
  renderWithProviders,
  TEST_DOG,
} from '../../test/test-utils'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import PremiumValuePreview from './PremiumValuePreview'

describe('PremiumValuePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    seedFullAppState()
  })

  it('renders dog name in personalized copy', () => {
    renderWithProviders(<PremiumValuePreview dogName="Buddy" />)
    expect(screen.getByText(/Unlock Buddy's Full Health Potential/)).toBeInTheDocument()
  })

  it('shows health facts count from localStorage', () => {
    const facts = [
      { id: '1', text: 'Has allergies to chicken', category: 'allergy', createdAt: new Date().toISOString() },
      { id: '2', text: 'Hip surgery in 2023', category: 'medical', createdAt: new Date().toISOString() },
      { id: '3', text: 'Weighs 65 lbs', category: 'physical', createdAt: new Date().toISOString() },
    ]
    localStorage.setItem(
      'pawsy_facts_test-dog-456',
      JSON.stringify(facts)
    )

    renderWithProviders(<PremiumValuePreview dogName="Buddy" dogId="test-dog-456" />)
    expect(screen.getByText(/3 health facts/i)).toBeInTheDocument()
  })

  it('shows breed risk count when breed has known risks', () => {
    renderWithProviders(
      <PremiumValuePreview dogName="Buddy" breed="Golden Retriever" />
    )
    // Golden Retriever has 4 breed health risks
    expect(screen.getByText(/4 breed-specific health risks/i)).toBeInTheDocument()
  })

  it('does not show breed risk line when breed has no known risks', () => {
    renderWithProviders(
      <PremiumValuePreview dogName="Buddy" breed="Unknown Breed" />
    )
    expect(screen.queryByText(/breed-specific health risks/i)).not.toBeInTheDocument()
  })

  it('shows allergy count when dog has allergies', () => {
    renderWithProviders(
      <PremiumValuePreview
        dogName="Buddy"
        allergies={['Chicken', 'Grain']}
      />
    )
    expect(screen.getByText(/2 known allergies/i)).toBeInTheDocument()
  })

  it('does not show allergy line when no allergies', () => {
    renderWithProviders(
      <PremiumValuePreview dogName="Buddy" allergies={[]} />
    )
    expect(screen.queryByText(/known allergies/i)).not.toBeInTheDocument()
  })

  it('shows zero facts message when no facts stored', () => {
    renderWithProviders(
      <PremiumValuePreview dogName="Buddy" dogId="test-dog-456" />
    )
    // No facts seeded, so it should indicate 0 or show a different message
    expect(screen.getByText(/0 health facts/i)).toBeInTheDocument()
  })

  it('shows blurred preview section', () => {
    renderWithProviders(<PremiumValuePreview dogName="Buddy" />)
    // The blurred preview should be present with aria-hidden
    const blurredPreview = screen.getByTestId('premium-dashboard-preview')
    expect(blurredPreview).toBeInTheDocument()
  })

  it('renders compelling CTA copy', () => {
    renderWithProviders(<PremiumValuePreview dogName="Buddy" />)
    const matches = screen.getAllByText(/premium AI/i)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })
})
