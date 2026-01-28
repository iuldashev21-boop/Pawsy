/**
 * Tests for analysisOrchestrator.js
 *
 * The orchestrator is the central service that coordinates the post-analysis
 * pipeline. Every analysis type (chat, photo, lab) flows through:
 *   1. Call the AI service
 *   2. Save result to storage
 *   3. Extract PetFacts
 *   4. Save extracted facts
 *   5. Run alert engine
 *   6. Return result
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — declared before import so hoisting works
// ---------------------------------------------------------------------------

vi.mock('../../../../src/services/api/gemini', () => ({
  geminiService: {
    chat: vi.fn(),
    analyzePhoto: vi.fn(),
    analyzeLab: vi.fn(),
  },
}))

vi.mock('../../../../src/services/storage/LocalStorageService', () => {
  const mock = {
    savePhotoAnalysis: vi.fn(),
    saveLabAnalysis: vi.fn(),
    savePetFact: vi.fn(),
    getPetFacts: vi.fn(() => []),
    getAlerts: vi.fn(() => []),
    saveAlert: vi.fn(),
  }
  return { default: mock }
})

vi.mock('../../../../src/services/ai/factExtractor', () => ({
  extractFactsFromMetadata: vi.fn(() => []),
  extractFactsFromPhoto: vi.fn(() => []),
  extractFactsFromLab: vi.fn(() => []),
}))

vi.mock('../../../../src/services/intelligence/alertEngine', () => ({
  generateAlerts: vi.fn(() => []),
}))

vi.mock('../../../../src/services/intelligence/patternDetector', () => ({
  detectPatterns: vi.fn(() => []),
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  runChatAnalysis,
  runPhotoAnalysis,
  runLabAnalysis,
} from '../../../../src/services/orchestrator/analysisOrchestrator'

import { geminiService } from '../../../../src/services/api/gemini'
import LocalStorageService from '../../../../src/services/storage/LocalStorageService'
import {
  extractFactsFromMetadata,
  extractFactsFromPhoto,
  extractFactsFromLab,
} from '../../../../src/services/ai/factExtractor'
import { generateAlerts } from '../../../../src/services/intelligence/alertEngine'
import { detectPatterns } from '../../../../src/services/intelligence/patternDetector'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDog(overrides = {}) {
  return {
    id: 'dog-1',
    name: 'Buddy',
    breed: 'Labrador Retriever',
    weight: 70,
    weightUnit: 'lbs',
    dateOfBirth: '2020-06-15',
    allergies: ['chicken'],
    conditions: [],
    medications: [],
    ...overrides,
  }
}

const mockChatResult = {
  error: false,
  message: 'Looks like a minor issue.',
  symptoms_mentioned: ['limping'],
  possible_conditions: ['sprain'],
  urgency_level: 'low',
  recommended_actions: ['rest'],
  should_see_vet: false,
  suggested_action: 'continue_chat',
  follow_up_questions: [],
  emergency_steps: [],
}

const mockPhotoResult = {
  error: false,
  is_dog: true,
  urgency_level: 'moderate',
  visible_symptoms: ['redness', 'swelling'],
  possible_conditions: ['hot spot', 'dermatitis'],
  recommended_actions: ['keep clean'],
  should_see_vet: false,
  summary: 'Moderate skin irritation observed.',
  confidence: 'medium',
}

const mockLabResult = {
  error: false,
  is_lab_report: true,
  detected_type: 'blood_work',
  readability: 'clear',
  values: [
    { name: 'BUN', value: '32', unit: 'mg/dL', reference_range: '7-27', status: 'high', interpretation: 'Elevated' },
  ],
  overall_assessment: 'needs_attention',
  summary: 'BUN slightly elevated.',
  key_findings: ['BUN elevated'],
  abnormal_count: 1,
  possible_conditions: ['dehydration'],
  recommended_actions: ['recheck BUN'],
  should_see_vet: true,
  vet_urgency: 'routine_checkup',
  confidence: 'medium',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('analysisOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // runChatAnalysis
  // =========================================================================

  describe('runChatAnalysis', () => {
    it('calls geminiService.chat with correct arguments', async () => {
      geminiService.chat.mockResolvedValue(mockChatResult)
      const dog = makeDog()

      await runChatAnalysis(dog, 'my dog is limping', [], null, [], true)

      expect(geminiService.chat).toHaveBeenCalledWith(
        dog, 'my dog is limping', [], null, [], true
      )
    })

    it('returns the AI response', async () => {
      geminiService.chat.mockResolvedValue(mockChatResult)

      const result = await runChatAnalysis(makeDog(), 'limping', [], null, [], false)

      expect(result).toEqual(mockChatResult)
    })

    it('extracts facts from chat metadata and saves them', async () => {
      geminiService.chat.mockResolvedValue(mockChatResult)
      const fakeFact = { id: 'f1', fact: 'limping', category: 'symptom' }
      extractFactsFromMetadata.mockReturnValue([fakeFact])

      const dog = makeDog()
      await runChatAnalysis(dog, 'limping', [], null, [], false)

      expect(extractFactsFromMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          symptoms_mentioned: ['limping'],
          possible_conditions: ['sprain'],
          urgency_level: 'low',
        }),
        'dog-1',
        'chat',
        expect.any(String), // messageId
      )
      expect(LocalStorageService.savePetFact).toHaveBeenCalledWith('dog-1', fakeFact)
    })

    it('runs alert engine after fact extraction', async () => {
      geminiService.chat.mockResolvedValue(mockChatResult)
      extractFactsFromMetadata.mockReturnValue([])
      LocalStorageService.getPetFacts.mockReturnValue([])
      LocalStorageService.getAlerts.mockReturnValue([])

      await runChatAnalysis(makeDog(), 'limping', [], null, [], false)

      expect(generateAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          dog: expect.objectContaining({ id: 'dog-1' }),
        })
      )
    })

    it('saves new alerts from the alert engine', async () => {
      geminiService.chat.mockResolvedValue(mockChatResult)
      const fakeAlert = { id: 'a1', type: 'symptom_pattern', title: 'Recurring limping' }
      generateAlerts.mockReturnValue([fakeAlert])

      await runChatAnalysis(makeDog(), 'limping', [], null, [], false)

      expect(LocalStorageService.saveAlert).toHaveBeenCalledWith('dog-1', fakeAlert)
    })

    it('returns error result without processing pipeline when AI returns error', async () => {
      const errorResult = { error: true, message: 'API failed' }
      geminiService.chat.mockResolvedValue(errorResult)

      const result = await runChatAnalysis(makeDog(), 'limping', [], null, [], false)

      expect(result).toEqual(errorResult)
      expect(extractFactsFromMetadata).not.toHaveBeenCalled()
      expect(LocalStorageService.savePetFact).not.toHaveBeenCalled()
      expect(generateAlerts).not.toHaveBeenCalled()
    })

    it('skips fact extraction when no dogId', async () => {
      geminiService.chat.mockResolvedValue(mockChatResult)
      const noDog = { name: 'unknown', breed: 'unknown' }

      await runChatAnalysis(noDog, 'limping', [], null, [], false)

      expect(extractFactsFromMetadata).not.toHaveBeenCalled()
    })
  })

  // =========================================================================
  // runPhotoAnalysis
  // =========================================================================

  describe('runPhotoAnalysis', () => {
    it('calls geminiService.analyzePhoto with correct arguments', async () => {
      geminiService.analyzePhoto.mockResolvedValue(mockPhotoResult)
      const dog = makeDog()

      await runPhotoAnalysis(dog, 'base64data', 'image/jpeg', 'Skin/Coat', 'red bump')

      expect(geminiService.analyzePhoto).toHaveBeenCalledWith(
        'base64data', 'image/jpeg', dog, 'Skin/Coat', 'red bump'
      )
    })

    it('saves photo analysis to storage', async () => {
      geminiService.analyzePhoto.mockResolvedValue(mockPhotoResult)
      const dog = makeDog()

      await runPhotoAnalysis(dog, 'base64data', 'image/jpeg', 'Skin/Coat', 'red bump')

      expect(LocalStorageService.savePhotoAnalysis).toHaveBeenCalledWith(
        'dog-1',
        expect.objectContaining({
          ...mockPhotoResult,
          bodyArea: 'Skin/Coat',
          body_area: 'Skin/Coat',
          description: 'red bump',
        })
      )
    })

    it('extracts facts from photo result and saves them', async () => {
      geminiService.analyzePhoto.mockResolvedValue(mockPhotoResult)
      const fakeFact = { id: 'f2', fact: 'redness', category: 'symptom' }
      extractFactsFromPhoto.mockReturnValue([fakeFact])

      await runPhotoAnalysis(makeDog(), 'base64data', 'image/jpeg', 'Skin/Coat', '')

      expect(extractFactsFromPhoto).toHaveBeenCalledWith(mockPhotoResult, 'dog-1')
      expect(LocalStorageService.savePetFact).toHaveBeenCalledWith('dog-1', fakeFact)
    })

    it('runs alert engine after photo analysis', async () => {
      geminiService.analyzePhoto.mockResolvedValue(mockPhotoResult)
      extractFactsFromPhoto.mockReturnValue([])

      await runPhotoAnalysis(makeDog(), 'base64data', 'image/jpeg', 'Skin/Coat', '')

      expect(generateAlerts).toHaveBeenCalled()
    })

    it('returns the analysis result', async () => {
      geminiService.analyzePhoto.mockResolvedValue(mockPhotoResult)

      const result = await runPhotoAnalysis(makeDog(), 'base64data', 'image/jpeg', 'Skin/Coat', '')

      expect(result).toEqual(mockPhotoResult)
    })

    it('returns error result without saving when AI returns error', async () => {
      const errorResult = { error: true, message: 'Safety block' }
      geminiService.analyzePhoto.mockResolvedValue(errorResult)

      const result = await runPhotoAnalysis(makeDog(), 'base64data', 'image/jpeg', 'Skin/Coat', '')

      expect(result).toEqual(errorResult)
      expect(LocalStorageService.savePhotoAnalysis).not.toHaveBeenCalled()
      expect(extractFactsFromPhoto).not.toHaveBeenCalled()
    })
  })

  // =========================================================================
  // runLabAnalysis
  // =========================================================================

  describe('runLabAnalysis', () => {
    it('calls geminiService.analyzeLab with correct arguments', async () => {
      geminiService.analyzeLab.mockResolvedValue(mockLabResult)
      const dog = makeDog()

      await runLabAnalysis(dog, 'base64data', 'image/png', 'Blood Work (CBC / Chemistry)', 'pre-surgery')

      expect(geminiService.analyzeLab).toHaveBeenCalledWith(
        'base64data', 'image/png', dog, 'Blood Work (CBC / Chemistry)', 'pre-surgery'
      )
    })

    it('saves lab analysis to storage', async () => {
      geminiService.analyzeLab.mockResolvedValue(mockLabResult)
      const dog = makeDog()

      await runLabAnalysis(dog, 'base64data', 'image/png', 'Blood Work', 'notes')

      expect(LocalStorageService.saveLabAnalysis).toHaveBeenCalledWith(
        'dog-1',
        expect.objectContaining({
          ...mockLabResult,
          labType: 'Blood Work',
          notes: 'notes',
        })
      )
    })

    it('extracts facts from lab result and saves them', async () => {
      geminiService.analyzeLab.mockResolvedValue(mockLabResult)
      const fakeFact = { id: 'f3', fact: 'BUN elevated', category: 'lab_result' }
      extractFactsFromLab.mockReturnValue([fakeFact])

      await runLabAnalysis(makeDog(), 'base64data', 'image/png', 'Blood Work', '')

      expect(extractFactsFromLab).toHaveBeenCalledWith(mockLabResult, 'dog-1')
      expect(LocalStorageService.savePetFact).toHaveBeenCalledWith('dog-1', fakeFact)
    })

    it('runs alert engine after lab analysis', async () => {
      geminiService.analyzeLab.mockResolvedValue(mockLabResult)
      extractFactsFromLab.mockReturnValue([])

      await runLabAnalysis(makeDog(), 'base64data', 'image/png', 'Blood Work', '')

      expect(generateAlerts).toHaveBeenCalled()
    })

    it('returns the analysis result', async () => {
      geminiService.analyzeLab.mockResolvedValue(mockLabResult)

      const result = await runLabAnalysis(makeDog(), 'base64data', 'image/png', 'Blood Work', '')

      expect(result).toEqual(mockLabResult)
    })

    it('returns error result without saving when AI returns error', async () => {
      const errorResult = { error: true, message: 'Timeout' }
      geminiService.analyzeLab.mockResolvedValue(errorResult)

      const result = await runLabAnalysis(makeDog(), 'base64data', 'image/png', 'Blood Work', '')

      expect(result).toEqual(errorResult)
      expect(LocalStorageService.saveLabAnalysis).not.toHaveBeenCalled()
      expect(extractFactsFromLab).not.toHaveBeenCalled()
    })
  })

  // =========================================================================
  // Pipeline integration
  // =========================================================================

  describe('pipeline integration', () => {
    it('processes multiple facts from a single analysis', async () => {
      geminiService.analyzePhoto.mockResolvedValue(mockPhotoResult)
      const facts = [
        { id: 'f1', fact: 'redness', category: 'symptom' },
        { id: 'f2', fact: 'swelling', category: 'symptom' },
      ]
      extractFactsFromPhoto.mockReturnValue(facts)

      await runPhotoAnalysis(makeDog(), 'base64data', 'image/jpeg', 'Skin', '')

      expect(LocalStorageService.savePetFact).toHaveBeenCalledTimes(2)
      expect(LocalStorageService.savePetFact).toHaveBeenCalledWith('dog-1', facts[0])
      expect(LocalStorageService.savePetFact).toHaveBeenCalledWith('dog-1', facts[1])
    })

    it('saves multiple alerts from alert engine', async () => {
      geminiService.chat.mockResolvedValue(mockChatResult)
      const alerts = [
        { id: 'a1', type: 'breed_risk' },
        { id: 'a2', type: 'symptom_pattern' },
      ]
      generateAlerts.mockReturnValue(alerts)

      await runChatAnalysis(makeDog(), 'limping', [], null, [], false)

      expect(LocalStorageService.saveAlert).toHaveBeenCalledTimes(2)
    })

    it('passes existing alerts and patterns to alert engine', async () => {
      geminiService.chat.mockResolvedValue(mockChatResult)
      const existingAlerts = [{ id: 'old-alert', type: 'breed_risk' }]
      const existingFacts = [{ id: 'old-fact', tags: ['limping'], category: 'symptom' }]
      const patterns = [{ tag: 'limping', count: 3 }]
      LocalStorageService.getAlerts.mockReturnValue(existingAlerts)
      LocalStorageService.getPetFacts.mockReturnValue(existingFacts)
      detectPatterns.mockReturnValue(patterns)

      await runChatAnalysis(makeDog(), 'limping again', [], null, [], false)

      expect(generateAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          existingAlerts,
          petFacts: existingFacts,
          patterns,
        })
      )
    })
  })
})
