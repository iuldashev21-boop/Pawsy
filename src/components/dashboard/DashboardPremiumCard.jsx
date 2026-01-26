import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { PremiumBadge } from '../common/PremiumIcon'

/**
 * DashboardPremiumCard - Soft premium upsell on Dashboard
 * Dismissable, shows key premium benefits
 */
function DashboardPremiumCard({ dogName = 'your dog', onUpgrade, dismissed: dismissedProp, onDismiss }) {
  const [dismissedLocal, setDismissedLocal] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const dismissed = dismissedProp !== undefined ? dismissedProp : dismissedLocal
  const handleDismiss = onDismiss || (() => setDismissedLocal(true))

  if (dismissed) return null

  // Animation config respecting motion preferences
  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
      }

  return (
    <motion.div
      {...animationProps}
      className="bg-gradient-to-br from-[#FFF8E7] via-[#FFE4B5] to-[#FFD699] rounded-xl p-3 border border-[#E8B855]/30 relative shadow-sm"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }}
    >
      {/* Dismiss button - 44x44px touch target */}
      <button
        onClick={handleDismiss}
        className="absolute top-1 right-1 p-2.5 rounded-full hover:bg-white/50 text-[#B8860B] hover:text-[#8B6914] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
        aria-label="Dismiss premium card"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2.5 pr-5">
        <PremiumBadge size={32} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Know {dogName} Better
            </h3>
            <button
              onClick={onUpgrade}
              className="text-xs font-medium text-[#F4A261] hover:text-[#E8924F] transition-colors flex items-center gap-0.5 focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
            >
              Learn more →
            </button>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Personalized health intelligence — AI that knows their history
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardPremiumCard
