import { describe, it, expect } from 'vitest'
import {
  extractFactsFromMetadata,
  extractFactsDeep,
  deduplicateFacts,
  extractFactsFromPhoto,
  extractFactsFromLab,
} from '../../../../src/services/ai/factExtractor'

describe('factExtractor', () => {
  const DOG_ID = 'dog-123'
  const SESSION_ID = 'session-456'
  const MESSAGE_ID = 'msg-789'

  describe('extractFactsFromMetadata', () => {
    it('extracts PetFact from symptoms_mentioned with category "symptom"', () => {
      const metadata = {
        symptoms_mentioned: ['limping', 'whining'],
        urgency_level: 'moderate',
        possible_conditions: ['Sprain', 'Fracture'],
        recommended_actions: ['Rest', 'See vet'],
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)

      expect(facts).toHaveLength(2)
      expect(facts[0].category).toBe('symptom')
      expect(facts[0].fact).toBe('limping')
      expect(facts[0].tags).toEqual(['limping'])
      expect(facts[0].dogId).toBe(DOG_ID)
      expect(facts[0].source.sessionId).toBe(SESSION_ID)
      expect(facts[0].source.messageId).toBe(MESSAGE_ID)
      expect(facts[0].source.type).toBe('chat')
      expect(facts[0].status).toBe('active')
      expect(facts[0].resolvedAt).toBeNull()

      expect(facts[1].fact).toBe('whining')
      expect(facts[1].category).toBe('symptom')
    })

    it('maps urgency_level "urgent" to severity "severe"', () => {
      const metadata = {
        symptoms_mentioned: ['bleeding'],
        urgency_level: 'urgent',
        possible_conditions: [],
        recommended_actions: [],
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)
      expect(facts[0].severity).toBe('severe')
    })

    it('maps urgency_level "emergency" to severity "severe"', () => {
      const metadata = {
        symptoms_mentioned: ['seizure'],
        urgency_level: 'emergency',
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)
      expect(facts[0].severity).toBe('severe')
    })

    it('maps urgency_level "moderate" to severity "moderate"', () => {
      const metadata = {
        symptoms_mentioned: ['scratching'],
        urgency_level: 'moderate',
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)
      expect(facts[0].severity).toBe('moderate')
    })

    it('maps urgency_level "low" to severity "mild"', () => {
      const metadata = {
        symptoms_mentioned: ['sneezing'],
        urgency_level: 'low',
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)
      expect(facts[0].severity).toBe('mild')
    })

    it('maps urgency_level "none" to severity "mild"', () => {
      const metadata = {
        symptoms_mentioned: ['yawning'],
        urgency_level: 'none',
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)
      expect(facts[0].severity).toBe('mild')
    })

    it('skips extraction when no symptoms and no conditions in metadata', () => {
      const metadata = {
        symptoms_mentioned: [],
        urgency_level: 'low',
        possible_conditions: [],
        recommended_actions: ['Keep monitoring'],
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)
      expect(facts).toEqual([])
    })

    it('extracts conditions when symptoms are absent', () => {
      const metadata = {
        symptoms_mentioned: [],
        urgency_level: 'moderate',
        possible_conditions: ['Allergic Dermatitis', 'Hot Spot'],
        recommended_actions: ['See vet'],
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)
      expect(facts).toHaveLength(2)
      expect(facts[0].category).toBe('condition')
      expect(facts[0].fact).toBe('Allergic Dermatitis')
      expect(facts[1].fact).toBe('Hot Spot')
    })

    it('prefers symptoms over conditions when both present', () => {
      const metadata = {
        symptoms_mentioned: ['coughing'],
        urgency_level: 'moderate',
        possible_conditions: ['Kennel Cough'],
        recommended_actions: [],
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)
      // Should only extract symptom facts, not duplicate conditions
      expect(facts).toHaveLength(1)
      expect(facts[0].category).toBe('symptom')
      expect(facts[0].possibleConditions).toEqual(['Kennel Cough'])
    })

    it('returns empty array for null metadata', () => {
      expect(extractFactsFromMetadata(null, DOG_ID, SESSION_ID, MESSAGE_ID)).toEqual([])
    })

    it('returns empty array for undefined metadata', () => {
      expect(extractFactsFromMetadata(undefined, DOG_ID, SESSION_ID, MESSAGE_ID)).toEqual([])
    })

    it('returns empty array for metadata with no relevant fields', () => {
      const metadata = { response: 'Just chatting', concerns_detected: false }
      expect(extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)).toEqual([])
    })

    it('each fact has an id and createdAt', () => {
      const metadata = {
        symptoms_mentioned: ['vomiting'],
        urgency_level: 'moderate',
      }

      const facts = extractFactsFromMetadata(metadata, DOG_ID, SESSION_ID, MESSAGE_ID)
      expect(facts[0].id).toBeDefined()
      expect(typeof facts[0].id).toBe('string')
      expect(facts[0].createdAt).toBeDefined()
    })
  })

  describe('extractFactsDeep', () => {
    it('produces PetFacts with occurredAt dates from messages', () => {
      const timestamp = '2025-01-15T10:00:00.000Z'
      const messages = [
        {
          id: 'msg-1',
          timestamp,
          metadata: {
            symptoms_mentioned: ['diarrhea'],
            urgency_level: 'moderate',
            possible_conditions: ['Dietary indiscretion'],
            recommended_actions: ['Bland diet'],
          },
        },
      ]

      const facts = extractFactsDeep(messages, DOG_ID, SESSION_ID)
      expect(facts).toHaveLength(1)
      expect(facts[0].occurredAt).toBe(timestamp)
      expect(facts[0].fact).toBe('diarrhea')
    })

    it('processes multiple messages and deduplicates', () => {
      const messages = [
        {
          id: 'msg-1',
          timestamp: '2025-01-15T10:00:00.000Z',
          metadata: {
            symptoms_mentioned: ['vomiting'],
            urgency_level: 'low',
          },
        },
        {
          id: 'msg-2',
          timestamp: '2025-01-15T10:30:00.000Z',
          metadata: {
            symptoms_mentioned: ['vomiting'],
            urgency_level: 'moderate',
          },
        },
      ]

      const facts = extractFactsDeep(messages, DOG_ID, SESSION_ID)
      // Same symptom within 24h should be deduplicated
      expect(facts).toHaveLength(1)
      // Should be updated with the more recent severity
      expect(facts[0].severity).toBe('moderate')
    })

    it('skips messages without metadata', () => {
      const messages = [
        { id: 'msg-1', content: 'hello' },
        {
          id: 'msg-2',
          metadata: {
            symptoms_mentioned: ['lethargy'],
            urgency_level: 'low',
          },
        },
      ]

      const facts = extractFactsDeep(messages, DOG_ID, SESSION_ID)
      expect(facts).toHaveLength(1)
      expect(facts[0].fact).toBe('lethargy')
    })

    it('returns empty array for empty messages', () => {
      expect(extractFactsDeep([], DOG_ID, SESSION_ID)).toEqual([])
    })

    it('returns empty array for null messages', () => {
      expect(extractFactsDeep(null, DOG_ID, SESSION_ID)).toEqual([])
    })
  })

  describe('deduplicateFacts', () => {
    function makeTestFact(overrides = {}) {
      return {
        id: 'fact-1',
        dogId: DOG_ID,
        fact: 'limping',
        category: 'symptom',
        tags: ['limping'],
        severity: 'moderate',
        status: 'active',
        occurredAt: new Date().toISOString(),
        source: { type: 'chat', sessionId: SESSION_ID, messageId: MESSAGE_ID },
        possibleConditions: [],
        recommendedActions: [],
        resolvedAt: null,
        createdAt: new Date().toISOString(),
        ...overrides,
      }
    }

    it('same symptom within 24 hours is updated, not duplicated', () => {
      const existing = [
        makeTestFact({
          id: 'existing-1',
          tags: ['limping'],
          occurredAt: '2025-01-15T08:00:00.000Z',
          severity: 'mild',
        }),
      ]

      const newFacts = [
        makeTestFact({
          id: 'new-1',
          tags: ['limping'],
          occurredAt: '2025-01-15T14:00:00.000Z', // 6 hours later
          severity: 'moderate',
        }),
      ]

      const result = deduplicateFacts(newFacts, existing)
      expect(result).toHaveLength(1)
      expect(result[0].severity).toBe('moderate') // updated
    })

    it('same symptom beyond 24 hours creates a new fact', () => {
      const existing = [
        makeTestFact({
          id: 'existing-1',
          tags: ['limping'],
          occurredAt: '2025-01-13T08:00:00.000Z',
        }),
      ]

      const newFacts = [
        makeTestFact({
          id: 'new-1',
          tags: ['limping'],
          occurredAt: '2025-01-15T14:00:00.000Z', // 2+ days later
        }),
      ]

      const result = deduplicateFacts(newFacts, existing)
      expect(result).toHaveLength(2)
    })

    it('different symptoms are not deduplicated', () => {
      const existing = [
        makeTestFact({ id: 'e1', tags: ['limping'] }),
      ]

      const newFacts = [
        makeTestFact({ id: 'n1', tags: ['vomiting'] }),
      ]

      const result = deduplicateFacts(newFacts, existing)
      expect(result).toHaveLength(2)
    })

    it('returns existing facts when newFacts is empty', () => {
      const existing = [makeTestFact({ id: 'e1' })]
      const result = deduplicateFacts([], existing)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e1')
    })

    it('returns empty array when both inputs are empty', () => {
      expect(deduplicateFacts([], [])).toEqual([])
    })

    it('handles null inputs gracefully', () => {
      expect(deduplicateFacts(null, null)).toEqual([])
      expect(deduplicateFacts(null, [makeTestFact()])).toEqual([makeTestFact()])
    })
  })

  // =========================================================================
  // extractFactsFromPhoto (NEW — Phase 2)
  // =========================================================================

  describe('extractFactsFromPhoto', () => {
    it('extracts symptom facts from visible_symptoms', () => {
      const photoResult = {
        visible_symptoms: ['redness', 'swelling'],
        possible_conditions: ['hot spot', 'dermatitis'],
        urgency_level: 'moderate',
        recommended_actions: ['keep clean'],
        body_area: 'Skin/Coat',
      }

      const facts = extractFactsFromPhoto(photoResult, DOG_ID)

      expect(facts).toHaveLength(2)
      expect(facts[0].fact).toBe('redness')
      expect(facts[0].category).toBe('symptom')
      expect(facts[0].source.type).toBe('photo')
      expect(facts[0].dogId).toBe(DOG_ID)
      expect(facts[0].severity).toBe('moderate')
      expect(facts[0].possibleConditions).toEqual(['hot spot', 'dermatitis'])
      expect(facts[1].fact).toBe('swelling')
    })

    it('extracts condition facts when no visible symptoms', () => {
      const photoResult = {
        visible_symptoms: [],
        possible_conditions: ['allergic reaction'],
        urgency_level: 'low',
        recommended_actions: [],
      }

      const facts = extractFactsFromPhoto(photoResult, DOG_ID)

      expect(facts).toHaveLength(1)
      expect(facts[0].fact).toBe('allergic reaction')
      expect(facts[0].category).toBe('condition')
    })

    it('includes body_area in tags when present', () => {
      const photoResult = {
        visible_symptoms: ['discharge'],
        possible_conditions: [],
        urgency_level: 'moderate',
        body_area: 'Ear',
      }

      const facts = extractFactsFromPhoto(photoResult, DOG_ID)

      expect(facts[0].tags).toContain('discharge')
      expect(facts[0].tags).toContain('ear')
    })

    it('returns empty array for null input', () => {
      expect(extractFactsFromPhoto(null, DOG_ID)).toEqual([])
    })

    it('returns empty array when no symptoms or conditions', () => {
      const photoResult = {
        visible_symptoms: [],
        possible_conditions: [],
        urgency_level: 'low',
      }
      expect(extractFactsFromPhoto(photoResult, DOG_ID)).toEqual([])
    })
  })

  // =========================================================================
  // extractFactsFromLab (NEW — Phase 2)
  // =========================================================================

  describe('extractFactsFromLab', () => {
    it('extracts facts from abnormal lab values', () => {
      const labResult = {
        values: [
          { name: 'WBC', value: '12.5', status: 'normal', interpretation: 'Normal' },
          { name: 'BUN', value: '32', status: 'high', interpretation: 'Elevated BUN' },
          { name: 'ALT', value: '250', status: 'critical', interpretation: 'Severely elevated' },
        ],
        key_findings: ['BUN elevated', 'ALT critically high'],
        overall_assessment: 'concerning',
        possible_conditions: ['kidney disease', 'liver issue'],
        recommended_actions: ['recheck in 2 weeks'],
      }

      const facts = extractFactsFromLab(labResult, DOG_ID)

      // Should extract abnormal values (BUN + ALT)
      const abnormalFacts = facts.filter(f => f.category === 'lab_result')
      expect(abnormalFacts.length).toBeGreaterThanOrEqual(2)

      const bunFact = abnormalFacts.find(f => f.tags.includes('bun'))
      expect(bunFact).toBeDefined()
      expect(bunFact.fact).toContain('BUN')
      expect(bunFact.source.type).toBe('lab')
      expect(bunFact.dogId).toBe(DOG_ID)
    })

    it('maps overall_assessment to severity', () => {
      const labResult = {
        values: [
          { name: 'BUN', value: '32', status: 'high', interpretation: 'Elevated' },
        ],
        overall_assessment: 'concerning',
        key_findings: [],
        possible_conditions: [],
        recommended_actions: [],
      }

      const facts = extractFactsFromLab(labResult, DOG_ID)
      expect(facts[0].severity).toBe('severe')
    })

    it('normal assessment maps to mild severity', () => {
      const labResult = {
        values: [
          { name: 'BUN', value: '15', status: 'high', interpretation: 'Slightly high' },
        ],
        overall_assessment: 'normal',
        key_findings: [],
        possible_conditions: [],
        recommended_actions: [],
      }

      const facts = extractFactsFromLab(labResult, DOG_ID)
      expect(facts[0].severity).toBe('mild')
    })

    it('skips normal values', () => {
      const labResult = {
        values: [
          { name: 'WBC', value: '12.5', status: 'normal', interpretation: 'Normal' },
          { name: 'RBC', value: '7.0', status: 'normal', interpretation: 'Normal' },
        ],
        key_findings: [],
        overall_assessment: 'normal',
        possible_conditions: [],
        recommended_actions: [],
      }

      const facts = extractFactsFromLab(labResult, DOG_ID)
      expect(facts).toEqual([])
    })

    it('returns empty array for null input', () => {
      expect(extractFactsFromLab(null, DOG_ID)).toEqual([])
    })

    it('returns empty array when no values present', () => {
      const labResult = {
        values: [],
        key_findings: [],
        overall_assessment: 'normal',
        possible_conditions: [],
        recommended_actions: [],
      }
      expect(extractFactsFromLab(labResult, DOG_ID)).toEqual([])
    })

    it('includes lab marker name in tags', () => {
      const labResult = {
        values: [
          { name: 'Creatinine', value: '2.5', status: 'high', interpretation: 'Elevated' },
        ],
        overall_assessment: 'needs_attention',
        key_findings: [],
        possible_conditions: [],
        recommended_actions: [],
      }

      const facts = extractFactsFromLab(labResult, DOG_ID)
      expect(facts[0].tags).toContain('creatinine')
    })
  })
})
