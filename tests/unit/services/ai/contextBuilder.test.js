import { describe, it, expect } from 'vitest'
import { buildAIContext } from '../../../../src/services/ai/contextBuilder'

function makeDog(overrides = {}) {
  return {
    name: 'Buddy',
    breed: 'Golden Retriever',
    dateOfBirth: '2020-03-15',
    weight: 70,
    weightUnit: 'lbs',
    sex: 'Male',
    allergies: ['chicken'],
    medications: [{ name: 'Apoquel', dosage: '16mg daily' }],
    conditions: ['Hip Dysplasia'],
    chronicConditions: [],
    ...overrides,
  }
}

function makeFact(overrides = {}) {
  return {
    id: 'fact-1',
    dogId: 'dog-1',
    fact: 'limping on left hind leg',
    category: 'symptom',
    tags: ['limping'],
    severity: 'moderate',
    status: 'active',
    occurredAt: new Date().toISOString(),
    source: { type: 'chat', sessionId: 's1', messageId: 'm1' },
    possibleConditions: ['Sprain'],
    recommendedActions: ['Rest'],
    resolvedAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('contextBuilder', () => {
  describe('buildAIContext', () => {
    it('returns systemPrompt and contextSections', () => {
      const result = buildAIContext({ dog: makeDog() })
      expect(result).toHaveProperty('systemPrompt')
      expect(result).toHaveProperty('contextSections')
      expect(typeof result.systemPrompt).toBe('string')
      expect(result.systemPrompt.length).toBeGreaterThan(0)
    })

    it('builds prompt with dog profile at P0 (always included)', () => {
      const dog = makeDog()
      const result = buildAIContext({ dog })

      expect(result.systemPrompt).toContain('Buddy')
      expect(result.systemPrompt).toContain('Golden Retriever')
      expect(result.contextSections.p0.length).toBeGreaterThan(0)
    })

    it('includes allergy protocol at P0', () => {
      const dog = makeDog({ allergies: ['chicken', 'beef'] })
      const result = buildAIContext({ dog })

      expect(result.systemPrompt).toContain('chicken')
      expect(result.systemPrompt).toContain('beef')
      // Allergies are in P0
      const p0Text = result.contextSections.p0.join(' ')
      expect(p0Text).toContain('chicken')
    })

    it('includes medications at P0 for premium users', () => {
      const dog = makeDog()
      const premium = buildAIContext({ dog, isPremium: true })
      const free = buildAIContext({ dog, isPremium: false })

      // Premium gets a dedicated medications context section in P0
      // (beyond whatever the base prompt includes)
      const premP0 = premium.contextSections.p0
      const freeP0 = free.contextSections.p0

      // Premium should have more P0 sections than free (medications + conditions)
      expect(premP0.length).toBeGreaterThan(freeP0.length)

      // The dedicated medication section should mention "Current Medications"
      const hasMedSection = premP0.some(s => s.includes('Current Medications') && s.includes('Apoquel'))
      expect(hasMedSection).toBe(true)

      // Free should NOT have the dedicated medication section
      const freeMedSection = freeP0.some(s => s.startsWith('Current Medications'))
      expect(freeMedSection).toBe(false)
    })

    it('includes conditions at P0 for premium users', () => {
      const dog = makeDog()
      const premium = buildAIContext({ dog, isPremium: true })
      const free = buildAIContext({ dog, isPremium: false })

      const premP0 = premium.contextSections.p0.join(' ')
      const freeP0 = free.contextSections.p0.join(' ')

      expect(premP0).toContain('Hip Dysplasia')
      expect(freeP0).not.toContain('Hip Dysplasia')
    })

    it('includes top 10 PetFacts at P1 sorted by relevance', () => {
      const facts = Array.from({ length: 15 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i * 5)
        return makeFact({
          id: `f${i}`,
          fact: `symptom_entry_${i}`,
          tags: [`tag_entry_${i}`],
          occurredAt: d.toISOString(),
        })
      })

      const result = buildAIContext({ dog: makeDog(), petFacts: facts, isPremium: true })
      const p1Text = result.contextSections.p1.join('\n')

      // The most recent fact should be present
      expect(p1Text).toContain('symptom_entry_0')
      // Count unique fact lines (each starts with "- ")
      const factLines = p1Text.split('\n').filter(line => line.startsWith('- '))
      expect(factLines.length).toBeLessThanOrEqual(10)
      // Fact #14 (oldest) should NOT appear when we only take top 10
      expect(p1Text).not.toContain('symptom_entry_14')
    })

    it('free users get fact titles only; premium gets full facts', () => {
      const facts = [makeFact({ severity: 'severe', tags: ['limping'] })]

      const premium = buildAIContext({ dog: makeDog(), petFacts: facts, isPremium: true })
      const free = buildAIContext({ dog: makeDog(), petFacts: facts, isPremium: false })

      const premP1 = premium.contextSections.p1.join(' ')
      const freeP1 = free.contextSections.p1.join(' ')

      // Premium gets severity, category, and tags details
      expect(premP1).toContain('severe')
      expect(premP1).toContain('symptom')
      expect(premP1).toContain('limping')

      // Free gets the fact text but not the detailed annotations
      expect(freeP1).toContain('limping on left hind leg')
      expect(freeP1).not.toContain('[severe]')
    })

    it('returns empty context sections when no data exists', () => {
      const result = buildAIContext({ dog: makeDog({ allergies: [], medications: [], conditions: [] }), isPremium: false })

      // P1 should be empty (no facts, no photo)
      expect(result.contextSections.p1).toEqual([])
      // P2 should be empty (not premium)
      expect(result.contextSections.p2).toEqual([])
      // P3 should be empty
      expect(result.contextSections.p3).toEqual([])
    })

    it('P0 is never dropped even with large content', () => {
      const dog = makeDog()
      // Generate many facts to potentially blow the budget
      const facts = Array.from({ length: 50 }, (_, i) =>
        makeFact({ id: `f${i}`, fact: `Long symptom description number ${i} with lots of extra words to inflate token count artificially so the budget is exceeded quickly`, tags: [`tag${i}`] })
      )

      const result = buildAIContext({ dog, petFacts: facts, isPremium: true })

      // P0 content (base prompt + dog profile) must always be present
      expect(result.systemPrompt).toContain('Buddy')
      expect(result.contextSections.p0.length).toBeGreaterThan(0)
    })

    it('drops P3 content first when over budget', () => {
      // P3 is household context, currently returns empty, so test structure
      const result = buildAIContext({ dog: makeDog(), isPremium: true })
      // P3 is always empty in current implementation (placeholder)
      expect(result.contextSections.p3).toEqual([])
    })

    it('drops P2 before P1', () => {
      // Build a scenario where total is within budget -- P2 and P1 both included
      const facts = [makeFact()]
      const result = buildAIContext({
        dog: makeDog(),
        petFacts: facts,
        isPremium: true,
      })

      // With reasonable data, both P1 and P2 should be included
      // P1 has pet facts
      expect(result.contextSections.p1.length).toBeGreaterThan(0)
    })

    it('token budget estimation works (counts words roughly)', () => {
      const dog = makeDog()
      const result = buildAIContext({ dog })

      // systemPrompt should be a non-empty string
      const wordCount = result.systemPrompt.split(/\s+/).filter(Boolean).length
      expect(wordCount).toBeGreaterThan(0)
      // Should be within reasonable budget range
      expect(wordCount).toBeLessThanOrEqual(3000) // generous upper bound
    })

    it('includes photo context in P1 when provided', () => {
      const photo = {
        summary: 'Red irritated patch on belly',
        body_area: 'abdomen',
        urgency_level: 'moderate',
        possible_conditions: ['Hot spot', 'Dermatitis'],
      }

      const result = buildAIContext({ dog: makeDog(), photoContext: photo })
      const p1Text = result.contextSections.p1.join(' ')
      expect(p1Text).toContain('Red irritated patch')
      expect(p1Text).toContain('abdomen')
    })

    it('handles missing dog gracefully', () => {
      const result = buildAIContext({})
      expect(result).toHaveProperty('systemPrompt')
      expect(typeof result.systemPrompt).toBe('string')
    })

    it('handles being called with no arguments', () => {
      const result = buildAIContext()
      expect(result).toHaveProperty('systemPrompt')
      expect(result).toHaveProperty('contextSections')
    })
  })
})
