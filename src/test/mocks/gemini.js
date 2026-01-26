/* eslint-disable no-undef */
import { CHAT_SCENARIOS, PHOTO_SCENARIOS } from '../../services/dev/mockResponses'

export const isConfigured = vi.fn(() => true)

export const chat = vi.fn(async () => {
  return CHAT_SCENARIOS.HAPPY_PATH.response
})

export const analyzePhoto = vi.fn(async () => {
  return PHOTO_SCENARIOS.HEALTHY.response
})
