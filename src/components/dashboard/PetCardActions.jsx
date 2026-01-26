import { useReducedMotion, motion } from 'framer-motion'
import PremiumIcon from '../common/PremiumIcon'
import { getFeaturesByPlacement } from '../../constants/premiumFeatures'

function PetCardActions({ isPremium, onFeatureClick }) {
  const prefersReducedMotion = useReducedMotion()
  const petCardFeatures = getFeaturesByPlacement('petCard')

  return (
    <div className="flex items-center gap-2">
      {petCardFeatures.map((feature) => {
        const FeatureIcon = feature.icon
        return (
          <motion.button
            key={feature.id}
            whileTap={prefersReducedMotion ? {} : { scale: 0.92 }}
            onClick={() => onFeatureClick(feature.id)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            style={{ background: feature.iconBg }}
            aria-label={`${feature.label}${!isPremium ? ' — Premium feature' : ''}`}
          >
            <FeatureIcon className="w-4 h-4" style={{ color: feature.color }} aria-hidden="true" />
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
          </motion.button>
        )
      })}
    </div>
  )
}

export default PetCardActions
