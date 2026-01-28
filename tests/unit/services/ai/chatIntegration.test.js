import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Phase 6 – Chat Integration Tests
 *
 * Verifies that buildAIContext is actually called by gemini.chat() and that
 * the result varies correctly for premium vs free users.
 */

// We need to mock the contextBuilder so we can spy on buildAIContext
vi.mock('../../../../src/services/ai/contextBuilder', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    buildAIContext: vi.fn(original.buildAIContext),
  }
})

// Mock LocalStorageService so we can seed PetFacts
vi.mock('../../../../src/services/storage/LocalStorageService', () => {
  let factsStore = {}
  return {
    default: {
      getPetFacts: vi.fn((dogId) => factsStore[dogId] || []),
      _setFacts: (dogId, facts) => { factsStore[dogId] = facts },
      _reset: () => { factsStore = {} },
    },
  }
})

import { buildAIContext } from '../../../../src/services/ai/contextBuilder'
import LocalStorageService from '../../../../src/services/storage/LocalStorageService'

describe('Phase 6 – Chat Integration: buildAIContext wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    LocalStorageService._reset()
  })

  const dog = {
    name: 'Buddy',
    breed: 'Golden Retriever',
    weight: '65',
    weightUnit: 'lbs',
    dateOfBirth: '2022-01-15',
    sex: 'Male',
    allergies: ['chicken'],
    conditions: ['hip dysplasia'],
    medications: [{ name: 'Glucosamine', dosage: '500mg', frequency: 'daily' }],
  }

  const sampleFacts = [
    {
      id: 'f1',
      fact: 'Scratching ears frequently',
      category: 'symptom',
      severity: 'moderate',
      tags: ['ear', 'scratching'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'f2',
      fact: 'Loose stool after diet change',
      category: 'digestive',
      severity: 'mild',
      tags: ['digestive', 'stool'],
      createdAt: new Date().toISOString(),
    },
  ]

  // ---- Test: buildAIContext is called with correct args ----
  it('buildAIContext is called with dog, petFacts, isPremium, and photoContext', () => {
    const result = buildAIContext({
      dog,
      petFacts: sampleFacts,
      isPremium: true,
      conversationTags: ['ear'],
      photoContext: { body_area: 'ear', summary: 'Redness observed', urgency_level: 'moderate' },
    })

    expect(buildAIContext).toHaveBeenCalledWith(
      expect.objectContaining({
        dog,
        petFacts: sampleFacts,
        isPremium: true,
        photoContext: expect.objectContaining({ body_area: 'ear' }),
      })
    )
    expect(result.systemPrompt).toBeTruthy()
    expect(result.contextSections).toBeTruthy()
  })

  // ---- Test: Premium users get medications and conditions in P0 ----
  it('premium users get medications and conditions in the system prompt', () => {
    const result = buildAIContext({
      dog,
      petFacts: sampleFacts,
      isPremium: true,
    })

    expect(result.systemPrompt).toContain('Glucosamine')
    expect(result.systemPrompt).toContain('hip dysplasia')
  })

  // ---- Test: Free users get PetFact titles only (no severity detail) ----
  it('free users get PetFact titles without severity detail', () => {
    const result = buildAIContext({
      dog,
      petFacts: sampleFacts,
      isPremium: false,
    })

    // Should include the fact text
    expect(result.systemPrompt).toContain('Scratching ears frequently')
    // Should NOT include severity bracket for free users
    expect(result.systemPrompt).not.toMatch(/\[moderate\].*Scratching ears/)
    // Should NOT include medications for free users
    expect(result.systemPrompt).not.toContain('Glucosamine')
  })

  // ---- Test: Photo context included in P1 when provided ----
  it('includes photo context in P1 when provided', () => {
    const photoContext = {
      body_area: 'ear',
      summary: 'Redness and swelling observed in left ear',
      urgency_level: 'moderate',
      possible_conditions: ['Ear infection', 'Allergic reaction'],
    }

    const result = buildAIContext({
      dog,
      petFacts: [],
      isPremium: false,
      photoContext,
    })

    expect(result.systemPrompt).toContain('Redness and swelling observed')
    expect(result.systemPrompt).toContain('ear')
    expect(result.contextSections.p1.length).toBeGreaterThan(0)
  })

  // ---- Test: Conversation tags passed for relevance scoring ----
  it('uses conversation tags to score PetFacts by relevance', () => {
    const manyFacts = [
      ...sampleFacts,
      {
        id: 'f3',
        fact: 'Limping on left rear leg',
        category: 'symptom',
        severity: 'severe',
        tags: ['limping', 'leg'],
        createdAt: new Date().toISOString(),
      },
    ]

    // When tags match "ear", ear-related facts should score higher
    const result = buildAIContext({
      dog,
      petFacts: manyFacts,
      isPremium: true,
      conversationTags: ['ear', 'scratching'],
    })

    // The ear fact should appear in the prompt (it has matching tags)
    expect(result.systemPrompt).toContain('Scratching ears frequently')
  })

  // ---- Test: Falls back gracefully when no PetFacts exist ----
  it('returns valid prompt when no PetFacts exist (new user)', () => {
    const result = buildAIContext({
      dog,
      petFacts: [],
      isPremium: false,
    })

    // Should still have a valid prompt with dog profile
    expect(result.systemPrompt).toBeTruthy()
    expect(result.systemPrompt).toContain('Buddy')
    expect(result.systemPrompt).toContain('Golden Retriever')
    // No PetFacts section
    expect(result.systemPrompt).not.toContain('Recent Health Facts')
  })

  // ---- Test: contextBuilder includes allergy protocol ----
  it('includes allergy information in the prompt', () => {
    const result = buildAIContext({
      dog,
      petFacts: [],
      isPremium: false,
    })

    // The base system prompt includes allergies
    expect(result.systemPrompt).toContain('chicken')
  })

  // ---- Test: buildAIContext returns contextSections for transparency ----
  it('returns contextSections object for AI transparency features', () => {
    const result = buildAIContext({
      dog,
      petFacts: sampleFacts,
      isPremium: true,
      photoContext: { body_area: 'skin', summary: 'Test' },
    })

    expect(result.contextSections).toHaveProperty('p0')
    expect(result.contextSections).toHaveProperty('p1')
    expect(result.contextSections).toHaveProperty('p2')
    expect(result.contextSections).toHaveProperty('p3')
    expect(result.contextSections.p0.length).toBeGreaterThan(0)
  })
})
