import { describe, it, expect } from 'vitest'
import { generateUUID } from './uuid'

describe('generateUUID', () => {
  it('returns a string in UUID v4 format', () => {
    const uuid = generateUUID()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    expect(uuid).toMatch(uuidRegex)
  })

  it('generates unique values', () => {
    const uuids = new Set()
    for (let i = 0; i < 100; i++) {
      uuids.add(generateUUID())
    }
    expect(uuids.size).toBe(100)
  })

  it('works with fallback when crypto.randomUUID is unavailable', () => {
    const original = crypto.randomUUID
    try {
      crypto.randomUUID = undefined
      const uuid = generateUUID()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      expect(uuid).toMatch(uuidRegex)
    } finally {
      crypto.randomUUID = original
    }
  })
})
