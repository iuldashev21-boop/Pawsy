import { createContext, useContext, useReducer, useEffect } from 'react'

const DogContext = createContext(null)

const initialState = {
  dogs: [],
  activeDogId: null,
  loading: false,
}

function dogReducer(state, action) {
  switch (action.type) {
    case 'SET_DOGS':
      return { ...state, dogs: action.payload }
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
    default:
      return state
  }
}

export function DogProvider({ children }) {
  const [state, dispatch] = useReducer(dogReducer, initialState, () => {
    // Initialize from localStorage
    const stored = localStorage.getItem('pawsy_dogs')
    const activeDogId = localStorage.getItem('pawsy_active_dog')
    if (stored) {
      return {
        ...initialState,
        dogs: JSON.parse(stored),
        activeDogId: activeDogId || null,
      }
    }
    return initialState
  })

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem('pawsy_dogs', JSON.stringify(state.dogs))
    if (state.activeDogId) {
      localStorage.setItem('pawsy_active_dog', state.activeDogId)
    }
  }, [state.dogs, state.activeDogId])

  const addDog = (dogData) => {
    const newDog = {
      ...dogData,
      id: crypto.randomUUID(),
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

  const value = {
    dogs: state.dogs,
    activeDogId: state.activeDogId,
    activeDog: getActiveDog(),
    loading: state.loading,
    addDog,
    updateDog,
    deleteDog,
    setActiveDog,
  }

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
