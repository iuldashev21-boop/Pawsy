import { describe, it, expect } from 'vitest'
import { buildAIContext } from '../../../../src/services/ai/contextBuilder'

const mockDog = {
  name: 'Max',
  breed: 'Golden Retriever',
  dateOfBirth: '2020-01-15',
  weight: 70,
  weightUnit: 'lbs',
  sex: 'male',
  allergies: ['Chicken'],
  conditions: ['Hip dysplasia'],
}

describe('buildAIContext (prompt builder)', () => {
  it('includes dog profile data', () => {
    const { systemPrompt } = buildAIContext({ dog: mockDog, petFacts: [], isPremium: false })
    expect(systemPrompt).toContain('Max')
    expect(systemPrompt).toContain('Golden Retriever')
    expect(systemPrompt).toContain('Chicken')
    expect(systemPrompt).toContain('70')
  })

  it('works with no PetFacts (new user)', () => {
    const { systemPrompt } = buildAIContext({ dog: mockDog, petFacts: [], isPremium: false })
    expect(systemPrompt).toContain('Max')
    expect(systemPrompt).toContain('Golden Retriever')
  })

  it('includes PetFacts when provided', () => {
    const facts = [
      { id: '1', fact: 'Scratching ears frequently', category: 'symptom', severity: 'moderate', tags: ['ear'], createdAt: new Date().toISOString() },
      { id: '2', fact: 'Skin rash on belly', category: 'symptom', severity: 'mild', tags: ['skin'], createdAt: new Date().toISOString() },
    ]
    const { systemPrompt } = buildAIContext({ dog: mockDog, petFacts: facts, isPremium: true })
    expect(systemPrompt).toContain('Scratching ears frequently')
    expect(systemPrompt).toContain('Skin rash on belly')
  })

  it('includes photo context when provided', () => {
    const photoContext = {
      body_area: 'Skin/Coat',
      summary: 'Red patch on belly',
      urgency_level: 'moderate',
      possible_conditions: ['Hot spot', 'Allergic reaction'],
      visible_symptoms: ['Redness'],
    }
    const { systemPrompt } = buildAIContext({ dog: mockDog, petFacts: [], isPremium: false, photoContext })
    expect(systemPrompt).toContain('Red patch on belly')
    expect(systemPrompt).toContain('Skin/Coat')
  })

  it('produces no PetFacts section for empty facts array', () => {
    const { systemPrompt } = buildAIContext({ dog: mockDog, petFacts: [], isPremium: false })
    expect(systemPrompt).not.toContain('Recent Health Facts')
  })

  it('gates medications behind premium', () => {
    const dog = { ...mockDog, medications: [{ name: 'Glucosamine', dosage: '500mg' }] }
    const free = buildAIContext({ dog, petFacts: [], isPremium: false })
    const premium = buildAIContext({ dog, petFacts: [], isPremium: true })
    expect(free.systemPrompt).not.toContain('Glucosamine')
    expect(premium.systemPrompt).toContain('Glucosamine')
  })
})
