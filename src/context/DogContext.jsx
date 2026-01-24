import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'

const DogContext = createContext(null)

const initialState = {
  dogs: [],
  activeDogId: null,
  loading: true, // Start as loading until we've checked localStorage
}

function dogReducer(state, action) {
  switch (action.type) {
    case 'SET_DOGS':
      return { ...state, dogs: action.payload.dogs, activeDogId: action.payload.activeDogId }
    case 'ADD_DOG':
      return {
        ...state,
        dogs: [...state.dogs, action.payload],
        activeDogId: action.payload.id
      }
    case 'UPDATE_DOG':
      return {
        ...state,
        dogs: state.dogs.map(dog =>
          dog.id === action.payload.id ? { ...dog, ...action.payload } : dog
        ),
      }
    case 'DELETE_DOG':
      return {
        ...state,
        dogs: state.dogs.filter(dog => dog.id !== action.payload),
        activeDogId: state.activeDogId === action.payload ? null : state.activeDogId,
      }
    case 'SET_ACTIVE_DOG':
      return { ...state, activeDogId: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'RESET':
      return { ...initialState, loading: false }
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

export function DogProvider({ children }) {
  const [state, dispatch] = useReducer(dogReducer, initialState)

  // Load dogs for current user when component mounts or user changes
  const loadDogsForUser = useCallback(() => {
    const userId = getCurrentUserId()

    if (!userId) {
      dispatch({ type: 'RESET' }) // RESET now sets loading: false
      return
    }

    const dogsKey = getStorageKey(userId, 'dogs')
    const activeDogKey = getStorageKey(userId, 'active_dog')

    const storedDogs = localStorage.getItem(dogsKey)
    const storedActiveDog = localStorage.getItem(activeDogKey)

    // Parse with error handling to prevent crashes from corrupted data
    let dogs = []
    if (storedDogs) {
      try {
        dogs = JSON.parse(storedDogs)
      } catch {
        // Corrupted data - reset to empty
        localStorage.removeItem(dogsKey)
      }
    }

    dispatch({
      type: 'SET_DOGS',
      payload: {
        dogs,
        activeDogId: storedActiveDog || null,
      }
    })
    dispatch({ type: 'SET_LOADING', payload: false })
  }, [])

  // Initial load
  useEffect(() => {
    loadDogsForUser()
  }, [loadDogsForUser])

  // Listen for storage events (for cross-tab sync and user changes)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pawsy_current_user') {
        loadDogsForUser()
      }
    }

    // Also check for user changes on window focus (same tab logout/login)
    const handleFocus = () => {
      const currentUserId = getCurrentUserId()
      const currentDogsKey = currentUserId ? getStorageKey(currentUserId, 'dogs') : null
      const storedDogs = currentDogsKey ? localStorage.getItem(currentDogsKey) : null

      let currentDogs = []
      if (storedDogs) {
        try {
          currentDogs = JSON.parse(storedDogs)
        } catch {
          // Corrupted data - will be handled by loadDogsForUser
        }
      }

      // If user changed or dogs don't match, reload
      if (currentDogs.length !== state.dogs.length) {
        loadDogsForUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadDogsForUser, state.dogs.length])

  // Persist to localStorage on changes (only if we have a user)
  useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) return

    const dogsKey = getStorageKey(userId, 'dogs')
    const activeDogKey = getStorageKey(userId, 'active_dog')

    localStorage.setItem(dogsKey, JSON.stringify(state.dogs))
    if (state.activeDogId) {
      localStorage.setItem(activeDogKey, state.activeDogId)
    } else {
      localStorage.removeItem(activeDogKey)
    }
  }, [state.dogs, state.activeDogId])

  const addDog = (dogData) => {
    const userId = getCurrentUserId()
    if (!userId) {
      if (import.meta.env.DEV) console.error('Cannot add dog: no user logged in')
      return null
    }

    const newDog = {
      ...dogData,
      id: crypto.randomUUID(),
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_DOG', payload: newDog })
    return newDog
  }

  const updateDog = (id, updates) => {
    dispatch({
      type: 'UPDATE_DOG',
      payload: { id, ...updates, updatedAt: new Date().toISOString() }
    })
  }

  const deleteDog = (id) => {
    dispatch({ type: 'DELETE_DOG', payload: id })
  }

  const setActiveDog = (id) => {
    dispatch({ type: 'SET_ACTIVE_DOG', payload: id })
  }

  const getActiveDog = () => {
    return state.dogs.find(dog => dog.id === state.activeDogId) || state.dogs[0] || null
  }

  // Expose loadDogsForUser so it can be called after login/signup
  const reloadForCurrentUser = useCallback(() => {
    loadDogsForUser()
  }, [loadDogsForUser])

  const activeDog = getActiveDog()

  const value = useMemo(() => ({
    dogs: state.dogs,
    activeDogId: state.activeDogId,
    activeDog,
    loading: state.loading,
    addDog,
    updateDog,
    deleteDog,
    setActiveDog,
    reloadForCurrentUser,
  }), [state.dogs, state.activeDogId, activeDog, state.loading, reloadForCurrentUser])

  return (
    <DogContext.Provider value={value}>
      {children}
    </DogContext.Provider>
  )
}

export function useDog() {
  const context = useContext(DogContext)
  if (!context) {
    throw new Error('useDog must be used within a DogProvider')
  }
  return context
}
