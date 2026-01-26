import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { UsageProvider, useUsage } from './UsageContext'
import { seedAuthState, TEST_USER } from '../test/test-utils'
import { USAGE_LIMITS } from '../constants/usage'

// UsageProvider depends on AuthProvider and usePremium (which uses AuthContext)
function wrapper({ children }) {
  return (
    <AuthProvider>
      <UsageProvider>{children}</UsageProvider>
    </AuthProvider>
  )
}

describe('UsageContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides default usage for new user', async () => {
    seedAuthState()
    const { result } = renderHook(() => useUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.canChat).toBe(true)
    expect(result.current.canPhoto).toBe(true)
    expect(result.current.usage.chatsUsedToday).toBe(0)
    expect(result.current.usage.photosUsedToday).toBe(0)
  })

  it('first day has higher limits', async () => {
    seedAuthState()
    const { result } = renderHook(() => useUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // On first day, limits should use firstDay values
    expect(result.current.isFirstDay).toBe(true)
    expect(result.current.limits.dailyChats).toBe(USAGE_LIMITS.firstDayChats)
    expect(result.current.limits.dailyPhotos).toBe(USAGE_LIMITS.firstDayPhotos)
  })

  it('non-first day has normal limits', async () => {
    seedAuthState()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    localStorage.setItem(`pawsy_${TEST_USER.id}_usage`, JSON.stringify({
      chatsUsedToday: 0,
      photosUsedToday: 0,
      emergencyChatsUsed: 0,
      emergencyPhotosUsed: 0,
      lastResetDate: today,
      firstDayDate: yesterdayStr,
    }))

    const { result } = renderHook(() => useUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isFirstDay).toBe(false)
    expect(result.current.limits.dailyChats).toBe(USAGE_LIMITS.dailyChats)
    expect(result.current.limits.dailyPhotos).toBe(USAGE_LIMITS.dailyPhotos)
  })

  it('useChat decrements remaining and enforces limits', async () => {
    seedAuthState()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    localStorage.setItem(`pawsy_${TEST_USER.id}_usage`, JSON.stringify({
      chatsUsedToday: USAGE_LIMITS.dailyChats - 1,
      photosUsedToday: 0,
      emergencyChatsUsed: 0,
      emergencyPhotosUsed: 0,
      lastResetDate: today,
      firstDayDate: yesterday.toISOString().split('T')[0],
    }))

    const { result } = renderHook(() => useUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.chatsRemaining).toBe(1)
    expect(result.current.canChat).toBe(true)

    // Use the last chat
    act(() => {
      result.current.useChat()
    })

    expect(result.current.chatsRemaining).toBe(0)
    expect(result.current.canChat).toBe(false)

    // Trying to use another should fail
    let usedChat
    act(() => {
      usedChat = result.current.useChat()
    })
    expect(usedChat).toBe(false)
  })

  it('usePhoto decrements remaining and enforces limits', async () => {
    seedAuthState()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    localStorage.setItem(`pawsy_${TEST_USER.id}_usage`, JSON.stringify({
      chatsUsedToday: 0,
      photosUsedToday: USAGE_LIMITS.dailyPhotos - 1,
      emergencyChatsUsed: 0,
      emergencyPhotosUsed: 0,
      lastResetDate: today,
      firstDayDate: yesterday.toISOString().split('T')[0],
    }))

    const { result } = renderHook(() => useUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.canPhoto).toBe(true)

    act(() => {
      result.current.usePhoto()
    })

    expect(result.current.canPhoto).toBe(false)
  })

  it('emergency overrides work independently', async () => {
    seedAuthState()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // User has exhausted regular chats
    localStorage.setItem(`pawsy_${TEST_USER.id}_usage`, JSON.stringify({
      chatsUsedToday: USAGE_LIMITS.dailyChats,
      photosUsedToday: 0,
      emergencyChatsUsed: 0,
      emergencyPhotosUsed: 0,
      lastResetDate: today,
      firstDayDate: yesterday.toISOString().split('T')[0],
    }))

    const { result } = renderHook(() => useUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.canChat).toBe(false)
    expect(result.current.canEmergencyChat).toBe(true)
    expect(result.current.emergencyChatsRemaining).toBe(USAGE_LIMITS.emergencyChats)

    act(() => {
      result.current.useEmergencyChat()
    })

    expect(result.current.emergencyChatsRemaining).toBe(USAGE_LIMITS.emergencyChats - 1)
  })

  it('daily reset clears counts on new date', async () => {
    seedAuthState()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Usage from yesterday
    localStorage.setItem(`pawsy_${TEST_USER.id}_usage`, JSON.stringify({
      chatsUsedToday: 3,
      photosUsedToday: 2,
      emergencyChatsUsed: 1,
      emergencyPhotosUsed: 0,
      lastResetDate: yesterdayStr,
      firstDayDate: yesterdayStr,
    }))

    const { result } = renderHook(() => useUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Daily counts should have been reset
    expect(result.current.usage.chatsUsedToday).toBe(0)
    expect(result.current.usage.photosUsedToday).toBe(0)
    // firstDayDate should be preserved
    expect(result.current.usage.firstDayDate).toBe(yesterdayStr)
  })

  it('resetUsage clears all counts', async () => {
    seedAuthState()
    const today = new Date().toISOString().split('T')[0]

    localStorage.setItem(`pawsy_${TEST_USER.id}_usage`, JSON.stringify({
      chatsUsedToday: 3,
      photosUsedToday: 2,
      emergencyChatsUsed: 1,
      emergencyPhotosUsed: 1,
      lastResetDate: today,
      firstDayDate: today,
    }))

    const { result } = renderHook(() => useUsage(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.resetUsage()
    })

    expect(result.current.usage.chatsUsedToday).toBe(0)
    expect(result.current.usage.photosUsedToday).toBe(0)
  })
})
