import { describe, it, expect } from 'vitest'
import { detectPatterns } from '../../../../src/services/intelligence/patternDetector'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function makeFact(overrides = {}) {
  return {
    id: overrides.id || crypto.randomUUID(),
    tags: overrides.tags || [],
    severity: overrides.severity || 'moderate',
    createdAt: overrides.createdAt || new Date().toISOString(),
    fact: overrides.fact || 'Test fact',
    category: overrides.category || 'symptom',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('detectPatterns', () => {
  it('returns empty array when no facts provided', () => {
    expect(detectPatterns(null)).toEqual([])
    expect(detectPatterns([])).toEqual([])
    expect(detectPatterns(undefined)).toEqual([])
  })

  it('detects recurring symptom with 3+ facts with same tag in 30 days', () => {
    const facts = [
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(2) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(5) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(10) }),
    ]

    const patterns = detectPatterns(facts)
    expect(patterns).toHaveLength(1)

    const pattern = patterns[0]
    expect(pattern.tag).toBe('vomiting')
    expect(pattern.count).toBe(3)
    expect(pattern.factIds).toHaveLength(3)
    expect(pattern.firstSeen).toBeDefined()
    expect(pattern.lastSeen).toBeDefined()
    expect(pattern.description).toContain('vomiting')
    expect(pattern.description).toContain('3')
  })

  it('does NOT flag 2 occurrences (below default threshold of 3)', () => {
    const facts = [
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(1) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(5) }),
    ]

    const patterns = detectPatterns(facts)
    expect(patterns).toEqual([])
  })

  it('does NOT flag 3 occurrences spread over 90 days (outside 30-day window)', () => {
    const facts = [
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(5) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(50) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(80) }),
    ]

    const patterns = detectPatterns(facts)
    // Only 1 occurrence is within the 30-day window, so no pattern
    expect(patterns).toEqual([])
  })

  it('handles overlapping patterns (vomiting AND lethargy recurring)', () => {
    const facts = [
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(1), severity: 'high' }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(3), severity: 'moderate' }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(7), severity: 'moderate' }),
      makeFact({ tags: ['lethargy'], createdAt: daysAgo(2), severity: 'low' }),
      makeFact({ tags: ['lethargy'], createdAt: daysAgo(5), severity: 'moderate' }),
      makeFact({ tags: ['lethargy'], createdAt: daysAgo(9), severity: 'moderate' }),
    ]

    const patterns = detectPatterns(facts)
    expect(patterns).toHaveLength(2)

    const tags = patterns.map((p) => p.tag)
    expect(tags).toContain('vomiting')
    expect(tags).toContain('lethargy')
  })

  it('returns empty array when no patterns meet threshold', () => {
    const facts = [
      makeFact({ tags: ['coughing'], createdAt: daysAgo(2) }),
      makeFact({ tags: ['sneezing'], createdAt: daysAgo(3) }),
      makeFact({ tags: ['limping'], createdAt: daysAgo(4) }),
    ]

    const patterns = detectPatterns(facts)
    expect(patterns).toEqual([])
  })

  it('works with empty facts array', () => {
    const patterns = detectPatterns([])
    expect(patterns).toEqual([])
  })

  it('pattern includes tag, count, firstSeen, lastSeen, factIds', () => {
    const f1 = makeFact({ tags: ['diarrhea'], createdAt: daysAgo(10), severity: 'moderate' })
    const f2 = makeFact({ tags: ['diarrhea'], createdAt: daysAgo(5), severity: 'high' })
    const f3 = makeFact({ tags: ['diarrhea'], createdAt: daysAgo(1), severity: 'low' })
    const facts = [f1, f2, f3]

    const patterns = detectPatterns(facts)
    expect(patterns).toHaveLength(1)

    const p = patterns[0]
    expect(p).toHaveProperty('tag', 'diarrhea')
    expect(p).toHaveProperty('count', 3)
    expect(p).toHaveProperty('firstSeen')
    expect(p).toHaveProperty('lastSeen')
    expect(p).toHaveProperty('factIds')
    expect(p).toHaveProperty('severity', 'high') // max severity
    expect(p).toHaveProperty('description')

    // firstSeen should be the earliest date, lastSeen the latest
    expect(new Date(p.firstSeen).getTime()).toBeLessThanOrEqual(new Date(p.lastSeen).getTime())

    // factIds should contain all 3 fact ids
    expect(p.factIds).toContain(f1.id)
    expect(p.factIds).toContain(f2.id)
    expect(p.factIds).toContain(f3.id)
  })

  it('respects custom threshold option', () => {
    const facts = [
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(1) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(3) }),
    ]

    // With threshold of 2, should detect pattern
    const patterns = detectPatterns(facts, { threshold: 2 })
    expect(patterns).toHaveLength(1)
    expect(patterns[0].tag).toBe('vomiting')
  })

  it('respects custom windowDays option', () => {
    const facts = [
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(5) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(50) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(80) }),
    ]

    // With a 90-day window, all 3 should be found
    const patterns = detectPatterns(facts, { windowDays: 90 })
    expect(patterns).toHaveLength(1)
    expect(patterns[0].count).toBe(3)
  })

  it('normalizes tags to lowercase', () => {
    const facts = [
      makeFact({ tags: ['Vomiting'], createdAt: daysAgo(1) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(3) }),
      makeFact({ tags: ['VOMITING'], createdAt: daysAgo(5) }),
    ]

    const patterns = detectPatterns(facts)
    expect(patterns).toHaveLength(1)
    expect(patterns[0].tag).toBe('vomiting')
    expect(patterns[0].count).toBe(3)
  })

  it('deduplicates factIds when a fact has multiple matching tags', () => {
    const sharedFact = makeFact({
      tags: ['vomiting', 'nausea'],
      createdAt: daysAgo(1),
    })
    const facts = [
      sharedFact,
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(3) }),
      makeFact({ tags: ['vomiting'], createdAt: daysAgo(5) }),
    ]

    const patterns = detectPatterns(facts)
    const vomPattern = patterns.find((p) => p.tag === 'vomiting')
    expect(vomPattern).toBeDefined()

    // factIds should be deduplicated
    const uniqueIds = new Set(vomPattern.factIds)
    expect(uniqueIds.size).toBe(vomPattern.factIds.length)
  })

  it('sorts patterns by severity then count', () => {
    const facts = [
      // 3 high-severity headache entries
      makeFact({ tags: ['headache'], createdAt: daysAgo(1), severity: 'high' }),
      makeFact({ tags: ['headache'], createdAt: daysAgo(3), severity: 'high' }),
      makeFact({ tags: ['headache'], createdAt: daysAgo(5), severity: 'high' }),
      // 4 low-severity coughing entries
      makeFact({ tags: ['coughing'], createdAt: daysAgo(1), severity: 'low' }),
      makeFact({ tags: ['coughing'], createdAt: daysAgo(2), severity: 'low' }),
      makeFact({ tags: ['coughing'], createdAt: daysAgo(4), severity: 'low' }),
      makeFact({ tags: ['coughing'], createdAt: daysAgo(6), severity: 'low' }),
    ]

    const patterns = detectPatterns(facts)
    expect(patterns).toHaveLength(2)
    // Headache (high severity) should come first despite lower count
    expect(patterns[0].tag).toBe('headache')
    expect(patterns[1].tag).toBe('coughing')
  })
})
