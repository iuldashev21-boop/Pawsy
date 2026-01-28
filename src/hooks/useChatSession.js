import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { generateUUID } from '../utils/uuid'
import { useDog } from '../context/DogContext'
import { useChat as useChatContext } from '../context/ChatContext'
import { usePremium } from './usePremium'
import { geminiService } from '../services/api/gemini'

/**
 * useChatSession - Custom hook wrapping ChatContext session management.
 *
 * Premium users: auto-creates a session, persists every message via ChatContext.
 * Free users: in-memory only, messages stored in local useState.
 *
 * Returns:
 *   messages       - array of message objects for the current conversation
 *   sendMessage    - async (content) => response - sends a user message and gets AI reply
 *   isLoading      - boolean indicating AI is generating a response
 *   activeSession  - the current ChatContext session object (null for free users)
 *   sessions       - array of all sessions for the active dog
 *   loadSession    - (sessionId) => void - loads an existing session
 *   createNewSession - () => void - starts a fresh conversation
 */
function useChatSession() {
  const { activeDog } = useDog()
  const { isPremium } = usePremium()
  const {
    createSession,
    addMessage,
    setActiveSession,
    getSessionsForDog,
    activeSession,
    sessions: allSessions,
  } = useChatContext()

  // In-memory messages for free users
  const [freeMessages, setFreeMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Track the current premium session ID across async calls
  const currentSessionIdRef = useRef(null)

  // Keep ref in sync with active session
  useEffect(() => {
    if (isPremium && activeSession?.id) {
      currentSessionIdRef.current = activeSession.id
    }
  }, [isPremium, activeSession?.id])

  // Derive messages from the right source
  const messages = isPremium && activeSession
    ? activeSession.messages
    : freeMessages

  // Sessions for the current dog (premium only)
  const sessions = useMemo(() => {
    if (!isPremium || !activeDog?.id) return []
    return getSessionsForDog(activeDog.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, activeDog?.id, getSessionsForDog, allSessions])

  const sendMessage = useCallback(async (content) => {
    setIsLoading(true)

    const userMsg = {
      id: generateUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    if (isPremium) {
      // Auto-create session if none active
      let sessionId = currentSessionIdRef.current
      if (!sessionId) {
        const dogContext = activeDog ? {
          id: activeDog.id,
          name: activeDog.name,
          breed: activeDog.breed || 'unknown',
          age: activeDog.age,
          weight: activeDog.weight,
          weightUnit: activeDog.weightUnit,
        } : { name: 'your dog', breed: 'unknown' }

        const newSession = createSession(activeDog?.id, dogContext)
        sessionId = newSession.id
        currentSessionIdRef.current = sessionId
      }

      // Add user message to session
      addMessage(sessionId, { role: 'user', content })
    } else {
      // Add user message to in-memory state for free users
      setFreeMessages(prev => [...prev, userMsg])
    }

    try {
      const dogContext = activeDog ? {
        id: activeDog.id,
        name: activeDog.name,
        breed: activeDog.breed || 'unknown',
        age: activeDog.age,
        weight: activeDog.weight,
        weightUnit: activeDog.weightUnit,
      } : { name: 'your dog', breed: 'unknown' }

      const history = freeMessages.slice(-10)

      const response = await geminiService.chat(dogContext, content, history)

      if (response.error) {
        const errorMsg = response.message || 'Something went wrong. Please try again.'

        if (isPremium) {
          const sessionId = currentSessionIdRef.current
          if (sessionId) {
            addMessage(sessionId, { role: 'assistant', content: errorMsg })
          }
        } else {
          setFreeMessages(prev => [...prev, {
            id: generateUUID(),
            role: 'assistant',
            content: errorMsg,
            timestamp: new Date().toISOString(),
          }])
        }

        setIsLoading(false)
        return response
      }

      if (isPremium) {
        const sessionId = currentSessionIdRef.current
        if (sessionId) {
          addMessage(sessionId, { role: 'assistant', content: response.message })
        }
      } else {
        setFreeMessages(prev => [...prev, {
          id: generateUUID(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          metadata: {
            follow_up_questions: response.follow_up_questions || [],
            quick_replies: response.quick_replies || [],
            urgency_level: response.urgency_level || 'low',
            symptoms_mentioned: response.symptoms_mentioned || [],
            possible_conditions: response.possible_conditions || [],
            recommended_actions: response.recommended_actions || [],
            should_see_vet: response.should_see_vet || false,
            emergency_steps: response.emergency_steps || [],
          },
        }])
      }

      setIsLoading(false)
      return response
    } catch {
      const errorContent = 'Something went wrong. Please try again.'

      if (!isPremium) {
        setFreeMessages(prev => [...prev, {
          id: generateUUID(),
          role: 'assistant',
          content: errorContent,
          timestamp: new Date().toISOString(),
        }])
      }

      setIsLoading(false)
      return { error: true, message: errorContent }
    }
  }, [isPremium, activeDog, createSession, addMessage, freeMessages])

  const loadSession = useCallback((sessionId) => {
    setActiveSession(sessionId)
    currentSessionIdRef.current = sessionId
    // When loading a session, also sync freeMessages for consistency
    const session = allSessions.find(s => s.id === sessionId)
    if (session) {
      setFreeMessages(session.messages || [])
    }
  }, [setActiveSession, allSessions])

  const createNewSession = useCallback(() => {
    setActiveSession(null)
    currentSessionIdRef.current = null
    setFreeMessages([])
  }, [setActiveSession])

  return {
    messages,
    sendMessage,
    isLoading,
    activeSession: isPremium ? activeSession : null,
    sessions,
    loadSession,
    createNewSession,
  }
}

export { useChatSession }
export default useChatSession
