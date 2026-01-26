import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { OnboardingProvider, useOnboarding } from './OnboardingContext'
import { seedAuthState, TEST_USER } from '../test/test-utils'

function wrapper({ children }) {
  return (
    <AuthProvider>
      <OnboardingProvider>{children}</OnboardingProvider>
    </AuthProvider>
  )
}

describe('OnboardingContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('new user sees welcome modal', async () => {
    seedAuthState()
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    await waitFor(() => {
      expect(result.current.showWelcome).toBe(true)
    })
  })

  it('dismissWelcome hides modal and marks step complete', async () => {
    seedAuthState()
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    await waitFor(() => {
      expect(result.current.showWelcome).toBe(true)
    })

    act(() => {
      result.current.dismissWelcome()
    })

    expect(result.current.showWelcome).toBe(false)
    expect(result.current.progress.welcomeSeen).toBe(true)
  })

  it('completeStep persists progress', async () => {
    seedAuthState()
    // Pre-seed with welcomeSeen so it doesn't override
    localStorage.setItem(`pawsy_${TEST_USER.id}_onboarding`, JSON.stringify({
      welcomeSeen: true,
      hasDog: false,
      firstChat: false,
      firstPhoto: false,
      checkedFood: false,
      viewedGuides: false,
    }))

    const { result } = renderHook(() => useOnboarding(), { wrapper })

    await waitFor(() => {
      expect(result.current.progress.welcomeSeen).toBe(true)
    })

    act(() => {
      result.current.completeStep('hasDog')
    })

    expect(result.current.progress.hasDog).toBe(true)

    // Check localStorage
    const stored = JSON.parse(localStorage.getItem(`pawsy_${TEST_USER.id}_onboarding`))
    expect(stored.hasDog).toBe(true)
  })

  it('triggers celebration for milestone steps', async () => {
    seedAuthState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_onboarding`, JSON.stringify({
      welcomeSeen: true,
      hasDog: false,
      firstChat: false,
      firstPhoto: false,
      checkedFood: false,
      viewedGuides: false,
    }))

    const { result } = renderHook(() => useOnboarding(), { wrapper })

    await waitFor(() => {
      expect(result.current.progress.welcomeSeen).toBe(true)
    })

    act(() => {
      result.current.completeStep('firstChat')
    })

    expect(result.current.celebration.show).toBe(true)
    expect(result.current.celebration.message).toBe('First chat complete!')
  })

  it('clearCelebration hides celebration', async () => {
    seedAuthState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_onboarding`, JSON.stringify({
      welcomeSeen: true,
      hasDog: false,
      firstChat: false,
      firstPhoto: false,
      checkedFood: false,
      viewedGuides: false,
    }))

    const { result } = renderHook(() => useOnboarding(), { wrapper })

    await waitFor(() => {
      expect(result.current.progress.welcomeSeen).toBe(true)
    })

    act(() => {
      result.current.completeStep('hasDog')
    })

    act(() => {
      result.current.clearCelebration()
    })

    expect(result.current.celebration.show).toBe(false)
  })

  it('isOnboardingComplete is true when all 4 main steps done', async () => {
    seedAuthState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_onboarding`, JSON.stringify({
      welcomeSeen: true,
      hasDog: true,
      firstChat: true,
      firstPhoto: true,
      checkedFood: true,
      viewedGuides: false,
    }))

    const { result } = renderHook(() => useOnboarding(), { wrapper })

    await waitFor(() => {
      expect(result.current.isOnboardingComplete).toBe(true)
    })

    expect(result.current.completedCount).toBe(4)
    expect(result.current.showChecklist).toBe(false)
  })

  it('showChecklist is true when welcome seen but steps incomplete', async () => {
    seedAuthState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_onboarding`, JSON.stringify({
      welcomeSeen: true,
      hasDog: true,
      firstChat: false,
      firstPhoto: false,
      checkedFood: false,
      viewedGuides: false,
    }))

    const { result } = renderHook(() => useOnboarding(), { wrapper })

    await waitFor(() => {
      expect(result.current.showChecklist).toBe(true)
    })

    expect(result.current.completedCount).toBe(1)
  })

  it('completing a step twice is a no-op', async () => {
    seedAuthState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_onboarding`, JSON.stringify({
      welcomeSeen: true,
      hasDog: true,
      firstChat: false,
      firstPhoto: false,
      checkedFood: false,
      viewedGuides: false,
    }))

    const { result } = renderHook(() => useOnboarding(), { wrapper })

    await waitFor(() => {
      expect(result.current.progress.hasDog).toBe(true)
    })

    act(() => {
      result.current.completeStep('hasDog')
    })

    // Should not trigger celebration for already-complete step
    expect(result.current.celebration.show).toBe(false)
  })
})
