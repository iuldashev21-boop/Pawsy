import { motion, useReducedMotion } from 'framer-motion'
import { Lock } from 'lucide-react'
import PremiumIcon from '../common/PremiumIcon'

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)'

const FEATURE_DESCRIPTIONS = {
  medications: {
    title: 'Medication Tracking',
    description: 'Track your dog\'s medications, dosages, and schedules to never miss a dose.',
  },
  vaccinations: {
    title: 'Vaccination Records',
    description: 'Keep vaccination records organized with due-date alerts and vet info.',
  },
  lifestyle: {
    title: 'Lifestyle Profile',
    description: 'Set activity levels and environment details for tailored health recommendations.',
  },
  profile: {
    title: 'Complete Health Profile',
    description: 'Build a comprehensive health profile for the most accurate AI-powered advice.',
  },
  onboarding: {
    title: 'Premium Health Onboarding',
    description: 'Walk through a guided setup to give Pawsy deep insight into your dog\'s health.',
  },
  timeline: {
    title: 'Health Timeline',
    description: 'View a visual history of symptoms, vet visits, and health milestones.',
  },
  alerts: {
    title: 'Breed & Age Alerts',
    description: 'Receive proactive alerts for health issues common to your dog\'s breed and age.',
  },
  vitals: {
    title: 'Health Vitals Dashboard',
    description: 'See your dog\'s key health metrics at a glance — weight, symptoms, streaks, and upcoming care.',
  },
  reports: {
    title: 'Vet Reports',
    description: 'Generate health summaries to share with your veterinarian.',
  },
}

function PremiumGate({ children, feature, isPremium }) {
  const prefersReducedMotion = useReducedMotion()

  if (isPremium) {
    return <>{children}</>
  }

  const featureInfo = FEATURE_DESCRIPTIONS[feature] || {
    title: 'Premium Feature',
    description: 'Unlock this feature with Pawsy Premium for personalized health care.',
  }

  const cardAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 24 },
      }

  // Blurred preview path: show actual children with blur overlay + compact CTA
  if (children) {
    return (
      <motion.div {...cardAnimation} className="relative rounded-2xl overflow-hidden">
        {/* Blurred preview of actual content */}
        <div
          className="pointer-events-none select-none"
          aria-hidden="true"
          style={{ filter: 'blur(3px)', opacity: 0.7 }}
        >
          {children}
        </div>

        {/* Compact upgrade overlay — frosted glass strip at bottom */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-3 rounded-b-2xl"
          style={{
            background: 'linear-gradient(to top, rgba(255,248,231,0.97) 60%, rgba(255,248,231,0.0) 100%)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="w-4 h-4 text-[#F4A261] flex-shrink-0" aria-hidden="true" />
            <span
              className="text-sm font-bold text-[#3D3D3D] truncate"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {featureInfo.title}
            </span>
          </div>
          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold flex-shrink-0
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            style={{
              fontFamily: 'Nunito, sans-serif',
              background: 'linear-gradient(135deg, #FFD54F 0%, #F4A261 50%, #E8924F 100%)',
              boxShadow: '0 2px 12px rgba(244,162,97,0.3)',
              minHeight: 36,
            }}
            aria-label={`Unlock ${featureInfo.title} with Premium`}
          >
            <PremiumIcon size={14} gradient={false} className="text-white" />
            Unlock
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // Fallback: gold card for features without children
  return (
    <motion.div
      {...cardAnimation}
      className="relative rounded-2xl overflow-hidden"
      style={{ boxShadow: CARD_SHADOW }}
    >
      {/* Premium gradient background */}
      <div
        className="p-6"
        style={{
          background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 50%, #FFD699 100%)',
        }}
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-4">
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                    y: [0, -4, 0],
                  }
            }
            transition={
              prefersReducedMotion
                ? {}
                : {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
            className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md"
          >
            <Lock className="w-6 h-6 text-[#F4A261]" aria-hidden="true" />
          </motion.div>
        </div>

        {/* Feature info */}
        <div className="text-center mb-5">
          <h3
            className="text-lg font-bold text-[#3D3D3D] mb-2"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {featureInfo.title}
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-xs mx-auto">
            {featureInfo.description}
          </p>
        </div>

        {/* Upgrade button */}
        <motion.button
          type="button"
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          style={{
            fontFamily: 'Nunito, sans-serif',
            background: 'linear-gradient(135deg, #FFD54F 0%, #F4A261 50%, #E8924F 100%)',
            boxShadow: '0 2px 12px rgba(244,162,97,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            minHeight: 44,
          }}
          aria-label={`Unlock ${featureInfo.title} with Premium`}
        >
          <PremiumIcon size={18} gradient={false} className="text-white" />
          Unlock with Premium
        </motion.button>

        {/* Price hint */}
        <p className="text-xs text-[#6B6B6B] text-center mt-3">
          $4.99/month or $39.99/year
        </p>
      </div>
    </motion.div>
  )
}

export default PremiumGate
