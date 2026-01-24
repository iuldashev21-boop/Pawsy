import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'

const ChatContext = createContext(null)

const initialState = {
  sessions: [],
  activeSessionId: null,
  loading: false,
  healthEvents: [], // Timeline of health events (symptoms, photo analyses, concerns)
}

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload, activeSessionId: null }

    case 'SET_HEALTH_EVENTS':
      return { ...state, healthEvents: action.payload }

    case 'ADD_HEALTH_EVENT':
      return {
        ...state,
        healthEvents: [...state.healthEvents, action.payload],
      }

    case 'CLEAR_HEALTH_EVENTS_FOR_DOG':
      return {
        ...state,
        healthEvents: state.healthEvents.filter(e => e.dogId !== action.payload),
      }

    case 'CREATE_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, action.payload],
        activeSessionId: action.payload.id,
      }

    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSessionId: action.payload }

    case 'ADD_MESSAGE': {
      const { sessionId, message } = action.payload
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === sessionId
            ? {
                ...session,
                messages: [...session.messages, message],
                updatedAt: new Date().toISOString(),
                // Auto-generate title from first user message
                title: session.messages.length === 0 && message.role === 'user'
                  ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                  : session.title,
              }
            : session
        ),
      }
    }

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.payload),
        activeSessionId: state.activeSessionId === action.payload ? null : state.activeSessionId,
      }

    case 'CLEAR_SESSIONS_FOR_DOG':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.dogId !== action.payload),
        activeSessionId: null,
      }

    case 'CLEAR_ALL_SESSIONS':
      return {
        ...state,
        sessions: [],
        activeSessionId: null,
      }

    case 'CLEAR_ALL_HEALTH_EVENTS':
      return {
        ...state,
        healthEvents: [],
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

// Helper to get current user ID from localStorage
const getCurrentUserId = () => {
  const stored = localStorage.getItem('pawsy_current_user')
  if (stored) {
    try {
      return JSON.parse(stored).id
    } catch {
      return null
    }
  }
  return null
}

// Get user-prefixed storage key
const getStorageKey = (userId, key) => {
  if (!userId) return null
  return `pawsy_${userId}_${key}`
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  // Load sessions and health events for current user
  const loadSessionsForUser = useCallback(() => {
    const userId = getCurrentUserId()
    if (!userId) {
      dispatch({ type: 'RESET' })
      return
    }

    const sessionsKey = getStorageKey(userId, 'chat_sessions')
    const healthEventsKey = getStorageKey(userId, 'health_events')

    const storedSessions = localStorage.getItem(sessionsKey)
    const storedHealthEvents = localStorage.getItem(healthEventsKey)

    // Parse with error handling to prevent crashes from corrupted data
    let sessions = []
    let healthEvents = []

    if (storedSessions) {
      try {
        sessions = JSON.parse(storedSessions)
      } catch {
        // Corrupted data - reset to empty
        localStorage.removeItem(sessionsKey)
      }
    }

    if (storedHealthEvents) {
      try {
        healthEvents = JSON.parse(storedHealthEvents)
      } catch {
        // Corrupted data - reset to empty
        localStorage.removeItem(healthEventsKey)
      }
    }

    dispatch({ type: 'SET_SESSIONS', payload: sessions })
    dispatch({ type: 'SET_HEALTH_EVENTS', payload: healthEvents })
  }, [])

  // Initial load
  useEffect(() => {
    loadSessionsForUser()
  }, [loadSessionsForUser])

  // Listen for storage events (for cross-tab sync and user changes)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pawsy_current_user') {
        loadSessionsForUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [loadSessionsForUser])

  // Persist sessions to localStorage (strip large image data to avoid bloating storage)
  useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) return

    const sessionsKey = getStorageKey(userId, 'chat_sessions')

    const sessionsForStorage = state.sessions.map(session => ({
      ...session,
      messages: session.messages.map(msg => {
        if (msg.image) {
          // Keep flag that image existed, but don't store the data
          return {
            ...msg,
            image: { hadImage: true },
          }
        }
        return msg
      }),
    }))
    localStorage.setItem(sessionsKey, JSON.stringify(sessionsForStorage))
  }, [state.sessions])

  // Persist health events to localStorage
  useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) return

    const healthEventsKey = getStorageKey(userId, 'health_events')
    localStorage.setItem(healthEventsKey, JSON.stringify(state.healthEvents))
  }, [state.healthEvents])

  const createSession = (dogId, dogContext) => {
    const newSession = {
      id: crypto.randomUUID(),
      dogId,
      title: 'New conversation',
      messages: [],
      dogContextSnapshot: dogContext,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'CREATE_SESSION', payload: newSession })
    return newSession
  }

  const addMessage = (sessionId, message) => {
    const newMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: newMessage } })
    return newMessage
  }

  const setActiveSession = (sessionId) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: sessionId })
  }

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const deleteSession = (sessionId) => {
    dispatch({ type: 'DELETE_SESSION', payload: sessionId })
  }

  const clearAllSessions = () => {
    dispatch({ type: 'CLEAR_ALL_SESSIONS' })
  }

  const getSessionsForDog = (dogId) => {
    return state.sessions.filter(s => s.dogId === dogId)
  }

  const getActiveSession = () => {
    return state.sessions.find(s => s.id === state.activeSessionId) || null
  }

  // Health Events for Timeline
  const addHealthEvent = (dogId, event) => {
    const newEvent = {
      id: crypto.randomUUID(),
      dogId,
      timestamp: new Date().toISOString(),
      ...event,
    }
    dispatch({ type: 'ADD_HEALTH_EVENT', payload: newEvent })
    return newEvent
  }

  const getHealthEventsForDog = (dogId) => {
    return state.healthEvents.filter(e => e.dogId === dogId)
  }

  const clearHealthEventsForDog = (dogId) => {
    dispatch({ type: 'CLEAR_HEALTH_EVENTS_FOR_DOG', payload: dogId })
  }

  // Expose reload for after login/signup
  const reloadForCurrentUser = useCallback(() => {
    loadSessionsForUser()
  }, [loadSessionsForUser])

  const activeSession = getActiveSession()

  const value = useMemo(() => ({
    sessions: state.sessions,
    activeSessionId: state.activeSessionId,
    activeSession,
    loading: state.loading,
    healthEvents: state.healthEvents,
    createSession,
    addMessage,
    setActiveSession,
    setLoading,
    deleteSession,
    clearAllSessions,
    getSessionsForDog,
    reloadForCurrentUser,
    // Health Timeline
    addHealthEvent,
    getHealthEventsForDog,
    clearHealthEventsForDog,
  }), [state.sessions, state.activeSessionId, activeSession, state.loading, state.healthEvents, reloadForCurrentUser])

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
