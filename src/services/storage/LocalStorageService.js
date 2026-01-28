/**
 * LocalStorageService
 *
 * Synchronous wrapper around localStorage that provides typed, user-scoped
 * access to Pawsy domain objects (dogs, chat sessions, health events, etc.).
 *
 * All public methods are static so consumers can call them without
 * instantiating the class.
 */

import { migratePetFacts } from './migration.js'

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

function xraysKey(dogId) {
  return `pawsy_xrays_${dogId}`
}

function bloodWorkKey(dogId) {
  return `pawsy_bloodwork_${dogId}`
}

function clinicalProfileKey(dogId) {
  return `pawsy_clinical_profile_${dogId}`
}

function vetReportKey(dogId) {
  return `pawsy_vet_report_${dogId}`
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
    return sortByDescending(migratePetFacts(readArray(factsKey(dogId))), 'createdAt')
  }

  static savePetFact(dogId, fact) {
    const key = factsKey(dogId)
    const facts = readArray(key)
    facts.push(stamp({ pinned: false, ...fact }))
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

  static togglePinFact(dogId, factId) {
    const key = factsKey(dogId)
    const facts = readArray(key)
    const target = facts.find((f) => f.id === factId)
    if (!target) return { error: 'not_found' }

    const pinnedCount = facts.filter((f) => f.pinned && f.id !== factId).length
    if (!target.pinned && pinnedCount >= 20) return { error: 'pin_limit' }

    const updated = facts.map((f) =>
      f.id === factId
        ? { ...f, pinned: !f.pinned, pinnedAt: !f.pinned ? new Date().toISOString() : null, updatedAt: new Date().toISOString() }
        : f
    )
    writeArray(key, updated)
    return updated.find((f) => f.id === factId)
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

  static deletePhotoAnalysis(dogId, analysisId) {
    const key = photosKey(dogId)
    const analyses = readArray(key).filter((a) => a.id !== analysisId)
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

  // ---- X-Ray Analyses -----------------------------------------------------

  static getXrayAnalyses(dogId) {
    return sortByDescending(readArray(xraysKey(dogId)), 'createdAt')
  }

  static saveXrayAnalysis(dogId, analysis) {
    const key = xraysKey(dogId)
    const analyses = readArray(key)

    // Strip large base64 fields to conserve storage space
    const { base64Data: _b64, imageBase64: _img64, ...rest } = analysis
    analyses.push(stamp(rest))
    writeArray(key, analyses)
  }

  static deleteXrayAnalysis(dogId, analysisId) {
    const key = xraysKey(dogId)
    const analyses = readArray(key)
    writeArray(key, analyses.filter(a => a.id !== analysisId))
  }

  // ---- Blood Work Analyses ------------------------------------------------

  static getBloodWorkAnalyses(dogId) {
    return sortByDescending(readArray(bloodWorkKey(dogId)), 'createdAt')
  }

  static saveBloodWorkAnalysis(dogId, analysis) {
    const key = bloodWorkKey(dogId)
    const analyses = readArray(key)

    // Strip large base64 fields to conserve storage space
    const { base64Data: _b64, imageBase64: _img64, ...rest } = analysis
    analyses.push(stamp(rest))
    writeArray(key, analyses)
  }

  static deleteBloodWorkAnalysis(dogId, analysisId) {
    const key = bloodWorkKey(dogId)
    const analyses = readArray(key)
    writeArray(key, analyses.filter(a => a.id !== analysisId))
  }

  // ---- Clinical Profile -----------------------------------------------------

  static getClinicalProfile(dogId) {
    try {
      const raw = localStorage.getItem(clinicalProfileKey(dogId))
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  static saveClinicalProfile(dogId, profile) {
    localStorage.setItem(clinicalProfileKey(dogId), JSON.stringify({
      ...profile,
      savedAt: new Date().toISOString(),
    }))
  }

  static deleteClinicalProfile(dogId) {
    localStorage.removeItem(clinicalProfileKey(dogId))
  }

  // ---- Vet Reports ----------------------------------------------------------

  static getVetReport(dogId) {
    try {
      const raw = localStorage.getItem(vetReportKey(dogId))
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  static saveVetReport(dogId, report) {
    localStorage.setItem(vetReportKey(dogId), JSON.stringify({
      ...report,
      savedAt: new Date().toISOString(),
    }))
  }

  static deleteVetReport(dogId) {
    localStorage.removeItem(vetReportKey(dogId))
  }
}

export default LocalStorageService
