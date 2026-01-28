import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { useDog } from '../../context/DogContext'
import PremiumIcon from '../common/PremiumIcon'
import PremiumValuePreview from './PremiumValuePreview'

const TOTAL_STEPS = 5

const FEATURE_COMPARISON = [
  { feature: 'AI Health Chat', free: '3/day', premium: 'Unlimited' },
  { feature: 'Photo Analysis', free: '2/day', premium: 'Unlimited' },
  { feature: 'Health Facts Memory', free: 'Basic', premium: 'Full context' },
  { feature: 'Chat History', free: 'Not saved', premium: 'Saved & searchable' },
  { feature: 'Medications Tracking', free: null, premium: true },
  { feature: 'Breed Health Risks', free: null, premium: true },
  { feature: 'Health Alerts', free: null, premium: true },
  { feature: 'Photo Gallery', free: 'Last 3', premium: 'Full history' },
]

const CONFETTI_COLORS = ['#F4A261', '#7EC8C8', '#FFD54F', '#81C784', '#FFB380', '#E8924F']

/**
 * PremiumUpgradeFlow - Multi-step upgrade modal
 *
 * Steps:
 * 1. Value Preview - Personalized data preview
 * 2. Feature Comparison - Free vs Premium table
 * 3. Pricing - Monthly and annual options
 * 4. Purchase - Simulated purchase button
 * 5. Celebration - Success with confetti
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - dogName: string
 */
function PremiumUpgradeFlow({ isOpen, onClose, onPurchase, dogName = '' }) {
  if (!isOpen) return null

  // Render the inner modal content. Because this mounts/unmounts with isOpen,
  // state (step, selectedPlan) is naturally reset each time the modal opens.
  return <UpgradeFlowModal onClose={onClose} onPurchase={onPurchase} dogName={dogName} />
}

/* -------------------------------------------------------------------------- */
/*  Inner modal component (owns step state, unmounts when modal closes)        */
/* -------------------------------------------------------------------------- */

function UpgradeFlowModal({ onClose, onPurchase, dogName }) {
  const prefersReducedMotion = useReducedMotion()
  const { activeDog } = useDog()
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState('annual')
  const dialogRef = useRef(null)

  // Derive dog data from context or props
  const dog = activeDog || {}
  const resolvedDogName = dogName || dog.name || ''
  const dogId = dog.id || ''
  const breed = dog.breed || ''
  const allergies = dog.allergies || []

  // ESC key support and focus management
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Focus the close button on open
    const timer = setTimeout(() => {
      const closeBtn = dialogRef.current?.querySelector('[aria-label="Close"]')
      closeBtn?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [onClose])

  const handleContinue = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handlePurchase = () => {
    onPurchase() // Call context's setPremium to fix stale closure issue
    setStep(5)
  }

  const handleCelebrationComplete = () => {
    onClose()
  }

  const contentAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
        transition: { type: 'spring', stiffness: 300, damping: 28 },
      }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-flow-title"
      >
        <motion.div
          ref={dialogRef}
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header with close button and step dots */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            {/* Back button or spacer */}
            {step > 1 && step < 5 ? (
              <button
                onClick={handleBack}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
                aria-label="Back"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" aria-hidden="true" />
              </button>
            ) : (
              <div style={{ width: 44 }} />
            )}

            {/* Step indicator dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => {
                const stepNum = i + 1
                const isActive = stepNum === step
                const isCompleted = stepNum < step

                return (
                  <div
                    key={stepNum}
                    data-testid="step-dot"
                    className={`rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-6 h-2.5 bg-gradient-to-r from-[#F4A261] to-[#E8924F]'
                        : isCompleted
                        ? 'w-2.5 h-2.5 bg-[#66BB6A]'
                        : 'w-2.5 h-2.5 bg-[#E8E8E8]'
                    }`}
                  />
                )
              })}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
              aria-label="Close"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <X className="w-5 h-5 text-[#6B6B6B]" aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            <AnimatePresence mode="wait">
              {/* Step 1: Value Preview */}
              {step === 1 && (
                <motion.div key="step-1" {...contentAnimation}>
                  <PremiumValuePreview
                    dogName={resolvedDogName}
                    dogId={dogId}
                    breed={breed}
                    allergies={allergies}
                  />
                </motion.div>
              )}

              {/* Step 2: Feature Comparison */}
              {step === 2 && (
                <motion.div key="step-2" {...contentAnimation}>
                  <StepFeatureComparison />
                </motion.div>
              )}

              {/* Step 3: Pricing */}
              {step === 3 && (
                <motion.div key="step-3" {...contentAnimation}>
                  <StepPricing
                    selectedPlan={selectedPlan}
                    onSelectPlan={setSelectedPlan}
                    dogName={resolvedDogName}
                  />
                </motion.div>
              )}

              {/* Step 4: Purchase */}
              {step === 4 && (
                <motion.div key="step-4" {...contentAnimation}>
                  <StepPurchase
                    selectedPlan={selectedPlan}
                    dogName={resolvedDogName}
                    onPurchase={handlePurchase}
                  />
                </motion.div>
              )}

              {/* Step 5: Celebration */}
              {step === 5 && (
                <motion.div key="step-5" {...contentAnimation}>
                  <StepCelebration
                    dogName={resolvedDogName}
                    onComplete={handleCelebrationComplete}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer CTA - shown on steps 1-3 */}
          {step >= 1 && step <= 3 && (
            <div className="px-5 pb-5 pt-2 border-t border-[#E8E8E8]/50">
              <button
                onClick={handleContinue}
                className="w-full py-3.5 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                style={{ minHeight: 44 }}
              >
                Continue
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* -------------------------------------------------------------------------- */
/*  Step 2: Feature Comparison                                                 */
/* -------------------------------------------------------------------------- */

function StepFeatureComparison() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3
          id="upgrade-flow-title"
          className="text-lg font-bold text-[#3D3D3D]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Feature Comparison
        </h3>
        <p className="text-sm text-[#6B6B6B]">
          See what you get with Premium
        </p>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-[#E8E8E8] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-3 bg-[#FDF8F3] border-b border-[#E8E8E8]">
          <div className="px-3 py-2.5 text-xs font-semibold text-[#6B6B6B]">
            Feature
          </div>
          <div className="px-3 py-2.5 text-xs font-semibold text-[#6B6B6B] text-center">
            Free
          </div>
          <div className="px-3 py-2.5 text-xs font-semibold text-center">
            <span className="text-[#F4A261]">Premium</span>
          </div>
        </div>

        {/* Table rows */}
        {FEATURE_COMPARISON.map((row, idx) => (
          <div
            key={row.feature}
            className={`grid grid-cols-3 items-center ${
              idx < FEATURE_COMPARISON.length - 1 ? 'border-b border-[#E8E8E8]/50' : ''
            }`}
          >
            <div className="px-3 py-2.5 text-sm text-[#3D3D3D]">
              {row.feature}
            </div>
            <div className="px-3 py-2.5 text-center">
              {row.free === null ? (
                <span className="text-[#9E9E9E]">&mdash;</span>
              ) : (
                <span className="text-xs text-[#6B6B6B]">{row.free}</span>
              )}
            </div>
            <div className="px-3 py-2.5 text-center">
              {row.premium === true ? (
                <Check className="w-4 h-4 text-[#66BB6A] mx-auto" aria-hidden="true" />
              ) : (
                <span className="text-xs font-medium text-[#F4A261]">
                  {row.premium}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Step 3: Pricing                                                            */
/* -------------------------------------------------------------------------- */

function StepPricing({ selectedPlan, onSelectPlan, dogName }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3
          className="text-lg font-bold text-[#3D3D3D]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Choose Your Plan
        </h3>
        <p className="text-sm text-[#6B6B6B]">
          {dogName ? `Give ${dogName} the best care` : 'Give your dog the best care'}
        </p>
      </div>

      {/* Annual plan - highlighted */}
      <button
        onClick={() => onSelectPlan('annual')}
        className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative ${
          selectedPlan === 'annual'
            ? 'border-[#F4A261] bg-gradient-to-br from-[#FFF8E7] to-[#FFF5ED] shadow-md'
            : 'border-[#E8E8E8] bg-white hover:border-[#F4A261]/50'
        }`}
        style={{ minHeight: 44 }}
      >
        {/* Best Value badge */}
        <div className="absolute -top-3 left-4 px-3 py-0.5 bg-[#FFD54F] text-[#3D3D3D] text-xs font-bold rounded-full">
          Best Value
        </div>

        <div className="flex items-center justify-between mt-1">
          <div>
            <p className="font-bold text-[#3D3D3D] text-base">Annual</p>
            <p className="text-sm text-[#6B6B6B]">Save 33% compared to monthly</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#F4A261]">$39.99</p>
            <p className="text-xs text-[#6B6B6B]">/year</p>
          </div>
        </div>

        {selectedPlan === 'annual' && (
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#F4A261] flex items-center justify-center">
            <Check className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
        )}
      </button>

      {/* Monthly plan */}
      <button
        onClick={() => onSelectPlan('monthly')}
        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
          selectedPlan === 'monthly'
            ? 'border-[#F4A261] bg-[#FFF8E7] shadow-md'
            : 'border-[#E8E8E8] bg-white hover:border-[#F4A261]/50'
        }`}
        style={{ minHeight: 44 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-[#3D3D3D] text-base">Monthly</p>
            <p className="text-sm text-[#6B6B6B]">Flexible, cancel anytime</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#3D3D3D]">$4.99</p>
            <p className="text-xs text-[#6B6B6B]">/month</p>
          </div>
        </div>

        {selectedPlan === 'monthly' && (
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#F4A261] flex items-center justify-center">
            <Check className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
        )}
      </button>

      {/* Fine print */}
      <p className="text-xs text-[#9E9E9E] text-center px-4">
        Cancel anytime. No commitment required.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Step 4: Purchase                                                           */
/* -------------------------------------------------------------------------- */

function StepPurchase({ selectedPlan, dogName, onPurchase }) {
  const planLabel = selectedPlan === 'annual' ? '$39.99/year' : '$4.99/month'

  return (
    <div className="space-y-5 text-center">
      <div>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFF8E7] to-[#FFE4B5] flex items-center justify-center">
          <PremiumIcon size={32} />
        </div>
        <h3
          className="text-lg font-bold text-[#3D3D3D]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Ready to upgrade?
        </h3>
        <p className="text-sm text-[#6B6B6B] mt-1">
          {dogName
            ? `${dogName} deserves the best health insights`
            : 'Your dog deserves the best health insights'}
        </p>
      </div>

      {/* Plan summary */}
      <div className="p-4 bg-[#FDF8F3] rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#3D3D3D]">
            Pawsy Premium ({selectedPlan === 'annual' ? 'Annual' : 'Monthly'})
          </span>
          <span className="text-sm font-bold text-[#F4A261]">{planLabel}</span>
        </div>
      </div>

      {/* Purchase button */}
      <button
        onClick={onPurchase}
        className="w-full py-4 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
        style={{ minHeight: 44 }}
      >
        <Sparkles className="w-5 h-5" aria-hidden="true" />
        Start Premium
      </button>

      <p className="text-xs text-[#9E9E9E]">
        Simulated purchase for demo purposes
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Step 5: Celebration                                                        */
/* -------------------------------------------------------------------------- */

function StepCelebration({ dogName, onComplete, prefersReducedMotion }) {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    }))
  )

  return (
    <div className="relative text-center py-6 overflow-hidden">
      {/* Confetti particles */}
      {!prefersReducedMotion &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: `${p.x}%`,
              top: '-10px',
            }}
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{
              y: ['0vh', '40vh'],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0.5],
              rotate: [0, 360],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
          />
        ))}

      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={
          prefersReducedMotion
            ? {}
            : { type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }
        }
        className="relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#F4A261] flex items-center justify-center mx-auto mb-5 shadow-lg">
          <PremiumIcon size={40} gradient={false} className="text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { delay: 0.4 }}
        className="relative z-10 space-y-4"
      >
        <h2
          className="text-2xl font-bold text-[#3D3D3D]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Welcome to Premium!
        </h2>
        <p className="text-[#6B6B6B] max-w-xs mx-auto">
          {dogName
            ? `${dogName} now has access to unlimited AI health insights, full history, and personalized care.`
            : 'Your dog now has access to unlimited AI health insights, full history, and personalized care.'}
        </p>

        <motion.button
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? {} : { delay: 0.7 }}
          onClick={onComplete}
          className="px-8 py-3.5 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg text-base flex items-center justify-center gap-2 mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          style={{ minHeight: 44 }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  )
}

export default PremiumUpgradeFlow
