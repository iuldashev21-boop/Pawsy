import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  screen,
  renderWithProviders,
  seedFullAppState,
  TEST_USER,
  TEST_DOG,
} from '../../test/test-utils'
import { seedDogState } from '../../test/test-utils'
import AIContextIndicator from './AIContextIndicator'

// Mock framer-motion for test stability
vi.mock('framer-motion', async () => await import('../../test/mocks/framer-motion.jsx'))

// Mock buildAIContext to avoid pulling in the full prompt builder dependency chain
vi.mock('../../services/ai/contextBuilder.js', () => ({
  buildAIContext: vi.fn(({ dog, petFacts = [], isPremium = false }) => {
    const p0 = []
    if (dog) p0.push(`Dog: ${dog.name}`)
    if (dog?.allergies?.length > 0) p0.push(`ALLERGIES: ${dog.allergies.join(', ')}`)
    const p1 = petFacts.length > 0 ? ['Recent Health Facts'] : []
    const p2 = isPremium && dog?.breed ? ['Breed risks'] : []
    return {
      systemPrompt: [...p0, ...p1, ...p2].join('\n\n'),
      contextSections: { p0, p1, p2, p3: [] },
    }
  }),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seedPetFacts(dogId, facts) {
  localStorage.setItem(`pawsy_facts_${dogId}`, JSON.stringify(facts))
}

function seedPremium(userId) {
  localStorage.setItem(`pawsy_${userId}_premium_status`, 'true')
}

function makeFact(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    dogId: TEST_DOG.id,
    fact: 'Test health fact',
    category: 'symptom',
    severity: 'moderate',
    tags: ['test'],
    source: 'chat',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AIContextIndicator', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // ---- Collapsed state ----------------------------------------------------

  describe('collapsed state', () => {
    it('shows pill with health facts count when facts exist', () => {
      seedFullAppState()
      const facts = [makeFact(), makeFact({ fact: 'Second fact' }), makeFact({ fact: 'Third fact' })]
      seedPetFacts(TEST_DOG.id, facts)

      renderWithProviders(<AIContextIndicator />)

      expect(screen.getByText(/Pawsy knows: 3 health facts/i)).toBeInTheDocument()
    })

    it('shows zero count when no facts exist', () => {
      seedFullAppState()

      renderWithProviders(<AIContextIndicator />)

      expect(screen.getByText(/Pawsy knows: 0 health facts/i)).toBeInTheDocument()
    })

    it('renders the Brain icon area', () => {
      seedFullAppState()

      renderWithProviders(<AIContextIndicator />)

      // The pill button should be accessible
      const pill = screen.getByRole('button', { name: /AI context/i })
      expect(pill).toBeInTheDocument()
    })
  })

  // ---- Expanded state -----------------------------------------------------

  describe('expanded state', () => {
    it('shows section details when pill is clicked', async () => {
      seedFullAppState()
      const facts = [makeFact(), makeFact({ fact: 'Second fact' })]
      seedPetFacts(TEST_DOG.id, facts)

      const { user } = renderWithProviders(<AIContextIndicator />)

      const pill = screen.getByRole('button', { name: /AI context/i })
      await user.click(pill)

      // Section labels should be visible
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Allergies')).toBeInTheDocument()
      expect(screen.getByText('Health Facts')).toBeInTheDocument()
      expect(screen.getByText('Medications')).toBeInTheDocument()
      expect(screen.getByText('Breed Risks')).toBeInTheDocument()
    })

    it('shows dog profile summary in Profile section', async () => {
      seedFullAppState()

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      // Dog name and breed should appear
      expect(screen.getByText(/Buddy/)).toBeInTheDocument()
      expect(screen.getByText(/Golden Retriever/)).toBeInTheDocument()
    })

    it('shows allergy count when dog has allergies', async () => {
      const dogWithAllergies = {
        ...TEST_DOG,
        allergies: ['Chicken', 'Wheat'],
      }
      seedFullAppState()
      seedDogState(dogWithAllergies)

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      expect(screen.getByText(/2 known/i)).toBeInTheDocument()
    })

    it('shows "None" for allergies when dog has none', async () => {
      seedFullAppState()

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      // Allergies section should show "None"
      const allergySection = screen.getByText('Allergies').closest('[data-section]')
      expect(allergySection).toHaveTextContent('None')
    })

    it('shows health facts count in expanded view', async () => {
      seedFullAppState()
      seedPetFacts(TEST_DOG.id, [makeFact(), makeFact(), makeFact(), makeFact(), makeFact()])

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      expect(screen.getByText(/5 facts/i)).toBeInTheDocument()
    })

    it('collapses when clicking the pill again', async () => {
      seedFullAppState()

      const { user } = renderWithProviders(<AIContextIndicator />)

      const pill = screen.getByRole('button', { name: /AI context/i })
      await user.click(pill)

      // Sections should be visible
      expect(screen.getByText('Profile')).toBeInTheDocument()

      // Click again to collapse
      await user.click(pill)

      // Section labels should disappear
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    })
  })

  // ---- Empty state --------------------------------------------------------

  describe('empty state', () => {
    it('shows empty state message for new user with no facts and no dog data', async () => {
      seedFullAppState()
      // Seed a dog with minimal data (no allergies, no medications)
      seedDogState({
        ...TEST_DOG,
        allergies: [],
        medications: [],
        breed: '',
      })

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      expect(screen.getByText(/No health context yet/i)).toBeInTheDocument()
    })
  })

  // ---- Free user premium gating -------------------------------------------

  describe('free user', () => {
    it('shows lock icon on Medications section', async () => {
      seedFullAppState()

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      // Find the medications row - it should have a lock indicator
      const medsSection = screen.getByText('Medications').closest('[data-section]')
      expect(medsSection).toBeInTheDocument()
      const lockIcon = medsSection.querySelector('[data-testid="lock-icon"]')
      expect(lockIcon).toBeInTheDocument()
    })

    it('shows lock icon on Breed Risks section', async () => {
      seedFullAppState()

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      const breedSection = screen.getByText('Breed Risks').closest('[data-section]')
      expect(breedSection).toBeInTheDocument()
      const lockIcon = breedSection.querySelector('[data-testid="lock-icon"]')
      expect(lockIcon).toBeInTheDocument()
    })

    it('shows "Premium" label on gated sections', async () => {
      seedFullAppState()

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      const premiumLabels = screen.getAllByText(/Premium/i)
      expect(premiumLabels.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ---- Premium user -------------------------------------------------------

  describe('premium user', () => {
    it('shows all sections unlocked without lock icons', async () => {
      seedFullAppState()
      seedPremium(TEST_USER.id)

      const dogWithMeds = {
        ...TEST_DOG,
        medications: [{ name: 'Apoquel', dosage: '16mg daily' }],
      }
      seedDogState(dogWithMeds)

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      // Medications should show without lock
      const medsSection = screen.getByText('Medications').closest('[data-section]')
      const lockIcon = medsSection.querySelector('[data-testid="lock-icon"]')
      expect(lockIcon).not.toBeInTheDocument()
    })

    it('shows medication count for premium users', async () => {
      seedFullAppState()
      seedPremium(TEST_USER.id)

      const dogWithMeds = {
        ...TEST_DOG,
        medications: [
          { name: 'Apoquel', dosage: '16mg daily' },
          { name: 'Fish Oil', dosage: '1000mg' },
        ],
      }
      seedDogState(dogWithMeds)

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      expect(screen.getByText(/2 active/i)).toBeInTheDocument()
    })

    it('shows breed risks available for premium users with recognized breed', async () => {
      seedFullAppState()
      seedPremium(TEST_USER.id)

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      // Golden Retriever is in the breed health risks database
      const breedSection = screen.getByText('Breed Risks').closest('[data-section]')
      expect(breedSection).toBeInTheDocument()
      // Should show breed risk info, not locked
      const lockIcon = breedSection.querySelector('[data-testid="lock-icon"]')
      expect(lockIcon).not.toBeInTheDocument()
    })

    it('shows "No known risks" for premium users with unrecognized breed', async () => {
      seedFullAppState()
      seedPremium(TEST_USER.id)

      seedDogState({
        ...TEST_DOG,
        breed: 'Rare Exotic Breed',
      })

      const { user } = renderWithProviders(<AIContextIndicator />)

      await user.click(screen.getByRole('button', { name: /AI context/i }))

      expect(screen.getByText(/No known risks/i)).toBeInTheDocument()
    })
  })

  // ---- No active dog ------------------------------------------------------

  describe('no active dog', () => {
    it('renders nothing when there is no active dog', () => {
      // Seed auth only, no dog
      localStorage.clear()
      const { id, email, name, createdAt } = TEST_USER
      const users = { [email]: { id, email, name, createdAt } }
      localStorage.setItem('pawsy_users', JSON.stringify(users))
      localStorage.setItem('pawsy_current_user', JSON.stringify({ id, email, name, createdAt }))
      localStorage.setItem(`pawsy_${id}_dogs`, JSON.stringify([]))

      const { container } = renderWithProviders(<AIContextIndicator />)

      // Should not render any visible content
      expect(container.querySelector('[data-testid="ai-context-indicator"]')).not.toBeInTheDocument()
    })
  })
})
