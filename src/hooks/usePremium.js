import { useState, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * usePremium - Premium subscription state hook
 *
 * Stores premium status in localStorage per user.
 * Separate from AuthContext intentionally — premium is a billing concern
 * that will migrate to a backend/payment provider later.
 *
 * Returns: { isPremium, setPremium, togglePremium }
 */
function usePremium() {
  const { user, getUserStorageKey } = useAuth()

  const getStorageKey = useCallback(() => {
    if (!user) return null
    return getUserStorageKey('premium_status')
  }, [user, getUserStorageKey])

  const [isPremium, setIsPremiumState] = useState(() => {
    if (!user) return false
    const key = `pawsy_${user.id}_premium_status`
    return localStorage.getItem(key) === 'true'
  })

  const setPremium = useCallback((value) => {
    const key = getStorageKey()
    if (!key) return
    localStorage.setItem(key, value ? 'true' : 'false')
    setIsPremiumState(value)
  }, [getStorageKey])

  const togglePremium = useCallback(() => {
    setPremium(!isPremium)
  }, [isPremium, setPremium])

  return useMemo(() => ({
    isPremium: !!user && isPremium,
    setPremium,
    togglePremium,
  }), [user, isPremium, setPremium, togglePremium])
}

export { usePremium }
export default usePremium
