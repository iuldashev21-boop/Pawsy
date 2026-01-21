import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { USAGE_LIMITS } from '../constants/usage'

const UsageContext = createContext(null)

// Alias for internal use
const LIMITS = USAGE_LIMITS

// Get today's date as YYYY-MM-DD in local timezone
const getTodayDate = () => {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

// Default usage state
const getDefaultUsage = () => ({
  chatsUsedToday: 0,
  photosUsedToday: 0,
  emergencyChatsUsed: 0,
  emergencyPhotosUsed: 0,
  lastResetDate: getTodayDate(),
  firstDayDate: getTodayDate(),
})

export function UsageProvider({ children }) {
  const { user, getUserStorageKey } = useAuth()
  const [usage, setUsage] = useState(getDefaultUsage())
  const [loading, setLoading] = useState(true)

  // Load usage from localStorage
  useEffect(() => {
    if (!user) {
      setUsage(getDefaultUsage())
      setLoading(false)
      return
    }

    const storageKey = getUserStorageKey('usage')
    const stored = localStorage.getItem(storageKey)

    if (stored) {
      const parsed = JSON.parse(stored)
      const today = getTodayDate()

      // Check if we need to reset (new day)
      if (parsed.lastResetDate !== today) {
        // Reset daily usage but keep firstDayDate
        const resetUsage = {
          ...getDefaultUsage(),
          firstDayDate: parsed.firstDayDate,
          lastResetDate: today,
        }
        localStorage.setItem(storageKey, JSON.stringify(resetUsage))
        setUsage(resetUsage)
      } else {
        setUsage(parsed)
      }
    } else {
      // First time user - set first day date
      const newUsage = getDefaultUsage()
      localStorage.setItem(storageKey, JSON.stringify(newUsage))
      setUsage(newUsage)
    }

    setLoading(false)
  }, [user, getUserStorageKey])

  // Save usage to localStorage whenever it changes
  const saveUsage = useCallback((newUsage) => {
    if (!user) return
    const storageKey = getUserStorageKey('usage')
    localStorage.setItem(storageKey, JSON.stringify(newUsage))
    setUsage(newUsage)
  }, [user, getUserStorageKey])

  // Check if it's the user's first day
  const isFirstDay = usage.firstDayDate === getTodayDate()

  // Calculate limits based on first day bonus
  const effectiveLimits = {
    dailyChats: isFirstDay ? LIMITS.firstDayChats : LIMITS.dailyChats,
    dailyPhotos: isFirstDay ? LIMITS.firstDayPhotos : LIMITS.dailyPhotos,
    emergencyChats: LIMITS.emergencyChats,
    emergencyPhotos: LIMITS.emergencyPhotos,
  }

  // Computed values
  const chatsRemaining = effectiveLimits.dailyChats - usage.chatsUsedToday
  const photosRemaining = effectiveLimits.dailyPhotos - usage.photosUsedToday
  const emergencyChatsRemaining = LIMITS.emergencyChats - usage.emergencyChatsUsed
  const emergencyPhotosRemaining = LIMITS.emergencyPhotos - usage.emergencyPhotosUsed

  // Can use regular (non-emergency)
  const canChat = chatsRemaining > 0
  const canPhoto = photosRemaining > 0

  // Can use emergency
  const canEmergencyChat = emergencyChatsRemaining > 0
  const canEmergencyPhoto = emergencyPhotosRemaining > 0

  // Actions
  const useChat = useCallback(() => {
    if (!canChat) return false

    const newUsage = {
      ...usage,
      chatsUsedToday: usage.chatsUsedToday + 1,
    }
    saveUsage(newUsage)
    return true
  }, [usage, canChat, saveUsage])

  const usePhoto = useCallback(() => {
    if (!canPhoto) return false

    const newUsage = {
      ...usage,
      photosUsedToday: usage.photosUsedToday + 1,
    }
    saveUsage(newUsage)
    return true
  }, [usage, canPhoto, saveUsage])

  const useEmergencyChat = useCallback(() => {
    if (!canEmergencyChat) return false

    const newUsage = {
      ...usage,
      emergencyChatsUsed: usage.emergencyChatsUsed + 1,
    }
    saveUsage(newUsage)
    return true
  }, [usage, canEmergencyChat, saveUsage])

  const useEmergencyPhoto = useCallback(() => {
    if (!canEmergencyPhoto) return false

    const newUsage = {
      ...usage,
      emergencyPhotosUsed: usage.emergencyPhotosUsed + 1,
    }
    saveUsage(newUsage)
    return true
  }, [usage, canEmergencyPhoto, saveUsage])

  // For debugging/testing - reset usage
  const resetUsage = useCallback(() => {
    const newUsage = getDefaultUsage()
    saveUsage(newUsage)
  }, [saveUsage])

  const value = {
    // State
    usage,
    limits: effectiveLimits,
    isFirstDay,
    loading,

    // Computed
    chatsRemaining,
    photosRemaining,
    emergencyChatsRemaining,
    emergencyPhotosRemaining,
    canChat,
    canPhoto,
    canEmergencyChat,
    canEmergencyPhoto,

    // Actions
    useChat,
    usePhoto,
    useEmergencyChat,
    useEmergencyPhoto,
    resetUsage, // For testing
  }

  return (
    <UsageContext.Provider value={value}>
      {children}
    </UsageContext.Provider>
  )
}

export function useUsage() {
  const context = useContext(UsageContext)
  if (!context) {
    throw new Error('useUsage must be used within a UsageProvider')
  }
  return context
}
