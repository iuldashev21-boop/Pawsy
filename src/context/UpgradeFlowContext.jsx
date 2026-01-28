import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PremiumUpgradeFlow from '../components/premium/PremiumUpgradeFlow'
import PostPaymentOnboarding from '../components/premium/PostPaymentOnboarding'
import { useDog } from './DogContext'
import { usePremium } from '../hooks/usePremium'

const UpgradeFlowContext = createContext(null)

function UpgradeFlowProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPostPaymentOnboarding, setShowPostPaymentOnboarding] = useState(false)
  const { activeDog, updateDog } = useDog()
  const { onboardingPending, completePremiumOnboarding, dismissPremiumOnboarding, setPremium } = usePremium()

  // Handle purchase - called from PremiumUpgradeFlow when user completes purchase
  // This ensures we use the SAME usePremium hook instance for setting premium
  // and checking onboardingPending (fixes stale closure issue)
  const handlePurchase = useCallback(() => {
    setPremium(true)
  }, [setPremium])

  const openUpgradeFlow = useCallback(() => setIsOpen(true), [])

  const closeUpgradeFlow = useCallback(() => {
    setIsOpen(false)
    // After upgrade flow closes, check if onboarding should show
    if (onboardingPending && activeDog) {
      setTimeout(() => {
        setShowPostPaymentOnboarding(true)
      }, 300)
    }
  }, [onboardingPending, activeDog])

  // Listen for the pawsy:openUpgrade custom event dispatched by PremiumGate / UsageLimitModal
  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('pawsy:openUpgrade', handler)
    return () => window.removeEventListener('pawsy:openUpgrade', handler)
  }, [])

  // Listen for pawsy:openPostPaymentOnboarding custom event (from Dashboard nudge card)
  useEffect(() => {
    const handler = () => {
      if (activeDog) {
        setShowPostPaymentOnboarding(true)
      }
    }
    window.addEventListener('pawsy:openPostPaymentOnboarding', handler)
    return () => window.removeEventListener('pawsy:openPostPaymentOnboarding', handler)
  }, [activeDog])

  const handleOnboardingComplete = useCallback((data) => {
    if (activeDog && updateDog) {
      updateDog(activeDog.id, {
        isSpayedNeutered: data.isSpayedNeutered,
        chronicConditions: data.chronicConditions || [],
        surgeryHistory: data.surgeryHistory || [],
        medications: data.medications || [],
        activityLevel: data.activityLevel,
        livingEnvironment: data.livingEnvironment,
        socialExposure: data.socialExposure || [],
        dietType: data.dietType,
        foodBrand: data.foodBrand,
        feedingSchedule: data.feedingSchedule,
        vaccinations: data.vaccinations || [],
      })
    }
    completePremiumOnboarding()
    setShowPostPaymentOnboarding(false)
  }, [activeDog, updateDog, completePremiumOnboarding])

  const handleOnboardingDismiss = useCallback(() => {
    dismissPremiumOnboarding()
    setShowPostPaymentOnboarding(false)
  }, [dismissPremiumOnboarding])

  const value = useMemo(
    () => ({ openUpgradeFlow, closeUpgradeFlow, isOpen }),
    [openUpgradeFlow, closeUpgradeFlow, isOpen],
  )

  return (
    <UpgradeFlowContext.Provider value={value}>
      {children}
      <PremiumUpgradeFlow
        isOpen={isOpen}
        onClose={closeUpgradeFlow}
        onPurchase={handlePurchase}
        dogName={activeDog?.name || ''}
      />

      {/* Post-Payment Onboarding Overlay */}
      <AnimatePresence>
        {showPostPaymentOnboarding && activeDog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <PostPaymentOnboarding
              dog={activeDog}
              onComplete={handleOnboardingComplete}
              onDismiss={handleOnboardingDismiss}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </UpgradeFlowContext.Provider>
  )
}

function useUpgradeFlow() {
  const ctx = useContext(UpgradeFlowContext)
  if (!ctx) {
    throw new Error('useUpgradeFlow must be used within an UpgradeFlowProvider')
  }
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components -- Standard React Context pattern
export { UpgradeFlowProvider, useUpgradeFlow }
export default UpgradeFlowProvider
