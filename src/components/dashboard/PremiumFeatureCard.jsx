import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import PremiumIcon from '../common/PremiumIcon'
import { getFeatureById } from '../../constants/premiumFeatures'
import { useToast } from '../../context/ToastContext'

function PremiumFeatureCard({ featureId, isPremium, onFeatureClick, onUpgrade }) {
  const prefersReducedMotion = useReducedMotion()
  const { showToast } = useToast()
  const feature = getFeatureById(featureId)

  if (!feature) return null

  const FeatureIcon = feature.icon

  const handleClick = () => {
    if (onFeatureClick) {
      onFeatureClick(featureId)
    } else if (isPremium) {
      showToast('Coming soon! This feature is under development.')
    } else {
      onUpgrade?.()
    }
  }

  return (
    <motion.button
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      onClick={handleClick}
      className="w-full text-left rounded-2xl p-3.5 transition-shadow duration-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
      style={{
        background: feature.bgGradient,
        border: '1px solid rgba(232,221,208,0.4)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
      }}
      aria-label={`${feature.label}${!isPremium ? ' — Premium feature' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: feature.iconBg }}
          >
            <FeatureIcon className="w-5 h-5" style={{ color: feature.color }} aria-hidden="true" />
          </div>
          {!isPremium && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 100%)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <PremiumIcon size={10} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-bold text-[13px] text-[#2D2A26] leading-tight"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {feature.label}
          </h4>
          <p
            className="text-[11px] text-[#8C7B6B] mt-0.5 leading-tight"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {feature.description}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#C5B8A8] flex-shrink-0" aria-hidden="true" />
      </div>
    </motion.button>
  )
}

export default PremiumFeatureCard
