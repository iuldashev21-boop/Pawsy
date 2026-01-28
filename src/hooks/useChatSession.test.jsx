import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../context/AuthContext'
import { DogProvider } from '../context/DogContext'
import { ChatProvider } from '../context/ChatContext'
import { UsageProvider } from '../context/UsageContext'
import { OnboardingProvider } from '../context/OnboardingContext'
import { ToastProvider } from '../context/ToastContext'
import { seedFullAppState, TEST_USER, TEST_DOG } from '../test/test-utils'
import { useChatSession } from './useChatSession'

// Mock geminiService
vi.mock('../services/api/gemini', () => ({
  geminiService: {
    isConfigured: vi.fn(() => true),
    chat: vi.fn(async () => ({
      error: false,
      message: 'AI response about your dog',
      follow_up_questions: [],
      quick_replies: [],
      concerns_detected: false,
      suggested_action: 'continue_chat',
      urgency_level: 'low',
      symptoms_mentioned: [],
      possible_conditions: [],
      recommended_actions: [],
      home_care_tips: [],
      should_see_vet: false,
      emergency_steps: [],
    })),
  },
}))

function wrapper({ children }) {
  return (
    <AuthProvider>
      <DogProvider>
        <UsageProvider>
          <ChatProvider>
            <OnboardingProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </OnboardingProvider>
          </ChatProvider>
        </UsageProvider>
      </DogProvider>
    </AuthProvider>
  )
}

describe('useChatSession', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── Basic return shape ──

  it('returns the expected shape', () => {
    seedFullAppState()
    const { result } = renderHook(() => useChatSession(), { wrapper })

    expect(result.current).toHaveProperty('messages')
    expect(result.current).toHaveProperty('sendMessage')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('activeSession')
    expect(result.current).toHaveProperty('sessions')
    expect(result.current).toHaveProperty('loadSession')
    expect(result.current).toHaveProperty('createNewSession')
  })

  it('initializes with empty messages', () => {
    seedFullAppState()
    const { result } = renderHook(() => useChatSession(), { wrapper })

    expect(result.current.messages).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  // ── Free user behavior ──

  it('keeps messages in-memory only for free users', async () => {
    seedFullAppState()
    const { result } = renderHook(() => useChatSession(), { wrapper })

    await act(async () => {
      await result.current.sendMessage('Hello')
    })

    // Messages should exist in state
    expect(result.current.messages.length).toBeGreaterThanOrEqual(1)
    // No active session for free users (not persisted)
    expect(result.current.activeSession).toBeNull()
  })

  it('free user sendMessage adds user message and AI response', async () => {
    seedFullAppState()
    const { result } = renderHook(() => useChatSession(), { wrapper })

    await act(async () => {
      await result.current.sendMessage('My dog is limping')
    })

    const userMsg = result.current.messages.find(m => m.role === 'user')
    const aiMsg = result.current.messages.find(m => m.role === 'assistant')
    expect(userMsg).toBeDefined()
    expect(userMsg.content).toBe('My dog is limping')
    expect(aiMsg).toBeDefined()
    expect(aiMsg.content).toBe('AI response about your dog')
  })

  it('free user sessions list is empty', () => {
    seedFullAppState()
    const { result } = renderHook(() => useChatSession(), { wrapper })

    expect(result.current.sessions).toEqual([])
  })

  // ── Premium user behavior ──

  it('auto-creates a session on first sendMessage for premium users', async () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    const { result } = renderHook(() => useChatSession(), { wrapper })

    await act(async () => {
      await result.current.sendMessage('My dog has a rash')
    })

    expect(result.current.activeSession).not.toBeNull()
    expect(result.current.activeSession.dogId).toBe(TEST_DOG.id)
  })

  it('persists messages in session for premium users', async () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    const { result } = renderHook(() => useChatSession(), { wrapper })

    await act(async () => {
      await result.current.sendMessage('Tell me about fleas')
    })

    // Active session should exist and have messages
    expect(result.current.activeSession).not.toBeNull()
    // The session should have at least 1 message (context updates batch)
    expect(result.current.activeSession.messages.length).toBeGreaterThanOrEqual(1)
    // messages should mirror activeSession
    expect(result.current.messages.length).toBeGreaterThanOrEqual(1)
  })

  it('premium user sessions list includes created session', async () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    const { result } = renderHook(() => useChatSession(), { wrapper })

    await act(async () => {
      await result.current.sendMessage('Question about diet')
    })

    expect(result.current.sessions.length).toBe(1)
  })

  // ── createNewSession ──

  it('createNewSession clears messages and starts fresh for premium users', async () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    const { result } = renderHook(() => useChatSession(), { wrapper })

    // Send a message to create a session
    await act(async () => {
      await result.current.sendMessage('First session message')
    })

    expect(result.current.messages.length).toBeGreaterThan(0)

    // Create new session
    act(() => {
      result.current.createNewSession()
    })

    expect(result.current.messages).toEqual([])
  })

  it('createNewSession resets messages for free user', async () => {
    seedFullAppState()
    const { result } = renderHook(() => useChatSession(), { wrapper })

    await act(async () => {
      await result.current.sendMessage('Some question')
    })

    expect(result.current.messages.length).toBeGreaterThan(0)

    act(() => {
      result.current.createNewSession()
    })

    expect(result.current.messages).toEqual([])
  })

  // ── loadSession ──

  it('loadSession loads messages from an existing session for premium users', async () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
    const { result } = renderHook(() => useChatSession(), { wrapper })

    // Create first session with a message
    await act(async () => {
      await result.current.sendMessage('First session')
    })

    const firstSessionId = result.current.activeSession.id

    // Create new session
    act(() => {
      result.current.createNewSession()
    })

    expect(result.current.messages).toEqual([])

    // Load the first session
    act(() => {
      result.current.loadSession(firstSessionId)
    })

    expect(result.current.messages.length).toBeGreaterThan(0)
    expect(result.current.activeSession.id).toBe(firstSessionId)
  })

  // ── isLoading state ──

  it('isLoading is false after sendMessage completes', async () => {
    seedFullAppState()
    const { result } = renderHook(() => useChatSession(), { wrapper })

    // Before sending
    expect(result.current.isLoading).toBe(false)

    await act(async () => {
      await result.current.sendMessage('Loading test')
    })

    // After completion, isLoading should be false
    expect(result.current.isLoading).toBe(false)
    // And messages should be populated
    expect(result.current.messages.length).toBeGreaterThan(0)
  })

  // ── Error handling ──

  it('handles API error gracefully', async () => {
    seedFullAppState()
    const { geminiService } = await import('../services/api/gemini')
    geminiService.chat.mockImplementationOnce(async () => ({
      error: true,
      message: 'Something went wrong',
    }))

    const { result } = renderHook(() => useChatSession(), { wrapper })

    await act(async () => {
      await result.current.sendMessage('Error test')
    })

    // Should still have the user message
    const userMsg = result.current.messages.find(m => m.role === 'user')
    expect(userMsg).toBeDefined()
    // Should have error assistant message
    const errMsg = result.current.messages.find(m => m.role === 'assistant')
    expect(errMsg).toBeDefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('handles thrown exceptions from geminiService', async () => {
    seedFullAppState()
    const { geminiService } = await import('../services/api/gemini')
    geminiService.chat.mockImplementationOnce(async () => {
      throw new Error('Network failure')
    })

    const { result } = renderHook(() => useChatSession(), { wrapper })

    await act(async () => {
      await result.current.sendMessage('Crash test')
    })

    const userMsg = result.current.messages.find(m => m.role === 'user')
    expect(userMsg).toBeDefined()
    expect(result.current.isLoading).toBe(false)
  })

  // ── sendMessage returns response metadata ──

  it('sendMessage returns the AI response object', async () => {
    seedFullAppState()
    const { result } = renderHook(() => useChatSession(), { wrapper })

    let response
    await act(async () => {
      response = await result.current.sendMessage('What about ticks?')
    })

    expect(response).toBeDefined()
    expect(response.message).toBe('AI response about your dog')
  })
})
