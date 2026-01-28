/**
 * Analysis Orchestrator
 *
 * Central service that coordinates the entire post-analysis pipeline.
 * Every analysis type (chat, photo, lab) flows through a unified pipeline:
 *
 *   1. Call the appropriate AI agent via geminiService
 *   2. Save result to storage (type-specific)
 *   3. Extract PetFacts (type-specific extraction)
 *   4. Save extracted facts
 *   5. Run alert engine
 *   6. Return result to the calling page
 */

import { geminiService } from '../api/gemini'
import LocalStorageService from '../storage/LocalStorageService'
import {
  extractFactsFromMetadata,
  extractFactsFromPhoto,
  extractFactsFromLab,
} from '../ai/factExtractor'
import { generateAlerts } from '../intelligence/alertEngine'
import { detectPatterns } from '../intelligence/patternDetector'

// ---------------------------------------------------------------------------
// Internal pipeline
// ---------------------------------------------------------------------------

function runAlertCheck(dog) {
  const petFacts = LocalStorageService.getPetFacts(dog.id)
  const existingAlerts = LocalStorageService.getAlerts(dog.id)
  const patterns = detectPatterns(petFacts)

  const newAlerts = generateAlerts({
    dog,
    petFacts,
    patterns,
    existingAlerts,
  })

  for (const alert of newAlerts) {
    LocalStorageService.saveAlert(dog.id, alert)
  }
}

/**
 * Save facts and return the saved facts (with generated IDs).
 */
function saveFacts(dogId, facts) {
  const before = LocalStorageService.getPetFacts(dogId)
  const beforeIds = new Set(before.map((f) => f.id))

  for (const fact of facts) {
    LocalStorageService.savePetFact(dogId, fact)
  }

  const after = LocalStorageService.getPetFacts(dogId)
  return after.filter((f) => !beforeIds.has(f.id))
}

/**
 * Check if any newly saved fact qualifies for a pin suggestion.
 * Returns a suggestion object for moderate+ severity unpinned facts.
 */
function buildPinSuggestion(savedFacts) {
  const candidate = savedFacts.find(
    (f) => !f.pinned && ['moderate', 'severe'].includes(f.severity)
  )
  if (!candidate) return null
  return {
    factId: candidate.id,
    message: 'This seems important. Want me to always remember this?',
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run chat analysis through the full pipeline.
 *
 * @param {object} dog - dog profile
 * @param {string} message - user message
 * @param {Array} history - chat history
 * @param {object|null} photoContext - photo analysis context
 * @param {Array} healthEvents - health events
 * @param {boolean} isPremium - premium status
 * @returns {object} AI response
 */
export async function runChatAnalysis(dog, message, history, photoContext, healthEvents, isPremium) {
  const result = await geminiService.chat(dog, message, history, photoContext, healthEvents, isPremium)

  if (result.error) return result

  // Extract and save facts
  if (dog?.id) {
    const metadata = {
      symptoms_mentioned: result.symptoms_mentioned || [],
      possible_conditions: result.possible_conditions || [],
      urgency_level: result.urgency_level || 'low',
      recommended_actions: result.recommended_actions || [],
      should_see_vet: result.should_see_vet || false,
    }
    const facts = extractFactsFromMetadata(metadata, dog.id, 'chat', result.messageId || crypto.randomUUID())
    const savedFacts = saveFacts(dog.id, facts)
    runAlertCheck(dog)

    const pinSuggestion = buildPinSuggestion(savedFacts)
    if (pinSuggestion) {
      result.pinSuggestion = pinSuggestion
    }
  }

  return result
}

/**
 * Run photo analysis through the full pipeline.
 *
 * @param {object} dog - dog profile
 * @param {string} imageBase64 - base64-encoded image
 * @param {string} mimeType - image MIME type
 * @param {string} bodyArea - body area label
 * @param {string} description - owner description
 * @returns {object} photo analysis result
 */
export async function runPhotoAnalysis(dog, imageBase64, mimeType, bodyArea, description) {
  const result = await geminiService.analyzePhoto(imageBase64, mimeType, dog, bodyArea, description)

  if (result.error) return result

  // Save to storage
  if (dog?.id) {
    LocalStorageService.savePhotoAnalysis(dog.id, {
      ...result,
      bodyArea,
      body_area: bodyArea,
      description,
    })

    // Extract and save facts
    const facts = extractFactsFromPhoto(result, dog.id)
    saveFacts(dog.id, facts)
    runAlertCheck(dog)
  }

  return result
}

/**
 * Run lab analysis through the full pipeline.
 *
 * @param {object} dog - dog profile
 * @param {string} imageBase64 - base64-encoded image
 * @param {string} mimeType - image MIME type
 * @param {string} labType - lab type label
 * @param {string} notes - additional notes
 * @returns {object} lab analysis result
 */
export async function runLabAnalysis(dog, imageBase64, mimeType, labType, notes) {
  const result = await geminiService.analyzeLab(imageBase64, mimeType, dog, labType, notes)

  if (result.error) return result

  // Save to storage
  if (dog?.id) {
    LocalStorageService.saveLabAnalysis(dog.id, {
      ...result,
      labType,
      notes,
    })

    // Extract and save facts
    const facts = extractFactsFromLab(result, dog.id)
    saveFacts(dog.id, facts)
    runAlertCheck(dog)
  }

  return result
}
