import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('signup creates and persists a user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.signup('test@example.com', 'Test User')
    })

    expect(result.current.user).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    })
    expect(result.current.user.id).toBeDefined()
    expect(result.current.isAuthenticated).toBe(true)

    // Check localStorage
    const stored = JSON.parse(localStorage.getItem('pawsy_current_user'))
    expect(stored.email).toBe('test@example.com')

    const users = JSON.parse(localStorage.getItem('pawsy_users'))
    expect(users['test@example.com']).toBeDefined()
  })

  it('signup throws on duplicate email', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.signup('test@example.com', 'User One')
    })

    expect(() => {
      act(() => {
        result.current.signup('test@example.com', 'User Two')
      })
    }).toThrow('Email already registered')
  })

  it('signup with autoLogin logs in existing user instead of throwing', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.signup('test@example.com', 'User One')
    })
    const originalId = result.current.user.id

    act(() => {
      result.current.signup('test@example.com', 'User Two', true)
    })

    // Should log in existing user, not create new
    expect(result.current.user.id).toBe(originalId)
    expect(result.current.user.name).toBe('User One')
  })

  it('login finds existing user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.signup('test@example.com', 'Test User')
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()

    act(() => {
      result.current.login('test@example.com')
    })

    expect(result.current.user.email).toBe('test@example.com')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('login throws for unknown user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(() => {
      act(() => {
        result.current.login('unknown@example.com')
      })
    }).toThrow('User not found')
  })

  it('login with autoCreate creates new user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login('demo@google.com', true)
    })

    expect(result.current.user.email).toBe('demo@google.com')
    expect(result.current.user.name).toBe('Google User')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('logout clears session but keeps user data', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.signup('test@example.com', 'Test User')
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)

    // Current user cleared but registry preserved
    expect(localStorage.getItem('pawsy_current_user')).toBeNull()
    expect(JSON.parse(localStorage.getItem('pawsy_users'))['test@example.com']).toBeDefined()
  })

  it('getUserStorageKey returns null when logged out', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.getUserStorageKey('dogs')).toBeNull()
  })

  it('getUserStorageKey returns prefixed key when logged in', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.signup('test@example.com', 'Test User')
    })

    const key = result.current.getUserStorageKey('dogs')
    expect(key).toBe(`pawsy_${result.current.user.id}_dogs`)
  })

  it('restores user from localStorage on mount', () => {
    const user = {
      id: 'restored-id',
      email: 'restored@example.com',
      name: 'Restored User',
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('pawsy_current_user', JSON.stringify(user))

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user.id).toBe('restored-id')
    expect(result.current.isAuthenticated).toBe(true)
  })
})
