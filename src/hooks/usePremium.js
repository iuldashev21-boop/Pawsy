import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * usePremium - Premium subscription state hook
 *
 * Stores premium status in localStorage per user.
 * Separate from AuthContext intentionally — premium is a billing concern
 * that will migrate to a backend/payment provider later.
 *
 * Returns: { isPremium, setPremium, togglePremium, justUpgraded }
 */
function usePremium() {
  const { user, getUserStorageKey } = useAuth()

  const getStorageKey = useCallback(() => {
    if (!user) return null
    return getUserStorageKey('premium_status')
  }, [user, getUserStorageKey])

  const getOnboardingKey = useCallback(() => {
    if (!user) return null
    return `pawsy_${user.id}_premium_onboarding_status`
  }, [user])

  const [isPremium, setIsPremiumState] = useState(() => {
    if (!user) return false
    const key = `pawsy_${user.id}_premium_status`
    return localStorage.getItem(key) === 'true'
  })

  const [justUpgraded, setJustUpgraded] = useState(false)
  const timerRef = useRef(null)

  // Onboarding status: 'pending' | 'complete' | 'dismissed' | null
  const [onboardingStatus, setOnboardingStatusState] = useState(() => {
    const key = getOnboardingKey()
    if (!key) return null
    return localStorage.getItem(key) || null
  })

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const setPremiumOnboardingPending = useCallback(() => {
    const key = getOnboardingKey()
    if (!key) return
    // Only set pending if not already complete (re-upgrade after downgrade)
    const current = localStorage.getItem(key)
    if (current === 'complete') return
    localStorage.setItem(key, 'pending')
    setOnboardingStatusState('pending')
  }, [getOnboardingKey])

  const completePremiumOnboarding = useCallback(() => {
    const key = getOnboardingKey()
    if (!key) return
    localStorage.setItem(key, 'complete')
    setOnboardingStatusState('complete')
  }, [getOnboardingKey])

  const dismissPremiumOnboarding = useCallback(() => {
    const key = getOnboardingKey()
    if (!key) return
    localStorage.setItem(key, 'dismissed')
    setOnboardingStatusState('dismissed')
  }, [getOnboardingKey])

  const setPremium = useCallback((value) => {
    const key = getStorageKey()
    if (!key) return
    localStorage.setItem(key, value ? 'true' : 'false')
    setIsPremiumState(value)

    // Track "just upgraded" for transition animation
    if (value) {
      setJustUpgraded(true)
      setPremiumOnboardingPending()
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setJustUpgraded(false)
        timerRef.current = null
      }, 3000)
    } else {
      setJustUpgraded(false)
    }
  }, [getStorageKey, setPremiumOnboardingPending])

  const togglePremium = useCallback(() => {
    setPremium(!isPremium)
  }, [isPremium, setPremium])

  const onboardingPending = onboardingStatus === 'pending'
  const onboardingComplete = onboardingStatus === 'complete'

  return useMemo(() => ({
    isPremium: !!user && isPremium,
    setPremium,
    togglePremium,
    justUpgraded,
    onboardingPending,
    onboardingComplete,
    setPremiumOnboardingPending,
    completePremiumOnboarding,
    dismissPremiumOnboarding,
  }), [user, isPremium, setPremium, togglePremium, justUpgraded, onboardingPending, onboardingComplete, setPremiumOnboardingPending, completePremiumOnboarding, dismissPremiumOnboarding])
}

export { usePremium }
export default usePremium
