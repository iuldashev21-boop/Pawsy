/**
 * Agent C -- PetFact extraction from AI response metadata.
 *
 * Converts structured Gemini chat/photo response metadata into PetFact
 * objects that can be persisted and scored for future context injection.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Simple fallback (test environments, older runtimes)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const SEVERITY_MAP = {
  emergency: 'severe',
  urgent: 'severe',
  moderate: 'moderate',
  low: 'mild',
  none: 'mild',
}

function mapSeverity(urgencyLevel) {
  if (!urgencyLevel) return 'mild'
  return SEVERITY_MAP[urgencyLevel.toLowerCase()] || 'mild'
}

function nowISO() {
  return new Date().toISOString()
}

// ---------------------------------------------------------------------------
// Per-message extraction
// ---------------------------------------------------------------------------

/**
 * Extract PetFacts from a single Gemini structured response metadata object.
 *
 * @param {object} metadata - parsed Gemini response (symptoms_mentioned, urgency_level, etc.)
 * @param {string} dogId
 * @param {string} sessionId
 * @param {string} messageId
 * @returns {Array} array of PetFact objects
 */
export function extractFactsFromMetadata(metadata, dogId, sessionId, messageId) {
  if (!metadata) return []

  const facts = []
  const severity = mapSeverity(metadata.urgency_level)
  const now = nowISO()

  const symptoms = metadata.symptoms_mentioned
  const conditions = metadata.possible_conditions
  const actions = metadata.recommended_actions

  // Extract symptom facts
  if (Array.isArray(symptoms) && symptoms.length > 0) {
    for (const symptom of symptoms) {
      facts.push({
        id: generateId(),
        dogId,
        fact: symptom,
        category: 'symptom',
        tags: [symptom.toLowerCase()],
        severity,
        status: 'active',
        occurredAt: now,
        source: { type: 'chat', sessionId, messageId },
        possibleConditions: Array.isArray(conditions) ? [...conditions] : [],
        recommendedActions: Array.isArray(actions) ? [...actions] : [],
        resolvedAt: null,
        createdAt: now,
      })
    }
  }

  // Extract condition facts
  if (Array.isArray(conditions) && conditions.length > 0 && (!symptoms || symptoms.length === 0)) {
    for (const condition of conditions) {
      facts.push({
        id: generateId(),
        dogId,
        fact: condition,
        category: 'condition',
        tags: [condition.toLowerCase()],
        severity,
        status: 'active',
        occurredAt: now,
        source: { type: 'chat', sessionId, messageId },
        possibleConditions: [condition],
        recommendedActions: Array.isArray(actions) ? [...actions] : [],
        resolvedAt: null,
        createdAt: now,
      })
    }
  }

  return facts
}

// ---------------------------------------------------------------------------
// End-of-session deep extraction
// ---------------------------------------------------------------------------

/**
 * Deep extraction: process all messages in a session to produce consolidated
 * PetFacts. For now this iterates existing message metadata rather than
 * making an additional Gemini call.
 *
 * @param {Array} messages - array of message objects with `.metadata`
 * @param {string} dogId
 * @param {string} sessionId
 * @returns {Array} deduplicated PetFact array
 */
export function extractFactsDeep(messages, dogId, sessionId) {
  if (!Array.isArray(messages) || messages.length === 0) return []

  const allFacts = []

  for (const msg of messages) {
    if (!msg.metadata) continue
    const msgFacts = extractFactsFromMetadata(
      msg.metadata,
      dogId,
      sessionId,
      msg.id || msg.messageId || generateId()
    )

    // Attach timestamp from the message when available
    for (const fact of msgFacts) {
      if (msg.timestamp || msg.createdAt) {
        fact.occurredAt = msg.timestamp || msg.createdAt
      }
    }

    allFacts.push(...msgFacts)
  }

  // Deduplicate within the session
  return deduplicateFacts(allFacts, [])
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Deduplicate facts: if a new fact has the same primary tag as an existing
 * fact and both occurred within 24 hours, keep only the most recent one
 * (update rather than create).
 *
 * @param {Array} newFacts - facts to add
 * @param {Array} existingFacts - facts already stored
 * @returns {Array} merged fact list (existing updated + truly new facts)
 */
// ---------------------------------------------------------------------------
// Photo extraction (NEW — Phase 2)
// ---------------------------------------------------------------------------

/**
 * Extract PetFacts from photo analysis result.
 *
 * @param {object} photoResult - parsed photo analysis response
 * @param {string} dogId
 * @returns {Array} array of PetFact objects
 */
export function extractFactsFromPhoto(photoResult, dogId) {
  if (!photoResult) return []

  const facts = []
  const severity = mapSeverity(photoResult.urgency_level)
  const now = nowISO()

  const symptoms = photoResult.visible_symptoms
  const conditions = photoResult.possible_conditions
  const actions = photoResult.recommended_actions
  const bodyArea = photoResult.body_area

  // Build base tags (include body area if present)
  const baseTags = bodyArea ? [bodyArea.toLowerCase()] : []

  // Extract symptom facts
  if (Array.isArray(symptoms) && symptoms.length > 0) {
    for (const symptom of symptoms) {
      facts.push({
        id: generateId(),
        dogId,
        fact: symptom,
        category: 'symptom',
        tags: [symptom.toLowerCase(), ...baseTags],
        severity,
        status: 'active',
        occurredAt: now,
        source: { type: 'photo' },
        possibleConditions: Array.isArray(conditions) ? [...conditions] : [],
        recommendedActions: Array.isArray(actions) ? [...actions] : [],
        resolvedAt: null,
        createdAt: now,
      })
    }
  }

  // Extract condition facts if no symptoms
  if (facts.length === 0 && Array.isArray(conditions) && conditions.length > 0) {
    for (const condition of conditions) {
      facts.push({
        id: generateId(),
        dogId,
        fact: condition,
        category: 'condition',
        tags: [condition.toLowerCase(), ...baseTags],
        severity,
        status: 'active',
        occurredAt: now,
        source: { type: 'photo' },
        possibleConditions: [condition],
        recommendedActions: Array.isArray(actions) ? [...actions] : [],
        resolvedAt: null,
        createdAt: now,
      })
    }
  }

  return facts
}

// ---------------------------------------------------------------------------
// Lab extraction (NEW — Phase 2)
// ---------------------------------------------------------------------------

const LAB_ASSESSMENT_SEVERITY_MAP = {
  concerning: 'severe',
  needs_attention: 'moderate',
  normal: 'mild',
}

function mapLabSeverity(assessment) {
  if (!assessment) return 'moderate'
  return LAB_ASSESSMENT_SEVERITY_MAP[assessment.toLowerCase()] || 'moderate'
}

/**
 * Extract PetFacts from lab analysis result.
 *
 * @param {object} labResult - parsed lab analysis response
 * @param {string} dogId
 * @returns {Array} array of PetFact objects
 */
export function extractFactsFromLab(labResult, dogId) {
  if (!labResult) return []

  const facts = []
  const severity = mapLabSeverity(labResult.overall_assessment)
  const now = nowISO()

  const values = labResult.values
  const conditions = labResult.possible_conditions
  const actions = labResult.recommended_actions

  // Extract facts from abnormal lab values
  if (Array.isArray(values)) {
    for (const value of values) {
      if (value.status === 'normal') continue

      const markerName = value.name || 'Unknown marker'
      const interpretation = value.interpretation || `${markerName} is ${value.status}`

      facts.push({
        id: generateId(),
        dogId,
        fact: `${markerName}: ${value.value} (${value.status}) - ${interpretation}`,
        category: 'lab_result',
        tags: [markerName.toLowerCase(), value.status],
        severity,
        status: 'active',
        occurredAt: now,
        source: { type: 'lab' },
        possibleConditions: Array.isArray(conditions) ? [...conditions] : [],
        recommendedActions: Array.isArray(actions) ? [...actions] : [],
        resolvedAt: null,
        createdAt: now,
        labValue: {
          name: markerName,
          value: value.value,
          unit: value.unit,
          referenceRange: value.reference_range,
          status: value.status,
        },
      })
    }
  }

  return facts
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

export function deduplicateFacts(newFacts, existingFacts) {
  if (!Array.isArray(newFacts) || newFacts.length === 0) {
    return Array.isArray(existingFacts) ? [...existingFacts] : []
  }

  const existing = Array.isArray(existingFacts) ? [...existingFacts] : []
  const result = [...existing]

  for (const newFact of newFacts) {
    const primaryTag = newFact.tags?.[0]?.toLowerCase()
    if (!primaryTag) {
      result.push(newFact)
      continue
    }

    const newTime = new Date(newFact.occurredAt || newFact.createdAt).getTime()

    // Check against both existing facts and already-added new facts
    let duplicateIndex = -1
    for (let i = 0; i < result.length; i++) {
      const existingTag = result[i].tags?.[0]?.toLowerCase()
      if (existingTag !== primaryTag) continue
      if (result[i].category !== newFact.category) continue

      const existingTime = new Date(result[i].occurredAt || result[i].createdAt).getTime()
      if (Math.abs(newTime - existingTime) < DEDUP_WINDOW_MS) {
        duplicateIndex = i
        break
      }
    }

    if (duplicateIndex >= 0) {
      // Update the existing fact with newer data if the new one is more recent
      const existingTime = new Date(result[duplicateIndex].occurredAt || result[duplicateIndex].createdAt).getTime()
      if (newTime >= existingTime) {
        result[duplicateIndex] = {
          ...result[duplicateIndex],
          severity: newFact.severity,
          possibleConditions: newFact.possibleConditions,
          recommendedActions: newFact.recommendedActions,
          occurredAt: newFact.occurredAt,
        }
      }
    } else {
      result.push(newFact)
    }
  }

  return result
}
