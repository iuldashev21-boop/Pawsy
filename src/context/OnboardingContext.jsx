import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const OnboardingContext = createContext(null)

const STEP_MESSAGES = {
  hasDog: 'Profile created!',
  firstChat: 'First chat complete!',
  firstPhoto: 'Photo analyzed!',
  checkedFood: 'Safety checked!',
}

const MAIN_STEP_KEYS = Object.keys(STEP_MESSAGES)
const TOTAL_STEPS = MAIN_STEP_KEYS.length

const DEFAULT_PROGRESS = {
  welcomeSeen: false,
  hasDog: false,
  firstChat: false,
  firstPhoto: false,
  checkedFood: false,
  viewedGuides: false,
}

export function OnboardingProvider({ children }) {
  const { user, getUserStorageKey } = useAuth()
  const [progress, setProgress] = useState(DEFAULT_PROGRESS)
  const [showWelcome, setShowWelcome] = useState(false)
  const [celebration, setCelebration] = useState({ show: false, message: '' })

  // Load onboarding progress from localStorage
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reset state when user logs out
      setProgress(DEFAULT_PROGRESS)
      setShowWelcome(false)
      return
    }

    const storageKey = getUserStorageKey('onboarding')
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setProgress(JSON.parse(stored))
    } else {
      setProgress(DEFAULT_PROGRESS)
      setShowWelcome(true)
    }
  }, [user, getUserStorageKey])

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress) => {
    if (!user) return
    const storageKey = getUserStorageKey('onboarding')
    localStorage.setItem(storageKey, JSON.stringify(newProgress))
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

  const completedCount = MAIN_STEP_KEYS.filter(key => progress[key]).length
  const isOnboardingComplete = completedCount === TOTAL_STEPS

  // Should show checklist (after welcome, before all steps done)
  const showChecklist = progress.welcomeSeen && !isOnboardingComplete

  const value = {
    progress,
    completeStep,
    showWelcome,
    dismissWelcome,
    showChecklist,
    completedCount,
    totalSteps: TOTAL_STEPS,
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

// eslint-disable-next-line react-refresh/only-export-components -- Standard React Context pattern
export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
