/**
 * LocalStorageService
 *
 * Synchronous wrapper around localStorage that provides typed, user-scoped
 * access to Pawsy domain objects (dogs, chat sessions, health events, etc.).
 *
 * All public methods are static so consumers can call them without
 * instantiating the class.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readArray(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr))
}

function stamp(item) {
  const now = new Date().toISOString()
  return {
    ...item,
    id: item.id ?? crypto.randomUUID(),
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? now,
  }
}

function sortByDescending(arr, field) {
  return [...arr].sort(
    (a, b) => new Date(b[field]).getTime() - new Date(a[field]).getTime()
  )
}

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

function dogsKey(userId) {
  return `pawsy_${userId}_dogs`
}

function chatSessionsKey(userId) {
  return `pawsy_${userId}_chat_sessions`
}

function healthEventsKey(userId) {
  return `pawsy_${userId}_health_events`
}

function factsKey(dogId) {
  return `pawsy_facts_${dogId}`
}

function photosKey(dogId) {
  return `pawsy_photos_${dogId}`
}

function alertsKey(dogId) {
  return `pawsy_alerts_${dogId}`
}

function labsKey(dogId) {
  return `pawsy_labs_${dogId}`
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class LocalStorageService {
  // ---- Dogs ---------------------------------------------------------------

  static getDogs(userId) {
    return readArray(dogsKey(userId))
  }

  static saveDog(userId, dog) {
    const key = dogsKey(userId)
    const dogs = readArray(key)
    dogs.push(stamp(dog))
    writeArray(key, dogs)
  }

  static getDog(userId, dogId) {
    return this.getDogs(userId).find((d) => d.id === dogId)
  }

  static updateDog(userId, dogId, updates) {
    const key = dogsKey(userId)
    const dogs = readArray(key)
    const idx = dogs.findIndex((d) => d.id === dogId)
    if (idx === -1) return
    dogs[idx] = { ...dogs[idx], ...updates, updatedAt: new Date().toISOString() }
    writeArray(key, dogs)
  }

  static deleteDog(userId, dogId) {
    const key = dogsKey(userId)
    const dogs = readArray(key).filter((d) => d.id !== dogId)
    writeArray(key, dogs)
  }

  // ---- Pet Facts ----------------------------------------------------------

  static getPetFacts(dogId) {
    return sortByDescending(readArray(factsKey(dogId)), 'createdAt')
  }

  static savePetFact(dogId, fact) {
    const key = factsKey(dogId)
    const facts = readArray(key)
    facts.push(stamp(fact))
    writeArray(key, facts)
  }

  static updatePetFact(dogId, factId, updates) {
    const key = factsKey(dogId)
    const facts = readArray(key)
    const idx = facts.findIndex((f) => f.id === factId)
    if (idx === -1) return
    facts[idx] = { ...facts[idx], ...updates, updatedAt: new Date().toISOString() }
    writeArray(key, facts)
  }

  // ---- Chat Sessions ------------------------------------------------------

  static getChatSessions(userId) {
    return sortByDescending(readArray(chatSessionsKey(userId)), 'updatedAt')
  }

  static saveChatSession(userId, session) {
    const key = chatSessionsKey(userId)
    const sessions = readArray(key)
    sessions.push(stamp(session))
    writeArray(key, sessions)
  }

  // ---- Health Events ------------------------------------------------------

  static getHealthEvents(userId) {
    return readArray(healthEventsKey(userId))
  }

  static saveHealthEvent(userId, event) {
    const key = healthEventsKey(userId)
    const events = readArray(key)
    events.push(stamp(event))
    writeArray(key, events)
  }

  // ---- Photo Analyses -----------------------------------------------------

  static getPhotoAnalyses(dogId) {
    return sortByDescending(readArray(photosKey(dogId)), 'createdAt')
  }

  static savePhotoAnalysis(dogId, analysis) {
    const key = photosKey(dogId)
    const analyses = readArray(key)

    // Strip large base64 fields to conserve storage space
    const { base64Data: _b64, imageBase64: _img64, ...rest } = analysis
    analyses.push(stamp(rest))
    writeArray(key, analyses)
  }

  // ---- Alerts -------------------------------------------------------------

  static getAlerts(dogId) {
    return readArray(alertsKey(dogId))
  }

  static saveAlert(dogId, alert) {
    const key = alertsKey(dogId)
    const alerts = readArray(key)
    alerts.push(stamp(alert))
    writeArray(key, alerts)
  }

  static updateAlert(dogId, alertId, updates) {
    const key = alertsKey(dogId)
    const alerts = readArray(key)
    const idx = alerts.findIndex((a) => a.id === alertId)
    if (idx === -1) return
    alerts[idx] = { ...alerts[idx], ...updates, updatedAt: new Date().toISOString() }
    writeArray(key, alerts)
  }

  // ---- Lab Analyses -------------------------------------------------------

  static getLabAnalyses(dogId) {
    return sortByDescending(readArray(labsKey(dogId)), 'createdAt')
  }

  static saveLabAnalysis(dogId, analysis) {
    const key = labsKey(dogId)
    const analyses = readArray(key)

    // Strip large base64 fields to conserve storage space
    const { base64Data: _b64, imageBase64: _img64, ...rest } = analysis
    analyses.push(stamp(rest))
    writeArray(key, analyses)
  }
}

export default LocalStorageService
