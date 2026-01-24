import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import PremiumIcon, { PremiumBadge } from './common/PremiumIcon'

/**
 * PremiumHint - Soft upsell component for Premium features
 *
 * Usage:
 * <PremiumHint
 *   message="Save this conversation for later"
 *   feature="Chat history"
 *   dismissable={true}
 *   variant="inline" | "banner" | "card"
 * />
 */

const VARIANTS = {
  inline: {
    container: 'flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#FFF8E7] to-[#FFE4B5] border border-[#E8B855]/30',
    iconSize: 16,
    text: 'text-xs',
  },
  banner: {
    container: 'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#FFF8E7] to-[#FFE4B5] border border-[#E8B855]/30',
    iconSize: 20,
    text: 'text-sm',
  },
  card: {
    container: 'p-4 rounded-xl bg-gradient-to-br from-[#FFF8E7] via-[#FFE4B5] to-[#FFD699] border border-[#E8B855]/30 shadow-sm',
    iconSize: 24,
    text: 'text-sm',
  },
}

function PremiumHint({
  message,
  feature,
  dismissable = true,
  variant = 'banner',
  onLearnMore,
  className = '',
}) {
  const [isDismissed, setIsDismissed] = useState(false)
  const styles = VARIANTS[variant]

  if (isDismissed) return null

  if (variant === 'card') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`${styles.container} ${className}`}
        >
          {dismissable && (
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/50 text-[#9E9E9E]"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-3">
            <PremiumBadge size={40} />
            <div>
              <h4
                className="font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Pawsy Premium
              </h4>
              {feature && (
                <p className="text-xs text-[#6B6B6B]">{feature}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-[#6B6B6B] mb-3">{message}</p>

          <button
            onClick={onLearnMore}
            className="flex items-center gap-1 text-[#F4A261] font-semibold text-sm hover:text-[#E8924F] transition-colors"
          >
            Learn More
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${styles.container} ${className}`}
      >
        <PremiumIcon size={styles.iconSize} className="flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className={`${styles.text} text-[#6B6B6B]`}>
            <span className="font-medium text-[#3D3D3D]">Premium: </span>
            {message}
          </p>
        </div>

        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-[#F4A261] font-medium text-xs hover:text-[#E8924F] transition-colors flex-shrink-0"
          >
            Learn More
          </button>
        )}

        {dismissable && (
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/50 text-[#9E9E9E] flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default PremiumHint
