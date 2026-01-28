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
import LocalStorageService from '../storage/LocalStorageService.js'

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

function buildDiagnosticSummarySection(dogId, isPremium) {
  if (!dogId || !isPremium) return ''

  const lines = []
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get recent X-ray analyses
  const xrays = LocalStorageService.getXrayAnalyses(dogId) || []
  const recentXrays = xrays
    .filter((x) => x.createdAt && new Date(x.createdAt) >= thirtyDaysAgo)
    .slice(0, 3)

  if (recentXrays.length > 0) {
    lines.push('Recent X-ray Findings:')
    for (const xray of recentXrays) {
      const date = new Date(xray.createdAt).toLocaleDateString()
      const region = xray.body_region || 'unknown region'
      const impression = xray.overall_impression || 'unspecified'

      // Include key findings if abnormal
      if (impression !== 'normal' && xray.findings?.length > 0) {
        const abnormalFindings = xray.findings
          .filter((f) => f.significance !== 'normal')
          .slice(0, 2)
          .map((f) => `${f.structure}: ${f.observation}`)
        if (abnormalFindings.length > 0) {
          lines.push(`- ${region} X-ray (${date}): ${impression} - ${abnormalFindings.join('; ')}`)
        } else {
          lines.push(`- ${region} X-ray (${date}): ${impression}`)
        }
      } else {
        lines.push(`- ${region} X-ray (${date}): ${impression}`)
      }

      // Note follow-up recommendations
      if (xray.additional_views_recommended?.length > 0) {
        lines.push(`  Follow-up recommended: ${xray.additional_views_recommended.join(', ')}`)
      }
    }
  }

  // Get recent blood work analyses
  const bloodWork = LocalStorageService.getBloodWorkAnalyses(dogId) || []
  const recentBloodWork = bloodWork
    .filter((b) => b.createdAt && new Date(b.createdAt) >= thirtyDaysAgo)
    .slice(0, 3)

  if (recentBloodWork.length > 0) {
    lines.push(lines.length > 0 ? '' : '')
    lines.push('Recent Blood Work:')
    for (const panel of recentBloodWork) {
      const date = new Date(panel.createdAt).toLocaleDateString()
      const panelType = panel.detected_panel_type || 'blood work'
      const assessment = panel.overall_assessment || 'unspecified'

      // Include abnormal values
      const abnormalValues = (panel.values || [])
        .filter((v) => v.status !== 'normal')
        .slice(0, 3)

      if (abnormalValues.length > 0) {
        const abnormalSummary = abnormalValues
          .map((v) => `${v.name}: ${v.value}${v.unit ? ' ' + v.unit : ''} (${v.status})`)
          .join(', ')
        lines.push(`- ${panelType} (${date}): ${assessment} - ${abnormalSummary}`)
      } else {
        lines.push(`- ${panelType} (${date}): ${assessment}`)
      }

      // Note organ system concerns
      const concerningSystems = (panel.organ_system_summary || [])
        .filter((s) => s.status !== 'normal')
        .map((s) => s.system)
      if (concerningSystems.length > 0) {
        lines.push(`  Systems of concern: ${concerningSystems.join(', ')}`)
      }
    }
  }

  // Get recent lab analyses (generic)
  const labs = LocalStorageService.getLabAnalyses(dogId) || []
  const recentLabs = labs
    .filter((l) => l.createdAt && new Date(l.createdAt) >= thirtyDaysAgo)
    .filter((l) => l.lab_type !== 'xray' && l.lab_type !== 'blood_work') // Exclude already shown
    .slice(0, 2)

  if (recentLabs.length > 0) {
    lines.push(lines.length > 0 ? '' : '')
    lines.push('Other Recent Lab Results:')
    for (const lab of recentLabs) {
      const date = new Date(lab.createdAt).toLocaleDateString()
      const labType = lab.lab_type || 'lab test'
      const assessment = lab.overall_assessment || 'unspecified'

      const abnormalValues = (lab.values || [])
        .filter((v) => v.status !== 'normal')
        .slice(0, 2)

      if (abnormalValues.length > 0) {
        const summary = abnormalValues.map((v) => `${v.name}: ${v.status}`).join(', ')
        lines.push(`- ${labType} (${date}): ${assessment} - ${summary}`)
      } else {
        lines.push(`- ${labType} (${date}): ${assessment}`)
      }
    }
  }

  if (lines.length === 0) return ''

  return lines.filter(Boolean).join('\n')
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
  const diagnosticSection = buildDiagnosticSummarySection(dog?.id, isPremium)

  const p1Sections = [petFactsSection, photoSection, diagnosticSection].filter(Boolean)

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
