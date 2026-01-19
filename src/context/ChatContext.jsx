import { createContext, useContext, useReducer, useEffect } from 'react'

const ChatContext = createContext(null)

const initialState = {
  sessions: [],
  activeSessionId: null,
  loading: false,
}

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload }

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

    default:
      return state
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState, () => {
    const stored = localStorage.getItem('pawsy_chat_sessions')
    if (stored) {
      return {
        ...initialState,
        sessions: JSON.parse(stored),
      }
    }
    return initialState
  })

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('pawsy_chat_sessions', JSON.stringify(state.sessions))
  }, [state.sessions])

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

  const getSessionsForDog = (dogId) => {
    return state.sessions.filter(s => s.dogId === dogId)
  }

  const getActiveSession = () => {
    return state.sessions.find(s => s.id === state.activeSessionId) || null
  }

  const value = {
    sessions: state.sessions,
    activeSessionId: state.activeSessionId,
    activeSession: getActiveSession(),
    loading: state.loading,
    createSession,
    addMessage,
    setActiveSession,
    setLoading,
    deleteSession,
    getSessionsForDog,
  }

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
