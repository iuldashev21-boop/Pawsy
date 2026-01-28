/**
 * Profile migration utilities.
 *
 * Handles schema upgrades for dog profile objects stored in localStorage.
 * Each profile carries a `schemaVersion` number; profiles without one are
 * treated as v1 and upgraded to the latest version.
 */

const CURRENT_VERSION = 2

// Fields checked by computeProfileCompletion and their "filled" predicate.
const COMPLETION_FIELDS = [
  { key: 'name', check: (v) => typeof v === 'string' && v.length > 0 },
  { key: 'breed', check: (v) => typeof v === 'string' && v.length > 0 },
  { key: 'dateOfBirth', check: (v) => typeof v === 'string' && v.length > 0 },
  { key: 'weight', check: (v) => v != null && v !== '' },
  { key: 'allergies', check: (v) => Array.isArray(v) && v.length > 0 },
  { key: 'chronicConditions', check: (v) => Array.isArray(v) && v.length > 0 },
  { key: 'medications', check: (v) => Array.isArray(v) && v.length > 0 },
  { key: 'vaccinations', check: (v) => Array.isArray(v) && v.length > 0 },
  { key: 'isSpayedNeutered', check: (v) => !!v },
  { key: 'activityLevel', check: (v) => typeof v === 'string' && v.length > 0 },
  { key: 'livingEnvironment', check: (v) => typeof v === 'string' && v.length > 0 },
  { key: 'foodBrand', check: (v) => typeof v === 'string' && v.length > 0 },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute a 0-100 profile-completion percentage based on how many of the
 * known completion fields are filled in.
 */
export function computeProfileCompletion(profile) {
  const filled = COMPLETION_FIELDS.filter((f) => f.check(profile[f.key])).length
  return Math.round((filled / COMPLETION_FIELDS.length) * 100)
}

/**
 * Migrate a single dog profile to the latest schema version.
 *
 * - v1 (no schemaVersion) -> v2
 * - v2 -> returned as-is
 * - Unknown future version -> throws
 */
export function migrateProfile(profile) {
  const version = profile.schemaVersion

  // Already current -- return unchanged
  if (version === CURRENT_VERSION) {
    return profile
  }

  // Unknown future version
  if (version != null && version > CURRENT_VERSION) {
    throw new Error(
      `Unknown profile schema version: ${version}. ` +
        `Expected version ${CURRENT_VERSION} or lower.`
    )
  }

  // v1 -> v2 migration (version is undefined or 1)
  const v2Defaults = {
    isSpayedNeutered: false,
    chronicConditions: [],
    medications: [],
    vaccinations: [],
    activityLevel: 'moderate',
    livingEnvironment: 'indoor',
    socialExposure: [],
    surgeryHistory: [],
    foodBrand: '',
    behavioralNotes: [],
    location: '',
  }

  const migrated = {
    ...v2Defaults,
    ...profile,
    schemaVersion: CURRENT_VERSION,
  }

  migrated.profileCompletionPct = computeProfileCompletion(migrated)

  return migrated
}

/**
 * Migrate an array of profiles, applying migrateProfile to each.
 */
export function migrateAllProfiles(profiles) {
  return profiles.map(migrateProfile)
}

/**
 * Migrate an array of PetFacts, backfilling `pinned: false` on any fact
 * that is missing the field.
 *
 * @param {Array} facts - PetFact objects
 * @returns {Array} facts with `pinned` guaranteed
 */
export function migratePetFacts(facts) {
  if (!Array.isArray(facts)) return []
  return facts.map((f) => ({ ...f, pinned: f.pinned ?? false }))
}
