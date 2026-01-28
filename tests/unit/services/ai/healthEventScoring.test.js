import { describe, it, expect } from 'vitest'
import { scoreFacts, getTopFacts } from '../../../../src/services/ai/healthEventScoring'

function makeFact(overrides = {}) {
  return {
    id: 'fact-1',
    dogId: 'dog-1',
    fact: 'limping',
    category: 'symptom',
    tags: ['limping'],
    severity: 'moderate',
    status: 'active',
    occurredAt: new Date().toISOString(),
    source: { type: 'chat', sessionId: 's1', messageId: 'm1' },
    possibleConditions: [],
    recommendedActions: [],
    resolvedAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function daysAgoISO(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

describe('healthEventScoring', () => {
  describe('scoreFacts', () => {
    it('returns empty array for empty input', () => {
      expect(scoreFacts([])).toEqual([])
      expect(scoreFacts(null)).toEqual([])
      expect(scoreFacts(undefined)).toEqual([])
    })

    it('recent facts score higher than old ones (recency decay)', () => {
      const recent = makeFact({ id: 'r', occurredAt: daysAgoISO(1), severity: 'moderate', tags: [] })
      const old = makeFact({ id: 'o', occurredAt: daysAgoISO(80), severity: 'moderate', tags: [] })

      const scored = scoreFacts([old, recent])
      expect(scored[0].id).toBe('r')
      expect(scored[0]._relevanceScore).toBeGreaterThan(scored[1]._relevanceScore)
    })

    it('severe facts score higher than mild facts', () => {
      const severe = makeFact({ id: 's', severity: 'severe', tags: [], occurredAt: daysAgoISO(45) })
      const mild = makeFact({ id: 'm', severity: 'mild', tags: [], occurredAt: daysAgoISO(45) })

      const scored = scoreFacts([mild, severe])
      expect(scored[0].id).toBe('s')
      expect(scored[0]._relevanceScore).toBeGreaterThan(scored[1]._relevanceScore)
    })

    it('facts matching current conversation tags score higher', () => {
      const matching = makeFact({ id: 'match', tags: ['vomiting', 'lethargy'], occurredAt: daysAgoISO(45), severity: 'mild' })
      const notMatching = makeFact({ id: 'nomatch', tags: ['limping'], occurredAt: daysAgoISO(45), severity: 'mild' })

      const scored = scoreFacts([notMatching, matching], ['vomiting'])
      expect(scored[0].id).toBe('match')
      expect(scored[0]._relevanceScore).toBeGreaterThan(scored[1]._relevanceScore)
    })

    it('tag match score caps at 30 (3 matching tags)', () => {
      const manyTags = makeFact({
        id: 'many',
        tags: ['a', 'b', 'c', 'd', 'e'],
        occurredAt: daysAgoISO(90), // zero recency
        severity: 'mild', // 10 severity
      })
      // With 5 matching tags, score should be 10 (severity) + 30 (tag cap) = 40 max non-recency
      const scored = scoreFacts([manyTags], ['a', 'b', 'c', 'd', 'e'])
      // Recency at exactly 90 days = 0, severity mild = 10, tags = min(5*10, 30) = 30
      expect(scored[0]._relevanceScore).toBeCloseTo(10 + 30, 0)
    })

    it('all facts with equal scores maintain stable ordering', () => {
      const facts = [
        makeFact({ id: 'a', severity: 'moderate', tags: [], occurredAt: daysAgoISO(10) }),
        makeFact({ id: 'b', severity: 'moderate', tags: [], occurredAt: daysAgoISO(10) }),
        makeFact({ id: 'c', severity: 'moderate', tags: [], occurredAt: daysAgoISO(10) }),
      ]

      const scored = scoreFacts(facts)
      // All same score -- original order should be preserved
      expect(scored[0].id).toBe('a')
      expect(scored[1].id).toBe('b')
      expect(scored[2].id).toBe('c')
    })

    it('facts older than 90 days get zero recency points', () => {
      const ancient = makeFact({ id: 'old', occurredAt: daysAgoISO(180), severity: 'mild', tags: [] })
      const scored = scoreFacts([ancient])
      // severity=mild=10, recency=0, tags=0 => 10
      expect(scored[0]._relevanceScore).toBeCloseTo(10, 0)
    })
  })

  describe('getTopFacts', () => {
    it('returns sorted array with top N', () => {
      const facts = Array.from({ length: 15 }, (_, i) =>
        makeFact({ id: `f${i}`, occurredAt: daysAgoISO(i * 5), severity: 'moderate', tags: [] })
      )

      const top5 = getTopFacts(facts, [], 5)
      expect(top5).toHaveLength(5)
      // Most recent should be first
      expect(top5[0].id).toBe('f0')
    })

    it('returns all facts when fewer than limit', () => {
      const facts = [makeFact({ id: 'a' }), makeFact({ id: 'b' })]
      const top10 = getTopFacts(facts, [], 10)
      expect(top10).toHaveLength(2)
    })

    it('defaults to limit of 10', () => {
      const facts = Array.from({ length: 20 }, (_, i) =>
        makeFact({ id: `f${i}`, occurredAt: daysAgoISO(i) })
      )
      const top = getTopFacts(facts)
      expect(top).toHaveLength(10)
    })

    it('empty facts array returns empty array', () => {
      expect(getTopFacts([], ['tag'])).toEqual([])
    })
  })
})
