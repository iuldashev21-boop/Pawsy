import { describe, it, expect, beforeEach } from 'vitest'
import LocalStorageService from '../../../../src/services/storage/LocalStorageService'

describe('LocalStorageService', () => {
  const userId = 'user-abc-123'
  const otherUserId = 'user-xyz-789'

  beforeEach(() => {
    localStorage.clear()
  })

  // ---------------------------------------------------------------------------
  // Dogs
  // ---------------------------------------------------------------------------
  describe('getDogs', () => {
    it('returns an empty array when no dogs exist', () => {
      const dogs = LocalStorageService.getDogs(userId)
      expect(dogs).toEqual([])
    })

    it('returns dogs from localStorage for the given user', () => {
      const dogs = [
        { id: 'dog-1', name: 'Luna', breed: 'Beagle' },
        { id: 'dog-2', name: 'Max', breed: 'Poodle' },
      ]
      localStorage.setItem(`pawsy_${userId}_dogs`, JSON.stringify(dogs))

      const result = LocalStorageService.getDogs(userId)
      expect(result).toEqual(dogs)
      expect(result).toHaveLength(2)
    })

    it('returns dogs scoped to the correct user', () => {
      localStorage.setItem(
        `pawsy_${userId}_dogs`,
        JSON.stringify([{ id: 'dog-1', name: 'Luna' }])
      )
      localStorage.setItem(
        `pawsy_${otherUserId}_dogs`,
        JSON.stringify([{ id: 'dog-2', name: 'Rex' }])
      )

      const result = LocalStorageService.getDogs(userId)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Luna')
    })

    it('returns an empty array for corrupted JSON', () => {
      localStorage.setItem(`pawsy_${userId}_dogs`, '{bad json')
      const result = LocalStorageService.getDogs(userId)
      expect(result).toEqual([])
    })
  })

  describe('saveDog', () => {
    it('persists a dog to localStorage', () => {
      const dog = { id: 'dog-1', name: 'Bella', breed: 'Golden Retriever' }
      LocalStorageService.saveDog(userId, dog)

      const stored = JSON.parse(localStorage.getItem(`pawsy_${userId}_dogs`))
      expect(stored).toHaveLength(1)
      expect(stored[0]).toMatchObject({ id: 'dog-1', name: 'Bella' })
    })

    it('appends to existing dogs without overwriting', () => {
      LocalStorageService.saveDog(userId, { id: 'dog-1', name: 'Luna' })
      LocalStorageService.saveDog(userId, { id: 'dog-2', name: 'Max' })

      const dogs = LocalStorageService.getDogs(userId)
      expect(dogs).toHaveLength(2)
      expect(dogs.map((d) => d.name)).toEqual(['Luna', 'Max'])
    })

    it('assigns createdAt and updatedAt timestamps', () => {
      const dog = { id: 'dog-1', name: 'Buddy' }
      LocalStorageService.saveDog(userId, dog)

      const saved = LocalStorageService.getDogs(userId)[0]
      expect(saved.createdAt).toBeDefined()
      expect(saved.updatedAt).toBeDefined()
    })
  })

  describe('getDog', () => {
    it('returns a specific dog by id', () => {
      LocalStorageService.saveDog(userId, { id: 'dog-1', name: 'Luna' })
      LocalStorageService.saveDog(userId, { id: 'dog-2', name: 'Max' })

      const dog = LocalStorageService.getDog(userId, 'dog-2')
      expect(dog).toBeDefined()
      expect(dog.name).toBe('Max')
    })

    it('returns undefined when dog id does not exist', () => {
      LocalStorageService.saveDog(userId, { id: 'dog-1', name: 'Luna' })

      const dog = LocalStorageService.getDog(userId, 'dog-999')
      expect(dog).toBeUndefined()
    })

    it('returns undefined when no dogs exist', () => {
      const dog = LocalStorageService.getDog(userId, 'dog-1')
      expect(dog).toBeUndefined()
    })
  })

  describe('updateDog', () => {
    it('merges updates into the existing dog', () => {
      LocalStorageService.saveDog(userId, {
        id: 'dog-1',
        name: 'Luna',
        breed: 'Beagle',
        weight: 20,
      })

      LocalStorageService.updateDog(userId, 'dog-1', { weight: 22, allergies: ['Chicken'] })

      const updated = LocalStorageService.getDog(userId, 'dog-1')
      expect(updated.weight).toBe(22)
      expect(updated.allergies).toEqual(['Chicken'])
      expect(updated.name).toBe('Luna')
      expect(updated.breed).toBe('Beagle')
    })

    it('updates the updatedAt timestamp', () => {
      LocalStorageService.saveDog(userId, { id: 'dog-1', name: 'Luna' })
      const before = LocalStorageService.getDog(userId, 'dog-1').updatedAt

      // Small delay to ensure timestamp differs
      LocalStorageService.updateDog(userId, 'dog-1', { weight: 25 })
      const after = LocalStorageService.getDog(userId, 'dog-1').updatedAt

      expect(after).toBeDefined()
      expect(new Date(after).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime())
    })

    it('does not affect other dogs', () => {
      LocalStorageService.saveDog(userId, { id: 'dog-1', name: 'Luna' })
      LocalStorageService.saveDog(userId, { id: 'dog-2', name: 'Max' })

      LocalStorageService.updateDog(userId, 'dog-1', { name: 'Luna Updated' })

      expect(LocalStorageService.getDog(userId, 'dog-2').name).toBe('Max')
    })
  })

  describe('deleteDog', () => {
    it('removes the dog from the array', () => {
      LocalStorageService.saveDog(userId, { id: 'dog-1', name: 'Luna' })
      LocalStorageService.saveDog(userId, { id: 'dog-2', name: 'Max' })

      LocalStorageService.deleteDog(userId, 'dog-1')

      const dogs = LocalStorageService.getDogs(userId)
      expect(dogs).toHaveLength(1)
      expect(dogs[0].id).toBe('dog-2')
    })

    it('is a no-op when the dog does not exist', () => {
      LocalStorageService.saveDog(userId, { id: 'dog-1', name: 'Luna' })

      LocalStorageService.deleteDog(userId, 'dog-999')

      expect(LocalStorageService.getDogs(userId)).toHaveLength(1)
    })

    it('results in an empty array when the last dog is deleted', () => {
      LocalStorageService.saveDog(userId, { id: 'dog-1', name: 'Luna' })
      LocalStorageService.deleteDog(userId, 'dog-1')

      expect(LocalStorageService.getDogs(userId)).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // Pet Facts
  // ---------------------------------------------------------------------------
  describe('getPetFacts', () => {
    it('returns an empty array when no facts exist', () => {
      const facts = LocalStorageService.getPetFacts('dog-1')
      expect(facts).toEqual([])
    })

    it('returns facts sorted by createdAt descending (newest first)', () => {
      const dogId = 'dog-1'
      const older = { id: 'f1', text: 'Loves belly rubs', createdAt: '2026-01-01T10:00:00Z' }
      const newer = { id: 'f2', text: 'Afraid of thunder', createdAt: '2026-01-15T10:00:00Z' }
      const newest = { id: 'f3', text: 'Eats fast', createdAt: '2026-01-20T10:00:00Z' }

      // Save in non-sorted order
      LocalStorageService.savePetFact(dogId, older)
      LocalStorageService.savePetFact(dogId, newest)
      LocalStorageService.savePetFact(dogId, newer)

      const facts = LocalStorageService.getPetFacts(dogId)
      expect(facts).toHaveLength(3)
      expect(facts[0].id).toBe('f3') // newest
      expect(facts[1].id).toBe('f2')
      expect(facts[2].id).toBe('f1') // oldest
    })
  })

  describe('savePetFact', () => {
    it('persists a fact and retrieves it correctly', () => {
      const dogId = 'dog-1'
      const fact = { id: 'f1', text: 'Loves belly rubs', createdAt: '2026-01-10T10:00:00Z' }

      LocalStorageService.savePetFact(dogId, fact)

      const facts = LocalStorageService.getPetFacts(dogId)
      expect(facts).toHaveLength(1)
      expect(facts[0]).toMatchObject({ id: 'f1', text: 'Loves belly rubs' })
    })

    it('stores facts under the correct key', () => {
      const dogId = 'dog-1'
      LocalStorageService.savePetFact(dogId, { id: 'f1', text: 'Fact 1' })

      const raw = localStorage.getItem(`pawsy_facts_${dogId}`)
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(1)
    })

    it('keeps facts for different dogs separate', () => {
      LocalStorageService.savePetFact('dog-1', { id: 'f1', text: 'Fact for dog 1' })
      LocalStorageService.savePetFact('dog-2', { id: 'f2', text: 'Fact for dog 2' })

      expect(LocalStorageService.getPetFacts('dog-1')).toHaveLength(1)
      expect(LocalStorageService.getPetFacts('dog-2')).toHaveLength(1)
      expect(LocalStorageService.getPetFacts('dog-1')[0].text).toBe('Fact for dog 1')
    })
  })

  // ---------------------------------------------------------------------------
  // Chat Sessions
  // ---------------------------------------------------------------------------
  describe('getChatSessions', () => {
    it('returns an empty array when no sessions exist', () => {
      const sessions = LocalStorageService.getChatSessions(userId)
      expect(sessions).toEqual([])
    })

    it('returns sessions sorted by updatedAt descending (newest first)', () => {
      const older = {
        id: 's1',
        title: 'Old chat',
        messages: [],
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      }
      const newer = {
        id: 's2',
        title: 'Recent chat',
        messages: [],
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
      }

      LocalStorageService.saveChatSession(userId, older)
      LocalStorageService.saveChatSession(userId, newer)

      const sessions = LocalStorageService.getChatSessions(userId)
      expect(sessions).toHaveLength(2)
      expect(sessions[0].id).toBe('s2') // newest first
      expect(sessions[1].id).toBe('s1')
    })
  })

  describe('saveChatSession', () => {
    it('persists a chat session correctly', () => {
      const session = {
        id: 's1',
        dogId: 'dog-1',
        title: 'Ear scratching',
        messages: [{ role: 'user', content: 'My dog is scratching his ear' }],
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-01-10T10:00:00Z',
      }

      LocalStorageService.saveChatSession(userId, session)

      const sessions = LocalStorageService.getChatSessions(userId)
      expect(sessions).toHaveLength(1)
      expect(sessions[0]).toMatchObject({
        id: 's1',
        dogId: 'dog-1',
        title: 'Ear scratching',
      })
      expect(sessions[0].messages).toHaveLength(1)
    })

    it('stores under the user-scoped key', () => {
      const session = { id: 's1', title: 'Test', messages: [], updatedAt: new Date().toISOString() }
      LocalStorageService.saveChatSession(userId, session)

      const raw = localStorage.getItem(`pawsy_${userId}_chat_sessions`)
      expect(raw).toBeTruthy()
    })
  })

  // ---------------------------------------------------------------------------
  // Health Events
  // ---------------------------------------------------------------------------
  describe('getHealthEvents', () => {
    it('returns an empty array when no events exist', () => {
      const events = LocalStorageService.getHealthEvents(userId)
      expect(events).toEqual([])
    })

    it('returns stored health events', () => {
      const event = {
        id: 'e1',
        dogId: 'dog-1',
        type: 'symptom',
        title: 'Limping',
        timestamp: '2026-01-20T10:00:00Z',
      }
      LocalStorageService.saveHealthEvent(userId, event)

      const events = LocalStorageService.getHealthEvents(userId)
      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({ id: 'e1', type: 'symptom', title: 'Limping' })
    })
  })

  describe('saveHealthEvent', () => {
    it('persists a health event correctly', () => {
      const event = {
        id: 'e1',
        dogId: 'dog-1',
        type: 'chat',
        title: 'Scratching ears',
        urgency: 'low',
        timestamp: '2026-01-20T10:00:00Z',
      }
      LocalStorageService.saveHealthEvent(userId, event)

      const raw = localStorage.getItem(`pawsy_${userId}_health_events`)
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].title).toBe('Scratching ears')
    })

    it('appends multiple events', () => {
      LocalStorageService.saveHealthEvent(userId, {
        id: 'e1',
        type: 'symptom',
        timestamp: '2026-01-18T10:00:00Z',
      })
      LocalStorageService.saveHealthEvent(userId, {
        id: 'e2',
        type: 'photo',
        timestamp: '2026-01-20T10:00:00Z',
      })

      const events = LocalStorageService.getHealthEvents(userId)
      expect(events).toHaveLength(2)
    })
  })

  // ---------------------------------------------------------------------------
  // Photo Analyses
  // ---------------------------------------------------------------------------
  describe('getPhotoAnalyses', () => {
    it('returns an empty array when none exist', () => {
      const analyses = LocalStorageService.getPhotoAnalyses('dog-1')
      expect(analyses).toEqual([])
    })

    it('returns analyses sorted by createdAt descending', () => {
      const dogId = 'dog-1'
      const older = {
        id: 'a1',
        bodyArea: 'ear',
        summary: 'Minor redness',
        createdAt: '2026-01-10T10:00:00Z',
      }
      const newer = {
        id: 'a2',
        bodyArea: 'paw',
        summary: 'Small cut',
        createdAt: '2026-01-20T10:00:00Z',
      }

      LocalStorageService.savePhotoAnalysis(dogId, older)
      LocalStorageService.savePhotoAnalysis(dogId, newer)

      const analyses = LocalStorageService.getPhotoAnalyses(dogId)
      expect(analyses).toHaveLength(2)
      expect(analyses[0].id).toBe('a2') // newest first
      expect(analyses[1].id).toBe('a1')
    })
  })

  describe('savePhotoAnalysis', () => {
    it('persists an analysis without base64 image data', () => {
      const dogId = 'dog-1'
      const analysis = {
        id: 'a1',
        bodyArea: 'skin',
        summary: 'Mild irritation',
        base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...',
        imageBase64: 'data:image/png;base64,iVBORw0KGgo...',
        createdAt: '2026-01-20T10:00:00Z',
      }

      LocalStorageService.savePhotoAnalysis(dogId, analysis)

      const saved = LocalStorageService.getPhotoAnalyses(dogId)[0]
      expect(saved.summary).toBe('Mild irritation')
      expect(saved.bodyArea).toBe('skin')
      // base64 data should be stripped to save storage space
      expect(saved.base64Data).toBeUndefined()
      expect(saved.imageBase64).toBeUndefined()
    })

    it('preserves non-base64 fields', () => {
      const dogId = 'dog-1'
      const analysis = {
        id: 'a1',
        bodyArea: 'paw',
        summary: 'Small cut on pad',
        urgency_level: 'low',
        possible_conditions: ['Minor laceration'],
        createdAt: '2026-01-20T10:00:00Z',
      }

      LocalStorageService.savePhotoAnalysis(dogId, analysis)

      const saved = LocalStorageService.getPhotoAnalyses(dogId)[0]
      expect(saved.urgency_level).toBe('low')
      expect(saved.possible_conditions).toEqual(['Minor laceration'])
    })
  })

  // ---------------------------------------------------------------------------
  // Alerts
  // ---------------------------------------------------------------------------
  describe('getAlerts', () => {
    it('returns an empty array when no alerts exist', () => {
      const alerts = LocalStorageService.getAlerts('dog-1')
      expect(alerts).toEqual([])
    })

    it('returns stored alerts for a dog', () => {
      const dogId = 'dog-1'
      const alert = {
        id: 'al-1',
        type: 'vaccination',
        message: 'Rabies vaccination due',
        dueDate: '2026-02-15',
      }
      LocalStorageService.saveAlert(dogId, alert)

      const alerts = LocalStorageService.getAlerts(dogId)
      expect(alerts).toHaveLength(1)
      expect(alerts[0]).toMatchObject({
        id: 'al-1',
        type: 'vaccination',
        message: 'Rabies vaccination due',
      })
    })
  })

  describe('saveAlert', () => {
    it('persists an alert correctly', () => {
      const dogId = 'dog-1'
      const alert = {
        id: 'al-1',
        type: 'medication',
        message: 'Time for heartworm pill',
        dueDate: '2026-02-01',
      }

      LocalStorageService.saveAlert(dogId, alert)

      const alerts = LocalStorageService.getAlerts(dogId)
      expect(alerts).toHaveLength(1)
      expect(alerts[0].type).toBe('medication')
    })

    it('appends multiple alerts', () => {
      const dogId = 'dog-1'
      LocalStorageService.saveAlert(dogId, { id: 'al-1', type: 'vaccination' })
      LocalStorageService.saveAlert(dogId, { id: 'al-2', type: 'medication' })

      expect(LocalStorageService.getAlerts(dogId)).toHaveLength(2)
    })
  })

  describe('updateAlert', () => {
    it('modifies an alert in place', () => {
      const dogId = 'dog-1'
      LocalStorageService.saveAlert(dogId, {
        id: 'al-1',
        type: 'vaccination',
        message: 'Rabies due',
        dismissed: false,
      })

      LocalStorageService.updateAlert(dogId, 'al-1', { dismissed: true })

      const alerts = LocalStorageService.getAlerts(dogId)
      expect(alerts).toHaveLength(1)
      expect(alerts[0].dismissed).toBe(true)
      expect(alerts[0].message).toBe('Rabies due') // other fields preserved
    })

    it('does not affect other alerts', () => {
      const dogId = 'dog-1'
      LocalStorageService.saveAlert(dogId, { id: 'al-1', type: 'vaccination', dismissed: false })
      LocalStorageService.saveAlert(dogId, { id: 'al-2', type: 'medication', dismissed: false })

      LocalStorageService.updateAlert(dogId, 'al-1', { dismissed: true })

      const alerts = LocalStorageService.getAlerts(dogId)
      const untouched = alerts.find((a) => a.id === 'al-2')
      expect(untouched.dismissed).toBe(false)
    })

    it('is a no-op when the alert does not exist', () => {
      const dogId = 'dog-1'
      LocalStorageService.saveAlert(dogId, { id: 'al-1', type: 'vaccination' })

      // Should not throw
      LocalStorageService.updateAlert(dogId, 'al-999', { dismissed: true })

      expect(LocalStorageService.getAlerts(dogId)).toHaveLength(1)
    })
  })
})
