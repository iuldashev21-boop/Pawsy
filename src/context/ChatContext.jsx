import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { generateUUID } from '../utils/uuid'

const ChatContext = createContext(null)

const STORAGE_KEY_SESSIONS = 'chat_sessions'
const STORAGE_KEY_HEALTH_EVENTS = 'health_events'
const STORAGE_KEY_USER = 'pawsy_current_user'
const TITLE_MAX_LENGTH = 50

const initialState = {
  sessions: [],
  activeSessionId: null,
  loading: false,
  healthEvents: [],
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
                title: session.messages.length === 0 && message.role === 'user'
                  ? message.content.slice(0, TITLE_MAX_LENGTH) + (message.content.length > TITLE_MAX_LENGTH ? '...' : '')
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
      return { ...state, sessions: [], activeSessionId: null }

    case 'CLEAR_ALL_HEALTH_EVENTS':
      return { ...state, healthEvents: [] }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

const getCurrentUserId = () => {
  const stored = localStorage.getItem(STORAGE_KEY_USER)
  if (!stored) return null
  try {
    return JSON.parse(stored).id
  } catch {
    return null
  }
}

const getStorageKey = (userId, key) => {
  if (!userId) return null
  return `pawsy_${userId}_${key}`
}

const safeParse = (storageKey) => {
  const raw = localStorage.getItem(storageKey)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(storageKey)
    return []
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const loadSessionsForUser = useCallback(() => {
    const userId = getCurrentUserId()
    if (!userId) {
      dispatch({ type: 'RESET' })
      return
    }

    const sessions = safeParse(getStorageKey(userId, STORAGE_KEY_SESSIONS))
    const healthEvents = safeParse(getStorageKey(userId, STORAGE_KEY_HEALTH_EVENTS))

    dispatch({ type: 'SET_SESSIONS', payload: sessions })
    dispatch({ type: 'SET_HEALTH_EVENTS', payload: healthEvents })
  }, [])

  useEffect(() => {
    loadSessionsForUser()
  }, [loadSessionsForUser])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY_USER) {
        loadSessionsForUser()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadSessionsForUser])

  useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) return

    const sessionsForStorage = state.sessions.map(session => ({
      ...session,
      messages: session.messages.map(msg =>
        msg.image ? { ...msg, image: { hadImage: true } } : msg
      ),
    }))
    localStorage.setItem(getStorageKey(userId, STORAGE_KEY_SESSIONS), JSON.stringify(sessionsForStorage))
  }, [state.sessions])

  useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) return
    localStorage.setItem(getStorageKey(userId, STORAGE_KEY_HEALTH_EVENTS), JSON.stringify(state.healthEvents))
  }, [state.healthEvents])

  const createSession = (dogId, dogContext) => {
    const now = new Date().toISOString()
    const newSession = {
      id: generateUUID(),
      dogId,
      title: 'New conversation',
      messages: [],
      dogContextSnapshot: dogContext,
      createdAt: now,
      updatedAt: now,
    }
    dispatch({ type: 'CREATE_SESSION', payload: newSession })
    return newSession
  }

  const addMessage = (sessionId, message) => {
    const newMessage = {
      ...message,
      id: generateUUID(),
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

  const addHealthEvent = (dogId, event) => {
    const newEvent = {
      id: generateUUID(),
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
    reloadForCurrentUser: loadSessionsForUser,
    addHealthEvent,
    getHealthEventsForDog,
    clearHealthEventsForDog,
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Functions are stable, only state values need to be dependencies
  }), [state.sessions, state.activeSessionId, activeSession, state.loading, state.healthEvents, loadSessionsForUser])

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Standard React Context pattern
export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
