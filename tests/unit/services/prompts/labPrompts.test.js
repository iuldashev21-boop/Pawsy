/**
 * Tests for specialized lab prompts (Phase 3)
 */

import { describe, it, expect } from 'vitest'
import {
  buildXrayAnalysisSystemPrompt,
  buildBloodWorkAnalysisSystemPrompt,
  buildUrinalysisAnalysisSystemPrompt,
} from '../../../../src/services/prompts/labPrompts'

function makeDog(overrides = {}) {
  return {
    id: 'dog-1',
    name: 'Buddy',
    breed: 'Labrador Retriever',
    weight: 70,
    weightUnit: 'lbs',
    dateOfBirth: '2020-06-15',
    allergies: ['chicken'],
    conditions: ['hip dysplasia'],
    chronicConditions: [],
    medications: [{ name: 'Rimadyl', dosage: '75mg' }],
    ...overrides,
  }
}

describe('labPrompts', () => {
  // =========================================================================
  // X-ray Prompt
  // =========================================================================

  describe('buildXrayAnalysisSystemPrompt', () => {
    it('returns a string prompt', () => {
      const prompt = buildXrayAnalysisSystemPrompt(makeDog(), 'Pre-surgery evaluation')
      expect(typeof prompt).toBe('string')
      expect(prompt.length).toBeGreaterThan(100)
    })

    it('includes dog profile information', () => {
      const dog = makeDog({ name: 'Max', breed: 'German Shepherd' })
      const prompt = buildXrayAnalysisSystemPrompt(dog, '')

      expect(prompt).toContain('Max')
      expect(prompt).toContain('German Shepherd')
    })

    it('includes radiology-specific terminology', () => {
      const prompt = buildXrayAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/bone|skeletal|soft tissue|radiograph/i)
      expect(prompt).toMatch(/lateral|VD|DV|view/i)
    })

    it('mentions joint and foreign body assessment', () => {
      const prompt = buildXrayAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/joint/i)
      expect(prompt).toMatch(/foreign (body|object)/i)
    })

    it('includes owner notes when provided', () => {
      const prompt = buildXrayAnalysisSystemPrompt(makeDog(), 'checking for fracture after fall')

      expect(prompt).toContain('checking for fracture after fall')
    })

    it('includes AI limitations disclaimer', () => {
      const prompt = buildXrayAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/AI|not a substitute|veterinary|professional/i)
    })

    it('includes known conditions', () => {
      const dog = makeDog({ conditions: ['hip dysplasia', 'arthritis'] })
      const prompt = buildXrayAnalysisSystemPrompt(dog, '')

      expect(prompt).toContain('hip dysplasia')
    })

    it('includes medications', () => {
      const dog = makeDog({ medications: [{ name: 'Rimadyl', dosage: '75mg' }] })
      const prompt = buildXrayAnalysisSystemPrompt(dog, '')

      expect(prompt).toContain('Rimadyl')
    })
  })

  // =========================================================================
  // Blood Work Prompt
  // =========================================================================

  describe('buildBloodWorkAnalysisSystemPrompt', () => {
    it('returns a string prompt', () => {
      const prompt = buildBloodWorkAnalysisSystemPrompt(makeDog(), 'annual checkup')
      expect(typeof prompt).toBe('string')
      expect(prompt.length).toBeGreaterThan(100)
    })

    it('includes dog profile information', () => {
      const dog = makeDog({ name: 'Luna', breed: 'Golden Retriever' })
      const prompt = buildBloodWorkAnalysisSystemPrompt(dog, '')

      expect(prompt).toContain('Luna')
      expect(prompt).toContain('Golden Retriever')
    })

    it('mentions organ system groupings', () => {
      const prompt = buildBloodWorkAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/CBC|RBC|WBC|liver|kidney|electrolyte/i)
    })

    it('mentions reference ranges', () => {
      const prompt = buildBloodWorkAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/reference range|normal range/i)
    })

    it('mentions medication interactions', () => {
      const prompt = buildBloodWorkAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/medication|drug|interaction/i)
    })

    it('includes numerical value extraction guidance', () => {
      const prompt = buildBloodWorkAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/value|extract|read/i)
    })

    it('includes owner notes when provided', () => {
      const prompt = buildBloodWorkAnalysisSystemPrompt(makeDog(), 'pre-anesthesia panel')

      expect(prompt).toContain('pre-anesthesia panel')
    })

    it('uses dog-specific reference ranges', () => {
      const prompt = buildBloodWorkAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/canine|dog/i)
    })
  })

  // =========================================================================
  // Urinalysis Prompt
  // =========================================================================

  describe('buildUrinalysisAnalysisSystemPrompt', () => {
    it('returns a string prompt', () => {
      const prompt = buildUrinalysisAnalysisSystemPrompt(makeDog(), 'suspected UTI')
      expect(typeof prompt).toBe('string')
      expect(prompt.length).toBeGreaterThan(100)
    })

    it('includes dog profile information', () => {
      const dog = makeDog({ name: 'Daisy', breed: 'Beagle' })
      const prompt = buildUrinalysisAnalysisSystemPrompt(dog, '')

      expect(prompt).toContain('Daisy')
      expect(prompt).toContain('Beagle')
    })

    it('mentions urine-specific markers', () => {
      const prompt = buildUrinalysisAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/pH|specific gravity|protein|glucose|sediment/i)
    })

    it('mentions hydration assessment', () => {
      const prompt = buildUrinalysisAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/hydration/i)
    })

    it('mentions physical properties', () => {
      const prompt = buildUrinalysisAnalysisSystemPrompt(makeDog(), '')

      expect(prompt).toMatch(/color|clarity|turbid|appearance/i)
    })

    it('includes owner notes when provided', () => {
      const prompt = buildUrinalysisAnalysisSystemPrompt(makeDog(), 'increased urination')

      expect(prompt).toContain('increased urination')
    })

    it('includes known conditions', () => {
      const dog = makeDog({ chronicConditions: ['diabetes'] })
      const prompt = buildUrinalysisAnalysisSystemPrompt(dog, '')

      expect(prompt).toContain('diabetes')
    })
  })
})
