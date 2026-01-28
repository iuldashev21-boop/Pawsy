/**
 * Priority-based AI context assembly with token budgeting.
 *
 * Priority levels:
 *   P0 (never dropped): base prompt, dog profile, allergy protocol, medications/conditions (premium)
 *   P1: top 10 PetFacts, photo context, conversation summaries (premium)
 *   P2: breed/age risk alerts (premium), symptom patterns (premium)
 *   P3: household context (premium)
 *
 * Token budget: ~2000 words. Drop P3 first, then P2, then P1. P0 is never dropped.
 */

import { buildSystemPrompt } from '../prompts/chatPrompts.js'
import { getTopFacts } from './healthEventScoring.js'

// Rough token budget in words
const TOKEN_BUDGET_WORDS = 2000

function estimateWordCount(text) {
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildDogProfileSection(dog) {
  if (!dog) return ''
  const parts = [`Dog: ${dog.name || 'Unknown'}`]
  if (dog.breed) parts.push(`Breed: ${dog.breed}`)
  if (dog.weight) parts.push(`Weight: ${dog.weight} ${dog.weightUnit || 'lbs'}`)
  if (dog.dateOfBirth) parts.push(`DOB: ${dog.dateOfBirth}`)
  if (dog.sex || dog.gender) parts.push(`Sex: ${dog.sex || dog.gender}`)
  return parts.join('\n')
}

function buildAllergySection(dog) {
  if (!dog?.allergies || dog.allergies.length === 0) return ''
  return `ALLERGIES (critical): ${dog.allergies.join(', ')}`
}

function buildMedicationsSection(dog) {
  if (!dog?.medications || dog.medications.length === 0) return ''
  return `Current Medications: ${dog.medications.map(m => typeof m === 'string' ? m : `${m.name} (${m.dosage || 'dosage unknown'})`).join(', ')}`
}

function buildConditionsSection(dog) {
  if (!dog?.conditions && !dog?.chronicConditions) return ''
  const conds = dog.conditions || dog.chronicConditions || []
  if (conds.length === 0) return ''
  return `Known Conditions: ${conds.join(', ')}`
}

function buildPetFactsSection(petFacts, conversationTags, isPremium) {
  if (!petFacts || petFacts.length === 0) return ''

  const top = getTopFacts(petFacts, conversationTags, 10)
  if (top.length === 0) return ''

  const lines = ['Recent Health Facts:']
  for (const fact of top) {
    if (isPremium) {
      lines.push(`- [${fact.severity}] ${fact.fact} (${fact.category}, tags: ${(fact.tags || []).join(', ')})`)
    } else {
      lines.push(`- ${fact.fact}`)
    }
  }
  return lines.join('\n')
}

function buildPhotoContextSection(photoContext) {
  if (!photoContext) return ''
  const parts = ['Photo Analysis Context:']
  if (photoContext.summary) parts.push(`Summary: ${photoContext.summary}`)
  if (photoContext.body_area) parts.push(`Body area: ${photoContext.body_area}`)
  if (photoContext.urgency_level) parts.push(`Urgency: ${photoContext.urgency_level}`)
  if (photoContext.possible_conditions?.length > 0) {
    parts.push(`Possible conditions: ${photoContext.possible_conditions.join(', ')}`)
  }
  return parts.join('\n')
}

function buildBreedRiskSection(dog) {
  // Lightweight inline check -- full breed data lives in constants/breedHealthRisks
  if (!dog?.breed) return ''
  return `Breed-specific monitoring: Consider common ${dog.breed} health risks for this dog's age.`
}

function buildSymptomPatternsSection(petFacts) {
  if (!petFacts || petFacts.length < 2) return ''
  const tagCounts = {}
  for (const fact of petFacts) {
    for (const tag of (fact.tags || [])) {
      const lower = tag.toLowerCase()
      tagCounts[lower] = (tagCounts[lower] || 0) + 1
    }
  }
  const recurring = Object.entries(tagCounts)
    .filter(([, count]) => count >= 2)
    .map(([tag, count]) => `${tag} (${count}x)`)
  if (recurring.length === 0) return ''
  return `Recurring symptom patterns: ${recurring.join(', ')}`
}

function buildHouseholdSection() {
  // Placeholder for future household context (multi-pet, environment, etc.)
  return ''
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

/**
 * Build prioritized AI context with token budgeting.
 *
 * @param {object} params
 * @param {object} params.dog - dog profile
 * @param {Array}  params.petFacts - PetFact objects
 * @param {boolean} params.isPremium
 * @param {string[]} params.conversationTags
 * @param {object} params.photoContext
 * @returns {{ systemPrompt: string, contextSections: object }}
 */
export function buildAIContext({
  dog,
  petFacts = [],
  isPremium = false,
  conversationTags = [],
  photoContext = null,
} = {}) {
  // -- P0: always included ------------------------------------------------
  const basePrompt = buildSystemPrompt(dog)
  const dogProfile = buildDogProfileSection(dog)
  const allergyProtocol = buildAllergySection(dog)
  const medications = isPremium ? buildMedicationsSection(dog) : ''
  const conditions = isPremium ? buildConditionsSection(dog) : ''

  const p0Sections = [basePrompt, dogProfile, allergyProtocol, medications, conditions]
    .filter(Boolean)

  // -- P1 ------------------------------------------------------------------
  const petFactsSection = buildPetFactsSection(petFacts, conversationTags, isPremium)
  const photoSection = buildPhotoContextSection(photoContext)

  const p1Sections = [petFactsSection, photoSection].filter(Boolean)

  // -- P2 (premium only) ---------------------------------------------------
  const breedRisk = isPremium ? buildBreedRiskSection(dog) : ''
  const patterns = isPremium ? buildSymptomPatternsSection(petFacts) : ''

  const p2Sections = [breedRisk, patterns].filter(Boolean)

  // -- P3 (premium only) ---------------------------------------------------
  const household = isPremium ? buildHouseholdSection() : ''

  const p3Sections = [household].filter(Boolean)

  // -- Budget check --------------------------------------------------------
  const allText = (priority) => priority.join('\n\n')

  let includedP1 = p1Sections
  let includedP2 = p2Sections
  let includedP3 = p3Sections

  const totalWords = () =>
    estimateWordCount(allText(p0Sections)) +
    estimateWordCount(allText(includedP1)) +
    estimateWordCount(allText(includedP2)) +
    estimateWordCount(allText(includedP3))

  // Drop P3 first
  if (totalWords() > TOKEN_BUDGET_WORDS) {
    includedP3 = []
  }

  // Drop P2 next
  if (totalWords() > TOKEN_BUDGET_WORDS) {
    includedP2 = []
  }

  // Drop P1 last
  if (totalWords() > TOKEN_BUDGET_WORDS) {
    includedP1 = []
  }

  // P0 is never dropped

  // -- Assemble final prompt -----------------------------------------------
  const systemPrompt = [
    ...p0Sections,
    ...includedP1,
    ...includedP2,
    ...includedP3,
  ].join('\n\n')

  return {
    systemPrompt,
    contextSections: {
      p0: p0Sections,
      p1: includedP1,
      p2: includedP2,
      p3: includedP3,
    },
  }
}
