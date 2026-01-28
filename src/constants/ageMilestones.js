/**
 * Dog life-stage milestones with size-adjusted thresholds.
 *
 * Large/giant dogs age faster and enter senior/geriatric stages earlier.
 */

export const AGE_MILESTONES = [
  {
    stage: 'puppy',
    label: 'Puppy',
    defaultRange: { min: 0, max: 1 },
    description: 'Rapid growth, socialization, and foundational health.',
    screenings: [
      'Initial vaccination series',
      'Deworming schedule',
      'Spay/neuter consultation',
      'Baseline blood work',
    ],
  },
  {
    stage: 'young_adult',
    label: 'Young Adult',
    defaultRange: { min: 1, max: 3 },
    description: 'Physical maturity, establishing baseline health.',
    screenings: [
      'Annual wellness exam',
      'Dental check',
      'Heartworm test',
      'Fecal parasite test',
    ],
  },
  {
    stage: 'adult',
    label: 'Adult',
    defaultRange: { min: 3, max: 7 },
    largeRange: { min: 3, max: 5 },
    description: 'Maintenance phase with focus on prevention.',
    screenings: [
      'Annual wellness exam',
      'Dental cleaning',
      'Blood panel',
      'Weight management review',
    ],
  },
  {
    stage: 'senior',
    label: 'Senior',
    defaultRange: { min: 7, max: 10 },
    largeRange: { min: 5, max: 8 },
    description: 'Increased monitoring for age-related conditions.',
    screenings: [
      'Bi-annual wellness exams',
      'Senior blood panel',
      'Thyroid screening',
      'Joint/mobility assessment',
      'Eye examination',
      'Blood pressure check',
    ],
  },
  {
    stage: 'geriatric',
    label: 'Geriatric',
    defaultRange: { min: 10, max: 20 },
    largeRange: { min: 8, max: 20 },
    description: 'Intensive care with focus on comfort and quality of life.',
    screenings: [
      'Quarterly wellness exams',
      'Comprehensive blood work',
      'Urinalysis',
      'Cardiac evaluation',
      'Cancer screening',
      'Cognitive assessment',
      'Pain management review',
    ],
  },
]

const LARGE_SIZES = ['large', 'giant', 'extra-large', 'xl']

function isLargeSize(size) {
  if (!size) return false
  return LARGE_SIZES.includes(size.toLowerCase())
}

/**
 * Determine the current life stage for a dog.
 *
 * @param {number} ageYears - age in years (can be fractional)
 * @param {string} [size] - dog size category (e.g. 'small', 'medium', 'large', 'giant')
 * @returns {{ stage: string, label: string, description: string }} current life stage info
 */
export function getLifeStage(ageYears, size) {
  if (ageYears == null || ageYears < 0) {
    return { stage: 'unknown', label: 'Unknown', description: 'Age not available.' }
  }

  const useLargeRanges = isLargeSize(size)

  for (const milestone of AGE_MILESTONES) {
    const range = (useLargeRanges && milestone.largeRange) || milestone.defaultRange
    if (ageYears >= range.min && ageYears < range.max) {
      return {
        stage: milestone.stage,
        label: milestone.label,
        description: milestone.description,
      }
    }
  }

  // If age exceeds all ranges, return geriatric
  const last = AGE_MILESTONES[AGE_MILESTONES.length - 1]
  return {
    stage: last.stage,
    label: last.label,
    description: last.description,
  }
}

/**
 * Get recommended health screenings for a dog's age and size.
 *
 * @param {number} ageYears - age in years
 * @param {string} [size] - dog size category
 * @returns {string[]} list of recommended screenings
 */
export function getRecommendedScreenings(ageYears, size) {
  if (ageYears == null || ageYears < 0) return []

  const useLargeRanges = isLargeSize(size)

  for (const milestone of AGE_MILESTONES) {
    const range = (useLargeRanges && milestone.largeRange) || milestone.defaultRange
    if (ageYears >= range.min && ageYears < range.max) {
      return [...milestone.screenings]
    }
  }

  // Geriatric fallback
  const last = AGE_MILESTONES[AGE_MILESTONES.length - 1]
  return [...last.screenings]
}
