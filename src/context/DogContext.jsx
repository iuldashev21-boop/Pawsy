import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { generateUUID } from '../utils/uuid'
import { migrateAllProfiles } from '../services/storage/migration'

const DogContext = createContext(null)

const STORAGE_KEY_DOGS = 'dogs'
const STORAGE_KEY_ACTIVE_DOG = 'active_dog'
const STORAGE_KEY_USER = 'pawsy_current_user'

const initialState = {
  dogs: [],
  activeDogId: null,
  loading: true,
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

export function DogProvider({ children }) {
  const [state, dispatch] = useReducer(dogReducer, initialState)

  const loadDogsForUser = useCallback(() => {
    const userId = getCurrentUserId()
    if (!userId) {
      dispatch({ type: 'RESET' })
      return
    }

    const rawDogs = safeParse(getStorageKey(userId, STORAGE_KEY_DOGS))
    const storedActiveDog = localStorage.getItem(getStorageKey(userId, STORAGE_KEY_ACTIVE_DOG))

    // Run schema migrations on loaded profiles
    const dogs = migrateAllProfiles(rawDogs)

    // Persist migrated profiles back if any changed
    if (rawDogs.length > 0 && JSON.stringify(rawDogs) !== JSON.stringify(dogs)) {
      localStorage.setItem(getStorageKey(userId, STORAGE_KEY_DOGS), JSON.stringify(dogs))
    }

    dispatch({
      type: 'SET_DOGS',
      payload: { dogs, activeDogId: storedActiveDog || null }
    })
    dispatch({ type: 'SET_LOADING', payload: false })
  }, [])

  useEffect(() => {
    loadDogsForUser()
  }, [loadDogsForUser])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY_USER) {
        loadDogsForUser()
      }
    }

    const handleFocus = () => {
      const userId = getCurrentUserId()
      if (!userId) return
      const currentDogs = safeParse(getStorageKey(userId, STORAGE_KEY_DOGS))
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

  useEffect(() => {
    if (state.loading) return

    const userId = getCurrentUserId()
    if (!userId) return

    const dogsKey = getStorageKey(userId, STORAGE_KEY_DOGS)
    const activeDogKey = getStorageKey(userId, STORAGE_KEY_ACTIVE_DOG)

    localStorage.setItem(dogsKey, JSON.stringify(state.dogs))
    if (state.activeDogId) {
      localStorage.setItem(activeDogKey, state.activeDogId)
    } else {
      localStorage.removeItem(activeDogKey)
    }
  }, [state.dogs, state.activeDogId, state.loading])

  const addDog = (dogData) => {
    const userId = getCurrentUserId()
    if (!userId) {
      if (import.meta.env.DEV) console.error('Cannot add dog: no user logged in')
      return null
    }

    const now = new Date().toISOString()
    const newDog = {
      ...dogData,
      id: generateUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
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
    reloadForCurrentUser: loadDogsForUser,
  }), [state.dogs, state.activeDogId, activeDog, state.loading, loadDogsForUser])

  return (
    <DogContext.Provider value={value}>
      {children}
    </DogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Standard React Context pattern
export function useDog() {
  const context = useContext(DogContext)
  if (!context) {
    throw new Error('useDog must be used within a DogProvider')
  }
  return context
}
