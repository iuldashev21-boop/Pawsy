import { describe, it, expect } from 'vitest'
import {
  generateAlerts,
  dismissAlert,
  snoozeAlert,
} from '../../../../src/services/intelligence/alertEngine'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

function makeDog(overrides = {}) {
  return {
    id: 'dog-1',
    name: 'Buddy',
    breed: 'Labrador Retriever',
    ageYears: 4,
    vaccinations: [],
    ...overrides,
  }
}

function makePattern(overrides = {}) {
  return {
    tag: 'vomiting',
    count: 3,
    severity: 'moderate',
    firstSeen: daysAgo(10),
    lastSeen: daysAgo(1),
    factIds: ['f-1', 'f-2', 'f-3'],
    description: '"vomiting" has been recorded 3 times in the last 30 days.',
    ...overrides,
  }
}

function makeWeightFact(value, createdAt) {
  return {
    id: crypto.randomUUID(),
    tags: ['weight'],
    category: 'weight',
    value,
    severity: 'low',
    createdAt,
    fact: `Weight recorded: ${value}`,
  }
}

// ---------------------------------------------------------------------------
// breed_risk alerts
// ---------------------------------------------------------------------------

describe('generateAlerts - breed_risk', () => {
  it('Labrador at age 4 generates Hip Dysplasia alert (within 1-6 range)', () => {
    const dog = makeDog({ breed: 'Labrador Retriever', ageYears: 4 })
    const alerts = generateAlerts({ dog })

    const hipAlert = alerts.find(
      (a) => a.type === 'breed_risk' && a.metadata.conditionName === 'Hip Dysplasia'
    )
    expect(hipAlert).toBeDefined()
    expect(hipAlert.priority).toBe('high')
    expect(hipAlert.status).toBe('active')
    expect(hipAlert.title).toContain('Hip Dysplasia')
    expect(hipAlert.dogId).toBe('dog-1')
  })

  it('Labrador at age 2 generates alerts for conditions in range (not just hip dysplasia)', () => {
    const dog = makeDog({ breed: 'Labrador Retriever', ageYears: 2 })
    const alerts = generateAlerts({ dog })

    // Age 2 is in range for Hip Dysplasia (1-6), Elbow Dysplasia (1-4), Obesity (2-14)
    const breedAlerts = alerts.filter((a) => a.type === 'breed_risk')
    const conditionNames = breedAlerts.map((a) => a.metadata.conditionName)
    expect(conditionNames).toContain('Hip Dysplasia')
    expect(conditionNames).toContain('Elbow Dysplasia')
    expect(conditionNames).toContain('Obesity')
  })

  it('Labrador at age 7 generates Hip Dysplasia alert (age 7 is outside 1-6 for Labrador hip)', () => {
    // Hip Dysplasia for Labrador is ageRange 1-6, so age 7 should NOT trigger it
    const dog = makeDog({ breed: 'Labrador Retriever', ageYears: 7 })
    const alerts = generateAlerts({ dog })

    const hipAlert = alerts.find(
      (a) => a.type === 'breed_risk' && a.metadata.conditionName === 'Hip Dysplasia'
    )
    // Age 7 is > max of 6, so no hip dysplasia alert
    expect(hipAlert).toBeUndefined()
  })

  it('does not generate breed_risk alerts for unknown breed', () => {
    const dog = makeDog({ breed: 'Unknown Mixed', ageYears: 5 })
    const alerts = generateAlerts({ dog })

    const breedAlerts = alerts.filter((a) => a.type === 'breed_risk')
    expect(breedAlerts).toHaveLength(0)
  })

  it('does not generate breed_risk alerts when age is null', () => {
    const dog = makeDog({ breed: 'Labrador Retriever', ageYears: null })
    const alerts = generateAlerts({ dog })

    const breedAlerts = alerts.filter((a) => a.type === 'breed_risk')
    expect(breedAlerts).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// symptom_pattern alerts
// ---------------------------------------------------------------------------

describe('generateAlerts - symptom_pattern', () => {
  it('converts pattern detector output into alert', () => {
    const dog = makeDog({ breed: 'Unknown Mixed' })
    const patterns = [makePattern()]
    const alerts = generateAlerts({ dog, patterns })

    const symptomAlert = alerts.find((a) => a.type === 'symptom_pattern')
    expect(symptomAlert).toBeDefined()
    expect(symptomAlert.title).toContain('vomiting')
    expect(symptomAlert.metadata.tag).toBe('vomiting')
    expect(symptomAlert.metadata.count).toBe(3)
    expect(symptomAlert.status).toBe('active')
  })

  it('generates alerts for multiple patterns', () => {
    const dog = makeDog({ breed: 'Unknown Mixed' })
    const patterns = [
      makePattern({ tag: 'vomiting' }),
      makePattern({ tag: 'lethargy', severity: 'high' }),
    ]
    const alerts = generateAlerts({ dog, patterns })

    const symptomAlerts = alerts.filter((a) => a.type === 'symptom_pattern')
    expect(symptomAlerts).toHaveLength(2)
  })

  it('returns no symptom alerts when patterns array is empty', () => {
    const dog = makeDog({ breed: 'Unknown Mixed' })
    const alerts = generateAlerts({ dog, patterns: [] })

    const symptomAlerts = alerts.filter((a) => a.type === 'symptom_pattern')
    expect(symptomAlerts).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// vaccination_due alerts
// ---------------------------------------------------------------------------

describe('generateAlerts - vaccination_due', () => {
  it('generates alert for vaccination due in 14 days', () => {
    const dog = makeDog({
      breed: 'Unknown Mixed',
      vaccinations: [
        { name: 'Rabies', nextDueDate: daysFromNow(14) },
      ],
    })
    const alerts = generateAlerts({ dog })

    const vaxAlert = alerts.find((a) => a.type === 'vaccination_due')
    expect(vaxAlert).toBeDefined()
    expect(vaxAlert.title).toContain('Rabies')
    expect(vaxAlert.metadata.vaccinationName).toBe('Rabies')
    expect(vaxAlert.status).toBe('active')
  })

  it('does NOT generate alert for vaccination due in 60 days (too far)', () => {
    const dog = makeDog({
      breed: 'Unknown Mixed',
      vaccinations: [
        { name: 'Rabies', nextDueDate: daysFromNow(60) },
      ],
    })
    const alerts = generateAlerts({ dog })

    const vaxAlert = alerts.find((a) => a.type === 'vaccination_due')
    expect(vaxAlert).toBeUndefined()
  })

  it('generates high priority for vaccination due within 7 days', () => {
    const dog = makeDog({
      breed: 'Unknown Mixed',
      vaccinations: [
        { name: 'Distemper', nextDueDate: daysFromNow(3) },
      ],
    })
    const alerts = generateAlerts({ dog })

    const vaxAlert = alerts.find((a) => a.type === 'vaccination_due')
    expect(vaxAlert).toBeDefined()
    expect(vaxAlert.priority).toBe('high')
  })

  it('generates alert for overdue vaccination', () => {
    const dog = makeDog({
      breed: 'Unknown Mixed',
      vaccinations: [
        { name: 'Parvo', nextDueDate: daysAgo(5) },
      ],
    })
    const alerts = generateAlerts({ dog })

    const vaxAlert = alerts.find((a) => a.type === 'vaccination_due')
    expect(vaxAlert).toBeDefined()
    expect(vaxAlert.priority).toBe('high')
    expect(vaxAlert.message).toContain('was due')
  })
})

// ---------------------------------------------------------------------------
// weight_trend alerts
// ---------------------------------------------------------------------------

describe('generateAlerts - weight_trend', () => {
  it('generates alert for 10%+ weight change in 90 days', () => {
    const dog = makeDog({ breed: 'Unknown Mixed' })
    const petFacts = [
      makeWeightFact(50, daysAgo(60)),
      makeWeightFact(56, daysAgo(1)), // 12% gain
    ]
    const alerts = generateAlerts({ dog, petFacts })

    const weightAlert = alerts.find((a) => a.type === 'weight_trend')
    expect(weightAlert).toBeDefined()
    expect(weightAlert.metadata.direction).toBe('gain')
    expect(weightAlert.metadata.percentChange).toBeGreaterThanOrEqual(10)
    expect(weightAlert.priority).toBe('high')
  })

  it('does NOT generate alert for 2% weight change', () => {
    const dog = makeDog({ breed: 'Unknown Mixed' })
    const petFacts = [
      makeWeightFact(50, daysAgo(60)),
      makeWeightFact(51, daysAgo(1)), // 2% change
    ]
    const alerts = generateAlerts({ dog, petFacts })

    const weightAlert = alerts.find((a) => a.type === 'weight_trend')
    expect(weightAlert).toBeUndefined()
  })

  it('generates alert for 5%+ weight loss', () => {
    const dog = makeDog({ breed: 'Unknown Mixed' })
    const petFacts = [
      makeWeightFact(50, daysAgo(45)),
      makeWeightFact(47, daysAgo(1)), // 6% loss
    ]
    const alerts = generateAlerts({ dog, petFacts })

    const weightAlert = alerts.find((a) => a.type === 'weight_trend')
    expect(weightAlert).toBeDefined()
    expect(weightAlert.metadata.direction).toBe('loss')
  })

  it('does NOT generate alert when only one weight fact exists', () => {
    const dog = makeDog({ breed: 'Unknown Mixed' })
    const petFacts = [makeWeightFact(50, daysAgo(10))]
    const alerts = generateAlerts({ dog, petFacts })

    const weightAlert = alerts.find((a) => a.type === 'weight_trend')
    expect(weightAlert).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

describe('generateAlerts - deduplication', () => {
  it('does not create duplicate alert when existingAlerts has same type + key', () => {
    const dog = makeDog({ breed: 'Labrador Retriever', ageYears: 4 })

    const existingAlerts = [
      {
        id: 'existing-1',
        type: 'breed_risk',
        status: 'active',
        metadata: { key: 'breed_risk:Hip Dysplasia' },
      },
    ]

    const alerts = generateAlerts({ dog, existingAlerts })
    const hipAlerts = alerts.filter(
      (a) => a.type === 'breed_risk' && a.metadata.conditionName === 'Hip Dysplasia'
    )
    expect(hipAlerts).toHaveLength(0)
  })

  it('does not deduplicate against dismissed alerts', () => {
    const dog = makeDog({ breed: 'Labrador Retriever', ageYears: 4 })

    const existingAlerts = [
      {
        id: 'existing-1',
        type: 'breed_risk',
        status: 'dismissed',
        metadata: { key: 'breed_risk:Hip Dysplasia' },
      },
    ]

    const alerts = generateAlerts({ dog, existingAlerts })
    const hipAlerts = alerts.filter(
      (a) => a.type === 'breed_risk' && a.metadata.conditionName === 'Hip Dysplasia'
    )
    expect(hipAlerts).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// dismissAlert
// ---------------------------------------------------------------------------

describe('dismissAlert', () => {
  it('updates status to dismissed for matching alertId', () => {
    const alerts = [
      { id: 'a-1', type: 'breed_risk', status: 'active' },
      { id: 'a-2', type: 'symptom_pattern', status: 'active' },
    ]

    const updated = dismissAlert(alerts, 'a-1')
    expect(updated).toHaveLength(2)

    const dismissed = updated.find((a) => a.id === 'a-1')
    expect(dismissed.status).toBe('dismissed')
    expect(dismissed.dismissedAt).toBeDefined()

    // Other alert unchanged
    const other = updated.find((a) => a.id === 'a-2')
    expect(other.status).toBe('active')
  })

  it('returns same-length array when alertId not found', () => {
    const alerts = [{ id: 'a-1', status: 'active' }]
    const updated = dismissAlert(alerts, 'nonexistent')
    expect(updated).toHaveLength(1)
    expect(updated[0].status).toBe('active')
  })

  it('handles empty/null alerts gracefully', () => {
    expect(dismissAlert(null, 'a-1')).toEqual([])
    expect(dismissAlert([], 'a-1')).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// snoozeAlert
// ---------------------------------------------------------------------------

describe('snoozeAlert', () => {
  it('updates status to snoozed with snooze expiry', () => {
    const alerts = [
      { id: 'a-1', type: 'breed_risk', status: 'active' },
      { id: 'a-2', type: 'vaccination_due', status: 'active' },
    ]

    const updated = snoozeAlert(alerts, 'a-1', 7)
    expect(updated).toHaveLength(2)

    const snoozed = updated.find((a) => a.id === 'a-1')
    expect(snoozed.status).toBe('snoozed')
    expect(snoozed.snoozeUntil).toBeDefined()

    // snoozeUntil should be approximately 7 days from now
    const snoozeDate = new Date(snoozed.snoozeUntil)
    const expectedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const diffMs = Math.abs(snoozeDate - expectedDate)
    expect(diffMs).toBeLessThan(5000) // within 5 seconds

    // Other alert unchanged
    const other = updated.find((a) => a.id === 'a-2')
    expect(other.status).toBe('active')
  })

  it('handles empty/null alerts gracefully', () => {
    expect(snoozeAlert(null, 'a-1', 7)).toEqual([])
    expect(snoozeAlert([], 'a-1', 7)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('generateAlerts - edge cases', () => {
  it('returns empty array when no dog provided', () => {
    const alerts = generateAlerts({})
    expect(alerts).toEqual([])
  })

  it('returns empty array when no conditions are met', () => {
    const dog = makeDog({ breed: 'Unknown Mixed', ageYears: 3, vaccinations: [] })
    const alerts = generateAlerts({ dog })
    expect(alerts).toEqual([])
  })

  it('alert objects have required schema fields', () => {
    const dog = makeDog({ breed: 'Labrador Retriever', ageYears: 4 })
    const alerts = generateAlerts({ dog })

    expect(alerts.length).toBeGreaterThan(0)
    for (const alert of alerts) {
      expect(alert).toHaveProperty('id')
      expect(alert).toHaveProperty('dogId', 'dog-1')
      expect(alert).toHaveProperty('type')
      expect(alert).toHaveProperty('title')
      expect(alert).toHaveProperty('message')
      expect(alert).toHaveProperty('priority')
      expect(alert).toHaveProperty('status', 'active')
      expect(alert).toHaveProperty('metadata')
      expect(alert).toHaveProperty('createdAt')
      expect(['high', 'medium', 'low']).toContain(alert.priority)
    }
  })

  it('sorts alerts by priority (high first)', () => {
    const dog = makeDog({
      breed: 'Labrador Retriever',
      ageYears: 4,
      vaccinations: [{ name: 'Rabies', nextDueDate: daysFromNow(20) }],
    })
    const patterns = [makePattern({ tag: 'limping', severity: 'low' })]

    const alerts = generateAlerts({ dog, patterns })
    expect(alerts.length).toBeGreaterThan(1)

    // Verify sorted by priority descending
    const priorities = alerts.map((a) => a.priority)
    const order = { high: 3, medium: 2, low: 1 }
    for (let i = 1; i < priorities.length; i++) {
      expect(order[priorities[i - 1]]).toBeGreaterThanOrEqual(order[priorities[i]])
    }
  })
})
