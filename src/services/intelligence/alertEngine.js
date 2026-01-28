/**
 * Alert Engine
 *
 * Rule-based alert generation for dog health monitoring.
 * Produces alerts from breed risks, symptom patterns, vaccination
 * schedules, and weight trends. Supports deduplication, dismissal,
 * and snoozing.
 */

import { getBreedRisks } from '../../constants/breedHealthRisks.js'
import LocalStorageService from '../storage/LocalStorageService.js'

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
// Rule: Lab Value Trend (same marker abnormal across multiple analyses)
// ---------------------------------------------------------------------------

function generateLabTrendAlerts(dog, existingAlerts) {
  const alerts = []
  if (!dog?.id) return alerts

  const bloodWork = LocalStorageService.getBloodWorkAnalyses(dog.id) || []
  if (bloodWork.length < 2) return alerts

  // Track abnormal values across all analyses
  const markerHistory = {}

  for (const panel of bloodWork) {
    const values = panel.values || []
    for (const val of values) {
      if (val.status === 'normal' || !val.name) continue

      const markerName = val.name.toLowerCase()
      if (!markerHistory[markerName]) {
        markerHistory[markerName] = []
      }
      markerHistory[markerName].push({
        value: val.value,
        unit: val.unit,
        status: val.status,
        date: panel.createdAt,
      })
    }
  }

  // Generate alert if same marker is abnormal in 2+ analyses
  for (const [marker, occurrences] of Object.entries(markerHistory)) {
    if (occurrences.length < 2) continue

    const metadataKey = `lab_trend:${marker}`
    if (isDuplicate(existingAlerts, 'lab_trend', metadataKey)) continue

    const latestStatus = occurrences[occurrences.length - 1].status
    const priority = latestStatus === 'critical' ? 'high' : 'medium'

    alerts.push({
      id: makeId(),
      dogId: dog.id,
      type: 'lab_trend',
      title: `Recurring Abnormal: ${marker.toUpperCase()}`,
      message: `${marker.toUpperCase()} has been abnormal in ${occurrences.length} blood work analyses. Consider discussing with your veterinarian.`,
      priority,
      status: 'active',
      metadata: {
        key: metadataKey,
        marker,
        occurrences: occurrences.length,
        history: occurrences.slice(-3), // Keep last 3 for reference
      },
      createdAt: new Date().toISOString(),
    })
  }

  return alerts
}

// ---------------------------------------------------------------------------
// Rule: Imaging Follow-up Reminder
// ---------------------------------------------------------------------------

function generateImagingFollowupAlerts(dog, existingAlerts) {
  const alerts = []
  if (!dog?.id) return alerts

  const xrays = LocalStorageService.getXrayAnalyses(dog.id) || []
  if (xrays.length === 0) return alerts

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  for (const xray of xrays) {
    // Check if X-ray has recommended follow-up views
    const followUp = xray.additional_views_recommended || []
    if (followUp.length === 0) continue

    // Only alert for X-rays from the last 30 days
    const xrayDate = new Date(xray.createdAt)
    if (xrayDate < thirtyDaysAgo) continue

    // Check if abnormal findings warrant follow-up
    const hasAbnormalFindings = (xray.findings || []).some(
      (f) => f.significance === 'abnormal' || f.significance === 'critical'
    )
    if (!hasAbnormalFindings && xray.overall_impression === 'normal') continue

    const metadataKey = `imaging_followup:${xray.id}`
    if (isDuplicate(existingAlerts, 'imaging_followup', metadataKey)) continue

    const region = xray.body_region || 'unknown area'
    const daysSinceXray = Math.floor((now - xrayDate) / (24 * 60 * 60 * 1000))

    alerts.push({
      id: makeId(),
      dogId: dog.id,
      type: 'imaging_followup',
      title: `X-Ray Follow-up: ${region}`,
      message: `Your ${region} X-ray from ${daysSinceXray} day(s) ago recommended additional views: ${followUp.join(', ')}. Discuss with your veterinarian.`,
      priority: xray.overall_impression === 'critical' ? 'high' : 'medium',
      status: 'active',
      metadata: {
        key: metadataKey,
        xrayId: xray.id,
        bodyRegion: region,
        recommendedViews: followUp,
        impression: xray.overall_impression,
        xrayDate: xray.createdAt,
      },
      createdAt: new Date().toISOString(),
    })
  }

  return alerts
}

// ---------------------------------------------------------------------------
// Rule: Abnormal Lab Result Notification
// ---------------------------------------------------------------------------

function generateAbnormalLabAlerts(dog, existingAlerts) {
  const alerts = []
  if (!dog?.id) return alerts

  // Check blood work for recent critical/concerning results
  const bloodWork = LocalStorageService.getBloodWorkAnalyses(dog.id) || []
  const labs = LocalStorageService.getLabAnalyses(dog.id) || []

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Process recent blood work
  for (const panel of bloodWork) {
    const panelDate = new Date(panel.createdAt)
    if (panelDate < sevenDaysAgo) continue

    // Alert for concerning or critical overall assessment
    if (panel.overall_assessment === 'concerning' || panel.overall_assessment === 'critical') {
      const metadataKey = `abnormal_lab:bloodwork:${panel.id}`
      if (isDuplicate(existingAlerts, 'abnormal_lab', metadataKey)) continue

      const criticalValues = (panel.values || [])
        .filter((v) => v.status === 'critical')
        .map((v) => v.name)

      alerts.push({
        id: makeId(),
        dogId: dog.id,
        type: 'abnormal_lab',
        title: 'Critical Blood Work Results',
        message: criticalValues.length > 0
          ? `Recent blood work shows critical values for: ${criticalValues.join(', ')}. Contact your veterinarian promptly.`
          : `Recent blood work results are concerning. Review with your veterinarian.`,
        priority: 'high',
        status: 'active',
        metadata: {
          key: metadataKey,
          labId: panel.id,
          labType: 'blood_work',
          assessment: panel.overall_assessment,
          criticalValues,
          abnormalCount: panel.abnormal_count || 0,
          labDate: panel.createdAt,
        },
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Process recent generic lab results
  for (const lab of labs) {
    const labDate = new Date(lab.createdAt)
    if (labDate < sevenDaysAgo) continue

    if (lab.overall_assessment === 'abnormal_urgent' || lab.overall_assessment === 'critical') {
      const metadataKey = `abnormal_lab:${lab.lab_type}:${lab.id}`
      if (isDuplicate(existingAlerts, 'abnormal_lab', metadataKey)) continue

      const labType = lab.lab_type || 'lab test'

      alerts.push({
        id: makeId(),
        dogId: dog.id,
        type: 'abnormal_lab',
        title: `Urgent ${labType} Results`,
        message: `Recent ${labType} results require attention. Contact your veterinarian.`,
        priority: 'high',
        status: 'active',
        metadata: {
          key: metadataKey,
          labId: lab.id,
          labType: lab.lab_type,
          assessment: lab.overall_assessment,
          labDate: lab.createdAt,
        },
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Check X-rays for critical findings
  const xrays = LocalStorageService.getXrayAnalyses(dog.id) || []
  for (const xray of xrays) {
    const xrayDate = new Date(xray.createdAt)
    if (xrayDate < sevenDaysAgo) continue

    if (xray.overall_impression === 'critical') {
      const metadataKey = `abnormal_lab:xray:${xray.id}`
      if (isDuplicate(existingAlerts, 'abnormal_lab', metadataKey)) continue

      const region = xray.body_region || 'X-ray'

      alerts.push({
        id: makeId(),
        dogId: dog.id,
        type: 'abnormal_lab',
        title: `Critical ${region} X-Ray Findings`,
        message: `Recent ${region} X-ray shows critical findings. Contact your veterinarian immediately.`,
        priority: 'high',
        status: 'active',
        metadata: {
          key: metadataKey,
          labId: xray.id,
          labType: 'xray',
          bodyRegion: xray.body_region,
          assessment: xray.overall_impression,
          labDate: xray.createdAt,
        },
        createdAt: new Date().toISOString(),
      })
    }
  }

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
  allExisting.push(...weightAlerts)

  // Lab trend alerts (recurring abnormal markers)
  const labTrendAlerts = generateLabTrendAlerts(dog, allExisting)
  newAlerts.push(...labTrendAlerts)
  allExisting.push(...labTrendAlerts)

  // Imaging follow-up alerts
  const imagingAlerts = generateImagingFollowupAlerts(dog, allExisting)
  newAlerts.push(...imagingAlerts)
  allExisting.push(...imagingAlerts)

  // Abnormal lab result alerts
  const abnormalLabAlerts = generateAbnormalLabAlerts(dog, allExisting)
  newAlerts.push(...abnormalLabAlerts)

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
