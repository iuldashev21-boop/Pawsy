import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const OnboardingContext = createContext(null)

const ONBOARDING_STEPS = {
  welcomeSeen: false,
  hasDog: false,
  firstChat: false,
  firstPhoto: false,
  checkedFood: false,
  viewedGuides: false,
}

const STEP_MESSAGES = {
  hasDog: 'Profile created!',
  firstChat: 'First chat complete!',
  firstPhoto: 'Photo analyzed!',
  checkedFood: 'Safety checked!',
}

export function OnboardingProvider({ children }) {
  const { user, getUserStorageKey } = useAuth()
  const [progress, setProgress] = useState(ONBOARDING_STEPS)
  const [showWelcome, setShowWelcome] = useState(false)
  const [celebration, setCelebration] = useState({ show: false, message: '' })

  // Load onboarding progress from localStorage
  useEffect(() => {
    if (!user) {
      setProgress(ONBOARDING_STEPS)
      setShowWelcome(false)
      return
    }

    const storageKey = getUserStorageKey('onboarding')
    if (storageKey) {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setProgress(JSON.parse(stored))
      } else {
        // New user - show welcome
        setProgress(ONBOARDING_STEPS)
        setShowWelcome(true)
      }
    }
  }, [user, getUserStorageKey])

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress) => {
    if (!user) return
    const storageKey = getUserStorageKey('onboarding')
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(newProgress))
    }
  }, [user, getUserStorageKey])

  // Mark a step as complete
  const completeStep = useCallback((step) => {
    setProgress(prev => {
      if (prev[step]) return prev // Already complete
      const updated = { ...prev, [step]: true }
      saveProgress(updated)

      // Trigger celebration for main steps
      if (STEP_MESSAGES[step]) {
        setCelebration({ show: true, message: STEP_MESSAGES[step] })
      }

      return updated
    })
  }, [saveProgress])

  // Clear celebration
  const clearCelebration = useCallback(() => {
    setCelebration({ show: false, message: '' })
  }, [])

  // Mark welcome as seen
  const dismissWelcome = useCallback(() => {
    setShowWelcome(false)
    completeStep('welcomeSeen')
  }, [completeStep])

  // Check if all main steps are complete
  const completedCount = [
    progress.hasDog,
    progress.firstChat,
    progress.firstPhoto,
    progress.checkedFood,
  ].filter(Boolean).length

  const totalSteps = 4
  const isOnboardingComplete = completedCount === totalSteps

  // Should show checklist (after welcome, before all steps done)
  const showChecklist = progress.welcomeSeen && !isOnboardingComplete

  const value = {
    progress,
    completeStep,
    showWelcome,
    dismissWelcome,
    showChecklist,
    completedCount,
    totalSteps,
    isOnboardingComplete,
    celebration,
    clearCelebration,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
