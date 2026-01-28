import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Heart, Pill, Activity, Sparkles, X } from 'lucide-react'
import PawsyMascot from '../mascot/PawsyMascot'
import PremiumOnboarding from './PremiumOnboarding'

const VALUE_PROPS = [
  {
    icon: Heart,
    color: '#EF5350',
    bg: 'rgba(239,83,80,0.12)',
    title: 'Medical History',
    description: 'Track conditions, surgeries, and allergies',
  },
  {
    icon: Pill,
    color: '#F4A261',
    bg: 'rgba(244,162,97,0.12)',
    title: 'Medication Tracking',
    description: 'Never miss a dose with smart reminders',
  },
  {
    icon: Activity,
    color: '#7EC8C8',
    bg: 'rgba(126,200,200,0.12)',
    title: 'Lifestyle-Aware Advice',
    description: 'Personalized tips based on activity and diet',
  },
]

function PostPaymentOnboarding({ dog, onComplete, onDismiss }) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const handleLetsGo = useCallback(() => {
    setShowQuestionnaire(true)
  }, [])

  const animProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { type: 'spring', stiffness: 300, damping: 24 },
      }

  if (showQuestionnaire) {
    return (
      <motion.div {...animProps} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <PremiumOnboarding
          dog={dog}
          onComplete={onComplete}
          onClose={onDismiss}
        />
      </motion.div>
    )
  }

  return (
    <motion.div {...animProps} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
      {/* Dismiss button */}
      <div className="flex justify-end p-3 pb-0">
        <button
          onClick={onDismiss}
          className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors text-[#9E9E9E] hover:text-[#6B6B6B] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          aria-label="Close onboarding"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 pb-6 text-center">
        {/* Mascot */}
        <div className="mb-4">
          <PawsyMascot mood="happy" size={64} />
        </div>

        {/* Premium Active badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#F4A261]/15 to-[#E8924F]/15 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#E8924F]" aria-hidden="true" />
          <span className="text-xs font-bold text-[#E8924F]" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Premium Active
          </span>
        </div>

        {/* Heading */}
        <h2
          className="text-xl font-bold text-[#2D2A26] mb-2"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Before we begin, let&apos;s complete {dog?.name || 'your dog'}&apos;s profile
        </h2>
        <p className="text-sm text-[#6B6B6B] mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          A quick questionnaire to unlock the full power of Pawsy&apos;s health intelligence.
        </p>

        {/* Value prop cards */}
        <div className="space-y-3 mb-6">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon
            return (
              <div
                key={prop.title}
                className="flex items-center gap-3 p-3 rounded-xl text-left"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(253,248,243,0.8) 100%)',
                  border: '1px solid rgba(232,221,208,0.4)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: prop.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: prop.color }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2D2A26]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {prop.title}
                  </p>
                  <p className="text-xs text-[#6B6B6B]">{prop.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLetsGo}
          className="w-full py-3.5 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-shadow text-base"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Let&apos;s Go
        </motion.button>

        {/* Dismiss link */}
        <button
          onClick={onDismiss}
          className="mt-3 text-sm text-[#9E9E9E] hover:text-[#6B6B6B] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
        >
          I&apos;ll do this later
        </button>
      </div>
    </motion.div>
  )
}

export default PostPaymentOnboarding
