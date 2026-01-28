/**
 * Alert Engine
 *
 * Rule-based alert generation for dog health monitoring.
 * Produces alerts from breed risks, symptom patterns, vaccination
 * schedules, and weight trends. Supports deduplication, dismissal,
 * and snoozing.
 */

import { getBreedRisks } from '../../constants/breedHealthRisks.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 }

function priorityRank(p) {
  return PRIORITY_ORDER[p] || 0
}

function severityToPriority(severity) {
  if (severity === 'high' || severity === 'critical') return 'high'
  if (severity === 'moderate') return 'medium'
  return 'low'
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'alert-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

function getDogAgeYears(dog) {
  if (dog.ageYears != null) return dog.ageYears
  if (dog.age != null && typeof dog.age === 'number') return dog.age

  if (dog.dateOfBirth) {
    const dob = new Date(dog.dateOfBirth)
    const now = new Date()
    const diff = now.getTime() - dob.getTime()
    return diff / (365.25 * 24 * 60 * 60 * 1000)
  }

  return null
}

function isDuplicate(existingAlerts, type, metadataKey) {
  if (!existingAlerts || existingAlerts.length === 0) return false

  return existingAlerts.some((alert) => {
    if (alert.type !== type) return false
    if (alert.status === 'dismissed') return false

    // Check snooze expiry
    if (alert.status === 'snoozed' && alert.snoozeUntil) {
      const snoozedUntil = new Date(alert.snoozeUntil)
      if (snoozedUntil > new Date()) return true
    }

    if (alert.metadata?.key === metadataKey) return true
    return false
  })
}

// ---------------------------------------------------------------------------
// Rule: Breed Risk
// ---------------------------------------------------------------------------

function generateBreedRiskAlerts(dog, existingAlerts) {
  const alerts = []
  const breed = dog.breed
  if (!breed) return alerts

  const ageYears = getDogAgeYears(dog)
  if (ageYears == null) return alerts

  const risks = getBreedRisks(breed)

  for (const risk of risks) {
    const { name, ageRangeYears, severity, description } = risk

    if (ageYears < ageRangeYears.min || ageYears > ageRangeYears.max) continue

    const metadataKey = `breed_risk:${name}`
    if (isDuplicate(existingAlerts, 'breed_risk', metadataKey)) continue

    alerts.push({
      id: makeId(),
      dogId: dog.id,
      type: 'breed_risk',
      title: `${name} Risk`,
      message: `${breed} dogs aged ${ageRangeYears.min}-${ageRangeYears.max} years are at risk for ${name.toLowerCase()}. ${description}`,
      priority: severityToPriority(severity),
      status: 'active',
      metadata: {
        key: metadataKey,
        conditionName: name,
        breed,
        severity,
        ageRange: ageRangeYears,
      },
      createdAt: new Date().toISOString(),
    })
  }

  return alerts
}

// ---------------------------------------------------------------------------
// Rule: Symptom Pattern
// ---------------------------------------------------------------------------

function generateSymptomPatternAlerts(dog, patterns, existingAlerts) {
  const alerts = []
  if (!patterns || patterns.length === 0) return alerts

  for (const pattern of patterns) {
    const metadataKey = `symptom_pattern:${pattern.tag}`
    if (isDuplicate(existingAlerts, 'symptom_pattern', metadataKey)) continue

    alerts.push({
      id: makeId(),
      dogId: dog.id,
      type: 'symptom_pattern',
      title: `Recurring: ${pattern.tag}`,
      message: pattern.description || `"${pattern.tag}" has occurred ${pattern.count} times recently.`,
      priority: severityToPriority(pattern.severity || 'moderate'),
      status: 'active',
      metadata: {
        key: metadataKey,
        tag: pattern.tag,
        count: pattern.count,
        severity: pattern.severity,
        firstSeen: pattern.firstSeen,
        lastSeen: pattern.lastSeen,
        factIds: pattern.factIds,
      },
      createdAt: new Date().toISOString(),
    })
  }

  return alerts
}

// ---------------------------------------------------------------------------
// Rule: Vaccination Due
// ---------------------------------------------------------------------------

function generateVaccinationAlerts(dog, existingAlerts) {
  const alerts = []
  const vaccinations = dog.vaccinations
  if (!vaccinations || vaccinations.length === 0) return alerts

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  for (const vax of vaccinations) {
    const nextDue = vax.nextDueDate ? new Date(vax.nextDueDate) : null
    if (!nextDue) continue

    // Only alert if due within the next 30 days (and not already past)
    if (nextDue > thirtyDaysFromNow) continue

    const vacName = vax.name || 'Vaccination'
    const metadataKey = `vaccination_due:${vacName}`
    if (isDuplicate(existingAlerts, 'vaccination_due', metadataKey)) continue

    const daysUntil = Math.ceil((nextDue - now) / (24 * 60 * 60 * 1000))
    const isPast = daysUntil < 0

    alerts.push({
      id: makeId(),
      dogId: dog.id,
      type: 'vaccination_due',
      title: `${vacName} Due`,
      message: isPast
        ? `${vacName} was due ${Math.abs(daysUntil)} day(s) ago. Schedule with your vet.`
        : `${vacName} is due in ${daysUntil} day(s). Schedule with your vet.`,
      priority: isPast || daysUntil <= 7 ? 'high' : 'medium',
      status: 'active',
      metadata: {
        key: metadataKey,
        vaccinationName: vacName,
        nextDueDate: vax.nextDueDate,
        daysUntil,
      },
      createdAt: new Date().toISOString(),
    })
  }

  return alerts
}

// ---------------------------------------------------------------------------
// Rule: Weight Trend
// ---------------------------------------------------------------------------

function generateWeightTrendAlerts(dog, petFacts, existingAlerts) {
  const alerts = []
  if (!petFacts || petFacts.length === 0) return alerts

  // Filter for weight-related facts
  const weightFacts = petFacts.filter((f) => {
    const tags = (f.tags || []).map((t) => t.toLowerCase())
    return (
      tags.includes('weight') ||
      f.category === 'weight' ||
      (f.value != null && tags.some((t) => t.includes('weight')))
    )
  })

  if (weightFacts.length < 2) return alerts

  // Sort by date ascending
  const sorted = [...weightFacts].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  )

  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  // Get the earliest weight in the window and the most recent
  const inWindow = sorted.filter((f) => new Date(f.createdAt) >= ninetyDaysAgo)
  if (inWindow.length < 2) return alerts

  const earliest = inWindow[0]
  const latest = inWindow[inWindow.length - 1]

  const earliestWeight = parseFloat(earliest.value)
  const latestWeight = parseFloat(latest.value)

  if (isNaN(earliestWeight) || isNaN(latestWeight) || earliestWeight === 0) return alerts

  const percentChange = Math.abs((latestWeight - earliestWeight) / earliestWeight) * 100

  if (percentChange < 5) return alerts

  const direction = latestWeight > earliestWeight ? 'gain' : 'loss'
  const metadataKey = `weight_trend:${direction}`
  if (isDuplicate(existingAlerts, 'weight_trend', metadataKey)) return alerts

  alerts.push({
    id: makeId(),
    dogId: dog.id,
    type: 'weight_trend',
    title: `Significant Weight ${direction === 'gain' ? 'Gain' : 'Loss'}`,
    message: `${dog.name || 'Your dog'} has shown a ${percentChange.toFixed(1)}% weight ${direction} over the last 90 days (${earliestWeight} -> ${latestWeight}). Discuss with your vet.`,
    priority: percentChange >= 10 ? 'high' : 'medium',
    status: 'active',
    metadata: {
      key: metadataKey,
      direction,
      percentChange: Math.round(percentChange * 10) / 10,
      earliestWeight,
      latestWeight,
      earliestDate: earliest.createdAt,
      latestDate: latest.createdAt,
    },
    createdAt: new Date().toISOString(),
  })

  return alerts
}

// ---------------------------------------------------------------------------
// Main exports
// ---------------------------------------------------------------------------

/**
 * Generate health alerts for a dog based on multiple data sources.
 *
 * @param {object} params
 * @param {object} params.dog - dog profile with breed, age, vaccinations, etc.
 * @param {Array}  [params.petFacts] - PetFact objects
 * @param {Array}  [params.patterns] - output from detectPatterns()
 * @param {Array}  [params.existingAlerts] - alerts already generated (for dedup)
 * @returns {Array} newly generated alerts
 */
function generateAlerts({ dog, petFacts = [], patterns = [], existingAlerts = [] } = {}) {
  if (!dog) return []

  const allExisting = [...existingAlerts]
  const newAlerts = []

  // Breed risk alerts
  const breedAlerts = generateBreedRiskAlerts(dog, allExisting)
  newAlerts.push(...breedAlerts)
  allExisting.push(...breedAlerts)

  // Symptom pattern alerts
  const symptomAlerts = generateSymptomPatternAlerts(dog, patterns, allExisting)
  newAlerts.push(...symptomAlerts)
  allExisting.push(...symptomAlerts)

  // Vaccination alerts
  const vaxAlerts = generateVaccinationAlerts(dog, allExisting)
  newAlerts.push(...vaxAlerts)
  allExisting.push(...vaxAlerts)

  // Weight trend alerts
  const weightAlerts = generateWeightTrendAlerts(dog, petFacts, allExisting)
  newAlerts.push(...weightAlerts)

  // Sort by priority (highest first)
  newAlerts.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))

  return newAlerts
}

/**
 * Dismiss an alert by ID.
 *
 * @param {Array} alerts - current alerts array
 * @param {string} alertId - alert to dismiss
 * @returns {Array} updated alerts array (new reference)
 */
function dismissAlert(alerts, alertId) {
  if (!alerts || !alertId) return alerts || []

  return alerts.map((alert) => {
    if (alert.id !== alertId) return alert
    return {
      ...alert,
      status: 'dismissed',
      dismissedAt: new Date().toISOString(),
    }
  })
}

/**
 * Snooze an alert for a given number of days.
 *
 * @param {Array} alerts - current alerts array
 * @param {string} alertId - alert to snooze
 * @param {number} days - snooze duration in days
 * @returns {Array} updated alerts array (new reference)
 */
function snoozeAlert(alerts, alertId, days) {
  if (!alerts || !alertId) return alerts || []

  const snoozeUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

  return alerts.map((alert) => {
    if (alert.id !== alertId) return alert
    return {
      ...alert,
      status: 'snoozed',
      snoozeUntil,
    }
  })
}

export { generateAlerts, dismissAlert, snoozeAlert }
