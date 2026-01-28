import { describe, it, expect } from 'vitest'
import { BREED_HEALTH_RISKS, getBreedRisks } from '../../../src/constants/breedHealthRisks'

describe('breedHealthRisks', () => {
  const EXPECTED_BREEDS = [
    'Labrador Retriever',
    'Golden Retriever',
    'German Shepherd',
    'French Bulldog',
    'Poodle',
    'Beagle',
    'Bulldog',
    'Rottweiler',
    'Dachshund',
    'Siberian Husky',
    'Boxer',
    'Great Dane',
    'Doberman Pinscher',
    'Bernese Mountain Dog',
    'Cavalier King Charles Spaniel',
  ]

  describe('BREED_HEALTH_RISKS data', () => {
    it.each(EXPECTED_BREEDS)('contains data for %s', (breed) => {
      expect(BREED_HEALTH_RISKS[breed]).toBeDefined()
      expect(Array.isArray(BREED_HEALTH_RISKS[breed])).toBe(true)
      expect(BREED_HEALTH_RISKS[breed].length).toBeGreaterThan(0)
    })

    it('each breed entry has a conditions array', () => {
      for (const breed of Object.keys(BREED_HEALTH_RISKS)) {
        const conditions = BREED_HEALTH_RISKS[breed]
        expect(Array.isArray(conditions)).toBe(true)
        expect(conditions.length).toBeGreaterThan(0)
      }
    })

    it('each condition has name, ageRangeYears (min, max), and severity', () => {
      for (const [, conditions] of Object.entries(BREED_HEALTH_RISKS)) {
        for (const condition of conditions) {
          expect(condition).toHaveProperty('name')
          expect(typeof condition.name).toBe('string')

          expect(condition).toHaveProperty('ageRangeYears')
          expect(condition.ageRangeYears).toHaveProperty('min')
          expect(condition.ageRangeYears).toHaveProperty('max')
          expect(typeof condition.ageRangeYears.min).toBe('number')
          expect(typeof condition.ageRangeYears.max).toBe('number')
          expect(condition.ageRangeYears.max).toBeGreaterThanOrEqual(condition.ageRangeYears.min)

          expect(condition).toHaveProperty('severity')
          expect(['low', 'moderate', 'high']).toContain(condition.severity)

          // Description is also expected
          expect(condition).toHaveProperty('description')
          expect(typeof condition.description).toBe('string')
          expect(condition.description.length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('getBreedRisks', () => {
    it('returns conditions array for a known breed', () => {
      const risks = getBreedRisks('Labrador Retriever')
      expect(risks.length).toBeGreaterThan(0)
      expect(risks[0]).toHaveProperty('name')
    })

    it('returns empty array for an unknown breed', () => {
      expect(getBreedRisks('Xoloitzcuintli')).toEqual([])
    })

    it('returns empty array for null/undefined', () => {
      expect(getBreedRisks(null)).toEqual([])
      expect(getBreedRisks(undefined)).toEqual([])
    })

    it('returns empty array for non-string input', () => {
      expect(getBreedRisks(123)).toEqual([])
      expect(getBreedRisks({})).toEqual([])
    })
  })
})
