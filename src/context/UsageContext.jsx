import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { usePremium } from '../hooks/usePremium'
import { USAGE_LIMITS } from '../constants/usage'

const UsageContext = createContext(null)

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

function getDefaultUsage() {
  const today = getTodayDate()
  return {
    chatsUsedToday: 0,
    photosUsedToday: 0,
    emergencyChatsUsed: 0,
    emergencyPhotosUsed: 0,
    lastResetDate: today,
    firstDayDate: today,
  }
}

export function UsageProvider({ children }) {
  const { user, getUserStorageKey } = useAuth()
  const { isPremium } = usePremium()
  const [usage, setUsage] = useState(getDefaultUsage())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reset state when user logs out
      setUsage(getDefaultUsage())
      setLoading(false)
      return
    }

    const storageKey = getUserStorageKey('usage')
    const stored = localStorage.getItem(storageKey)
    const parsed = stored ? JSON.parse(stored) : null
    const today = getTodayDate()

    let resolved
    if (parsed && parsed.lastResetDate === today) {
      resolved = parsed
    } else {
      resolved = {
        ...getDefaultUsage(),
        firstDayDate: parsed?.firstDayDate || today,
        lastResetDate: today,
      }
      localStorage.setItem(storageKey, JSON.stringify(resolved))
    }

    setUsage(resolved)
    setLoading(false)
  }, [user, getUserStorageKey])

  const saveUsage = useCallback((newUsage) => {
    if (!user) return
    const storageKey = getUserStorageKey('usage')
    localStorage.setItem(storageKey, JSON.stringify(newUsage))
    setUsage(newUsage)
  }, [user, getUserStorageKey])

  const isFirstDay = usage.firstDayDate === getTodayDate()

  const effectiveLimits = useMemo(() => ({
    dailyChats: isFirstDay ? USAGE_LIMITS.firstDayChats : USAGE_LIMITS.dailyChats,
    dailyPhotos: isFirstDay ? USAGE_LIMITS.firstDayPhotos : USAGE_LIMITS.dailyPhotos,
    emergencyChats: USAGE_LIMITS.emergencyChats,
    emergencyPhotos: USAGE_LIMITS.emergencyPhotos,
  }), [isFirstDay])

  const chatsRemaining = effectiveLimits.dailyChats - usage.chatsUsedToday
  const photosRemaining = effectiveLimits.dailyPhotos - usage.photosUsedToday
  const emergencyChatsRemaining = effectiveLimits.emergencyChats - usage.emergencyChatsUsed
  const emergencyPhotosRemaining = effectiveLimits.emergencyPhotos - usage.emergencyPhotosUsed

  const canChat = isPremium || chatsRemaining > 0
  const canPhoto = isPremium || photosRemaining > 0
  const canEmergencyChat = emergencyChatsRemaining > 0
  const canEmergencyPhoto = emergencyPhotosRemaining > 0

  const tryIncrement = useCallback((allowed, field) => {
    if (!allowed) return false
    saveUsage({ ...usage, [field]: usage[field] + 1 })
    return true
  }, [usage, saveUsage])

  const useChat = useCallback(() => tryIncrement(canChat, 'chatsUsedToday'), [canChat, tryIncrement])
  const usePhoto = useCallback(() => tryIncrement(canPhoto, 'photosUsedToday'), [canPhoto, tryIncrement])
  const useEmergencyChat = useCallback(() => tryIncrement(canEmergencyChat, 'emergencyChatsUsed'), [canEmergencyChat, tryIncrement])
  const useEmergencyPhoto = useCallback(() => tryIncrement(canEmergencyPhoto, 'emergencyPhotosUsed'), [canEmergencyPhoto, tryIncrement])

  const resetUsage = useCallback(() => {
    saveUsage(getDefaultUsage())
  }, [saveUsage])

  const value = useMemo(() => ({
    usage,
    limits: effectiveLimits,
    isFirstDay,
    isPremium,
    loading,
    chatsRemaining,
    photosRemaining,
    emergencyChatsRemaining,
    emergencyPhotosRemaining,
    canChat,
    canPhoto,
    canEmergencyChat,
    canEmergencyPhoto,
    useChat,
    usePhoto,
    useEmergencyChat,
    useEmergencyPhoto,
    resetUsage,
  }), [
    usage, effectiveLimits, isFirstDay, isPremium, loading,
    chatsRemaining, photosRemaining, emergencyChatsRemaining, emergencyPhotosRemaining,
    canChat, canPhoto, canEmergencyChat, canEmergencyPhoto,
    useChat, usePhoto, useEmergencyChat, useEmergencyPhoto, resetUsage
  ])

  return (
    <UsageContext.Provider value={value}>
      {children}
    </UsageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Standard React Context pattern
export function useUsage() {
  const context = useContext(UsageContext)
  if (!context) {
    throw new Error('useUsage must be used within a UsageProvider')
  }
  return context
}
