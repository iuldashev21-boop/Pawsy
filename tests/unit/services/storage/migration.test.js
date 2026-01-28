import { describe, it, expect } from 'vitest'
import {
  migrateProfile,
  migrateAllProfiles,
  computeProfileCompletion,
} from '../../../../src/services/storage/migration'

describe('migrateProfile', () => {
  // ---------------------------------------------------------------------------
  // v1 -> v2 migration
  // ---------------------------------------------------------------------------
  describe('v1 to v2 migration', () => {
    const v1Profile = {
      id: 'dog-1',
      name: 'Luna',
      breed: 'Beagle',
      gender: 'female',
      weight: 20,
      weightUnit: 'lbs',
      dateOfBirth: '2023-05-10',
      allergies: ['Chicken'],
      chronicConditions: [],
      medications: [],
      vaccinations: [],
      dietType: 'dry',
      feedingSchedule: 'twice daily',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }

    it('migrates to v2 with correct default values', () => {
      const migrated = migrateProfile(v1Profile)

      expect(migrated.schemaVersion).toBe(2)
      expect(migrated.medications).toEqual([])
      expect(migrated.chronicConditions).toEqual([])
      expect(migrated.vaccinations).toEqual([])
      expect(migrated.isSpayedNeutered).toBe(false)
      expect(migrated.activityLevel).toBe('moderate')
      expect(migrated.livingEnvironment).toBe('indoor')
      expect(migrated.socialExposure).toEqual([])
      expect(migrated.surgeryHistory).toEqual([])
      expect(migrated.foodBrand).toBe('')
      expect(migrated.behavioralNotes).toEqual([])
      expect(migrated.location).toBe('')
    })

    it('preserves all original v1 fields', () => {
      const migrated = migrateProfile(v1Profile)

      expect(migrated.id).toBe('dog-1')
      expect(migrated.name).toBe('Luna')
      expect(migrated.breed).toBe('Beagle')
      expect(migrated.gender).toBe('female')
      expect(migrated.weight).toBe(20)
      expect(migrated.weightUnit).toBe('lbs')
      expect(migrated.dateOfBirth).toBe('2023-05-10')
      expect(migrated.allergies).toEqual(['Chicken'])
      expect(migrated.dietType).toBe('dry')
      expect(migrated.feedingSchedule).toBe('twice daily')
    })

    it('adds isSpayedNeutered field defaulting to false', () => {
      const migrated = migrateProfile(v1Profile)
      expect(migrated).toHaveProperty('isSpayedNeutered', false)
    })

    it('adds activityLevel field defaulting to moderate', () => {
      const migrated = migrateProfile(v1Profile)
      expect(migrated).toHaveProperty('activityLevel', 'moderate')
    })

    it('adds livingEnvironment field defaulting to indoor', () => {
      const migrated = migrateProfile(v1Profile)
      expect(migrated).toHaveProperty('livingEnvironment', 'indoor')
    })

    it('adds socialExposure as an empty array', () => {
      const migrated = migrateProfile(v1Profile)
      expect(migrated.socialExposure).toEqual([])
      expect(Array.isArray(migrated.socialExposure)).toBe(true)
    })

    it('adds surgeryHistory as an empty array', () => {
      const migrated = migrateProfile(v1Profile)
      expect(migrated.surgeryHistory).toEqual([])
      expect(Array.isArray(migrated.surgeryHistory)).toBe(true)
    })

    it('adds foodBrand as an empty string', () => {
      const migrated = migrateProfile(v1Profile)
      expect(migrated.foodBrand).toBe('')
    })

    it('adds behavioralNotes as an empty array', () => {
      const migrated = migrateProfile(v1Profile)
      expect(migrated.behavioralNotes).toEqual([])
      expect(Array.isArray(migrated.behavioralNotes)).toBe(true)
    })

    it('adds location as an empty string', () => {
      const migrated = migrateProfile(v1Profile)
      expect(migrated.location).toBe('')
    })
  })

  // ---------------------------------------------------------------------------
  // Already v2 - no re-migration
  // ---------------------------------------------------------------------------
  describe('already v2 profile', () => {
    const v2Profile = {
      id: 'dog-2',
      name: 'Max',
      breed: 'Poodle',
      gender: 'male',
      weight: 15,
      weightUnit: 'kg',
      dateOfBirth: '2022-03-15',
      allergies: [],
      chronicConditions: ['Hip dysplasia'],
      medications: [{ name: 'Rimadyl', dosage: '25mg' }],
      vaccinations: [{ name: 'Rabies', date: '2025-06-01' }],
      dietType: 'wet',
      feedingSchedule: 'twice daily',
      schemaVersion: 2,
      isSpayedNeutered: true,
      activityLevel: 'high',
      livingEnvironment: 'outdoor',
      socialExposure: ['dog park', 'daycare'],
      surgeryHistory: [{ procedure: 'ACL repair', date: '2024-11-01' }],
      foodBrand: 'Royal Canin',
      behavioralNotes: ['Anxious during storms'],
      location: 'San Francisco, CA',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-06-01T00:00:00Z',
    }

    it('does not modify an already-v2 profile', () => {
      const migrated = migrateProfile(v2Profile)
      expect(migrated).toEqual(v2Profile)
    })

    it('preserves existing v2 field values without resetting to defaults', () => {
      const migrated = migrateProfile(v2Profile)
      expect(migrated.isSpayedNeutered).toBe(true)
      expect(migrated.activityLevel).toBe('high')
      expect(migrated.livingEnvironment).toBe('outdoor')
      expect(migrated.socialExposure).toEqual(['dog park', 'daycare'])
      expect(migrated.surgeryHistory).toHaveLength(1)
      expect(migrated.foodBrand).toBe('Royal Canin')
      expect(migrated.behavioralNotes).toEqual(['Anxious during storms'])
      expect(migrated.location).toBe('San Francisco, CA')
    })
  })

  // ---------------------------------------------------------------------------
  // Idempotency
  // ---------------------------------------------------------------------------
  describe('idempotent migration', () => {
    it('produces the same result when run twice on a v1 profile', () => {
      const v1Profile = {
        id: 'dog-1',
        name: 'Buddy',
        breed: 'Labrador Retriever',
        weight: 30,
        allergies: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }

      const firstPass = migrateProfile(v1Profile)
      const secondPass = migrateProfile(firstPass)

      expect(secondPass).toEqual(firstPass)
    })

    it('does not accumulate extra fields on repeated runs', () => {
      const v1Profile = {
        id: 'dog-1',
        name: 'Rocky',
        breed: 'Boxer',
        weight: 60,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }

      const first = migrateProfile(v1Profile)
      const second = migrateProfile(first)
      const third = migrateProfile(second)

      expect(Object.keys(third).sort()).toEqual(Object.keys(first).sort())
    })
  })

  // ---------------------------------------------------------------------------
  // Unknown version
  // ---------------------------------------------------------------------------
  describe('unknown schema version', () => {
    it('throws a clear error for an unrecognized version', () => {
      const futureProfile = {
        id: 'dog-1',
        name: 'Luna',
        schemaVersion: 99,
      }

      expect(() => migrateProfile(futureProfile)).toThrow()
    })

    it('includes the version number in the error message', () => {
      const futureProfile = {
        id: 'dog-1',
        name: 'Luna',
        schemaVersion: 42,
      }

      expect(() => migrateProfile(futureProfile)).toThrow(/42/)
    })
  })
})

// ---------------------------------------------------------------------------
// migrateAllProfiles
// ---------------------------------------------------------------------------
describe('migrateAllProfiles', () => {
  it('migrates an array of profiles', () => {
    const profiles = [
      { id: 'dog-1', name: 'Luna', breed: 'Beagle', weight: 20 },
      { id: 'dog-2', name: 'Max', breed: 'Poodle', weight: 15 },
    ]

    const migrated = migrateAllProfiles(profiles)

    expect(migrated).toHaveLength(2)
    expect(migrated[0].schemaVersion).toBe(2)
    expect(migrated[1].schemaVersion).toBe(2)
  })

  it('handles an empty array', () => {
    const migrated = migrateAllProfiles([])
    expect(migrated).toEqual([])
  })

  it('handles a mix of v1 and v2 profiles', () => {
    const profiles = [
      { id: 'dog-1', name: 'Luna', breed: 'Beagle', weight: 20 },
      {
        id: 'dog-2',
        name: 'Max',
        breed: 'Poodle',
        weight: 15,
        schemaVersion: 2,
        isSpayedNeutered: true,
        activityLevel: 'low',
        livingEnvironment: 'indoor',
        socialExposure: [],
        surgeryHistory: [],
        foodBrand: 'Purina',
        behavioralNotes: [],
        location: 'Austin, TX',
      },
    ]

    const migrated = migrateAllProfiles(profiles)

    // v1 should be migrated
    expect(migrated[0].schemaVersion).toBe(2)
    expect(migrated[0].isSpayedNeutered).toBe(false)

    // v2 should be untouched
    expect(migrated[1].isSpayedNeutered).toBe(true)
    expect(migrated[1].foodBrand).toBe('Purina')
  })
})

// ---------------------------------------------------------------------------
// computeProfileCompletion
// ---------------------------------------------------------------------------
describe('computeProfileCompletion', () => {
  it('returns 0 for a completely empty profile', () => {
    const profile = {}
    const pct = computeProfileCompletion(profile)
    expect(pct).toBe(0)
  })

  it('returns 100 for a fully filled profile', () => {
    const profile = {
      name: 'Luna',
      breed: 'Beagle',
      gender: 'female',
      weight: 20,
      dateOfBirth: '2023-05-10',
      allergies: ['Chicken'],
      chronicConditions: ['Arthritis'],
      medications: [{ name: 'Rimadyl' }],
      vaccinations: [{ name: 'Rabies' }],
      dietType: 'dry',
      feedingSchedule: 'twice daily',
      isSpayedNeutered: true,
      activityLevel: 'moderate',
      livingEnvironment: 'indoor',
      socialExposure: ['dog park'],
      surgeryHistory: [{ procedure: 'Spay' }],
      foodBrand: 'Royal Canin',
      behavioralNotes: ['Friendly'],
      location: 'New York, NY',
      photoUrl: 'https://example.com/luna.jpg',
    }

    const pct = computeProfileCompletion(profile)
    expect(pct).toBe(100)
  })

  it('returns a percentage between 0 and 100 for a partial profile', () => {
    const profile = {
      name: 'Luna',
      breed: 'Beagle',
      weight: 20,
    }

    const pct = computeProfileCompletion(profile)
    expect(pct).toBeGreaterThan(0)
    expect(pct).toBeLessThan(100)
  })

  it('returns a number (not NaN or undefined)', () => {
    const profile = { name: 'Luna' }
    const pct = computeProfileCompletion(profile)
    expect(typeof pct).toBe('number')
    expect(pct).not.toBeNaN()
  })

  it('increases as more fields are filled', () => {
    const minimal = { name: 'Luna' }
    const partial = { name: 'Luna', breed: 'Beagle', weight: 20 }
    const fuller = {
      name: 'Luna',
      breed: 'Beagle',
      weight: 20,
      gender: 'female',
      dateOfBirth: '2023-05-10',
      allergies: ['Chicken'],
      dietType: 'dry',
      activityLevel: 'moderate',
    }

    const pctMinimal = computeProfileCompletion(minimal)
    const pctPartial = computeProfileCompletion(partial)
    const pctFuller = computeProfileCompletion(fuller)

    expect(pctPartial).toBeGreaterThan(pctMinimal)
    expect(pctFuller).toBeGreaterThan(pctPartial)
  })

  it('treats empty arrays as unfilled', () => {
    const withEmpty = {
      name: 'Luna',
      allergies: [],
      medications: [],
      socialExposure: [],
    }

    const withFilled = {
      name: 'Luna',
      allergies: ['Chicken'],
      medications: [{ name: 'Rimadyl' }],
      socialExposure: ['dog park'],
    }

    const pctEmpty = computeProfileCompletion(withEmpty)
    const pctFilled = computeProfileCompletion(withFilled)

    expect(pctFilled).toBeGreaterThan(pctEmpty)
  })

  it('treats empty strings as unfilled', () => {
    const withEmpty = { name: 'Luna', foodBrand: '', location: '' }
    const withFilled = { name: 'Luna', foodBrand: 'Purina', location: 'NYC' }

    const pctEmpty = computeProfileCompletion(withEmpty)
    const pctFilled = computeProfileCompletion(withFilled)

    expect(pctFilled).toBeGreaterThan(pctEmpty)
  })
})
