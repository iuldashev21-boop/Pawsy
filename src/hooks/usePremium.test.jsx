import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../context/AuthContext'
import { usePremium } from './usePremium'
import { seedAuthState, TEST_USER } from '../test/test-utils'

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('usePremium', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns false with no user', () => {
    const { result } = renderHook(() => usePremium(), { wrapper })
    expect(result.current.isPremium).toBe(false)
  })

  it('returns false for new authenticated user', () => {
    seedAuthState()
    const { result } = renderHook(() => usePremium(), { wrapper })
    expect(result.current.isPremium).toBe(false)
  })

  it('setPremium persists to localStorage', () => {
    seedAuthState()
    const { result } = renderHook(() => usePremium(), { wrapper })

    act(() => {
      result.current.setPremium(true)
    })

    expect(result.current.isPremium).toBe(true)
    expect(localStorage.getItem(`pawsy_${TEST_USER.id}_premium_status`)).toBe('true')
  })

  it('togglePremium flips state', () => {
    seedAuthState()
    const { result } = renderHook(() => usePremium(), { wrapper })

    expect(result.current.isPremium).toBe(false)

    act(() => {
      result.current.togglePremium()
    })

    expect(result.current.isPremium).toBe(true)

    act(() => {
      result.current.togglePremium()
    })

    expect(result.current.isPremium).toBe(false)
  })

  it('reads premium state from localStorage on mount', () => {
    seedAuthState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')

    const { result } = renderHook(() => usePremium(), { wrapper })
    expect(result.current.isPremium).toBe(true)
  })
})
