import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { ChatProvider, useChat } from './ChatContext'
import { seedAuthState, TEST_USER } from '../test/test-utils'

function wrapper({ children }) {
  return (
    <AuthProvider>
      <ChatProvider>{children}</ChatProvider>
    </AuthProvider>
  )
}

describe('ChatContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty sessions', () => {
    const { result } = renderHook(() => useChat(), { wrapper })

    expect(result.current.sessions).toEqual([])
    expect(result.current.activeSession).toBeNull()
  })

  it('createSession creates a new session and sets it active', () => {
    seedAuthState()
    const { result } = renderHook(() => useChat(), { wrapper })

    let session
    act(() => {
      session = result.current.createSession('dog-1', { name: 'Buddy' })
    })

    expect(session.id).toBeDefined()
    expect(session.dogId).toBe('dog-1')
    expect(session.title).toBe('New conversation')
    expect(session.messages).toEqual([])
    expect(session.createdAt).toBeDefined()
    expect(result.current.activeSessionId).toBe(session.id)
  })

  it('addMessage appends message to session', () => {
    seedAuthState()
    const { result } = renderHook(() => useChat(), { wrapper })

    let session
    act(() => {
      session = result.current.createSession('dog-1', { name: 'Buddy' })
    })

    act(() => {
      result.current.addMessage(session.id, {
        role: 'user',
        content: 'My dog is limping',
      })
    })

    const updatedSession = result.current.sessions.find(s => s.id === session.id)
    expect(updatedSession.messages).toHaveLength(1)
    expect(updatedSession.messages[0].role).toBe('user')
    expect(updatedSession.messages[0].content).toBe('My dog is limping')
    expect(updatedSession.messages[0].id).toBeDefined()
    expect(updatedSession.messages[0].timestamp).toBeDefined()
  })

  it('auto-generates title from first user message', () => {
    seedAuthState()
    const { result } = renderHook(() => useChat(), { wrapper })

    let session
    act(() => {
      session = result.current.createSession('dog-1', { name: 'Buddy' })
    })

    act(() => {
      result.current.addMessage(session.id, {
        role: 'user',
        content: 'My dog has been scratching a lot lately',
      })
    })

    const updatedSession = result.current.sessions.find(s => s.id === session.id)
    expect(updatedSession.title).toBe('My dog has been scratching a lot lately')
  })

  it('truncates long titles at 50 chars', () => {
    seedAuthState()
    const { result } = renderHook(() => useChat(), { wrapper })

    let session
    act(() => {
      session = result.current.createSession('dog-1', { name: 'Buddy' })
    })

    const longMessage = 'A'.repeat(80)
    act(() => {
      result.current.addMessage(session.id, {
        role: 'user',
        content: longMessage,
      })
    })

    const updatedSession = result.current.sessions.find(s => s.id === session.id)
    expect(updatedSession.title).toBe('A'.repeat(50) + '...')
  })

  it('deleteSession removes session', () => {
    seedAuthState()
    const { result } = renderHook(() => useChat(), { wrapper })

    let session
    act(() => {
      session = result.current.createSession('dog-1', { name: 'Buddy' })
    })

    act(() => {
      result.current.deleteSession(session.id)
    })

    expect(result.current.sessions).toHaveLength(0)
    expect(result.current.activeSessionId).toBeNull()
  })

  it('strips image data on persist', async () => {
    seedAuthState()
    const { result } = renderHook(() => useChat(), { wrapper })

    let session
    act(() => {
      session = result.current.createSession('dog-1', { name: 'Buddy' })
    })

    act(() => {
      result.current.addMessage(session.id, {
        role: 'user',
        content: 'Check this photo',
        image: { base64Data: 'very-large-image-data', mimeType: 'image/jpeg' },
      })
    })

    // Wait for persistence effect
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(`pawsy_${TEST_USER.id}_chat_sessions`))
      expect(stored).toBeDefined()
      expect(stored[0].messages[0].image).toEqual({ hadImage: true })
    })
  })

  it('addHealthEvent tracks health events', () => {
    seedAuthState()
    const { result } = renderHook(() => useChat(), { wrapper })

    let event
    act(() => {
      event = result.current.addHealthEvent('dog-1', {
        type: 'symptom',
        description: 'Limping on left leg',
        urgency: 'moderate',
      })
    })

    expect(event.id).toBeDefined()
    expect(event.dogId).toBe('dog-1')
    expect(event.type).toBe('symptom')
    expect(event.timestamp).toBeDefined()

    const dogEvents = result.current.getHealthEventsForDog('dog-1')
    expect(dogEvents).toHaveLength(1)
  })

  it('getSessionsForDog filters by dog', () => {
    seedAuthState()
    const { result } = renderHook(() => useChat(), { wrapper })

    act(() => {
      result.current.createSession('dog-1', { name: 'Buddy' })
      result.current.createSession('dog-2', { name: 'Max' })
      result.current.createSession('dog-1', { name: 'Buddy' })
    })

    const dog1Sessions = result.current.getSessionsForDog('dog-1')
    expect(dog1Sessions).toHaveLength(2)

    const dog2Sessions = result.current.getSessionsForDog('dog-2')
    expect(dog2Sessions).toHaveLength(1)
  })

  it('clearAllSessions empties all sessions', () => {
    seedAuthState()
    const { result } = renderHook(() => useChat(), { wrapper })

    act(() => {
      result.current.createSession('dog-1', { name: 'Buddy' })
      result.current.createSession('dog-2', { name: 'Max' })
    })

    act(() => {
      result.current.clearAllSessions()
    })

    expect(result.current.sessions).toHaveLength(0)
    expect(result.current.activeSessionId).toBeNull()
  })
})
